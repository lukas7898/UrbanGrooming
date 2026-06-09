import type { Metadata } from "next";
import { MyOrdersClient } from "@/components/MyOrdersClient";
import { SectionTitle } from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "Мої заявки",
  description:
    "Локальні квитанції замовлень Urban Grooming Lviv на цьому пристрої.",
  openGraph: {
    title: "Мої заявки | Urban Grooming Lviv",
    description:
      "Локальні квитанції замовлень Urban Grooming Lviv на цьому пристрої.",
    url: "/orders",
  },
};

export default function OrdersPage() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <SectionTitle
          eyebrow="Квитанції"
          title="Мої заявки"
          description="Це локальна історія заявок у цьому браузері. Для офіційного підтвердження ми зв'яжемося з вами телефоном."
        />
        <div className="mt-8">
          <MyOrdersClient />
        </div>
      </div>
    </section>
  );
}
