"use client";

import { useMemo, useState } from "react";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProductCard } from "@/components/ProductCard";
import { SearchInput } from "@/components/SearchInput";
import type { Product } from "@/types/product";

type CatalogClientProps = {
  products: Product[];
  categories: string[];
};

export function CatalogClient({ products, categories }: CatalogClientProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Усі");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("uk");

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "Усі" || product.category === activeCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        product.name.toLocaleLowerCase("uk").includes(normalizedQuery) ||
        product.brand.toLocaleLowerCase("uk").includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, products, query]);

  return (
    <div className="space-y-8">
      <div className="grid gap-5 rounded-lg bg-white p-5 shadow-soft ring-1 ring-dark/5 md:grid-cols-[1fr_1.4fr]">
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />
        <SearchInput value={query} onChange={setQuery} />
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-white px-6 py-14 text-center shadow-soft ring-1 ring-dark/5">
          <p className="text-lg font-bold text-dark">Нічого не знайдено</p>
          <p className="mt-2 text-sm text-dark/60">
            Спробуйте змінити категорію або пошуковий запит.
          </p>
        </div>
      )}
    </div>
  );
}
