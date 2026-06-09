import type { Metadata } from "next";
import { CTAButton } from "@/components/CTAButton";
import { SectionTitle } from "@/components/SectionTitle";
import { altegioBookingUrl } from "@/lib/links";

export const metadata: Metadata = {
  title: "Грумінг послуги",
  description:
    "Грумінг малих, середніх і великих собак, грумінг котів та експрес-линька в Urban Grooming Lviv.",
  openGraph: {
    title: "Грумінг послуги | Urban Grooming Lviv",
    description:
      "Послуги грумінгу для собак і котів у Львові від Urban Grooming Lviv.",
    url: "/services",
  },
};

const services = [
  {
    title: "Грумінг малих собак",
    description:
      "Комплексний догляд для малих порід: купання, сушка, стрижка, гігієна лап, вух і кігтів.",
  },
  {
    title: "Грумінг середніх собак",
    description:
      "Салонний догляд для собак середнього розміру з урахуванням типу шерсті та темпераменту.",
  },
  {
    title: "Грумінг великих собак",
    description:
      "Продуманий грумінг великих порід з комфортним темпом і професійною косметикою.",
  },
  {
    title: "Грумінг котів",
    description:
      "Акуратний догляд за шерстю, гігієнічні процедури та зниження стресу під час візиту.",
  },
  {
    title: "Експрес-линька",
    description:
      "Інтенсивне вичісування підшерстя, купання та сушка для помітного зменшення шерсті вдома.",
  },
];

export default function ServicesPage() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Салон"
          title="Грумінг послуги"
          description="Оберіть напрям догляду та запишіться онлайн через Altegio."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              className="flex min-h-64 flex-col rounded-lg bg-white p-6 shadow-soft ring-1 ring-dark/5"
            >
              <h2 className="text-2xl font-black text-dark">{service.title}</h2>
              <p className="mt-4 leading-7 text-dark/65">{service.description}</p>
              <CTAButton
                href={altegioBookingUrl}
                external
                variant="dark"
                className="mt-auto w-full"
              >
                Записатися
              </CTAButton>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
