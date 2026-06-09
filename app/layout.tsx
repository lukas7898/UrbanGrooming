import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://urban-grooming-lviv.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Urban Grooming Lviv",
    template: "%s | Urban Grooming Lviv",
  },
  description:
    "Urban Grooming Lviv: грумінг, корми, ласощі, косметика та товари для собак і котів у Львові.",
  openGraph: {
    title: "Urban Grooming Lviv",
    description:
      "Грумінг і зоотовари у Львові: догляд, корми, ласощі та косметика для собак і котів.",
    url: siteUrl,
    siteName: "Urban Grooming Lviv",
    locale: "uk_UA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
