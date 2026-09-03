import { MessageCircle, ShieldCheck, TrendingUp } from "lucide-react";
import Link from "next/link";
import { MarketingNav } from "@/components/panel/MarketingNav";

const FEATURES = [
  {
    title: "Conversaciones y ventas",
    copy: "Lee cada conversación que el agente de IA tuvo por WhatsApp: citas agendadas, ventas cerradas, seguimientos pendientes.",
    tint: "bg-md-teal/[0.07]",
  },
  {
    title: "Campañas y presupuesto",
    copy: "Estadísticas de Meta Ads y Google Ads, y control directo sobre cuánto presupuesto le das a cada campaña.",
    tint: "bg-md-admin-gold/[0.08]",
  },
  {
    title: "Tu plan y calendario",
    copy: "El resumen de tu plan de mercadotecnia y el calendario de contenido, siempre a la mano.",
    tint: "bg-md-admin-coral/[0.08]",
  },
  {
    title: "Pago y estado de cuenta",
    copy: "Registra tu tarjeta una vez y olvídate del cobro manual — tú ves el estado de tu cuenta en todo momento.",
    tint: null,
  },
];

const STATUS_ROWS = [
  { icon: MessageCircle, label: "Agente WhatsApp", level: "Activo", tint: "bg-md-teal/20 text-md-teal" },
  { icon: TrendingUp, label: "Campañas", level: "En proceso", tint: "bg-md-admin-gold/20 text-md-admin-gold" },
  { icon: ShieldCheck, label: "Cobro y cuenta", level: "Activo", tint: "bg-blue-400/20 text-blue-300" },
];

export default function CrmPage() {
  return (
    <div className="flex flex-1 flex-col bg-md-admin-bg font-admin-sans">
      <MarketingNav />

      <section className="border-b border-white/10 px-6 pb-24 pt-16 md:pb-32 md:pt-24">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-7">
          <h1 className="max-w-3xl font-admin-display text-5xl font-semibold leading-[1.02] tracking-tight text-md-admin-cream md:text-7xl">
            Tu propio tablero de control, incluido con tu plan.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-md-admin-rose-muted">
            Si ya eres cliente de Merca Digital, aquí es donde vives todos
            los días: tu agente de WhatsApp, tus campañas y el estado de tu
            cuenta, siempre encendido.
          </p>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-3 rounded-full bg-md-admin-gold px-7 py-3.5 text-sm font-semibold text-md-admin-card-deep transition-transform duration-200 hover:scale-[1.02] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-md-admin-gold focus-visible:ring-offset-2"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/40"
            >
              Crear mi cuenta
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-md-admin-card-deep px-6 py-24 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="admin-card p-6 md:p-10">
            <div className="mb-8">
              <span className="text-xs font-semibold uppercase tracking-wide text-md-admin-rose-muted/70">
                Panel de ejemplo
              </span>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {STATUS_ROWS.map((row) => (
                <div key={row.label} className="flex items-center gap-4">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${row.tint}`}
                  >
                    <row.icon size={20} strokeWidth={1.75} />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">
                      {row.label}
                    </span>
                    <span className="text-xs text-md-admin-rose-muted/70">{row.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 md:py-28">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-14 max-w-lg font-admin-display text-4xl font-semibold leading-tight tracking-tight text-md-admin-cream md:text-5xl">
            Cuatro instrumentos, un solo panel.
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className={`admin-card flex flex-col gap-3 ${
                  i % 2 === 0 ? "md:col-span-3" : "md:col-span-2"
                } ${feature.tint ?? ""}`}
              >
                <h3 className="text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-md-admin-rose-muted">
                  {feature.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 text-md-admin-rose-muted/70 sm:flex-row sm:items-center">
          <span className="text-sm font-semibold text-md-admin-cream">Merca Digital</span>
          <Link
            href="/"
            className="text-xs font-medium uppercase tracking-wide transition-colors hover:text-white"
          >
            Volver al inicio
          </Link>
        </div>
      </footer>
    </div>
  );
}
