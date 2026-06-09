import productsData from "@/data/products.json";
import type { Product } from "@/types/product";

const products = productsData as Product[];

export function getProducts(): Product[] {
  return products;
}

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.featured);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getCategories(): string[] {
  return Array.from(new Set(products.map((product) => product.category))).sort(
    (a, b) => a.localeCompare(b, "uk"),
  );
}
