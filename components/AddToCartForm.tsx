"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cartStorageKey, type CartItem } from "@/types/cart";
import type { Product } from "@/types/product";

type AddToCartFormProps = {
  product: Product;
};

function readCart(): CartItem[] {
  try {
    const rawCart = window.localStorage.getItem(cartStorageKey);
    return rawCart ? (JSON.parse(rawCart) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(cartStorageKey, JSON.stringify(items));
  window.dispatchEvent(new Event("urban-grooming-cart-updated"));
}

export function AddToCartForm({ product }: AddToCartFormProps) {
  const availableQuantity = Math.max(0, product.stockQuantity);
  const maxCartQuantity = Math.min(99, availableQuantity);
  const isAvailable = availableQuantity > 0;
  const [quantity, setQuantity] = useState(isAvailable ? 1 : 0);
  const [message, setMessage] = useState("");

  const cartLine = useMemo(
    () => `${product.brand} ${product.name} x ${quantity}`,
    [product.brand, product.name, quantity],
  );

  function addToCart() {
    if (!isAvailable) {
      return;
    }

    const cart = readCart();
    const existingItem = cart.find((item) => item.productSlug === product.slug);
    const existingQuantity = existingItem?.quantity ?? 0;
    const nextQuantity = Math.min(maxCartQuantity, existingQuantity + quantity);
    const nextCart = existingItem
      ? cart.map((item) =>
          item.productSlug === product.slug
            ? { ...item, quantity: nextQuantity }
            : item,
        )
      : [...cart, { productSlug: product.slug, quantity: nextQuantity }];

    writeCart(nextCart);
    setMessage(
      nextQuantity < existingQuantity + quantity
        ? `У кошику вже максимум для цієї позиції: ${maxCartQuantity} шт.`
        : "Товар додано в кошик.",
    );
  }

  return (
    <div className="mt-8 rounded-lg bg-background p-5">
      <p className="text-lg font-black text-dark">Додати в кошик</p>
      <p className="mt-2 text-sm font-semibold text-dark/60">
        {isAvailable
          ? `Доступно для замовлення: ${availableQuantity} шт.`
          : "Товар зараз недоступний для замовлення."}
      </p>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-bold text-dark/70">
          Кількість
        </label>
        <div className="grid max-w-48 grid-cols-3 overflow-hidden rounded-lg border border-dark/10 bg-white">
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            disabled={!isAvailable || quantity <= 1}
            className="min-h-12 text-xl font-black text-dark transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white"
            aria-label="Зменшити кількість"
          >
            -
          </button>
          <div className="flex min-h-12 items-center justify-center border-x border-dark/10 text-lg font-black text-dark">
            {quantity}
          </div>
          <button
            type="button"
            onClick={() =>
              setQuantity((current) => Math.min(maxCartQuantity, current + 1))
            }
            disabled={!isAvailable || quantity >= maxCartQuantity}
            className="min-h-12 text-xl font-black text-dark transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white"
            aria-label="Збільшити кількість"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-white p-4 ring-1 ring-dark/10">
        <p className="text-sm font-bold text-dark/55">Позиція</p>
        <p className="mt-2 text-sm leading-6 text-dark/70">{cartLine}</p>
      </div>

      {message ? (
        <p className="mt-4 rounded-lg border border-primary/60 bg-primary/20 px-4 py-3 text-sm font-semibold text-dark">
          {message}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={addToCart}
          disabled={!isAvailable}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-black text-dark transition hover:-translate-y-0.5 hover:bg-[#e9cb3e] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isAvailable ? "Додати в кошик" : "Немає в наявності"}
        </button>
        <Link
          href="/cart"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-dark px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#1f1f1f]"
        >
          Перейти в кошик
        </Link>
      </div>
    </div>
  );
}
