import type { Metadata } from "next";
import { CartClient } from "@/components/CartClient";
import { SectionTitle } from "@/components/SectionTitle";
import { getProducts } from "@/services/products";

export const metadata: Metadata = {
  title: "Кошик",
  description:
    "Кошик Urban Grooming Lviv для оформлення заявки на кілька товарів.",
  openGraph: {
    title: "Кошик | Urban Grooming Lviv",
    description:
      "Оформлення заявки на кілька товарів у каталозі Urban Grooming Lviv.",
    url: "/cart",
  },
};

export default function CartPage() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Замовлення"
          title="Кошик"
          description="Зберіть кілька позицій і відправте одну заявку в Telegram."
        />
        <div className="mt-8">
          <CartClient products={getProducts()} />
        </div>
      </div>
    </section>
  );
}
