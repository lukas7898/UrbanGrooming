import { NextResponse } from "next/server";
import { formatPrice } from "@/lib/format";
import { getProductBySlug } from "@/services/products";

type OrderPayload = {
  productSlug?: unknown;
  quantity?: unknown;
  customerName?: unknown;
  customerPhone?: unknown;
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

function buildOrderMessage({
  orderId,
  createdAt,
  customerName,
  customerPhone,
  productName,
  brand,
  category,
  quantity,
  total,
  productUrl,
}: {
  orderId: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  brand: string;
  category: string;
  quantity: number;
  total: number;
  productUrl: string;
}) {
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
    `Товар: ${brand} ${productName}`,
    `Категорія: ${category}`,
    `Кількість: ${quantity}`,
    `Сума: ${formatPrice(total)}`,
    "",
    `Сторінка товару: ${productUrl}`,
  ].join("\n");
}

function createOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `UG-${timestamp}-${random}`;
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

  const productSlug = sanitizeText(payload.productSlug);
  const customerName = sanitizeText(payload.customerName);
  const customerPhone = sanitizeText(payload.customerPhone);
  const quantity =
    typeof payload.quantity === "number" && Number.isInteger(payload.quantity)
      ? payload.quantity
      : 0;

  if (!productSlug || !customerName || !customerPhone) {
    return NextResponse.json(
      { ok: false, error: "Заповніть ім'я, телефон і товар." },
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

  if (quantity < 1 || quantity > 99) {
    return NextResponse.json(
      { ok: false, error: "Кількість має бути від 1 до 99." },
      { status: 400 },
    );
  }

  const product = getProductBySlug(productSlug);

  if (!product) {
    return NextResponse.json(
      { ok: false, error: "Товар не знайдено." },
      { status: 404 },
    );
  }

  if (product.stockQuantity <= 0) {
    return NextResponse.json(
      { ok: false, error: "Товар зараз недоступний для замовлення." },
      { status: 409 },
    );
  }

  if (quantity > product.stockQuantity) {
    return NextResponse.json(
      {
        ok: false,
        error: `Доступно лише ${product.stockQuantity} шт. Оберіть меншу кількість.`,
      },
      { status: 409 },
    );
  }

  const siteUrl = getSiteUrl(request);
  const productUrl = `${siteUrl}/catalog/${product.slug}`;
  const total = product.price * quantity;
  const orderId = createOrderId();
  const createdAt = new Date().toISOString();
  const text = buildOrderMessage({
    orderId,
    createdAt,
    customerName,
    customerPhone,
    productName: product.name,
    brand: product.brand,
    category: product.category,
    quantity,
    total,
    productUrl,
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
      productSlug: product.slug,
      productName: product.name,
      brand: product.brand,
      category: product.category,
      quantity,
      total,
      customerName,
      customerPhone,
    },
  });
}
