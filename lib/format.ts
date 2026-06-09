export function formatPrice(price: number): string {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 0,
  }).format(price);
}

export function createTelegramOrderLink(productName: string): string {
  const message = `Вітаю! Хочу замовити: ${productName}`;
  return `https://t.me/urbangroominglviv?text=${encodeURIComponent(message)}`;
}
