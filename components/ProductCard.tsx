import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-soft ring-1 ring-dark/5 transition hover:-translate-y-1 hover:ring-dark/15">
      <Link
        href={`/catalog/${product.slug}`}
        className="relative block aspect-square bg-[#efefef]"
        aria-label={product.name}
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-dark/45">
              {product.brand}
            </p>
            <h3 className="mt-2 min-h-12 text-base font-bold leading-6 text-dark">
              <Link href={`/catalog/${product.slug}`} className="hover:text-dark/75">
                {product.name}
              </Link>
            </h3>
          </div>
          <span className="shrink-0 rounded-full bg-background px-3 py-1 text-xs font-semibold text-dark/65">
            {product.category}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-lg font-extrabold text-dark">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice ? (
            <span className="text-sm font-semibold text-dark/35 line-through">
              {formatPrice(product.oldPrice)}
            </span>
          ) : null}
        </div>
        <div className="mt-auto pt-5">
          <p className="mb-4 text-sm font-semibold text-dark/60">
            {product.stockStatus}
          </p>
          <Link
            href={`/catalog/${product.slug}`}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-dark/10 bg-white px-4 py-2 text-sm font-bold text-dark transition hover:border-dark/30 hover:bg-primary"
          >
            Детальніше
          </Link>
        </div>
      </div>
    </article>
  );
}
