---
name: Merca Digital
description: One light, teal-accented system across the marketing site, CRM pitch, and client dashboard — plus a separate dark maroon/gold system for the staff admin panel
colors:
  md-teal: "#1da9b7"
  md-gold: "#e8b708"
  md-blue: "#076fa7"
  md-red: "#fa171f"
  panel-chassis: "#121417"
  gray-50: "#f9fafb"
  gray-900: "#111827"
  md-admin-bg: "#5c2530"
  md-admin-card: "#75303c"
  md-admin-card-deep: "#3d1119"
  md-admin-gold: "#f0c14b"
  md-admin-coral: "#e8695c"
  md-admin-cream: "#fdf6ef"
  md-admin-rose-muted: "#d9a9ac"
typography:
  body:
    fontFamily: "system-ui, -apple-system, Arial, sans-serif"
    weights: [400, 500, 600]
  admin:
    fontFamily: "Poppins (font-admin-sans / font-admin-display)"
    weights: [400, 500, 600, 700, 800]
rounded:
  card: "1.5rem"
  card-lg: "2rem"
  control: "0.5rem"
  pill: "9999px"
spacing:
  section-y: "6rem"
  section-y-lg: "8rem"
  container-max: "72rem"
components:
  button-primary:
    backgroundColor: "{colors.md-teal}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "14px 28px"
  card:
    backgroundColor: "#ffffff"
    shadow: "0 2px 10px rgba(0,0,0,0.02)"
    rounded: "{rounded.card}"
---

# Design System: Merca Digital

## Overview

**Two systems, split by audience.** The public-facing/client surfaces — the marketing site (`/`), the CRM pitch (`/crm`), and the client dashboard (`/dashboard/**`) — share one light, teal-accented visual language: a `gray-50` canvas, white cards on an extremely soft shadow (`shadow-[0_2px_10px_rgba(0,0,0,0.02)]`, never a border doubling as elevation), generously rounded corners (`rounded-2xl`/`rounded-3xl` on cards, `rounded-full` on every button and pill), and `md-teal` as the one primary accent — buttons, active nav states, focus rings, links.

**The staff admin panel (`/admin/**`) is a deliberately separate world: Admin v2**, a dark maroon/gold system built from a reference mockup the user provided (2026-09-02). It is not a variant of the light system with colors swapped — it has its own background/card tokens (`--md-admin-*` in `globals.css`), its own typeface (Poppins, `font-admin-sans`/`font-admin-display`), and its own card treatment (translucent "glass" — `bg-white/[0.06]` with `backdrop-blur-md`, not flat white). The rationale for keeping it separate rather than folding it into the one-light-system rule above: the admin panel is an internal tool used only by staff, not something a client or prospect ever sees, so it doesn't need to carry the same brand-trust signal as the public/client surfaces — and the user explicitly asked for this exact look, iterated on it (lighter background, glass cards over solid color, Poppins over a serif/italic pairing that read as "too AI-generic"), and confirmed it before it was propagated to the rest of `/admin`.

**This replaces the previous admin look** (light/utilitarian — sidebar nav, white shadow-only cards, `md-teal` accents, same shape as the client dashboard), which itself had replaced an even earlier dark "panel chassis" instrument-panel world (near-black ground, Space Grotesk display type, beveled plates, pilot-light dots) that governed the marketing site and client dashboard through 2026-08-21–26. That panel-chassis system is retired everywhere except as noted below (`panel-chassis` color, marketing hero photo scrim) — it is not the same thing as Admin v2's dark theme, which uses its own maroon/gold palette, not `panel-chassis` black.

**How this happened:** the admin panel was redesigned light/utilitarian first (per an earlier explicit scope decision), matched across the whole product, then the user asked specifically for the admin panel to be redone to match a reference screenshot with its own dark maroon/gold "SaaS dashboard" identity — explicitly scoped to `/admin` only, not the client-facing surfaces. This document's marketing/CRM/client-dashboard sections below describe the light system unchanged; the dedicated **Admin v2** section covers the new dark system in full.

**Confirmed carried over from the old system (still true):** no badge/eyebrow above any heading, no fabricated stats/case-studies/testimonials (PRODUCT.md's standing rule — real product screenshots and real photography only), brand color assigned by role not sprinkled (teal → WhatsApp agent / primary action, gold → Ads, blue → content/account, red → reserved for real alerts).

## Colors

Same four-color brand system as before, sampled from the logo — only the neutral scaffold and ground color changed (near-black → `gray-50`/white).

### Primary
- **Teal** (`#1da9b7`): the WhatsApp agent's color and the whole product's primary action color — every primary button, active nav state, focus ring, and link.

### Secondary
- **Gold** (`#e8b708`, used as a darkened `#a5790a` for text/small-pill legibility on white): Meta & Google Ads, and "needs attention"/pending account states.
- **Blue** (`#076fa7`): content/calendar/account-adjacent status.
- **Red** (`#fa171f`): reserved for genuine alert/error states (suspended accounts) — not used decoratively.

### Neutral
- **Canvas**: `gray-50` — page background behind white cards on the light system (marketing, `/crm`, client dashboard). The admin panel uses its own dark canvas instead — see **Admin v2** below.
- **Surface**: white — every card, every form, on the light system.
- **Text**: `gray-900` primary, `gray-400`/`gray-500` secondary on the light system — replaces the old `panel-ink`/`panel-ink-dim` on-dark pair.
- **panel-chassis** (`#121417`): now used only for the marketing hero's photo overlay gradient (a dark scrim over a real photo needs a genuinely dark color regardless of the rest of the page being light). No longer used in the admin panel — Admin v2's dark surfaces use the maroon/gold tokens below, not `panel-chassis`.

### Named Rules
**The Role, Not Rainbow Rule** (unchanged): each brand color maps to one real thing everywhere it appears. A client's account status (`activo`/`pendiente_de_pago`/`en_gracia`/`suspendido`/`cancelado`, `CLIENT_STATUS_META` in `src/app/dashboard/status.ts`) is the canonical example — the same teal/gold/blue/red mapping renders as a flat colored dot or pill on every surface (client dashboard, admin client list, admin Resumen), never a different color per surface.

**Card elevation is shadow-only.** Every card uses `shadow-[0_2px_10px_rgba(0,0,0,0.02)]` and no border — a border under a shadow is the "ghost card" tell. The one deliberate exception is the sidebar's active-nav-item accent, which is a left border by direct reference request (see Components).

## Typography

**No display face — on the light system.** The old Space Grotesk/Space Mono pairing is retired along with the dark chassis; the marketing site, `/crm`, and client dashboard all use the system sans (`body { font-family: Arial, Helvetica, sans-serif }` in `globals.css` — a pre-existing gap, not a deliberate choice, still open). Numbers and headings get weight (`font-semibold`), not a different typeface — this matches Operate-mode guidance (one family, tighter scale) and was a deliberate simplification even on the two Persuade surfaces (marketing site, `/crm`), which chose brand-through-color-and-photography over brand-through-typeface.

**The admin panel is the one exception**: it has its own committed typeface, Poppins, applied via `font-admin-sans` (body/UI, weights 400–700) and `font-admin-display` (page titles and the large stat/ring numbers, weight 700–800) — both registered as the same Poppins font instance in `globals.css`, so the two class names differ only in the weight/size applied at the call site, not the family. This was a direct response to user feedback that an earlier pass (Fraunces serif + italic headings) "se ve muy IA" (reads as generic AI output) — Poppins, no italics, one geometric sans varying only by weight, was the fix. Do not reintroduce a second family or italic styling in the admin panel.

### Hierarchy
- **Hero** (marketing only): `text-6xl`–`text-[6rem]`, `font-semibold`, `tracking-tight`.
- **Section headline**: `text-4xl`–`text-5xl`, `font-semibold`.
- **Card/page title**: `text-xl`–`text-2xl`, `font-semibold`.
- **Stat number**: `text-4xl`, `font-semibold` — the one place a number carries more visual weight than its label.
- **Body**: `text-sm`–`text-lg`, `leading-relaxed`, `text-gray-500`.
- **Label/eyebrow-free caption**: `text-xs`, uppercase, `tracking-wide`, `text-gray-400` — used inside a component (card header, stat subtitle), never floating above a heading.

### Named Rules
**No Kicker Rule** (unchanged): no small label sits above any headline.

## Layout

Two structural patterns depending on mode:
- **Persuade** (`/`, `/crm`): single centered container, `max-w-6xl`, `px-6`, generous section rhythm (`py-20`–`py-32`), sections alternate white/`gray-50` for a resting beat rather than one unbroken field.
- **Operate** (`/dashboard/**`, `/admin/**`): fixed 256px (`w-64`) left sidebar + fluid main content, collapsing to a slim top bar + horizontal tab strip below `md`. Both sidebars (`AdminSidebar`, `ClientSidebar`) share the same *shape* — grouped/flat nav links with icons, session/logout controls anchored to the bottom — but no longer the same *skin*: `ClientSidebar` (`/dashboard/**`) stays on the light system (white, `border-r border-gray-200`, `max-w-6xl` content, `px-6 py-10`, `border-l-4 border-md-teal bg-md-teal/10` active state). `AdminSidebar` (`/admin/**`) is dark (transparent over the Admin v2 maroon background, no border), `max-w-[1500px]` content, and its active state is a solid coral pill (`bg-md-admin-coral text-white`, full row, not a left border) — see **Admin v2** below for the full admin-only treatment.

## Elevation & Depth

On the light system: single shadow vocabulary, `shadow-[0_2px_10px_rgba(0,0,0,0.02)]`, no border. Corner radius scales with the container's importance: `rounded-xl`/`rounded-2xl` for standard cards and list containers, `rounded-3xl` for hero-weight cards (the marketing proof panel, the featured services panel). Buttons, pills, and status badges are always `rounded-full`. On the admin panel, elevation comes from translucency/blur layering instead of shadow — see **Admin v2**.

## Components

### Buttons
- **Shape**: `rounded-full` always — no intermediate radius on any button, on any surface.
- **Primary**: `bg-md-teal text-white`, hover `bg-md-teal/90` (Persuade surfaces) or a slightly darker literal shade where a `/90` opacity reads too soft against a busy background.
- **Secondary**: `border border-gray-200`/`border-gray-300`, `text-gray-700`, hover `bg-gray-100`.
- **Focus**: on the admin panel, standardized once for the whole surface via `.admin-panel` in `globals.css` (`focus-visible:ring-2 ring-md-admin-gold/50 ring-offset-md-admin-bg` — its own accent color, not teal). Client dashboard and Persuade buttons declare `focus-visible:ring-2 ring-md-teal/40` inline per-button since there's no shared wrapper class for that surface.

### Cards
On the light system: one shape everywhere, white, shadow-only, rounded. On the admin panel: `.admin-card`'s translucent glass treatment (see Admin v2). Both surfaces share the same "stat tile" *layout* (`StatTile` pattern, in both `admin/(dashboard)/page.tsx` and `dashboard/page.tsx`) — label top-left, small circular icon-link top-right (a real navigation affordance, never decorative), a bold number, an optional one-line real-data subtitle underneath (never a fabricated trend — see PRODUCT.md) — but not the same skin: the client dashboard's number is flat `text-4xl` on white, the admin version is a gold-gradient `font-admin-display` number on a glass card (see Admin v2 → Big numbers).

### Sidebar nav (`ClientSidebar`, light system only)
Flat vertical links (5 items), icon + label, active state = `border-l-4 border-md-teal` + `bg-md-teal/10` + bold `text-gray-900` (not colored text) + teal icon. The `border-l-4` reads as a known "AI-slop" tell to a mechanical detector but is a deliberate 1:1 match to the product screenshot the user pinned as the reference — kept on purpose. `AdminSidebar` no longer shares this treatment — see **Admin v2** below.

### Status pill / dot
Flat `rounded-full` pill (list rows) or a bare small dot (sidebar footer, table cells): `bg-{role}/10 text-{role}` for pills, solid `bg-{role}` for dots. Always driven by `CLIENT_STATUS_META`, never a one-off color choice. On the admin panel, the same role mapping is reused but rendered at higher opacity for legibility on a dark surface (`bg-{role}/20 text-{role}`, `text-blue-300` instead of `md-blue` for contrast) — same semantic colors, adjusted only for the dark background.

## Admin v2 (staff panel, `/admin/**`)

A complete, separate dark maroon/gold system for the internal staff tool, built to match a user-provided reference screenshot rather than derived from the light system. Every page under `/admin/**`, including the sign-in page, uses this system — there is no light/dark mix within admin.

**Background & cards.** Page background `--md-admin-bg` (`#5c2530`, a warm wine/maroon — deliberately lightened from an initial darker `#4b1620` pass per user feedback that it read "too red"). Cards are *not* flat solid color: `.admin-card` (`globals.css`) is `rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-md` — a translucent "glass" surface that lets the maroon background show through, again a direct fix for feedback that solid cards "se ve muy feo" (looked ugly/flat). A few surfaces need more contrast than the glass treatment gives (the conversations-ring widget, the sidebar session card, the right-rail quick-nav pill) — those use `bg-black/25` + the same `backdrop-blur-md` + `border-white/10`, a deliberately darker glass tier for "recessed" surfaces, not `panel-chassis` and not a flat fill.

**Color roles.** `md-admin-gold` (`#f0c14b`) is the primary action color — buttons, "+ Nuevo" pills, active links — playing the same role `md-teal` plays on the light system. `md-admin-coral` (`#e8695c`) is the icon-chip/accent color (stat tile icons, sidebar active state, delete-button hover) — not a primary button color. `md-admin-cream` (`#fdf6ef`) is reserved for small opaque light surfaces that need real contrast against the dark background (the sidebar's logo chip, the right-rail's top icon) — used sparingly and only where the reference specifically called for a light chip; the rest of the panel stays dark-on-dark-with-glass, not light boxes (an earlier pass tried inverting the stat-tile icons to cream circles and the user rejected it — "no uses cuadros blancos"). `md-admin-rose-muted` (`#d9a9ac`, usually at `/70` opacity) is the secondary/muted text color — replaces `gray-400`/`gray-500` for this surface, giving muted text a warm tint tied to the palette instead of generic gray-on-dark.

**Sidebar (`AdminSidebar`).** Dark, transparent over the page background (not its own white/cream fill). Active state is a solid coral pill spanning the full row (`bg-md-admin-coral text-white shadow-sm`), not the light system's left-border treatment. The logo sits in its own small `bg-md-admin-cream` chip at the top of the sidebar — necessary because the real logo PNG's wordmark is brand red, which has poor contrast directly on the maroon background.

**Big numbers.** Page-title-scale headings and stat/ring numbers use a gold gradient text treatment (`bg-gradient-to-br from-md-admin-cream to-md-admin-gold-deep bg-clip-text text-transparent`, `font-admin-display`) instead of flat white — a deliberate "more color effort" response to feedback that flat-white numbers on a dark card read as generic/AI-templated.

**Conversations ring** (admin Resumen only). A decorative SVG progress ring with a blurred radial-gradient glow behind it, framing the real 7-day WhatsApp-conversation count in the center. The ring's fill is a fixed ~88%, not data-driven — an early version tied the fill to week-over-week % change and it rendered as a near-invisible sliver whenever a client had a quiet week, which read as "broken" rather than "quiet"; the actual trend (when a prior week exists to compare against) is shown as real text below the count instead, colored/iconed by direction (teal `TrendingUp` when up, coral `TrendingDown` when down — never a fixed color regardless of sign).

**Avatar colors.** `InitialAvatar` colors are assigned by a deterministic hash of the entity's id (`avatarColorFor()` in `admin/(dashboard)/page.tsx`), not by list position — so the same client/contact gets the same color everywhere they appear on the page, not a different color per list.

### Navigation (`MarketingNav`)
Sticky, `bg-white/90 backdrop-blur`, `h-20`, `border-b border-gray-200`. Logo left, two text links center, a pill-shaped `/crm` badge right with a small teal dot — same structure as the old dark version, recolored.

## Do's and Don'ts

### Do:
- On the light system (marketing, `/crm`, client dashboard): use `shadow-[0_2px_10px_rgba(0,0,0,0.02)]` with no border for every card — one elevation system, not per-page invention.
- Keep `md-teal` as the light system's only primary accent color; gold/blue/red stay tied to their real semantic roles (Ads, content/account, alerts) and never substitute for teal as decoration.
- Reuse `CLIENT_STATUS_META`'s color mapping everywhere an account status renders (adjusted for contrast on dark admin surfaces per the Status pill/dot rule above), so a client's status means the same color on every surface they or staff can see it from.
- Keep sidebar nav (Operate surfaces) and section-based scroll (Persuade surfaces) as the two structural patterns — don't force a sidebar onto a marketing page or a scrolling hero onto a dashboard.
- On the admin panel: use `.admin-card`'s translucent glass treatment, not a flat solid fill — this was an explicit user correction, not a style choice to reconsider per-page.
- On the admin panel: use Poppins only (`font-admin-sans`/`font-admin-display`), no italics, no second typeface — also an explicit user correction.

### Don't:
- Don't reintroduce the dark chassis, Space Grotesk/Space Mono, or beveled-plate shadows on the light system outside the two named exceptions (`panel-chassis` marketing hero photo scrim; there is no longer a `panel-chassis` admin exception — Admin v2 uses its own maroon/gold tokens) — that world is retired, not a fallback.
- Don't invent stats, trend arrows, or chart data without a real query backing it (PRODUCT.md's standing rule) — every number on every stat tile, ring, and chart in this system is a live count, including the admin conversations ring (its fill % is fixed/decorative, but the number in the center is real — see Admin v2).
- Don't pair a border with a shadow on the same card ("ghost card") on the light system — pick shadow, always. (Admin v2 cards intentionally use both a `border-white/10` and translucency — that's the glass treatment, not the light system's rule.)
- Don't mention specific client industries — PRODUCT.md requires generic "negocios locales" language.
- Don't apply Admin v2's dark maroon/gold system to the light-system surfaces (marketing, `/crm`, client dashboard) or vice versa — they are deliberately two systems, not one system with a dark-mode toggle.
