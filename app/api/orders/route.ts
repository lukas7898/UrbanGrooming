import { NextResponse } from "next/server";
import { formatPrice } from "@/lib/format";
import { getProductBySlug } from "@/services/products";
import type { OrderReceiptItem } from "@/types/order";

type OrderPayload = {
  items?: unknown;
  customerName?: unknown;
  customerPhone?: unknown;
};

type IncomingOrderItem = {
  productSlug: string;
  quantity: number;
};

function sanitizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getSiteUrl(request: Request): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  return new URL(request.url).origin;
}

function parseItems(value: unknown): IncomingOrderItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const itemMap = new Map<string, number>();

  for (const item of value) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const payloadItem = item as {
      productSlug?: unknown;
      quantity?: unknown;
    };
    const productSlug = sanitizeText(payloadItem.productSlug);
    const quantity =
      typeof payloadItem.quantity === "number" &&
      Number.isInteger(payloadItem.quantity)
        ? payloadItem.quantity
        : 0;

    if (!productSlug || quantity <= 0) {
      continue;
    }

    itemMap.set(productSlug, (itemMap.get(productSlug) ?? 0) + quantity);
  }

  return Array.from(itemMap.entries()).map(([productSlug, quantity]) => ({
    productSlug,
    quantity,
  }));
}

function createOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `UG-${timestamp}-${random}`;
}

function buildOrderMessage({
  orderId,
  createdAt,
  customerName,
  customerPhone,
  items,
  total,
  siteUrl,
}: {
  orderId: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  items: OrderReceiptItem[];
  total: number;
  siteUrl: string;
}) {
  const itemLines = items.flatMap((item, index) => [
    `${index + 1}. ${item.brand} ${item.productName}`,
    `   Категорія: ${item.category}`,
    `   Кількість: ${item.quantity}`,
    `   Ціна: ${formatPrice(item.price)} x ${item.quantity} = ${formatPrice(
      item.total,
    )}`,
    `   Сторінка: ${siteUrl}/catalog/${item.productSlug}`,
  ]);

  return [
    "Нове замовлення Urban Grooming Lviv",
    `Номер заявки: ${orderId}`,
    `Дата: ${new Intl.DateTimeFormat("uk-UA", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "Europe/Kyiv",
    }).format(new Date(createdAt))}`,
    "",
    `Клієнт: ${customerName}`,
    `Телефон: ${customerPhone}`,
    "",
    "Товари:",
    ...itemLines,
    "",
    `Разом: ${formatPrice(total)}`,
  ].join("\n");
}

export async function POST(request: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!botToken || !adminChatId) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Telegram bot is not configured. Add TELEGRAM_BOT_TOKEN and TELEGRAM_ADMIN_CHAT_ID.",
      },
      { status: 503 },
    );
  }

  let payload: OrderPayload;

  try {
    payload = (await request.json()) as OrderPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Некоректний формат заявки." },
      { status: 400 },
    );
  }

  const customerName = sanitizeText(payload.customerName);
  const customerPhone = sanitizeText(payload.customerPhone);
  const incomingItems = parseItems(payload.items);

  if (!customerName || !customerPhone || incomingItems.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Заповніть ім'я, телефон і кошик." },
      { status: 400 },
    );
  }

  if (customerName.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Перевірте ім'я." },
      { status: 400 },
    );
  }

  if (!/^\+380\d{9}$/.test(customerPhone)) {
    return NextResponse.json(
      { ok: false, error: "Телефон має бути у форматі +380XXXXXXXXX." },
      { status: 400 },
    );
  }

  const orderItems: OrderReceiptItem[] = [];

  for (const item of incomingItems) {
    if (item.quantity < 1 || item.quantity > 99) {
      return NextResponse.json(
        { ok: false, error: "Кількість має бути від 1 до 99." },
        { status: 400 },
      );
    }

    const product = getProductBySlug(item.productSlug);

    if (!product) {
      return NextResponse.json(
        { ok: false, error: "Один з товарів не знайдено." },
        { status: 404 },
      );
    }

    if (product.stockQuantity <= 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `${product.brand} ${product.name} зараз недоступний для замовлення.`,
        },
        { status: 409 },
      );
    }

    if (item.quantity > product.stockQuantity) {
      return NextResponse.json(
        {
          ok: false,
          error: `${product.brand} ${product.name}: доступно лише ${product.stockQuantity} шт.`,
        },
        { status: 409 },
      );
    }

    orderItems.push({
      productSlug: product.slug,
      productName: product.name,
      brand: product.brand,
      category: product.category,
      quantity: item.quantity,
      price: product.price,
      total: product.price * item.quantity,
    });
  }

  const siteUrl = getSiteUrl(request);
  const total = orderItems.reduce((sum, item) => sum + item.total, 0);
  const orderId = createOrderId();
  const createdAt = new Date().toISOString();
  const text = buildOrderMessage({
    orderId,
    createdAt,
    customerName,
    customerPhone,
    items: orderItems,
    total,
    siteUrl,
  });

  const telegramResponse = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: adminChatId,
        text,
        disable_web_page_preview: false,
      }),
    },
  );

  if (!telegramResponse.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "Telegram не прийняв заявку. Перевірте налаштування бота.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    order: {
      id: orderId,
      createdAt,
      items: orderItems,
      total,
      customerName,
      customerPhone,
    },
  });
}
