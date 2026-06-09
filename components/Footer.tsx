import Link from "next/link";
import { altegioBookingUrl, instagramUrl } from "@/lib/links";

export function Footer() {
  return (
    <footer className="border-t border-dark/10 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
        <div>
          <p className="text-lg font-extrabold text-dark">Urban Grooming Lviv</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-dark/65">
            Грумінг і зоотовари для собак і котів у сучасному міському форматі.
          </p>
        </div>
        <div>
          <p className="text-sm font-bold text-dark">Навігація</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-dark/65">
            <Link href="/catalog" className="hover:text-dark">
              Магазин
            </Link>
            <Link href="/services" className="hover:text-dark">
              Послуги
            </Link>
            <Link href="/contacts" className="hover:text-dark">
              Контакти
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-dark">Соцмережі</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-dark/65">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-dark"
            >
              Instagram
            </a>
            <a
              href={altegioBookingUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-dark"
            >
              Запис Altegio
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-dark/10 px-4 py-5 text-center text-xs text-dark/45">
        © {new Date().getFullYear()} Urban Grooming Lviv
      </div>
    </footer>
  );
}
