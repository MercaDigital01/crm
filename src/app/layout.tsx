import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
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

// Dark maroon/gold Admin v2 palette, reused here so Clerk's own SignIn/SignUp/
// UserButton widgets match the rest of the product instead of rendering their
// light default card. See DESIGN.md for the full system this is drawn from.
const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#f0c14b",
    colorPrimaryForeground: "#3d1119",
    colorBackground: "#6b2a35",
    colorForeground: "#ffffff",
    colorMutedForeground: "#d9a9ac",
    colorInput: "rgba(255,255,255,0.08)",
    colorInputForeground: "#ffffff",
    colorNeutral: "#ffffff",
    colorRing: "#f0c14b",
    borderRadius: "1rem",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html
        lang="es"
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${spaceMono.variable} ${admin_sans.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
