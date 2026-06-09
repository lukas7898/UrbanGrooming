import Link from "next/link";
import type { ReactNode } from "react";

type CTAButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "dark" | "outline";
  className?: string;
  external?: boolean;
};

const variantClasses = {
  primary:
    "bg-primary text-dark hover:-translate-y-0.5 hover:bg-[#e9cb3e]",
  dark: "bg-dark text-white hover:-translate-y-0.5 hover:bg-[#1f1f1f]",
  outline:
    "border border-dark/15 bg-white text-dark hover:-translate-y-0.5 hover:border-dark/35",
};

export function CTAButton({
  href,
  children,
  variant = "primary",
  className = "",
  external = false,
}: CTAButtonProps) {
  const classes = `inline-flex min-h-12 items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold transition ${variantClasses[variant]} ${className}`;

  if (external) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
