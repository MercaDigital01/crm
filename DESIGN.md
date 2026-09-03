---
name: Merca Digital
description: One dark maroon/gold system (Admin v2) across the entire product — marketing site, CRM pitch, client dashboard, staff admin, and Clerk auth screens
colors:
  md-teal: "#1da9b7"
  md-gold: "#e8b708"
  md-blue: "#076fa7"
  md-red: "#fa171f"
  panel-chassis: "#121417"
  md-admin-bg: "#5c2530"
  md-admin-card: "#75303c"
  md-admin-card-deep: "#3d1119"
  md-admin-gold: "#f0c14b"
  md-admin-coral: "#e8695c"
  md-admin-cream: "#fdf6ef"
  md-admin-rose-muted: "#d9a9ac"
typography:
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
    backgroundColor: "{colors.md-admin-gold}"
    textColor: "{colors.md-admin-card-deep}"
    rounded: "{rounded.pill}"
    padding: "14px 28px"
  card:
    backgroundColor: "rgba(255,255,255,0.06)"
    backdropFilter: "blur(12px)"
    border: "1px solid rgba(255,255,255,0.10)"
    rounded: "{rounded.card}"
---

# Design System: Merca Digital

## Overview

**One system, the whole product: Admin v2.** Every surface — the public marketing site (`/`), the CRM pitch (`/crm`), the client dashboard (`/dashboard/**`), the staff admin panel (`/admin/**`), and Clerk's own sign-in/sign-up/UserButton widgets — now shares one dark maroon/gold visual language: a `--md-admin-bg` (`#5c2530`) canvas, translucent "glass" cards (`bg-white/[0.06]` + `backdrop-blur-md` + `border-white/10`, never flat solid fill), Poppins as the one committed typeface (`font-admin-sans`/`font-admin-display`, no italics, no second family), and `md-admin-gold` as the one primary accent — buttons, active nav states, focus rings, links — with `md-admin-coral` for icon chips/accents and `md-admin-cream` reserved for the rare small opaque surface that needs real contrast (logo chips).

**How this happened, in order:**
1. The whole product originally shared a light, teal-accented system (`gray-50` canvas, white shadow-only cards, `md-teal` primary) built after an earlier dark "panel chassis" instrument-panel world (Space Grotesk, near-black ground) was retired.
2. The user asked for the admin panel specifically (`/admin/**`) to be redone to match a reference screenshot — a dark maroon/gold "SaaS dashboard" look, explicitly scoped to admin only at first. This became **Admin v2**.
3. Two rounds of direct feedback refined it: the background was lightened (`#4b1620` → `#5c2530`, "se ve muy rojo"), flat solid cards were replaced with the translucent glass treatment ("no uses cuadros blancos... hay que poner transparencia"), and the typography moved from an initial serif+italic pairing to plain Poppins ("se ve muy IA" — read as generic AI output).
4. Once the admin Resumen page matched the reference, the user asked to propagate the same system to the rest of `/admin`, confirmed it, then asked to scale the *entire* system — marketing site, `/crm`, and client dashboard — to match, with full autonomy ("te dejo todo a tu criterio").

**The old light system is retired, not extended.** Every rule below describes Admin v2 as it now applies everywhere. Two small legacy artifacts remain, both inert: `panel-chassis` (`#121417`) is unused (was previously the marketing hero photo-scrim color, now recolored to a maroon-tinted scrim to match); `src/components/panel/{PilotLight,PanelPlate,StatusRow}.tsx` are unused leftovers from the original panel-chassis world, not imported anywhere, left in place rather than deleted mid-redesign.

**Confirmed carried over from every prior system (still true):** no badge/eyebrow above any heading, no fabricated stats/case-studies/testimonials/chart data (PRODUCT.md's standing rule — real product screenshots, real photography, real queries only), brand color assigned by role not sprinkled.

## Colors

### Primary
- **Gold** (`md-admin-gold`, `#f0c14b`): the whole product's primary action color — every primary button, active-link text, focus ring.

### Accent
- **Coral** (`md-admin-coral`, `#e8695c`): icon chips, sidebar active-nav pill, delete-button hover state. Not a primary button color.
- **Cream** (`md-admin-cream`, `#fdf6ef`): reserved for small opaque surfaces that need real contrast against the dark background — the logo chip (sidebar, marketing nav, sign-in/sign-up screens), the admin right-rail's top icon. Used sparingly; an earlier pass inverted the stat-tile icons to cream circles and the user explicitly rejected it ("no uses cuadros blancos, se ve muy feo") — don't reintroduce light card/icon surfaces beyond the named logo-chip exception.
- **Rose-muted** (`md-admin-rose-muted`, `#d9a9ac`, usually at `/70` opacity): the one secondary/muted text color, replacing `gray-400`/`gray-500` — gives muted text a warm tint tied to the palette instead of generic gray-on-dark.

### Legacy brand colors (still real, now used narrowly)
- **Teal** (`#1da9b7`): kept specifically as the WhatsApp-agent color (the one named-rule holdover from the original brand palette) and as the `activo` value in `CLIENT_STATUS_META` — not reused as a general accent anymore.
- **Gold-brand** (`md-gold`, `#e8b708`) / **Blue** (`#076fa7`) / **Red** (`#fa171f`): still exist as the underlying `CLIENT_STATUS_META` mapping (`pendiente_de_pago`/`en_gracia` → gold, `cancelado` → blue, `suspendido` → red) — but rendered through Admin v2's dark-surface pill treatment (`bg-{role}/20 text-{role}`, with `text-blue-300` substituted for `md-blue` and `text-md-admin-coral` substituted for `md-red` where contrast against the dark card requires it). The underlying real-world meaning (payment/account status) is unchanged; only the rendering adapted to a dark surface.

### Neutral / structural
- **Canvas**: `--md-admin-bg` (`#5c2530`) everywhere — page background behind every card, on every route.
- **Card**: never a flat fill — see Elevation & Depth.
- **Text**: white (primary), `md-admin-rose-muted` (secondary/muted), `md-admin-gold` (links, active states).
- **panel-chassis** (`#121417`): unused. Not part of Admin v2's palette.

### Named Rules
**The Role, Not Rainbow Rule** (unchanged): each color maps to one real thing everywhere it appears. A client's account status (`CLIENT_STATUS_META` in `src/app/dashboard/status.ts`) is the canonical example — the same color mapping renders as a flat colored dot or pill on every surface (client dashboard, admin client list, admin Resumen), never a different color per surface.

**Card elevation is glass, not shadow.** See Elevation & Depth.

## Typography

**One committed typeface everywhere: Poppins.** `font-admin-sans` (body/UI text, weights 400–700) and `font-admin-display` (page titles, large stat/ring numbers, weight 700–800) are registered as the *same* Poppins font instance in `globals.css` — the two class names differ only in the weight/size applied at the call site, not the family. No italics, no second face, on any surface. This was a direct response to user feedback that an earlier admin-only pass (Fraunces serif + italic headings) "se ve muy IA" — plain, confident, one-family type reads as designed rather than templated.

### Hierarchy
- **Hero** (marketing only): `text-6xl`–`text-[6rem]`, `font-admin-display font-semibold`, `tracking-tight`.
- **Section headline**: `text-4xl`–`text-5xl`, `font-admin-display font-semibold`.
- **Page/card title**: `admin-h1` utility (`text-2xl`–`text-3xl`, `font-admin-display font-semibold`, `text-md-admin-cream`) for page titles; `text-lg`–`text-2xl font-semibold text-white` for card-level titles.
- **Stat/ring number**: `font-admin-display`, gold gradient text (`bg-gradient-to-br from-md-admin-cream to-md-admin-gold-deep bg-clip-text text-transparent`) — the one place a number carries more visual weight than flat white, a deliberate "more color effort" response to feedback that flat-white numbers read as generic/AI-templated.
- **Body**: `text-sm`–`text-lg`, `leading-relaxed`, `text-md-admin-rose-muted` (the `admin-subtle` utility).
- **Label/caption**: `text-xs`, uppercase, `tracking-wide`, `text-md-admin-rose-muted/70` — used inside a component (card header, stat subtitle), never floating above a heading as a kicker.

### Named Rules
**No Kicker Rule** (unchanged): no small label sits above any headline.

## Layout

Two structural patterns depending on mode, both on the same dark canvas:
- **Persuade** (`/`, `/crm`): single centered container, `max-w-6xl`, `px-6`, generous section rhythm (`py-20`–`py-32`), sections alternate `md-admin-bg`/`md-admin-card-deep` for a resting beat rather than one unbroken field.
- **Operate** (`/dashboard/**`, `/admin/**`): fixed 256px (`w-64`) left sidebar, transparent over the page background (no separate fill, no border) + fluid main content, collapsing to a slim top bar + horizontal tab strip below `md`. `AdminSidebar` and `ClientSidebar` share the same shape and skin: grouped/flat nav links with icons, a solid coral pill active state (`bg-md-admin-coral text-white shadow-sm`, full row — not a left border), session/logout controls anchored to the bottom, logo in its own `bg-md-admin-cream` chip.

## Elevation & Depth

**Glass, not shadow, everywhere.** `.admin-card` (`globals.css`) is the one card primitive: `rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-md` — translucent, letting the maroon background show through, not a flat opaque fill. A few surfaces need more contrast than the standard glass tier (conversation-ring widgets, sidebar session cards, quick-nav pills) — those use a deliberately darker glass tier, `bg-black/25` + the same `backdrop-blur-md` + `border-white/10`, still translucent, never a flat fill and never `panel-chassis`. Corner radius scales with the container's importance: `rounded-2xl` for standard cards, `rounded-3xl` for hero-weight cards. Buttons, pills, and status badges are always `rounded-full`.

## Components

### Buttons
- **Shape**: `rounded-full` always — no intermediate radius on any button, on any surface.
- **Primary**: `bg-md-admin-gold text-md-admin-card-deep`, hover `bg-md-admin-gold/90`.
- **Secondary**: `border border-white/20`, `text-white`, hover `bg-white/10`.
- **Focus**: standardized once for the whole product via `.admin-panel` in `globals.css` — `focus-visible:ring-2 ring-md-admin-gold/50 ring-offset-md-admin-bg`. The `.admin-panel` wrapper class is applied at both the admin root layout and the dashboard root layout, so this is the one shared focus/input/table styling mechanism for both Operate surfaces; Persuade buttons (marketing, `/crm`) declare it inline per-button since they sit on varied backgrounds (photo hero, solid-gold closing band).

### Cards
One shape everywhere: `.admin-card`'s translucent glass treatment (see Elevation & Depth). The "stat tile" pattern (`StatTile`, duplicated with the same shape in `admin/(dashboard)/page.tsx` and `dashboard/page.tsx`) is: label top-left next to a solid-coral circular icon chip, an optional small circular icon-link top-right (a real navigation affordance, never decorative), a bold gold-gradient number, an optional one-line real-data subtitle underneath (never a fabricated trend — see PRODUCT.md).

### Sidebar nav (`AdminSidebar`, `ClientSidebar`)
Grouped (admin) or flat (client, 5 items) vertical links, icon + label, transparent over the page background. Active state is a solid coral pill spanning the full row (`bg-md-admin-coral text-white shadow-sm`), not a border. The logo sits in its own small `bg-md-admin-cream` chip at the top of the sidebar — necessary because the real logo PNG's wordmark is brand red, which has poor contrast directly on the maroon background; the same chip treatment is reused in `MarketingNav` and on the Clerk sign-in/sign-up screens for the same reason.

### Status pill / dot
Flat `rounded-full` pill (list rows) or a bare small dot (sidebar footer, table cells): `bg-{role}/20 text-{role}` for pills (higher opacity than a light system would use, for legibility on the dark card), solid `bg-{role}` for dots. Always driven by `CLIENT_STATUS_META`, never a one-off color choice — see Colors → Legacy brand colors for how the four status colors render on Admin v2's dark surfaces.

### Conversations ring (admin Resumen only)
A decorative SVG progress ring with a blurred radial-gradient glow behind it, framing the real 7-day WhatsApp-conversation count in the center. The ring's fill is a fixed ~88%, not data-driven — an early version tied the fill to week-over-week % change and it rendered as a near-invisible sliver whenever a client had a quiet week, which read as "broken" rather than "quiet"; the actual trend (when a prior week exists to compare against) is shown as real text below the count instead, colored/iconed by direction (teal `TrendingUp` when up, coral `TrendingDown` when down — never a fixed color regardless of sign).

### Avatar colors
`InitialAvatar` colors are assigned by a deterministic hash of the entity's id (`avatarColorFor()` in `admin/(dashboard)/page.tsx`), not by list position — so the same client/contact gets the same color everywhere they appear on the page, not a different color per list.

### Navigation (`MarketingNav`)
Sticky, `bg-md-admin-bg/90 backdrop-blur`, `h-20`, `border-b border-white/10`. Logo (in a cream chip) left, two text links center, a pill-shaped `/crm` badge right with a small gold dot.

### Clerk auth screens (`/sign-in`, `/sign-up`, `UserButton`)
Clerk's own hosted components are themed via `appearance` on `ClerkProvider` (`src/app/layout.tsx`), not per-page — `baseTheme: dark` from `@clerk/themes` plus explicit `variables` overrides (`colorBackground`, `colorForeground`, `colorMutedForeground`, `colorInput`/`colorInputForeground`, `colorPrimary`/`colorPrimaryForeground`, `colorRing`) mapped to the Admin v2 palette. **Do not use the older Clerk variable names** (`colorText`, `colorTextSecondary`, `colorInputBackground`, `colorInputText`) — this version of `@clerk/themes`/`@clerk/nextjs` silently ignores them (they simply don't map to anything), which previously left body text rendering in Clerk's light-theme default dark-gray on our dark card, nearly illegible. Verify any future Clerk appearance change by actually loading `/sign-in` — a wrong variable name fails silently, not with a build error.

## Do's and Don'ts

### Do:
- Use `.admin-card`'s translucent glass treatment for every card, on every surface — this was an explicit user correction (not flat solid fill), not a style choice to reconsider per-page.
- Use Poppins only (`font-admin-sans`/`font-admin-display`), no italics, no second typeface, anywhere in the product — also an explicit user correction.
- Keep `md-admin-gold` as the only primary accent color; coral stays tied to icon chips/accents, cream stays tied to logo chips — don't swap their roles.
- Reuse `CLIENT_STATUS_META`'s color mapping everywhere an account status renders (through the dark-surface pill treatment), so a client's status means the same color on every surface they or staff can see it from.
- Keep sidebar nav (Operate surfaces) and section-based scroll (Persuade surfaces) as the two structural patterns — don't force a sidebar onto a marketing page or a scrolling hero onto a dashboard.
- When touching Clerk's `appearance` config, verify against the currently-installed `@clerk/themes` version's actual variable names (they've changed between major versions) by rendering `/sign-in` and checking contrast, not by assuming the API surface from memory or older docs.

### Don't:
- Don't reintroduce flat solid-color cards, the old light system's white/`gray-50` treatment, or `panel-chassis` — all three are retired, not fallbacks.
- Don't invent stats, trend arrows, or chart/ring data without a real query backing it (PRODUCT.md's standing rule) — every number on every stat tile, ring, and chart in this system is a live count (the admin conversations ring's fill % is the one deliberate exception — decorative chrome, not a claimed metric — see Components).
- Don't add a second typeface or italic styling anywhere in the product.
- Don't mention specific client industries — PRODUCT.md requires generic "negocios locales" language.
- Don't invert small UI elements (icon chips, badges) to light/cream fills beyond the named logo-chip exception — this was tried and explicitly rejected by the user.
