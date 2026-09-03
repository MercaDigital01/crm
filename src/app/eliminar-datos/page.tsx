import Link from "next/link";
import { MarketingNav } from "@/components/panel/MarketingNav";

export const metadata = {
  title: "Eliminar mis datos — Merca Digital",
  description: "Cómo solicitar la eliminación de tu información en el CRM de Merca Digital.",
};

export default function EliminarDatosPage() {
  return (
    <div className="flex flex-1 flex-col bg-md-admin-bg font-admin-sans">
      <MarketingNav />

      <main className="mx-auto w-full max-w-2xl px-6 py-16 md:py-20">
        <h1 className="font-admin-display text-3xl font-semibold text-md-admin-cream md:text-4xl">
          Eliminar mis datos
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-md-admin-rose-muted">
          Si quieres que eliminemos la información personal asociada a tu cuenta en el
          CRM de Merca Digital (datos de contacto, registros de conversaciones de
          WhatsApp, estadísticas de campañas, archivos compartidos), sigue estos pasos.
        </p>

        <div className="mt-10 flex flex-col gap-6">
          <div className="admin-card flex gap-4 p-6">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-md-admin-coral text-sm font-semibold text-white">
              1
            </span>
            <div>
              <p className="text-sm font-semibold text-white">
                Escríbenos solicitando la eliminación de tus datos
              </p>
              <p className="mt-1 text-sm leading-relaxed text-md-admin-rose-muted">
                Por correo a{" "}
                <a href="mailto:mercadigital.durango@gmail.com" className="text-md-admin-gold underline">
                  mercadigital.durango@gmail.com
                </a>{" "}
                o por WhatsApp al{" "}
                <a
                  href="https://wa.me/526181112580?text=Quiero%20solicitar%20la%20eliminaci%C3%B3n%20de%20mis%20datos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-md-admin-gold underline"
                >
                  618 111 2580
                </a>
                , indicando el nombre de tu negocio y el correo con el que te
                registraste.
              </p>
            </div>
          </div>

          <div className="admin-card flex gap-4 p-6">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-md-admin-coral text-sm font-semibold text-white">
              2
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Confirmamos tu identidad</p>
              <p className="mt-1 text-sm leading-relaxed text-md-admin-rose-muted">
                Verificamos que la solicitud venga realmente del titular de la cuenta
                (o de una persona autorizada) antes de proceder.
              </p>
            </div>
          </div>

          <div className="admin-card flex gap-4 p-6">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-md-admin-coral text-sm font-semibold text-white">
              3
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Eliminamos tu información</p>
              <p className="mt-1 text-sm leading-relaxed text-md-admin-rose-muted">
                Eliminamos tus datos personales de nuestra plataforma dentro de los 30
                días siguientes a la confirmación, salvo que la ley nos obligue a
                conservar algún registro por más tiempo (por ejemplo, historial de
                pagos ya facturados). Te confirmamos por el mismo medio cuando el
                proceso concluya.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-10 text-sm leading-relaxed text-md-admin-rose-muted">
          Para más detalle sobre qué información recopilamos y cómo la usamos, consulta
          nuestro <Link href="/privacidad">Aviso de Privacidad</Link>.
        </p>

        <Link
          href="/"
          className="mt-12 inline-block text-sm font-medium text-md-admin-gold hover:underline"
        >
          ← Volver al inicio
        </Link>
      </main>
    </div>
  );
}
