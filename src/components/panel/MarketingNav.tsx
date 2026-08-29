import Image from "next/image";
import Link from "next/link";

const LINKS = [
  { href: "/#servicios", label: "Servicios" },
  { href: "/#proceso", label: "Cómo funciona" },
];

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/brand/logo-merca-digital.png"
            alt="Merca Digital"
            width={220}
            height={54}
            className="h-11 w-auto md:h-12"
            priority
          />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/crm"
          className="group flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-2 pr-4 transition-colors hover:border-md-teal/40"
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-md-teal" />
          <span className="text-sm font-semibold text-gray-900">CRM</span>
        </Link>
      </nav>
    </header>
  );
}
