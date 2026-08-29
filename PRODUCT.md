# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS v4, deployed on Vercel. Existing codebase (not greenfield stack-wise), already wired to Clerk (auth) and Neon Postgres (RLS-protected data).

## Users

Primary: dueños de negocios locales pequeños en México (comida, retail, servicios) sin equipo de marketing propio, evaluando si contratar a Merca Digital o, si ya son clientes, iniciando sesión en su CRM para revisar su cuenta. No son técnicos ni esperan jerga de marketing/tech.

Secondary: el propietario de Merca Digital, como operador/administrador del sistema (fuera del alcance de esta landing pública).

## Product Purpose

Merca Digital es una agencia de mercadotecnia digital que planea, diseña y ejecuta contenido (parrillas, ideación con fórmulas AIDA/PAS, dirección de arte) y campañas pagadas (Meta Ads, Google Ads) para negocios locales. Además de la gestión tradicional de agencia, ofrece un CRM propio donde cada cliente ve en tiempo real cómo un agente de inteligencia artificial vende/agenda citas por WhatsApp a su nombre, el desempeño de sus campañas, y el resumen completo de su plan de mercadotecnia — todo en un solo lugar, sin tener que preguntar.

## Positioning

A diferencia de una agencia tradicional que solo entrega reportes manuales y esporádicos, Merca Digital opera con transparencia automatizada: el cliente tiene acceso permanente a un panel que refleja en tiempo real el trabajo de un agente de IA cerrando ventas/citas por WhatsApp y el estado de sus campañas — algo que una agencia sin infraestructura propia no puede ofrecer de forma creíble.

## Operating Context

Clientes son negocios locales en México sin personal de marketing propio; delegan por completo su presencia digital a la agencia. El sitio y todo el copy son en español. El servicio se cobra mensualmente vía tarjeta con cargo recurrente automático (gestionado dentro del CRM, no en esta landing).

## Capabilities and Constraints

- El CRM ya está construido y funciona (autenticación, aislamiento de datos por cliente, panel de administración interno) — no tiene clientes reales operando en él todavía.
- La agencia está en etapa temprana (pocos clientes activos); la landing no debe inflar tamaño, resultados ni testimonios inexistentes (decisión explícita del usuario).
- No se deben mencionar giros de industria específicos (ej. "heladerías", "carnicerías") — mantener el lenguaje de audiencia genérico ("negocios locales") por decisión explícita del usuario.
- Aún no hay dominio propio (se registrará más adelante); el sitio corre sobre un dominio temporal de Vercel.

## Brand Commitments

- Nombre fijo: **Merca Digital**.
- Logo y paleta de marca ya definidos y confirmados por el usuario (no a decidir en esta fase): logo en `public/brand/logo-merca-digital.png`. Colores muestreados directo del logo — teal `#1DA9B7`, dorado `#E8B708`, rojo `#FA171F`, azul `#076FA7`.
- Tono de copy definido en las instrucciones del proyecto: persuasivo, conversacional, adaptado a negocios locales, usando fórmulas de copywriting (AIDA/PAS).

## Evidence on Hand

Ninguna prueba social real disponible todavía: sin testimonios, sin casos de éxito, sin cifras de resultados. La landing no debe fabricar ninguna de estas cosas.

## Product Principles

1. Transparencia radical: el cliente siempre puede ver qué está pasando con su marketing sin tener que preguntarle a nadie.
2. Automatización que libera tiempo — tanto al cliente como a la agencia — reemplazando seguimiento manual (incluyendo cobros y avisos).
3. Negocios locales primero: el lenguaje debe sentirse accesible para un dueño de negocio sin conocimientos técnicos, nunca como una startup tech hablándole a otros técnicos.
4. Honestidad sobre la etapa actual de la agencia: sin inflar resultados, tamaño o alcance mientras crece.
