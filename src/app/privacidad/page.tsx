import Link from "next/link";
import { MarketingNav } from "@/components/panel/MarketingNav";

export const metadata = {
  title: "Aviso de Privacidad — Merca Digital",
  description: "Aviso de Privacidad del CRM de Merca Digital.",
};

export default function PrivacidadPage() {
  return (
    <div className="flex flex-1 flex-col bg-md-admin-bg font-admin-sans">
      <MarketingNav />

      <main className="mx-auto w-full max-w-3xl px-6 py-16 md:py-20">
        <h1 className="font-admin-display text-3xl font-semibold text-md-admin-cream md:text-4xl">
          Aviso de Privacidad
        </h1>
        <p className="mt-3 text-sm text-md-admin-rose-muted">
          Responsable: Merca Digital [PENDIENTE: razón social / RFC]. Contacto:
          mercadigital.durango@gmail.com · WhatsApp 618 111 2580 (actualizará a
          correo institucional cuando esté disponible).
        </p>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-md-admin-rose-muted [&_a]:text-md-admin-gold [&_a]:underline [&_h2]:mt-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-md-admin-cream [&_strong]:text-white">
          <section>
            <h2>1. Quiénes somos</h2>
            <p className="mt-2">
              Merca Digital es una agencia de mercadotecnia digital que opera este CRM
              para dar seguimiento al plan de mercadotecnia, campañas publicitarias y
              conversaciones de WhatsApp de sus clientes. Este aviso describe qué
              información personal recopilamos a través de la plataforma, para qué la
              usamos, y cómo puede ejercer sus derechos sobre ella, conforme a la Ley
              Federal de Protección de Datos Personales en Posesión de los Particulares
              (LFPDPPP).
            </p>
          </section>

          <section>
            <h2>2. Qué información recopilamos</h2>
            <p className="mt-2">Recopilamos únicamente la información necesaria para operar el Servicio descrito en nuestros <Link href="/terminos">Términos de Servicio</Link>:</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong>Datos de tu cuenta.</strong> Al iniciar sesión como cliente,
                nuestro proveedor de autenticación (Clerk) recopila tu nombre y correo
                electrónico y, si inicias sesión con Google, tu información básica de
                perfil de Google.
              </li>
              <li>
                <strong>Datos de tu negocio.</strong> Nombre del negocio, correo de
                contacto y teléfono, capturados por nuestro equipo al darte de alta
                como cliente.
              </li>
              <li>
                <strong>Registros de conversaciones de WhatsApp.</strong> Nombre de
                contacto, teléfono, notas y resultado (cita agendada, venta cerrada,
                seguimiento pendiente, etc.) de las interacciones de tu negocio por
                WhatsApp, capturados para llevar el seguimiento comercial de tu cuenta.
              </li>
              <li>
                <strong>Estadísticas de campañas publicitarias.</strong> Métricas de
                rendimiento (impresiones, clics, gasto, conversiones) de tus campañas
                en Meta Ads y Google Ads, capturadas por nuestro equipo.
              </li>
              <li>
                <strong>Archivos.</strong> Entregables y miniaturas de contenido que
                compartimos contigo o que nos compartes, almacenados con nuestro
                proveedor de almacenamiento de archivos, Cloudinary.
              </li>
              <li>
                <strong>Datos técnicos básicos.</strong> Cookies de sesión necesarias
                para mantenerte conectado (proporcionadas por Clerk) y datos de
                funcionamiento del sitio proporcionados por nuestro proveedor de
                hosting, Vercel. No usamos cookies de publicidad ni de rastreo de
                terceros.
              </li>
            </ul>
          </section>

          <section>
            <h2>3. Para qué usamos tu información</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Operar tu Dashboard y darte visibilidad sobre tu plan, campañas y conversaciones.</li>
              <li>Dar seguimiento comercial a las conversaciones e interacciones de tu negocio.</li>
              <li>Reportarte el desempeño de tus campañas publicitarias.</li>
              <li>Contactarte sobre el estado de tu cuenta, pagos o cambios al Servicio.</li>
              <li>Brindarte soporte técnico cuando lo solicites.</li>
            </ul>
            <p className="mt-2">No vendemos tu información a nadie, y no la usamos para fines distintos a los aquí descritos.</p>
          </section>

          <section>
            <h2>4. Con quién compartimos tu información</h2>
            <p className="mt-2">
              Solo compartimos información con los proveedores que necesitamos para
              operar el Servicio, y únicamente lo que cada uno requiere para prestar su
              función:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Clerk</strong> — autenticación de cuentas.</li>
              <li><strong>Neon</strong> — alojamiento de la base de datos.</li>
              <li><strong>Cloudinary</strong> — almacenamiento de archivos/imágenes.</li>
              <li><strong>Vercel</strong> — hospedaje del sitio y la plataforma.</li>
              <li>Meta y Google — únicamente en la medida en que administremos tus campañas publicitarias directamente en sus plataformas, conforme a tu plan contratado.</li>
            </ul>
          </section>

          <section>
            <h2>5. Seguridad y acceso a tu información</h2>
            <p className="mt-2">
              El acceso a la información de cada cliente está restringido dentro de la
              plataforma: un cliente solo puede ver los datos de su propia cuenta.
              Cuando un miembro de nuestro equipo necesita entrar a tu cuenta con fines
              de soporte, ese acceso queda registrado en un historial de auditoría
              interno (ver Sección 10 de nuestros{" "}
              <Link href="/terminos">Términos de Servicio</Link>).
            </p>
          </section>

          <section>
            <h2>6. Cuánto tiempo conservamos tu información</h2>
            <p className="mt-2">
              Conservamos tu información mientras tu cuenta esté activa. Si cancelas el
              Servicio, conservamos tus datos por 90 días naturales antes de
              eliminarlos definitivamente, salvo que solicites su borrado anticipado
              (ver <Link href="/eliminar-datos">Eliminar mis datos</Link>).
            </p>
          </section>

          <section>
            <h2>7. Tus derechos (ARCO)</h2>
            <p className="mt-2">
              Puedes solicitar en cualquier momento el Acceso, Rectificación,
              Cancelación u Oposición (derechos ARCO) sobre tu información personal, así
              como la eliminación de tus datos, escribiendo a
              mercadigital.durango@gmail.com o por WhatsApp al 618 111 2580. Ver también{" "}
              <Link href="/eliminar-datos">cómo solicitar la eliminación de tus datos</Link>.
            </p>
          </section>

          <section>
            <h2>8. Cambios a este aviso</h2>
            <p className="mt-2">
              Podemos actualizar este Aviso de Privacidad en cualquier momento. Los
              cambios relevantes se notificarán por correo electrónico y/o aviso en el
              Dashboard.
            </p>
          </section>

          <section>
            <h2>9. Contacto</h2>
            <p className="mt-2">
              Para cualquier duda sobre este aviso, escríbenos a
              mercadigital.durango@gmail.com o por WhatsApp al 618 111 2580.
            </p>
          </section>
        </div>

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
