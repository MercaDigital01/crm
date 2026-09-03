import Image from "next/image";
import Link from "next/link";

const LINKS = [
  { href: "/#servicios", label: "Servicios" },
  { href: "/#proceso", label: "Cómo funciona" },
];

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-md-admin-bg/90 backdrop-blur">
      <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 rounded-2xl bg-md-admin-cream px-3 py-2">
          <Image
            src="/brand/logo-merca-digital.png"
            alt="Merca Digital"
            width={220}
            height={54}
            className="h-8 w-auto md:h-9"
            priority
          />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/60 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/crm"
          className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] py-1.5 pl-2 pr-4 transition-colors hover:border-md-admin-gold/40"
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-md-admin-gold" />
          <span className="text-sm font-semibold text-white">CRM</span>
        </Link>
      </nav>
    </header>
  );
}
