export function formatPrice(price: number): string {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 0,
  }).format(price);
}

type TelegramOrderProduct = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
};

export function createTelegramOrderLink(product: TelegramOrderProduct): string {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://urban-grooming-lviv.vercel.app";
  const message = [
    "Вітаю! Хочу замовити:",
    `${product.brand} ${product.name}`,
    `Категорія: ${product.category}`,
    `Ціна: ${formatPrice(product.price)}`,
    `Сторінка товару: ${siteUrl}/catalog/${product.slug}`,
  ].join("\n");

  return `https://t.me/urbangroominglviv?text=${encodeURIComponent(message)}`;
}
