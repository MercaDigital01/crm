# Plan de Desarrollo — CRM Merca Digital

> Documento vivo. Se actualiza conforme avanza el proyecto y se toman nuevas decisiones.
> Última actualización: revisión de análisis completada (roles, ciclo de vida de cuenta, dependencias externas, decisiones de producto). **Arranca ejecución en Fase 0.**

## 1. Visión general

Sitio web institucional de Merca Digital que incluye un **CRM multi-cliente**: cada cliente de la agencia tiene un perfil con login donde ve el trabajo de un agente de IA que vende/agenda por WhatsApp, estadísticas de sus campañas de Meta Ads y Google Ads, un resumen organizado de su plan de marketing, y gestiona su propio presupuesto de campañas. El cobro mensual es automático vía tarjeta guardada, con lógica de reintento y suspensión de servicio (CRM + campañas) por impago. El propietario de la plataforma (tú) mantiene acceso administrativo completo a todas las cuentas para brindar soporte, con auditoría y transparencia contractual.

## 2. Stack tecnológico

| Pieza | Herramienta | Por qué |
|---|---|---|
| Framework web | **Next.js** | Soporta frontend (dashboard, sitio) y backend (rutas API, webhooks) en un solo proyecto. |
| Hosting | **Vercel** | Creador de Next.js, despliegue automático, Preview Deployments por rama/PR, capa gratuita suficiente para iniciar. |
| Base de datos | **Neon** (Postgres) | Ya tienes cuenta, soporta RLS nativo, branching de BD ligado a Preview Deployments de Vercel, integración oficial "Neon Authorize" con Clerk. |
| Autenticación | **Clerk** | Verificación de registro robusta, tier gratis hasta 10k usuarios activos, se integra con RLS de Neon vía JWT. MFA obligatorio para el rol `owner`/`staff`. |
| Seguridad de datos | **RLS (Row Level Security)** en Postgres, con 3 roles desde el diseño inicial: `cliente`, `staff/owner`, `service` (procesos automáticos) | Aísla los datos de cada cliente a nivel de base de datos, no solo en el código, y contempla desde el inicio quién más necesita acceso legítimo (soporte, automatizaciones) para no rehacer políticas más adelante. |
| Archivos (imágenes/video) | **Cloudinary** | Transformación automática de imágenes/video (miniaturas, formatos), ideal para creativos de campañas y logos. |
| Cobros recurrentes | **Mercado Pago** | Tokeniza tarjetas (nunca las almacenamos nosotros), soporta cobro recurrente y webhooks de estado de pago. Se investigará su lógica nativa de reintento antes de construir la propia (ver Fase 3). |
| Repositorio de código | **GitHub** | Control de versiones + conecta con Vercel para despliegue automático. |
| Agente de IA (WhatsApp) | Por definir en Fase 4 | Requiere presupuesto variable (costo por uso de modelo de lenguaje). Es la única pieza que no puede ser 100% gratuita sin sacrificar calidad. |

## 3. Estrategia de entornos

- Rama `main` → Production en Vercel (lo que ven los clientes reales).
- Rama `dev` → Preview Deployment automático en Vercel, con su **propia base de datos** (Neon crea una rama de BD ligada a esa preview) y llaves de prueba de Mercado Pago. Así se prueba todo — código y datos — sin tocar producción ni arriesgar cobros reales.
- **Regla explícita del propietario**: no se hace ningún despliegue a `main`/producción hasta que el usuario lo indique expresamente. Todo el desarrollo inicial (Fases 1 en adelante) vive y se prueba en `dev`/Preview.

## 4. Acceso de administrador / "Vista de Soporte" (diseño transversal)

Como propietario, necesitas poder entrar a cualquier cuenta de cliente para resolver dudas o ayudarles directamente. Para que esto sea profesional, seguro y transparente (no un acceso informal "por la puerta de atrás"), se implementa así:

- **Rol `owner` distinto, no una contraseña compartida.** Tu cuenta tiene un rol especial en el sistema de permisos.
- **Modo "Entrar como cliente"**: desde el panel de administración, un botón te lleva al mismo dashboard que ve el cliente, con un banner visible indicando que estás en modo soporte — evita confusión sobre en qué cuenta estás parado y reutiliza la misma interfaz ya construida (no hay que duplicar pantallas).
- **Auditoría**: cada acceso o cambio hecho en modo soporte queda registrado (quién, cuándo, qué). Te protege a ti mismo ante cualquier disputa futura con un cliente.
- **Nunca incluye el número de tarjeta completo**: como las tarjetas se tokenizan en Mercado Pago y nunca tocan nuestra base de datos, este acceso no amplía el riesgo sobre datos de pago.
- **Transparencia contractual**: se declara explícitamente en los Términos de Servicio que el cliente acepta al registrarse (ver Fase 0), volviendo esta capacidad una función declarada del producto, no algo oculto.
- **MFA obligatorio** para el rol `owner`/`staff`, dado el nivel de acceso que implica.

Esto no es una fase aparte — se implementa a través de Fases 1, 2 y 7 (detallado abajo).

## 5. Fases

### Fase 0 — Fundamentos no técnicos (prerrequisito, con solapamientos)

**Objetivo:** dejar listo lo legal/administrativo antes de escribir código, porque bloquea integraciones posteriores. Algunos trámites tardan semanas y no dependen de nuestro ritmo de desarrollo — por eso se arrancan aquí aunque su resultado no llegue hasta fases más adelante.

- Confirmar RFC de persona física con actividad empresarial (ya lo tienes ✅).
- Crear cuenta de Mercado Pago como negocio (vinculada al RFC).
- Registrar dominio para Merca Digital.
- Crear cuentas: GitHub, Vercel, Neon (ya existe), Clerk, Cloudinary.
- Iniciar el proceso de **Meta Business Manager** y verificación de negocio. *Nota: Meta normalmente exige un sitio web funcionando con tu dominio como parte de la verificación — por eso una landing page mínima (Fase 1) debe publicarse antes de completar este trámite. Fase 0 y el arranque de Fase 1 se solapan, no son estrictamente secuenciales.*
- **Vincular las cuentas de Google Ads de tus clientes bajo tu MCC lo antes posible**, y solicitar el developer token. El acceso Básico/Estándar de la API depende de historial de actividad de las cuentas — si se espera hasta Fase 5 para vincularlas, el reloj de aprobación arranca tarde y bloquea esa fase innecesariamente. El código de sincronización se construye hasta Fase 5, pero el trámite corre en paralelo desde ahora.
- Redactar cláusula de Términos de Servicio sobre acceso administrativo de soporte (ver sección 4) y sobre cargos recurrentes/cancelación, conforme a la LFPDPPP.
- **Definir con cada cliente la estrategia de número de WhatsApp** (ver Fase 4): la Cloud API oficial no puede convivir con la app normal de WhatsApp Business en el mismo número, así que hay que decidir de antemano si cada cliente usará un número nuevo dedicado al agente o migrará su número actual. Conviene tenerlo claro desde las conversaciones comerciales, antes de que el cliente llegue a Fase 4 esperando seguir usando su app tal cual.

---

### Fase 1 — Base técnica + sitio institucional

**Qué se construye:**
- Proyecto Next.js conectado a GitHub y Vercel (con entornos `dev`/`main` funcionando).
- Base de datos en Neon con esquema inicial (tabla de clientes, usuarios, planes).
- **RLS activado desde el día uno con 3 roles** (`cliente`, `staff/owner`, `service`) — no se agrega después. El rol `service` es el que usarán los procesos automáticos (webhooks, cron de suspensión) de fases posteriores sin tener que rediseñar permisos entonces.
- Integración Clerk ↔ Neon funcionando: login, registro, sesión. MFA obligatorio para rol `owner`. **Nota de arquitectura (desviación del plan original):** durante la construcción, Neon reestructuró la función "Neon Authorize" (JWT directo a Postgres) bajo un nuevo producto llamado "Data API", que ya no expone el patrón simple documentado originalmente. En su lugar, se implementó aislamiento por sesión: el servidor de Next.js verifica la sesión de Clerk (confiable, ya validada por Clerk) y le informa a Postgres quién es el usuario actual mediante variables de sesión (`set_config`) al inicio de cada transacción; las políticas RLS filtran filas basándose en esas variables. La garantía de seguridad a nivel de base de datos se mantiene idéntica, solo cambió el mecanismo de transporte de la identidad. Verificado con pruebas automatizadas de aislamiento cruzado antes de continuar.
- **Decisión de producto**: un solo usuario por cliente (no se usa el modelo de "Organizations" de Clerk). Cada negocio cliente tiene una sola persona con credenciales de acceso a su dashboard, simplificando el esquema de roles. Si en el futuro algún cliente necesita dar acceso a más de una persona de su negocio, se puede evaluar entonces sin que esto bloquee el diseño actual.
- Landing page institucional de Merca Digital — publicada temprano porque la verificación de Meta (Fase 0) la necesita en línea.

**Por qué en este orden:** todo lo demás depende de tener autenticación y aislamiento de datos funcionando correctamente, incluyendo los roles que otras fases van a necesitar.

**Entregable:** sitio público visible + login funcional + primer cliente de prueba puede iniciar sesión y ver un perfil vacío.

---

### Fase 2 — CRM Core (perfiles, dashboard y panel de soporte)

**Qué se construye:**
- Perfil de cliente con secciones: Resumen del plan, Calendario, Conversaciones/Ventas (WhatsApp), Campañas (Meta/Google), Configuración de pago.
- **La tabla de estadísticas de campañas se modela desde ahora con la forma real de las respuestas de Meta Insights API y Google Ads API** (documentación pública, no requiere acceso aprobado para consultarla), aunque en esta fase se llene manualmente. Esto evita una migración de datos y de dashboard cuando llegue la sincronización automática en Fase 5.
- Panel de administración interno con el modo **"Entrar como cliente"** (Vista de Soporte, ver sección 4) para dar de alta clientes y cargar información mientras se automatiza.

**Por qué:** permite usar el CRM con clientes reales antes de tener todas las integraciones automáticas, sin comprometer el modelo de datos a futuro.

**Entregable:** un cliente puede loguearse y ver su dashboard completo; tú puedes entrar en modo soporte a cualquier cuenta.

---

### Fase 3 — Cobro automático recurrente (Mercado Pago)

**Qué se construye:**
- Registro de tarjeta (tokenizada por Mercado Pago, nunca almacenada por nosotros).
- **Antes de programar la lógica de reintento**, se investiga a fondo el comportamiento nativo de Mercado Pago Suscripciones (cuántos reintentos hace, cuándo cancela). Si su comportamiento no permite una ventana de gracia de exactamente 5 días, se opta por cobros programados vía su API directa en vez de su producto de suscripción nativo, para tener control total del calendario de reintento.
- Webhook de Mercado Pago que actualiza el estado del cliente.
- **Sistema de eventos genérico de "cambio de estado de cuenta"** (no un simple interruptor): al fallar el pago y agotarse los 5 días de gracia, se dispara un evento con una sola acción registrada por ahora (desactivar CRM). Esto permite que Fase 6 añada una segunda acción al mismo evento (pausar campañas) sin reescribir esta lógica.
- **Ciclo de vida completo de la cuenta**, incluyendo el estado inicial que faltaba definir: `pendiente_de_pago` (perfil creado, sin acceso al CRM) → `activo` (primer pago exitoso) → `en_gracia` (pago fallido, dentro de los 5 días) → `suspendido` (agotada la gracia) → `activo` de nuevo al recibir el pago. Ningún cliente ve su CRM habilitado mientras está en `pendiente_de_pago`, aunque su perfil ya exista en el sistema. Se agrega además un estado `cancelado` para cancelación voluntaria del cliente (distinto de `suspendido` por impago), con su propio flujo de salida: revocar accesos que el cliente dio a sus cuentas de Meta/Google Ads, definir qué pasa con su número de WhatsApp si fue migrado a Cloud API, y un plazo de retención de datos antes de eliminarlos conforme a la LFPDPPP (derecho de borrado).
- Activación automática del CRM al recibir el primer pago exitoso (transición `pendiente_de_pago` → `activo`).
- **Sistema de notificaciones genérico** (correo + aviso en el dashboard), construido desde esta fase para ser reutilizable por cualquier otro tipo de aviso futuro (no exclusivo de pagos) — Fase 5 lo reutiliza para las recomendaciones de presupuesto. Se dispara al entrar a `en_gracia` y a `suspendido`, con enlace directo a la sección "Configuración de pago" del dashboard para que el cliente actualice su tarjeta. Esta es la pieza que realmente elimina la necesidad de que tú avises manualmente por WhatsApp cuando un pago falla — sin esto solo se automatiza el cobro, no la comunicación.
- **Remitente de los correos**: todos los correos automáticos (pagos, recomendaciones, etc.) se envían como **"Merca Digital Team"**, no con tu nombre personal ni con el nombre técnico del sistema.

**Por qué en este punto:** ya existe el perfil de cliente (Fase 2) donde anclar el estado de pago, y se construye pensando en que Fase 6 se conectará aquí después.

**Entregable:** un cliente nuevo paga, su CRM se activa solo; si deja de pagar, se suspende solo.

---

### Fase 4 — Agente de IA en WhatsApp

**Qué se construye:**
- Solicitud y obtención de **WhatsApp Business Platform (Cloud API)** oficial, condicionado al avance de la verificación de negocio de Meta (iniciada en Fase 0).
- **Aplicar la estrategia de número definida en Fase 0** por cliente: número nuevo dedicado, o migración del número actual. La Cloud API no tiene app propia para el celular del cliente, así que si migra su número, se le da una interfaz dentro del mismo CRM para leer/responder conversaciones manualmente cuando quiera intervenir, además del agente automático.
- Agente de IA conectado al número de WhatsApp de cada cliente: responde, califica, agenda o cierra venta según reglas por cliente.
- Visualización en el dashboard: conversaciones, citas agendadas, ventas cerradas.
- Primer costo variable real del proyecto (uso del modelo de IA por conversación).
- **Monitoreo de costo por cliente**: alerta simple si un cliente presenta un pico inusual de conversaciones, para detectar gasto anómalo del modelo de IA antes de que sea una sorpresa en la factura.

**Por qué después de pagos:** es la funcionalidad más costosa de construir bien y no tiene sentido activarla para clientes fuera del flujo de cobro formal.

**Entregable:** el agente de IA opera en WhatsApp para clientes activos y el dashboard refleja su actividad en tiempo real.

---

### Fase 5 — Integración automática de Meta Ads y Google Ads

**Qué se construye:**
- Conexión vía Meta Marketing API y Google Ads API, apoyada en los trámites iniciados en Fase 0 (vinculación de cuentas a tu MCC ya en marcha desde entonces).
- Sincronización automática de métricas (CPA, ROAS, CTR, CPM) hacia el mismo modelo de datos diseñado en Fase 2 — sin migración porque ya se anticipó su forma real.
- Panel donde el cliente puede ajustar presupuesto de sus campañas **de forma manual e instantánea** (sin aprobación previa de tu equipo, sin acceso a configuración/optimización, que sigue siendo control exclusivo de tu equipo).
- **Motor de recomendaciones de presupuesto**: reglas basadas en umbrales sobre las métricas ya sincronizadas (CPA, ROAS, CTR, CPM) que generan avisos accionables ("tu CTR lleva 3 días por debajo del objetivo, considera ajustar tu presupuesto") usando el sistema de notificaciones genérico construido en Fase 3 (correo "Merca Digital Team" + aviso en dashboard, con enlace directo a la sección de presupuesto). Revisión con cadencia razonable (diaria o semanal, no en tiempo real) para evitar fatiga de alertas. Así el cliente conserva control total y manual de su presupuesto, pero siempre informado de cuándo es realmente necesario ajustarlo. *(Mejora futura, Fase 8: redactar estas recomendaciones con un modelo de lenguaje en vez de texto fijo por regla, para que se sientan más personalizadas.)*
- **Aclaración importante**: el presupuesto de campaña se factura directamente entre el cliente (o tu Business Manager) y Meta/Google — es dinero completamente separado de la mensualidad del servicio CRM que cobras vía Mercado Pago (Fase 3). Son dos cobros con dueños distintos y no deben mezclarse en la lógica de suspensión ni en la comunicación con el cliente.

**Entregable:** las secciones de campañas del dashboard dejan de ser manuales y se actualizan solas.

---

### Fase 6 — Automatización de suspensión por impago

**Qué se construye:**
- Se añade una segunda acción al evento de "cambio de estado de cuenta" creado en Fase 3: al suspenderse, además de desactivar el CRM, se pausan automáticamente las campañas activas de Meta/Google Ads del cliente (vía las APIs conectadas en Fase 5).
- Reactivación automática al recibir el pago (dispara el evento inverso).

**Por qué al final:** necesita que tanto el motor de pagos (Fase 3) como las APIs de Ads (Fase 5) ya funcionen de forma confiable — es la pieza que las conecta.

**Entregable:** el cobro se vuelve automático de punta a punta, sin intervención manual para suspender o pausar nada.

---

### Fase 7 — Seguridad, QA y lanzamiento

- Revisión de políticas RLS para los 3 roles (que ningún cliente vea datos de otro, que el rol `service` solo pueda hacer lo estrictamente necesario).
- **Tabla de auditoría** para el modo "Vista de Soporte" (quién entró, cuándo, a qué cuenta, qué se modificó).
- Pruebas de los flujos de pago fallido/reintento/suspensión con datos de prueba.
- Revisión de manejo de secretos (llaves de API, tokens) — nunca en el código, solo en variables de entorno.
- Migración de clientes piloto al sistema completo.

---

### Fase 8 — Roadmap futuro (ecosistema completo)

Fuera del alcance inmediato: expansión más allá del CRM (más canales además de WhatsApp, reportes automatizados en PDF, portal de aprobación de contenido, etc.) — se definirá con más detalle una vez que las Fases 1-7 estén en producción.

- **Meta Tech Provider / Embedded Signup**: a la escala actual (1-10 clientes) basta con que cada cliente otorgue acceso de administrador a su propio Meta Business Manager. Si el número de clientes crece considerablemente, vale la pena registrar a Merca Digital como Tech Provider de Meta y usar "Embedded Signup" para automatizar el onboarding de WhatsApp Cloud API por cliente, en vez de hacerlo manualmente uno por uno.

## 6. Riesgos y dependencias a vigilar

- **Verificación de negocio de Meta** es el mayor riesgo de calendario (puede tardar y no depende de nosotros) — se inicia en Fase 0, en paralelo al desarrollo, y requiere la landing de Fase 1 publicada primero.
- **Costo variable del agente de IA** debe presupuestarse aunque sea mínimo; no es negociable sin sacrificar calidad.
- **Aprobación de Google Ads API** requiere cuentas vinculadas a tu MCC con historial — por eso se vinculan desde Fase 0, no en Fase 5.
- **Comportamiento nativo de reintento de Mercado Pago** debe confirmarse antes de construir la lógica de 5 días en Fase 3, para evitar que dos sistemas de reintento entren en conflicto.
- **Rediseño de RLS a mitad de camino** se evita diseñando los 3 roles (`cliente`, `staff/owner`, `service`) desde Fase 1, no agregándolos reactivamente cuando se necesiten en Fase 2 o Fase 6.
