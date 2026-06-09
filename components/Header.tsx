import Link from "next/link";

const navItems = [
  { href: "/catalog", label: "Магазин" },
  { href: "/services", label: "Грумінг" },
  { href: "/orders", label: "Мої заявки" },
  { href: "/contacts", label: "Контакти" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-dark/10 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Urban Grooming Lviv">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-black text-dark">
            UG
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-extrabold text-dark">
              Urban Grooming
            </span>
            <span className="block text-xs font-medium text-dark/55">Lviv</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-dark/75 transition hover:bg-white hover:text-dark sm:px-4"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
