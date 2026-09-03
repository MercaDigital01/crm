import Link from "next/link";
import { MarketingNav } from "@/components/panel/MarketingNav";

export const metadata = {
  title: "Términos de Servicio — Merca Digital",
  description: "Términos de Servicio del CRM de Merca Digital.",
};

export default function TerminosPage() {
  return (
    <div className="flex flex-1 flex-col bg-md-admin-bg font-admin-sans">
      <MarketingNav />

      <main className="mx-auto w-full max-w-3xl px-6 py-16 md:py-20">
        <h1 className="font-admin-display text-3xl font-semibold text-md-admin-cream md:text-4xl">
          Términos de Servicio
        </h1>
        <p className="mt-3 text-sm text-md-admin-rose-muted">
          CRM Merca Digital. Contacto: mercadigital.durango@gmail.com · WhatsApp 618 111 2580.
        </p>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-md-admin-rose-muted [&_a]:text-md-admin-gold [&_a]:underline [&_h2]:mt-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-md-admin-cream [&_strong]:text-white">
          <section>
            <h2>1. Objeto y aceptación</h2>
            <p className="mt-2">
              Los presentes Términos de Servicio (&quot;Términos&quot;) regulan el uso de la
              plataforma de gestión de mercadotecnia digital operada por Merca Digital
              (&quot;la Agencia&quot;, &quot;nosotros&quot;), incluyendo el sistema de administración de
              relación con clientes (&quot;el CRM&quot;), el panel de control (&quot;Dashboard&quot;), el
              agente de inteligencia artificial para atención por WhatsApp, y demás
              herramientas asociadas (en conjunto, &quot;el Servicio&quot;).
            </p>
            <p className="mt-2">
              Al registrarse y/o realizar el primer pago dentro de la plataforma, el
              cliente contratante (&quot;el Cliente&quot;, &quot;usted&quot;) acepta expresamente estos
              Términos en su totalidad. Si no está de acuerdo con alguna disposición, no
              debe registrarse ni utilizar el Servicio.
            </p>
          </section>

          <section>
            <h2>2. Descripción del Servicio</h2>
            <p className="mt-2">
              El Servicio consiste en el acceso a un panel privado (&quot;Dashboard&quot;) donde el
              Cliente puede consultar y, en la medida indicada en estos Términos,
              gestionar:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Un resumen organizado de su plan de mercadotecnia digital contratado con la Agencia.</li>
              <li>El registro de la actividad de un agente de inteligencia artificial que atiende, califica y/o agenda citas o ventas a través de WhatsApp en representación del negocio del Cliente.</li>
              <li>Estadísticas de desempeño de sus campañas publicitarias en Meta Ads (Facebook/Instagram) y Google Ads.</li>
              <li>Un módulo para <strong>solicitar</strong> ajustes de presupuesto de dichas campañas publicitarias, sujeto a revisión y ejecución por la Agencia (Sección 8).</li>
              <li>Un módulo de consulta de estado de cuenta y método de pago.</li>
            </ul>
            <p className="mt-2">
              El Servicio no incluye la administración, configuración ni optimización
              estratégica de las campañas publicitarias, actividad que permanece bajo
              control exclusivo de la Agencia conforme al plan de mercadotecnia
              contratado por separado.
            </p>
          </section>

          <section>
            <h2>3. Registro y cuenta de usuario</h2>
            <p className="mt-2">
              3.1. El acceso al Servicio se otorga mediante una cuenta de usuario
              individual, vinculada a un único negocio Cliente. Cada Cliente cuenta con
              una sola persona autorizada para iniciar sesión, salvo acuerdo distinto
              por escrito con la Agencia.
            </p>
            <p className="mt-2">
              3.2. El Cliente es responsable de mantener la confidencialidad de sus
              credenciales de acceso y de toda actividad realizada desde su cuenta.
            </p>
            <p className="mt-2">
              3.3. La cuenta permanece en estado &quot;pendiente de activación&quot; desde su
              creación hasta que la Agencia confirme el primer pago conforme a la
              Sección 5. Durante este estado, el Cliente no tiene acceso funcional al
              Dashboard.
            </p>
          </section>

          <section>
            <h2>4. Planes y precios</h2>
            <p className="mt-2">
              El plan de mercadotecnia contratado por el Cliente, lo que incluye, y su
              costo mensual se definen individualmente con cada Cliente y son visibles
              en todo momento dentro de la sección &quot;Tu plan&quot; de su Dashboard. Los
              precios se encuentran expresados en pesos mexicanos (MXN).
            </p>
          </section>

          <section>
            <h2>5. Cobro del Servicio</h2>
            <p className="mt-2">
              5.1. Actualmente, el cobro de la mensualidad del Servicio es gestionado
              directamente por el equipo de la Agencia con cada Cliente (no existe
              todavía un cobro recurrente automático dentro del Dashboard). La Agencia{" "}
              <strong>no almacena</strong> números completos de tarjeta bancaria en su
              plataforma.
            </p>
            <p className="mt-2">
              5.2. Cuando el cobro recurrente automático esté disponible dentro del
              Dashboard, estos Términos se actualizarán para describir dicho mecanismo
              antes de activarlo, y se notificará al Cliente con antelación razonable.
            </p>
            <p className="mt-2">
              5.3. El Cliente puede consultar su historial de pagos registrados en la
              sección &quot;Configuración de pago&quot; de su Dashboard.
            </p>
          </section>

          <section>
            <h2>6. Pagos pendientes, periodo de gracia y suspensión</h2>
            <p className="mt-2">
              6.1. Si un pago no se recibe en la fecha correspondiente, la cuenta del
              Cliente puede pasar a estado <strong>&quot;en periodo de gracia&quot;</strong>, a
              criterio de la Agencia, mientras se regulariza el pago.
            </p>
            <p className="mt-2">
              6.2. Durante el periodo de gracia, la Agencia dará seguimiento al Cliente
              para regularizar el pago.
            </p>
            <p className="mt-2">
              6.3. Si el pago no se regulariza, la cuenta puede pasar a estado{" "}
              <strong>&quot;suspendido&quot;</strong>, lo cual implica: (a) la desactivación del
              acceso funcional al CRM y Dashboard; (b) la pausa de las campañas
              publicitarias activas del Cliente que se encuentren bajo administración de
              la Agencia, gestionada por el equipo de la Agencia.
            </p>
            <p className="mt-2">
              6.4. El Cliente será notificado del cambio de estado de su cuenta.
            </p>
            <p className="mt-2">
              6.5. La reactivación del Servicio (y, en su caso, la reanudación de
              campañas pausadas) se realiza una vez regularizado el pago.
            </p>
          </section>

          <section>
            <h2>7. Cancelación voluntaria</h2>
            <p className="mt-2">
              7.1. El Cliente puede solicitar la cancelación del Servicio en cualquier
              momento escribiendo a mercadigital.durango@gmail.com o por WhatsApp al 618
              111 2580.
            </p>
            <p className="mt-2">
              7.2. Al cancelar, la cuenta pasa a estado <strong>&quot;cancelado&quot;</strong>,
              distinto de la suspensión por falta de pago descrita en la Sección 6. La
              cancelación implica: (a) la revocación de los accesos que el Cliente
              hubiera otorgado a la Agencia sobre sus cuentas de Meta Business Manager
              y/o Google Ads, en la medida en que dichos accesos ya no sean necesarios;
              (b) en caso de que el número de WhatsApp del Cliente hubiera sido migrado
              a la plataforma oficial de WhatsApp Business (Cloud API) conforme a la
              Sección 9, se definirá junto con el Cliente el destino de dicho número;
              (c) la conservación de los datos del Cliente por un plazo de{" "}
              <strong>90 (noventa) días naturales</strong> antes de su eliminación
              definitiva, salvo que el Cliente solicite su borrado anticipado conforme a
              la Sección 11 y nuestro <Link href="/privacidad">Aviso de Privacidad</Link>.
            </p>
            <p className="mt-2">
              7.3. No se realizarán cargos adicionales una vez procesada la
              cancelación, salvo cargos ya generados y pendientes de cobro previos a la
              fecha de cancelación.
            </p>
          </section>

          <section>
            <h2>8. Solicitudes de ajuste de presupuesto de campañas publicitarias</h2>
            <p className="mt-2">
              8.1. El Cliente puede <strong>solicitar</strong> desde su Dashboard un
              ajuste al presupuesto de sus campañas publicitarias activas (pausar,
              aumentar o reducir presupuesto). Dicha solicitud es revisada por el
              equipo de la Agencia, quien la ejecuta manualmente si procede — no se
              trata de un cambio instantáneo ni automático.
            </p>
            <p className="mt-2">
              8.2. La Agencia mantiene control exclusivo sobre la configuración,
              segmentación, creatividades y optimización estratégica de dichas
              campañas.
            </p>
            <p className="mt-2">
              8.3. Con base en las métricas de desempeño de sus campañas, la Agencia
              podrá compartir recomendaciones sobre posibles ajustes de presupuesto.
              Dichas recomendaciones son de carácter informativo.
            </p>
            <p className="mt-2">
              8.4. <strong>El presupuesto de las campañas publicitarias se factura de
              forma independiente y directa entre el Cliente (o la cuenta publicitaria
              correspondiente) y Meta y/o Google.</strong> Dicho gasto publicitario es
              distinto y separado de la mensualidad cobrada por la Agencia conforme a
              la Sección 5.
            </p>
          </section>

          <section>
            <h2>9. Agente de inteligencia artificial y atención por WhatsApp</h2>
            <p className="mt-2">
              9.1. El Servicio incluye la operación de un agente de inteligencia
              artificial que interactúa con los contactos del Cliente a través de
              WhatsApp, conforme a reglas y flujos configurados en conjunto con la
              Agencia. El resultado de dichas interacciones queda registrado en el
              Dashboard del Cliente.
            </p>
            <p className="mt-2">
              9.2. Dependiendo de la estrategia acordada con cada Cliente, el número de
              WhatsApp utilizado podrá ser (a) un número nuevo dedicado exclusivamente
              al agente, o (b) el número actual del Cliente migrado a la plataforma
              oficial de WhatsApp Business (Cloud API). El Cliente reconoce que, en el
              caso (b), dicho número dejará de poder utilizarse simultáneamente con la
              aplicación estándar de WhatsApp Business en un dispositivo móvil.
            </p>
            <p className="mt-2">
              9.3. El Servicio se opera en cumplimiento de las políticas comerciales de
              Meta para WhatsApp Business Platform, con el fin de proteger la cuenta y
              el número del Cliente frente a suspensiones o baneos por parte de dicha
              plataforma.
            </p>
          </section>

          <section>
            <h2>10. Acceso administrativo de soporte (&quot;Vista de Soporte&quot;)</h2>
            <p className="mt-2">
              10.1. El Cliente reconoce y acepta que la Agencia, como operadora de la
              plataforma, cuenta con la capacidad técnica de acceder a la información
              de su cuenta con fines de soporte técnico, resolución de dudas y
              administración del Servicio (&quot;Vista de Soporte&quot;).
            </p>
            <p className="mt-2">
              10.2. Todo acceso realizado mediante la Vista de Soporte queda registrado
              en un historial de auditoría (usuario administrador, fecha, cuenta
              consultada y, en su caso, cambios realizados), disponible para consulta
              interna de la Agencia.
            </p>
            <p className="mt-2">
              10.3. La Vista de Soporte <strong>no otorga acceso</strong> al número
              completo de la tarjeta bancaria del Cliente, dado que dicha información
              nunca es almacenada por la Agencia (ver Sección 5.1).
            </p>
          </section>

          <section>
            <h2>11. Propiedad de la información y datos personales</h2>
            <p className="mt-2">
              11.1. La información comercial del Cliente (contenido de conversaciones,
              estadísticas de campañas, datos de contacto de sus propios clientes,
              etc.) le pertenece al Cliente. La Agencia la trata como datos
              confidenciales y los utiliza únicamente para la prestación del Servicio.
            </p>
            <p className="mt-2">
              11.2. El tratamiento de datos personales por parte de la Agencia se
              realiza conforme a la Ley Federal de Protección de Datos Personales en
              Posesión de los Particulares (LFPDPPP) y se describe en detalle en
              nuestro <Link href="/privacidad">Aviso de Privacidad</Link>. El Cliente
              puede ejercer sus derechos de Acceso, Rectificación, Cancelación y
              Oposición (derechos ARCO), así como solicitar la eliminación de sus
              datos, conforme al proceso descrito en{" "}
              <Link href="/eliminar-datos">/eliminar-datos</Link>.
            </p>
          </section>

          <section>
            <h2>12. Propiedad intelectual</h2>
            <p className="mt-2">
              La plataforma, su código, diseño, marca &quot;Merca Digital&quot; y demás elementos
              asociados son propiedad de la Agencia. Estos Términos no transfieren al
              Cliente ningún derecho de propiedad intelectual sobre la plataforma.
            </p>
          </section>

          <section>
            <h2>13. Limitación de responsabilidad</h2>
            <p className="mt-2">
              13.1. El Servicio se proporciona &quot;tal cual&quot; y &quot;según disponibilidad&quot;. La
              Agencia no garantiza resultados específicos de ventas, agendamiento o
              desempeño publicitario, los cuales dependen de múltiples factores fuera
              de su control.
            </p>
            <p className="mt-2">
              13.2. La Agencia no será responsable por interrupciones del Servicio
              derivadas de fallas de terceros proveedores (Meta, Google, proveedores de
              infraestructura), fuera de su control razonable.
            </p>
          </section>

          <section>
            <h2>14. Modificaciones a los Términos</h2>
            <p className="mt-2">
              La Agencia podrá actualizar estos Términos en cualquier momento. Los
              cambios relevantes serán notificados al Cliente por correo electrónico
              y/o aviso en el Dashboard, con una antelación razonable antes de su
              entrada en vigor.
            </p>
          </section>

          <section>
            <h2>15. Legislación aplicable y jurisdicción</h2>
            <p className="mt-2">
              Estos Términos se rigen por las leyes aplicables en los Estados Unidos
              Mexicanos. Para cualquier controversia, las partes se someten a los
              tribunales competentes de [PENDIENTE: ciudad/estado], renunciando a
              cualquier otro fuero que pudiera corresponderles.
            </p>
          </section>

          <section>
            <h2>16. Contacto</h2>
            <p className="mt-2">
              Para cualquier duda relacionada con estos Términos, puede contactar a la
              Agencia en mercadigital.durango@gmail.com o por WhatsApp al 618 111 2580.
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
