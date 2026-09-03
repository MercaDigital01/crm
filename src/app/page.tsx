import { Show } from "@clerk/nextjs";
import { CalendarDays, MessageCircle, ShieldCheck, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MarketingNav } from "@/components/panel/MarketingNav";

const AGENT_PHOTO =
  "https://images.unsplash.com/photo-1754331732644-f7b381eccd9f?fm=jpg&q=80&w=1800&auto=format&fit=crop";

const WHATSAPP_HREF =
  "https://wa.me/526181112580?text=" +
  encodeURIComponent("Hola, quiero saber más sobre el CRM de Merca Digital");

const STEPS = [
  {
    label: "Platicamos",
    copy: "Conocemos tu negocio y armamos el plan de mercadotecnia contigo.",
    color: "text-md-admin-gold",
  },
  {
    label: "Configuramos",
    copy: "Preparamos tu agente de WhatsApp, tus campañas y tu tablero.",
    color: "text-blue-300",
  },
  {
    label: "Operas",
    copy: "Tu tablero queda encendido — lo revisas cuando quieras, nosotros seguimos trabajando.",
    color: "text-md-teal",
  },
];

const STATUS_ROWS = [
  { icon: MessageCircle, label: "Agente WhatsApp", level: "Activo", tint: "bg-md-teal/20 text-md-teal" },
  { icon: TrendingUp, label: "Campañas", level: "En proceso", tint: "bg-md-admin-gold/20 text-md-admin-gold" },
  { icon: ShieldCheck, label: "Tu cuenta", level: "Activo", tint: "bg-blue-400/20 text-blue-300" },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-md-admin-bg font-admin-sans">
      <MarketingNav />

      {/* HERO — the real product's subject (WhatsApp), not an industrial costume */}
      <section className="relative overflow-hidden">
        <div className="relative min-h-[640px] w-full md:min-h-[760px]">
          <Image
            src={AGENT_PHOTO}
            alt="Persona respondiendo mensajes de WhatsApp desde su celular"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(61,17,25,0.55) 0%, rgba(61,17,25,0.72) 45%, rgba(61,17,25,0.96) 92%)",
            }}
          />

          <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-16 pt-24 md:pb-20">
            <h1 className="max-w-3xl font-admin-display text-6xl font-semibold leading-[0.95] tracking-tight text-white sm:text-7xl md:text-[6rem]">
              Tu mercadotecnia,
              <br />
              <span className="text-md-admin-gold">siempre a la vista.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              Manejamos tu contenido, tus campañas y un agente de
              inteligencia artificial que vende y agenda por WhatsApp. Tú ves
              todo, en tiempo real, sin tener que preguntarnos.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full bg-md-admin-gold px-7 py-3.5 text-sm font-semibold text-md-admin-card-deep transition-transform duration-200 hover:scale-[1.02] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-md-admin-gold focus-visible:ring-offset-2"
              >
                Quiero mi tablero
              </a>
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:border-white/50 active:scale-[0.97]"
                >
                  Ir a mi Dashboard
                </Link>
              </Show>
              <Show when="signed-out">
                <Link
                  href="/crm"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:border-white/50 active:scale-[0.97]"
                >
                  Ya soy cliente
                </Link>
              </Show>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF — a live preview of the real dashboard, not an illustrated instrument */}
      <section className="border-b border-white/10 bg-md-admin-card-deep px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="admin-card p-6 md:p-10">
            <div className="mb-8 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-md-admin-rose-muted/70">
                Así se ve tu tablero
              </span>
              <span className="flex items-center gap-2 rounded-full bg-md-teal/20 px-3 py-1 text-xs font-medium text-md-teal">
                <span className="h-1.5 w-1.5 rounded-full bg-md-teal" />
                Encendido
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

      {/* SERVICIOS — asymmetric, real content only: no invented case studies or stats */}
      <section id="servicios" className="border-b border-white/10 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-14 max-w-2xl font-admin-display text-4xl font-semibold leading-tight tracking-tight text-md-admin-cream md:text-5xl">
            Contenido, campañas y ventas — en un solo equipo.
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
            {/* Agente — featured, wider */}
            <div className="admin-card overflow-hidden p-0 md:col-span-3">
              <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-[1.1fr_0.9fr] md:p-10">
                <div className="flex flex-col justify-center gap-4">
                  <MessageCircle size={26} strokeWidth={1.75} className="text-md-teal" />
                  <h3 className="text-2xl font-semibold text-white">
                    Agente de ventas por WhatsApp
                  </h3>
                  <p className="text-sm leading-relaxed text-md-admin-rose-muted">
                    Un agente de IA responde, califica y cierra ventas o
                    agenda citas por WhatsApp a tu nombre — con las reglas
                    que definimos juntos. Cada conversación queda en tu
                    tablero, como un comprobante.
                  </p>
                </div>

                <div className="relative mx-auto w-full max-w-[230px] self-center">
                  <div className="relative rotate-1 rounded-2xl bg-[#f4f1e9] px-5 pb-6 pt-5 text-[#1b1b18] shadow-[0_20px_45px_-20px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-1.5 hover:rotate-0">
                    <p className="mb-4 border-b border-dashed border-black/20 pb-3 text-center text-[10px] font-medium uppercase tracking-wide">
                      Comprobante de conversación · ejemplo
                    </p>
                    <div className="flex flex-col gap-2 text-[11px] leading-relaxed">
                      <p className="text-black/50">Cliente 20:41</p>
                      <p>&quot;¿Tienen espacio para mañana?&quot;</p>
                      <p className="mt-2 text-black/50">Agente IA 20:41</p>
                      <p>
                        &quot;Claro, tengo 5:00 pm y 6:30 pm disponibles.
                        ¿Cuál te acomoda?&quot;
                      </p>
                      <p className="mt-2 text-black/50">Cliente 20:42</p>
                      <p>&quot;6:30 está perfecto&quot;</p>
                      <div className="my-2 border-t border-dashed border-black/20" />
                      <p className="flex justify-between font-semibold">
                        <span>CITA AGENDADA</span>
                        <span>6:30 PM</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ads — gold tint */}
            <div className="admin-card flex flex-col gap-4 bg-md-admin-gold/[0.07] p-8 md:col-span-2">
              <TrendingUp size={24} strokeWidth={1.75} className="text-md-admin-gold" />
              <h3 className="text-xl font-semibold text-white">
                Meta &amp; Google Ads
              </h3>
              <p className="text-sm leading-relaxed text-md-admin-rose-muted">
                Manejamos tus campañas de principio a fin: segmentación,
                presupuesto y optimización constante. Tú ves el rendimiento
                en tu tablero, sin esperar un reporte.
              </p>
            </div>

            {/* Contenido — coral tint */}
            <div className="admin-card flex flex-col gap-4 bg-md-admin-coral/[0.08] p-8 md:col-span-2">
              <CalendarDays size={24} strokeWidth={1.75} className="text-md-admin-coral" />
              <h3 className="text-xl font-semibold text-white">
                Contenido y calendario
              </h3>
              <p className="text-sm leading-relaxed text-md-admin-rose-muted">
                Diseñamos y programamos tus publicaciones con una parrilla
                mensual clara. Tú apruebas, nosotros ejecutamos.
              </p>
            </div>

            {/* Tablero — included value-add, not a fourth sold service */}
            <div className="flex items-center gap-4 rounded-3xl border border-white/10 p-6 md:col-span-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-400/20">
                <span className="h-2 w-2 rounded-full bg-blue-300" />
              </span>
              <p className="text-sm leading-relaxed text-md-admin-rose-muted">
                Todo esto se refleja en tu{" "}
                <span className="font-medium text-white">tablero</span>,
                incluido con tu plan — sin costo aparte.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESO — sequence carries real information, numbering earns its place */}
      <section id="proceso" className="border-b border-white/10 bg-md-admin-card-deep px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-16 max-w-xl font-admin-display text-4xl font-semibold leading-tight tracking-tight text-md-admin-cream md:text-5xl">
            Cómo arrancamos.
          </h2>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, i) => (
              <div key={step.label} className="flex flex-col gap-3">
                <span className={`text-sm font-semibold ${step.color}`}>
                  0{i + 1}
                </span>
                <h3 className="text-xl font-semibold text-white">
                  {step.label}
                </h3>
                <p className="max-w-xs text-sm leading-relaxed text-md-admin-rose-muted">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING CTA — a single committed color field, permitted for a Persuade surface */}
      <section className="bg-md-admin-gold px-6 py-24 md:py-28">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-7">
          <h2 className="max-w-3xl font-admin-display text-4xl font-semibold leading-[1.05] tracking-tight text-md-admin-card-deep md:text-6xl">
            Platícanos de tu negocio y arma tu tablero.
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-md-admin-card-deep px-7 py-3.5 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.97]"
            >
              Escribir por WhatsApp
            </a>
            <a
              href="mailto:mercadigital.durango@gmail.com"
              className="inline-flex items-center gap-3 rounded-full border border-md-admin-card-deep/40 px-7 py-3.5 text-sm font-semibold text-md-admin-card-deep transition-colors hover:border-md-admin-card-deep/70 active:scale-[0.97]"
            >
              mercadigital.durango@gmail.com
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-semibold text-md-admin-cream">Merca Digital</span>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <Link
              href="/#servicios"
              className="text-xs font-medium uppercase tracking-wide text-md-admin-rose-muted/70 transition-colors hover:text-white"
            >
              Servicios
            </Link>
            <Link
              href="/#proceso"
              className="text-xs font-medium uppercase tracking-wide text-md-admin-rose-muted/70 transition-colors hover:text-white"
            >
              Cómo funciona
            </Link>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium uppercase tracking-wide text-md-admin-rose-muted/70 transition-colors hover:text-white"
            >
              618 111 2580
            </a>
            <a
              href="mailto:mercadigital.durango@gmail.com"
              className="text-xs font-medium uppercase tracking-wide text-md-admin-rose-muted/70 transition-colors hover:text-white"
            >
              mercadigital.durango@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
