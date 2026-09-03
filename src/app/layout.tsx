import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import {
  Geist,
  Geist_Mono,
  Poppins,
  Space_Grotesk,
  Space_Mono,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-panel-display",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-panel-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Admin panel v2 (dark maroon/gold) own-world typography — one geometric
// sans (Poppins) across headings, big stat numbers, and body text, using
// weight alone for hierarchy. No italics. Deliberately distinct from the
// marketing site's Space Grotesk/Mono pairing above: same "committed
// own-world type, not default system chrome" principle, applied to the
// admin world's own character.
const admin_sans = Poppins({
  variable: "--font-admin-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Merca Digital — El tablero de tu negocio",
  description:
    "Mercadotecnia digital para negocios locales, con un agente de IA que vende y agenda por WhatsApp y un panel donde ves todo en tiempo real.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
      <html
        lang="es"
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${spaceMono.variable} ${admin_sans.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          {/*
            THESIS: A confident, transparent agency proven by a real working
            product, not an industrial-panel costume or generic AI-agency
            chrome (icon-tile trios, eyebrow kickers, invented metrics).
            OWN-WORLD: Dark chassis field carried across the whole page;
            brand teal/gold/blue as committed per-section accents, not
            scattered; Space Grotesk oversized display; Space Mono reserved
            for small functional labels, never a heading kicker; real,
            verified stock photography; the WhatsApp-receipt mockup as the
            one authored differentiator asset.
            STORY: Visitor sees the three real services (WhatsApp sales
            agent, Ads, content) proven by an actual dashboard preview, then
            contacts the agency or logs in if already a client.
            FIRST VIEWPORT: Full-bleed real photo of the product's real
            subject (a WhatsApp conversation), one giant two-line headline,
            no badge or eyebrow above it, one primary WhatsApp CTA.
            FORM: Canon path — user-pinned via named competitor references
            (Novacraft/Zenrixa/Arolex/Digitaal), built at their craft level;
            replaces candidate 3/7 (seed a62cecbd) from the prior run.
            FINISH: unreviewed and undocumented is unfinished; this build
            ends with the finish review, the verdict, and DESIGN.md.
          */}
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
