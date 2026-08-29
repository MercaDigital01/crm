---
name: Merca Digital
description: One light, teal-accented system across the whole product — marketing site, CRM pitch, client dashboard, and staff admin
colors:
  md-teal: "#1da9b7"
  md-gold: "#e8b708"
  md-blue: "#076fa7"
  md-red: "#fa171f"
  panel-chassis: "#121417"
  gray-50: "#f9fafb"
  gray-900: "#111827"
typography:
  body:
    fontFamily: "system-ui, -apple-system, Arial, sans-serif"
    weights: [400, 500, 600]
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

**One system, four surfaces.** The whole product — the public marketing site (`/`), the CRM pitch (`/crm`), the client dashboard (`/dashboard/**`), and the staff admin panel (`/admin/**`) — now shares one light, teal-accented visual language: a `gray-50` canvas, white cards on an extremely soft shadow (`shadow-[0_2px_10px_rgba(0,0,0,0.02)]`, never a border doubling as elevation), generously rounded corners (`rounded-2xl`/`rounded-3xl` on cards, `rounded-full` on every button and pill), and `md-teal` as the one primary accent — buttons, active nav states, focus rings, links.

**This replaces the previous system**, a dark "panel chassis" instrument-panel world (near-black ground, Space Grotesk display type, beveled plates, pilot-light dots) that governed the marketing site and client dashboard through 2026-08-21–26. That system is retired, not extended — this is a redesign, not a refinement: the old dark world is evidence of what came before, not a parallel option to preserve. Two small, deliberate threads of continuity survive the swap: the four brand colors themselves (sampled from the logo, unchanged), and `panel-chassis` (`#121417`) as the fill for exactly two "special" dark accent cards inside the admin panel (see Admin section below) — everywhere else, dark-on-light became light-on-white.

**How this happened:** the admin panel was redesigned first (light/utilitarian, per an earlier explicit scope decision), then the user asked for a bolder "SaaS dashboard" look referencing a specific product screenshot (sidebar nav, stat tiles, soft rounded cards), corrected an initial emerald-green accent back to the real Merca Digital teal, then asked for the exact same visual format across the entire product. This document describes the result of that full pass, not a plan for one.

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
- **Canvas**: `gray-50` — page background behind white cards, everywhere (marketing sections that need a resting beat, dashboard/admin page background).
- **Surface**: white — every card, every form.
- **Text**: `gray-900` primary, `gray-400`/`gray-500` secondary — replaces the old `panel-ink`/`panel-ink-dim` on-dark pair.
- **panel-chassis** (`#121417`): still defined, now used only for the admin panel's two special dark cards (sidebar session card, conversation-activity chart) and the marketing hero's photo overlay gradient (a dark scrim over a real photo needs a genuinely dark color regardless of the rest of the page being light).

### Named Rules
**The Role, Not Rainbow Rule** (unchanged): each brand color maps to one real thing everywhere it appears. A client's account status (`activo`/`pendiente_de_pago`/`en_gracia`/`suspendido`/`cancelado`, `CLIENT_STATUS_META` in `src/app/dashboard/status.ts`) is the canonical example — the same teal/gold/blue/red mapping renders as a flat colored dot or pill on every surface (client dashboard, admin client list, admin Resumen), never a different color per surface.

**Card elevation is shadow-only.** Every card uses `shadow-[0_2px_10px_rgba(0,0,0,0.02)]` and no border — a border under a shadow is the "ghost card" tell. The one deliberate exception is the sidebar's active-nav-item accent, which is a left border by direct reference request (see Components).

## Typography

**No display face.** The old Space Grotesk/Space Mono pairing is retired along with the dark chassis; every surface now uses the system sans (`body { font-family: Arial, Helvetica, sans-serif }` in `globals.css` — a pre-existing gap, not a deliberate choice, still open). Numbers and headings get weight (`font-semibold`), not a different typeface — this matches Operate-mode guidance (one family, tighter scale) and was a deliberate simplification even on the two Persuade surfaces (marketing site, `/crm`), which chose brand-through-color-and-photography over brand-through-typeface.

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
- **Operate** (`/dashboard/**`, `/admin/**`): fixed 256px (`w-64`) left sidebar (white, `border-r border-gray-200`) + fluid main content, `max-w-6xl` inside the remaining space, `px-6 py-10`. Collapses to a slim top bar + horizontal tab strip below `md`. Both sidebars (`AdminSidebar`, `ClientSidebar`) share the same component shape: grouped nav links with icons, a `border-l-4 border-md-teal bg-md-teal/10` active state, session/logout controls anchored to the sidebar's bottom.

## Elevation & Depth

Single shadow vocabulary, used everywhere: `shadow-[0_2px_10px_rgba(0,0,0,0.02)]`, no border. Corner radius scales with the container's importance: `rounded-xl`/`rounded-2xl` for standard cards and list containers, `rounded-3xl` for hero-weight cards (the two admin dark cards, the marketing proof panel, the featured services panel). Buttons, pills, and status badges are always `rounded-full`.

## Components

### Buttons
- **Shape**: `rounded-full` always — no intermediate radius on any button, on any surface.
- **Primary**: `bg-md-teal text-white`, hover `bg-md-teal/90` (Persuade surfaces) or a slightly darker literal shade where a `/90` opacity reads too soft against a busy background.
- **Secondary**: `border border-gray-200`/`border-gray-300`, `text-gray-700`, hover `bg-gray-100`.
- **Focus**: `focus-visible:ring-2 ring-md-teal/40` — standardized once for the whole Operate side via `.admin-panel` in `globals.css`; Persuade buttons declare it inline per-button since they sit on varied backgrounds (photo hero, teal band).

### Cards
One shape everywhere: white, shadow-only, rounded. A "stat tile" (`StatTile` pattern, duplicated with the same shape in both `admin/(dashboard)/page.tsx` and `dashboard/page.tsx`) is: label top-left, optional small circular icon-link top-right (a real navigation affordance, never decorative), a bold `text-4xl` number, an optional one-line real-data subtitle underneath (never a fabricated trend — see PRODUCT.md).

### Sidebar nav (`AdminSidebar`, `ClientSidebar`)
Grouped (admin) or flat (client, only 5 items) vertical links, icon + label, active state = `border-l-4 border-md-teal` + `bg-md-teal/10` + bold `text-gray-900` (not colored text) + teal icon. The `border-l-4` reads as a known "AI-slop" tell to a mechanical detector but is a deliberate 1:1 match to the product screenshot the user pinned as the reference — kept on purpose.

### Status pill / dot
Flat `rounded-full` pill (list rows) or a bare small dot (sidebar footer, table cells): `bg-{role}/10 text-{role}` for pills, solid `bg-{role}` for dots. Always driven by `CLIENT_STATUS_META`, never a one-off color choice.

### Dark accent cards (admin only)
Exactly two: the admin sidebar's session/logout card and the admin Resumen page's 7-day conversation-activity chart. Both use `bg-panel-chassis` + `.admin-dark-pattern` (a subtle CSS dot-grid, no image) + white text — the one place the old dark world still appears, chosen deliberately to avoid inventing non-brand colors (an initial pass used `emerald-*` here, corrected to the real brand dark). The chart's bars are real per-day WhatsApp-event counts; a zero-count day renders with a diagonal-stripe fill (`.admin-stripe-empty`), never a faked bar height.

### Navigation (`MarketingNav`)
Sticky, `bg-white/90 backdrop-blur`, `h-20`, `border-b border-gray-200`. Logo left, two text links center, a pill-shaped `/crm` badge right with a small teal dot — same structure as the old dark version, recolored.

## Do's and Don'ts

### Do:
- Use `shadow-[0_2px_10px_rgba(0,0,0,0.02)]` with no border for every card, on every surface — one elevation system, not per-page invention.
- Keep `md-teal` as the only primary accent color; gold/blue/red stay tied to their real semantic roles (Ads, content/account, alerts) and never substitute for teal as decoration.
- Reuse `CLIENT_STATUS_META`'s color mapping everywhere an account status renders, so a client's status means the same color on every surface they or staff can see it from.
- Keep sidebar nav (Operate surfaces) and section-based scroll (Persuade surfaces) as the two structural patterns — don't force a sidebar onto a marketing page or a scrolling hero onto a dashboard.

### Don't:
- Don't reintroduce the dark chassis, Space Grotesk/Space Mono, or beveled-plate shadows outside the two named exceptions (admin's dark cards, marketing hero photo scrim) — that world is retired, not a fallback.
- Don't invent stats, trend arrows, or chart data without a real query backing it (PRODUCT.md's standing rule) — every number on every stat tile and chart in this system is a live count.
- Don't pair a border with a shadow on the same card ("ghost card") — pick shadow, always, per this system.
- Don't mention specific client industries — PRODUCT.md requires generic "negocios locales" language.
