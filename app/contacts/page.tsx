import type { Metadata } from "next";
import { CTAButton } from "@/components/CTAButton";
import { SectionTitle } from "@/components/SectionTitle";
import { altegioBookingUrl, instagramUrl } from "@/lib/links";

export const metadata: Metadata = {
  title: "Контакти",
  description:
    "Контакти Urban Grooming Lviv: адреса у Львові, Instagram, Altegio запис і графік роботи.",
  openGraph: {
    title: "Контакти | Urban Grooming Lviv",
    description:
      "Зв'язок з Urban Grooming Lviv для запису на грумінг і замовлення зоотоварів.",
    url: "/contacts",
  },
};

const contactRows = [
  { label: "Адреса", value: "м. Львів, вул. Під Голоском 19Д" },
  { label: "Графік", value: "Щодня: 10:00-20:00" },
  { label: "Instagram", value: "@urbangruminglviv" },
];

export default function ContactsPage() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Зв'язок"
          title="Контакти"
          description="Запис на грумінг через Altegio, товари можна оформити через кошик на сайті."
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
              Instagram і запис онлайн
            </h2>
            <p className="mt-4 leading-7 text-white/70">
              Запис на грумінг доступний через Altegio. Для новин, консультацій і живих оновлень переходьте в Instagram.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <CTAButton
                href={altegioBookingUrl}
                external
                variant="primary"
              >
                Записатися через Altegio
              </CTAButton>
              <CTAButton
                href={instagramUrl}
                external
                variant="outline"
              >
                Instagram
              </CTAButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
