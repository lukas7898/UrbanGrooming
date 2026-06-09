"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import {
  cartStorageKey,
  ordersStorageKey,
  type CartItem,
} from "@/types/cart";
import type { OrderReceipt } from "@/types/order";
import type { Product } from "@/types/product";

type CartClientProps = {
  products: Product[];
};

type SubmitState = "idle" | "loading" | "success" | "error";
const phonePrefix = "+380";

function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "");
  const withoutCountryCode = digits.startsWith("380")
    ? digits.slice(3)
    : digits.startsWith("0")
      ? digits.slice(1)
      : digits;

  return `${phonePrefix}${withoutCountryCode.slice(0, 9)}`;
}

function saveCart(items: CartItem[]) {
  window.localStorage.setItem(cartStorageKey, JSON.stringify(items));
  window.dispatchEvent(new Event("urban-grooming-cart-updated"));
}

function saveOrderReceipt(order: OrderReceipt) {
  try {
    const rawOrders = window.localStorage.getItem(ordersStorageKey);
    const orders = rawOrders ? (JSON.parse(rawOrders) as OrderReceipt[]) : [];
    const nextOrders = [order, ...orders].slice(0, 20);

    window.localStorage.setItem(ordersStorageKey, JSON.stringify(nextOrders));
  } catch {
    // Telegram is the source of truth. Local receipts are only convenience.
  }
}

export function CartClient({ products }: CartClientProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState(phonePrefix);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [orderReceipt, setOrderReceipt] = useState<OrderReceipt | null>(null);

  useEffect(() => {
    try {
      const rawCart = window.localStorage.getItem(cartStorageKey);
      setCartItems(rawCart ? (JSON.parse(rawCart) as CartItem[]) : []);
    } catch {
      setCartItems([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  const cartLines = useMemo(
    () =>
      cartItems
        .map((item) => {
          const product = products.find(
            (candidate) => candidate.slug === item.productSlug,
          );

          if (!product) {
            return null;
          }

          const maxQuantity = Math.min(99, Math.max(0, product.stockQuantity));
          const quantity = Math.min(item.quantity, maxQuantity);

          return {
            product,
            quantity,
            maxQuantity,
            total: product.price * quantity,
          };
        })
        .filter((line): line is NonNullable<typeof line> => Boolean(line)),
    [cartItems, products],
  );

  const cartTotal = cartLines.reduce((sum, line) => sum + line.total, 0);
  const hasUnavailableItems = cartLines.some((line) => line.maxQuantity <= 0);

  function updateQuantity(productSlug: string, nextQuantity: number) {
    const product = products.find((candidate) => candidate.slug === productSlug);
    const maxQuantity = product
      ? Math.min(99, Math.max(0, product.stockQuantity))
      : 0;
    const clampedQuantity = Math.min(Math.max(1, nextQuantity), maxQuantity);
    const nextCart = cartItems.map((item) =>
      item.productSlug === productSlug
        ? { ...item, quantity: clampedQuantity }
        : item,
    );

    setCartItems(nextCart);
    saveCart(nextCart);
  }

  function removeItem(productSlug: string) {
    const nextCart = cartItems.filter((item) => item.productSlug !== productSlug);

    setCartItems(nextCart);
    saveCart(nextCart);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartLines.map((line) => ({
            productSlug: line.product.slug,
            quantity: line.quantity,
          })),
          customerName,
          customerPhone,
        }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        order?: OrderReceipt;
      };

      if (!response.ok || !result.ok || !result.order) {
        throw new Error(result.error || "Не вдалося відправити заявку.");
      }

      window.localStorage.removeItem(cartStorageKey);
      window.dispatchEvent(new Event("urban-grooming-cart-updated"));
      saveOrderReceipt(result.order);
      setOrderReceipt(result.order);
      setCartItems([]);
      setSubmitState("success");
    } catch (error) {
      setSubmitState("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Не вдалося відправити заявку. Спробуйте ще раз.",
      );
    }
  }

  if (!loaded) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-soft ring-1 ring-dark/5">
        <p className="font-semibold text-dark/60">Завантажуємо кошик...</p>
      </div>
    );
  }

  if (submitState === "success" && orderReceipt) {
    return (
      <div className="rounded-lg border border-primary bg-primary/20 p-6">
        <p className="text-2xl font-black text-dark">Заявку відправлено</p>
        <p className="mt-3 text-sm leading-6 text-dark/70">
          Ми отримали замовлення і зв&apos;яжемося для підтвердження.
        </p>
        <div className="mt-5 rounded-lg bg-white p-5 ring-1 ring-dark/10">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-dark/45">
            {orderReceipt.id}
          </p>
          <div className="mt-4 grid gap-3">
            {orderReceipt.items.map((item) => (
              <div
                key={item.productSlug}
                className="flex justify-between gap-4 border-b border-dark/10 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-bold text-dark">
                    {item.brand} {item.productName}
                  </p>
                  <p className="mt-1 text-sm text-dark/55">
                    {item.quantity} x {formatPrice(item.price)}
                  </p>
                </div>
                <p className="font-black text-dark">{formatPrice(item.total)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-between gap-4 text-lg">
            <span className="font-black text-dark">Разом</span>
            <span className="font-black text-dark">
              {formatPrice(orderReceipt.total)}
            </span>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/orders"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-dark px-5 py-2 text-sm font-black text-white transition hover:bg-[#1f1f1f]"
          >
            Мої заявки
          </Link>
          <Link
            href="/catalog"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-2 text-sm font-black text-dark ring-1 ring-dark/10 transition hover:bg-primary"
          >
            Продовжити покупки
          </Link>
        </div>
      </div>
    );
  }

  if (cartLines.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-soft ring-1 ring-dark/5">
        <p className="text-xl font-black text-dark">Кошик порожній</p>
        <p className="mt-3 text-sm leading-6 text-dark/60">
          Додайте товари з каталогу, щоб оформити одну заявку на кілька позицій.
        </p>
        <Link
          href="/catalog"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-black text-dark transition hover:bg-[#e9cb3e]"
        >
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="grid gap-4">
        {cartLines.map((line) => (
          <article
            key={line.product.slug}
            className="rounded-lg bg-white p-5 shadow-soft ring-1 ring-dark/5"
          >
            <div className="flex flex-col justify-between gap-5 sm:flex-row">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-dark/45">
                  {line.product.brand}
                </p>
                <h2 className="mt-2 text-xl font-black text-dark">
                  {line.product.name}
                </h2>
                <p className="mt-2 text-sm font-semibold text-dark/55">
                  Доступно: {line.maxQuantity} шт.
                </p>
              </div>
              <p className="text-xl font-black text-dark">
                {formatPrice(line.total)}
              </p>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="grid max-w-48 grid-cols-3 overflow-hidden rounded-lg border border-dark/10 bg-white">
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(line.product.slug, line.quantity - 1)
                  }
                  disabled={line.quantity <= 1 || line.maxQuantity <= 0}
                  className="min-h-11 text-xl font-black transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white"
                >
                  -
                </button>
                <div className="flex min-h-11 items-center justify-center border-x border-dark/10 font-black">
                  {line.quantity}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(line.product.slug, line.quantity + 1)
                  }
                  disabled={
                    line.quantity >= line.maxQuantity || line.maxQuantity <= 0
                  }
                  className="min-h-11 text-xl font-black transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeItem(line.product.slug)}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-dark/10 px-4 py-2 text-sm font-black text-dark transition hover:border-dark/30 hover:bg-background"
              >
                Видалити
              </button>
            </div>
          </article>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="h-fit rounded-lg bg-white p-5 shadow-soft ring-1 ring-dark/5"
      >
        <p className="text-xl font-black text-dark">Оформити заявку</p>
        <div className="mt-5 flex items-center justify-between gap-4 rounded-lg bg-background p-4">
          <span className="font-bold text-dark/55">Разом</span>
          <span className="text-2xl font-black text-dark">
            {formatPrice(cartTotal)}
          </span>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-dark/70">
              Ім&apos;я
            </span>
            <input
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              minLength={2}
              required
              placeholder="Ваше ім'я"
              className="min-h-12 w-full rounded-lg border border-dark/10 bg-white px-4 text-sm font-medium text-dark outline-none transition placeholder:text-dark/35 focus:border-dark/35 focus:ring-4 focus:ring-primary/30"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-dark/70">
              Телефон
            </span>
            <input
              type="tel"
              value={customerPhone}
              onChange={(event) =>
                setCustomerPhone(formatPhoneInput(event.target.value))
              }
              minLength={13}
              maxLength={13}
              required
              inputMode="tel"
              placeholder="+380..."
              className="min-h-12 w-full rounded-lg border border-dark/10 bg-white px-4 text-sm font-medium text-dark outline-none transition placeholder:text-dark/35 focus:border-dark/35 focus:ring-4 focus:ring-primary/30"
            />
          </label>
        </div>

        {hasUnavailableItems ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            У кошику є товар без залишку. Видаліть його перед замовленням.
          </p>
        ) : null}

        {submitState === "error" ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={
            submitState === "loading" || hasUnavailableItems || cartTotal <= 0
          }
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-black text-dark transition hover:-translate-y-0.5 hover:bg-[#e9cb3e] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {submitState === "loading" ? "Відправляємо..." : "Замовити все"}
        </button>
      </form>
    </div>
  );
}
