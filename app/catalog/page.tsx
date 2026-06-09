import type { Metadata } from "next";
import { CatalogClient } from "@/components/CatalogClient";
import { SectionTitle } from "@/components/SectionTitle";
import { getCategories, getProducts } from "@/services/products";

export const metadata: Metadata = {
  title: "Каталог зоотоварів",
  description:
    "Каталог кормів, ласощів, косметики, гігієни та аксесуарів для собак і котів у Urban Grooming Lviv.",
  openGraph: {
    title: "Каталог зоотоварів | Urban Grooming Lviv",
    description:
      "Корм, ласощі, косметика та аксесуари для собак і котів у Львові.",
    url: "/catalog",
  },
};

export default function CatalogPage() {
  const products = getProducts();
  const categories = getCategories();

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Магазин"
          title="Каталог"
          description="Пошук за назвою або брендом, фільтр за категорією та швидкий перехід до деталей товару."
        />
        <div className="mt-8">
          <CatalogClient products={products} categories={categories} />
        </div>
      </div>
    </section>
  );
}
