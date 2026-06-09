"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { ordersStorageKey } from "@/types/cart";
import type { OrderReceipt } from "@/types/order";

type LegacyOrderReceipt = {
  id: string;
  createdAt: string;
  productSlug: string;
  productName: string;
  brand: string;
  category: string;
  quantity: number;
  total: number;
  customerName: string;
  customerPhone: string;
};

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function isCurrentOrderReceipt(
  order: OrderReceipt | LegacyOrderReceipt,
): order is OrderReceipt {
  if ("items" in order && Array.isArray(order.items)) {
    return true;
  }

  return false;
}

function normalizeOrder(order: OrderReceipt | LegacyOrderReceipt) {
  if (isCurrentOrderReceipt(order)) {
    return order;
  }

  return {
    id: order.id,
    createdAt: order.createdAt,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    total: order.total,
    items: [
      {
        productSlug: order.productSlug,
        productName: order.productName,
        brand: order.brand,
        category: order.category,
        quantity: order.quantity,
        price: order.total / order.quantity,
        total: order.total,
      },
    ],
  } satisfies OrderReceipt;
}

export function MyOrdersClient() {
  const [orders, setOrders] = useState<OrderReceipt[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const rawOrders = window.localStorage.getItem(ordersStorageKey);
      const parsedOrders = rawOrders
        ? (JSON.parse(rawOrders) as Array<OrderReceipt | LegacyOrderReceipt>)
        : [];
      setOrders(parsedOrders.map(normalizeOrder));
    } catch {
      setOrders([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  if (!loaded) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-soft ring-1 ring-dark/5">
        <p className="font-semibold text-dark/60">Завантажуємо заявки...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-soft ring-1 ring-dark/5">
        <p className="text-xl font-black text-dark">Заявок ще немає</p>
        <p className="mt-3 text-sm leading-6 text-dark/60">
          Після оформлення замовлення тут з&apos;явиться локальна квитанція.
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
    <div className="grid gap-5">
      {orders.map((order) => (
        <article
          key={order.id}
          className="rounded-lg bg-white p-5 shadow-soft ring-1 ring-dark/5"
        >
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-dark/45">
                {order.id}
              </p>
              <h2 className="mt-2 text-xl font-black text-dark">
                {order.items.length === 1
                  ? `${order.items[0].brand} ${order.items[0].productName}`
                  : `${order.items.length} позиції в заявці`}
              </h2>
              <p className="mt-2 text-sm font-semibold text-dark/55">
                {formatOrderDate(order.createdAt)}
              </p>
            </div>
            <span className="rounded-lg bg-primary px-4 py-2 text-sm font-black text-dark">
              {formatPrice(order.total)}
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {order.items.map((item) => (
              <div
                key={item.productSlug}
                className="rounded-lg bg-background p-4 text-sm"
              >
                <div className="flex justify-between gap-4">
                  <p className="font-black text-dark">
                    {item.brand} {item.productName}
                  </p>
                  <p className="font-black text-dark">
                    {formatPrice(item.total)}
                  </p>
                </div>
                <p className="mt-1 font-semibold text-dark/55">
                  {item.quantity} x {formatPrice(item.price)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-lg bg-background p-4">
              <p className="font-bold text-dark/45">Клієнт</p>
              <p className="mt-1 font-black text-dark">{order.customerName}</p>
            </div>
            <div className="rounded-lg bg-background p-4">
              <p className="font-bold text-dark/45">Телефон</p>
              <p className="mt-1 font-black text-dark">{order.customerPhone}</p>
            </div>
          </div>

          {order.items.length === 1 ? (
            <Link
              href={`/catalog/${order.items[0].productSlug}`}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-dark/10 px-4 py-2 text-sm font-black text-dark transition hover:border-dark/30 hover:bg-primary"
            >
              Відкрити товар
            </Link>
          ) : null}
        </article>
      ))}
    </div>
  );
}
