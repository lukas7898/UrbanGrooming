import type { Metadata } from "next";
import { CTAButton } from "@/components/CTAButton";
import { SectionTitle } from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "Контакти",
  description:
    "Контакти Urban Grooming Lviv: Instagram, Telegram, адреса, телефон і графік роботи.",
  openGraph: {
    title: "Контакти | Urban Grooming Lviv",
    description:
      "Зв'язок з Urban Grooming Lviv для запису на грумінг і замовлення зоотоварів.",
    url: "/contacts",
  },
};

const contactRows = [
  { label: "Адреса", value: "Львів, адреса буде додана перед запуском" },
  { label: "Телефон", value: "+380 XX XXX XX XX" },
  { label: "Графік", value: "Пн-Сб: 10:00-19:00, Нд: за домовленістю" },
];

export default function ContactsPage() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Зв'язок"
          title="Контакти"
          description="Для запису на грумінг або замовлення товарів напишіть у зручний канал."
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-lg bg-white p-6 shadow-soft ring-1 ring-dark/5 sm:p-8">
            <div className="divide-y divide-dark/10">
              {contactRows.map((row) => (
                <div
                  key={row.label}
                  className="grid gap-2 py-5 first:pt-0 last:pb-0 sm:grid-cols-[180px_1fr]"
                >
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-dark/45">
                    {row.label}
                  </p>
                  <p className="font-semibold text-dark">{row.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-dark p-6 text-white shadow-soft sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
              Онлайн
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-normal">
              Instagram і Telegram
            </h2>
            <p className="mt-4 leading-7 text-white/70">
              Пишіть для консультації, запису або замовлення товарів з каталогу.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <CTAButton
                href="https://www.instagram.com/urbangruminglviv"
                external
                variant="primary"
              >
                Instagram
              </CTAButton>
              <CTAButton
                href="https://t.me/urbangroominglviv"
                external
                variant="outline"
              >
                Telegram
              </CTAButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
