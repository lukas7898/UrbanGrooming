import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartForm } from "@/components/AddToCartForm";
import { formatPrice } from "@/lib/format";
import { getProductBySlug, getProducts } from "@/services/products";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getProducts().map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: "Товар не знайдено",
    };
  }

  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.shortDescription,
    openGraph: {
      title: product.seoTitle || product.name,
      description: product.seoDescription || product.shortDescription,
      url: `/catalog/${product.slug}`,
      images: [
        {
          url: product.imageUrl,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-white shadow-soft ring-1 ring-dark/5">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-contain p-6 sm:p-10"
          />
        </div>

        <div className="rounded-lg bg-white p-6 shadow-soft ring-1 ring-dark/5 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-dark/45">
            {product.brand}
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-dark sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-background px-4 py-2 text-sm font-bold text-dark/70">
              {product.category}
            </span>
            <span className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-dark">
              {product.stockQuantity > 0
                ? `${product.stockStatus} · ${product.stockQuantity} шт.`
                : product.stockStatus}
            </span>
          </div>

          <div className="mt-7 flex items-end gap-3">
            <span className="text-4xl font-black text-dark">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice ? (
              <span className="pb-1 text-lg font-semibold text-dark/35 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            ) : null}
          </div>

          <p className="mt-6 text-lg font-semibold leading-8 text-dark/75">
            {product.shortDescription}
          </p>
          <p className="mt-4 leading-8 text-dark/65">{product.description}</p>

          {product.tags.length > 0 ? (
            <div className="mt-7 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-dark/10 px-3 py-1 text-sm font-semibold text-dark/55"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          <AddToCartForm product={product} />
        </div>
      </div>
    </section>
  );
}
