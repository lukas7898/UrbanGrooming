import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CTAButton } from "@/components/CTAButton";
import { ProductCard } from "@/components/ProductCard";
import { SectionTitle } from "@/components/SectionTitle";
import { altegioBookingUrl } from "@/lib/links";
import {
  getCategories,
  getFeaturedProducts,
  getProducts,
} from "@/services/products";

export const metadata: Metadata = {
  title: "Грумінг і зоотовари у Львові",
  description:
    "Urban Grooming Lviv: догляд, корми, ласощі та косметика для собак і котів.",
  openGraph: {
    title: "Urban Grooming Lviv — грумінг і зоотовари у Львові",
    description:
      "Догляд, корми, ласощі та косметика для собак і котів у Львові.",
    url: "/",
  },
};

const services = [
  "Грумінг малих собак",
  "Грумінг середніх собак",
  "Грумінг котів",
];

const benefits = [
  "Преміальний, чистий підхід до догляду без зайвого шуму",
  "Каталог товарів готовий до майбутнього e-commerce розвитку",
  "Зручний кошик для зоотоварів і онлайн-запис на грумінг через Altegio",
];

export default function Home() {
  const categories = getCategories();
  const featuredProducts = getFeaturedProducts().slice(0, 4);
  const productCount = getProducts().length;

  return (
    <>
      <section className="bg-dark text-white">
        <div className="mx-auto grid min-h-[calc(100vh-150px)] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <p className="mb-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-primary">
              Urban Grooming Lviv
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-normal sm:text-5xl lg:text-6xl">
              Urban Grooming — грумінг і зоотовари у Львові
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
              Догляд, корми, ласощі та косметика для собак і котів.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <CTAButton href="/catalog">Перейти в магазин</CTAButton>
              <CTAButton href={altegioBookingUrl} variant="outline" external>
                Записатися на грумінг
              </CTAButton>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-lg bg-white p-5 text-dark shadow-soft">
              <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg bg-background">
                <Image
                  src="/images/products/placeholder-product.jpg"
                  alt="Urban Grooming Lviv зоотовари"
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-background p-5">
                  <p className="text-4xl font-black">{productCount}</p>
                  <p className="mt-2 text-sm font-semibold text-dark/60">
                    демотоварів у каталозі
                  </p>
                </div>
                <div className="rounded-lg bg-primary p-5">
                  <p className="text-4xl font-black">{categories.length}</p>
                  <p className="mt-2 text-sm font-semibold text-dark/65">
                    категорій для старту
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-dark/10 p-5">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-dark/45">
                  Грумінг
                </p>
                <p className="mt-3 text-2xl font-black text-dark">
                  Чистий запис, міський стиль, професійний догляд
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Категорії"
            title="Popular categories"
            description="Стартовий каталог побудований так, щоб його було легко розширити до повноцінного магазину."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category}
                href="/catalog"
                className="rounded-lg bg-white p-6 shadow-soft ring-1 ring-dark/5 transition hover:-translate-y-1 hover:ring-dark/15"
              >
                <span className="text-sm font-bold uppercase tracking-[0.16em] text-dark/40">
                  Категорія
                </span>
                <p className="mt-3 text-2xl font-black text-dark">{category}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionTitle
              eyebrow="Салон"
              title="Grooming services"
              description="Послуги для собак і котів з акцентом на комфорт тварини, охайний фініш і зрозумілу комунікацію."
            />
            <div className="grid gap-4 sm:grid-cols-3">
              {services.map((service) => (
                <div key={service} className="rounded-lg bg-background p-6">
                  <p className="text-lg font-black text-dark">{service}</p>
                  <p className="mt-3 text-sm leading-6 text-dark/65">
                    Консультація, догляд і підбір формату процедури.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionTitle
              eyebrow="Магазин"
              title="Featured products"
              description="Популярні позиції для швидкого старту каталогу."
            />
            <CTAButton href="/catalog" variant="dark" className="sm:mb-1">
              Увесь каталог
            </CTAButton>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Підхід"
            title="Why choose us"
            description="MVP вже відображає дві рівні частини бізнесу: грумінг і магазин."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="rounded-lg border border-dark/10 p-6">
                <p className="text-base font-bold leading-7 text-dark">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-lg bg-dark p-8 text-white sm:p-10">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
                Контакт
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-normal">
                Підібрати товар або записатися на грумінг
              </h2>
              <p className="mt-3 max-w-2xl text-white/70">
                Замовляйте товари через кошик або записуйтеся на грумінг онлайн через Altegio.
              </p>
            </div>
            <CTAButton href="/contacts">Контакти</CTAButton>
          </div>
        </div>
      </section>
    </>
  );
}
