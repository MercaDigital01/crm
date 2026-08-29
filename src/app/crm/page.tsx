import { MessageCircle, ShieldCheck, TrendingUp } from "lucide-react";
import Link from "next/link";
import { MarketingNav } from "@/components/panel/MarketingNav";

const CARD_SHADOW = "shadow-[0_2px_10px_rgba(0,0,0,0.02)]";

const FEATURES = [
  {
    title: "Conversaciones y ventas",
    copy: "Lee cada conversación que el agente de IA tuvo por WhatsApp: citas agendadas, ventas cerradas, seguimientos pendientes.",
    tint: "bg-md-teal/[0.06]",
  },
  {
    title: "Campañas y presupuesto",
    copy: "Estadísticas de Meta Ads y Google Ads, y control directo sobre cuánto presupuesto le das a cada campaña.",
    tint: "bg-md-gold/[0.07]",
  },
  {
    title: "Tu plan y calendario",
    copy: "El resumen de tu plan de mercadotecnia y el calendario de contenido, siempre a la mano.",
    tint: "bg-md-blue/[0.05]",
  },
  {
    title: "Pago y estado de cuenta",
    copy: "Registra tu tarjeta una vez y olvídate del cobro manual — tú ves el estado de tu cuenta en todo momento.",
    tint: null,
  },
];

const STATUS_ROWS = [
  { icon: MessageCircle, label: "Agente WhatsApp", level: "Activo", tint: "bg-md-teal/10 text-md-teal" },
  { icon: TrendingUp, label: "Campañas", level: "En proceso", tint: "bg-md-gold/10 text-[#a5790a]" },
  { icon: ShieldCheck, label: "Cobro y cuenta", level: "Activo", tint: "bg-md-blue/10 text-md-blue" },
];

export default function CrmPage() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <MarketingNav />

      <section className="border-b border-gray-100 px-6 pb-24 pt-16 md:pb-32 md:pt-24">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-7">
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight text-gray-900 md:text-7xl">
            Tu propio tablero de control, incluido con tu plan.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-gray-500">
            Si ya eres cliente de Merca Digital, aquí es donde vives todos
            los días: tu agente de WhatsApp, tus campañas y el estado de tu
            cuenta, siempre encendido.
          </p>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-3 rounded-full bg-md-teal px-7 py-3.5 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-md-teal focus-visible:ring-offset-2"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-full border border-gray-200 px-7 py-3.5 text-sm font-semibold text-gray-900 transition-colors hover:border-gray-300"
            >
              Crear mi cuenta
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-gray-50 px-6 py-24 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className={`rounded-3xl bg-white p-6 md:p-10 ${CARD_SHADOW}`}>
            <div className="mb-8">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
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
                    <span className="text-sm font-semibold text-gray-900">
                      {row.label}
                    </span>
                    <span className="text-xs text-gray-400">{row.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 md:py-28">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-14 max-w-lg text-4xl font-semibold leading-tight tracking-tight text-gray-900 md:text-5xl">
            Cuatro instrumentos, un solo panel.
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className={`flex flex-col gap-3 rounded-3xl p-8 ${
                  i % 2 === 0 ? "md:col-span-3" : "md:col-span-2"
                } ${feature.tint ?? "border border-gray-100"} ${CARD_SHADOW}`}
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {feature.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 text-gray-400 sm:flex-row sm:items-center">
          <span className="text-sm font-semibold text-gray-900">Merca Digital</span>
          <Link
            href="/"
            className="text-xs font-medium uppercase tracking-wide transition-colors hover:text-gray-900"
          >
            Volver al inicio
          </Link>
        </div>
      </footer>
    </div>
  );
}
