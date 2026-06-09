"use client";

import { type FormEvent, useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";

type ProductOrderFormProps = {
  product: Product;
};

type SubmitState = "idle" | "loading" | "success" | "error";

export function ProductOrderForm({ product }: ProductOrderFormProps) {
  const availableQuantity = Math.max(0, product.stockQuantity);
  const maxOrderQuantity = Math.min(99, availableQuantity);
  const isAvailable = availableQuantity > 0;
  const [quantity, setQuantity] = useState(isAvailable ? 1 : 0);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const totalPrice = useMemo(
    () => product.price * quantity,
    [product.price, quantity],
  );

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
          productSlug: product.slug,
          quantity,
          customerName,
          customerPhone,
        }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Не вдалося відправити заявку.");
      }

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

  if (submitState === "success") {
    return (
      <div className="mt-8 rounded-lg border border-primary bg-primary/20 p-5">
        <p className="text-xl font-black text-dark">Заявку відправлено</p>
        <p className="mt-3 text-sm leading-6 text-dark/70">
          Ми отримали ваше замовлення і зв&apos;яжемося для підтвердження.
        </p>
        <div className="mt-5 rounded-lg bg-white p-4 text-sm ring-1 ring-dark/10">
          <div className="flex justify-between gap-4 py-2">
            <span className="font-semibold text-dark/55">Товар</span>
            <span className="text-right font-bold text-dark">
              {product.brand} {product.name}
            </span>
          </div>
          <div className="flex justify-between gap-4 py-2">
            <span className="font-semibold text-dark/55">Кількість</span>
            <span className="font-bold text-dark">{quantity}</span>
          </div>
          <div className="flex justify-between gap-4 py-2">
            <span className="font-semibold text-dark/55">Сума</span>
            <span className="font-bold text-dark">{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between gap-4 py-2">
            <span className="font-semibold text-dark/55">Клієнт</span>
            <span className="text-right font-bold text-dark">
              {customerName}, {customerPhone}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 rounded-lg bg-background p-5">
      <p className="text-lg font-black text-dark">Оформити заявку</p>
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
              setQuantity((current) => Math.min(maxOrderQuantity, current + 1))
            }
            disabled={!isAvailable || quantity >= maxOrderQuantity}
            className="min-h-12 text-xl font-black text-dark transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white"
            aria-label="Збільшити кількість"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
            onChange={(event) => setCustomerPhone(event.target.value)}
            minLength={7}
            required
            placeholder="+380..."
            className="min-h-12 w-full rounded-lg border border-dark/10 bg-white px-4 text-sm font-medium text-dark outline-none transition placeholder:text-dark/35 focus:border-dark/35 focus:ring-4 focus:ring-primary/30"
          />
        </label>
      </div>

      <div className="mt-5 rounded-lg bg-white p-4 ring-1 ring-dark/10">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-bold text-dark/55">До замовлення</span>
          <span className="text-lg font-black text-dark">
            {formatPrice(totalPrice)}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-dark/60">
          {product.brand} {product.name} x {quantity}
        </p>
      </div>

      {submitState === "error" ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitState === "loading" || !isAvailable}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-black text-dark transition hover:-translate-y-0.5 hover:bg-[#e9cb3e] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {submitState === "loading"
          ? "Відправляємо..."
          : isAvailable
            ? "Замовити"
            : "Немає в наявності"}
      </button>
    </form>
  );
}
