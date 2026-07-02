import type { Metadata, Viewport } from "next";
import { Baloo_2, Luckiest_Guy } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-baloo",
});

const luckiest = Luckiest_Guy({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-luckiest",
});

export const metadata: Metadata = {
  title: "Kart Hero World Cup — Bracket Challenge",
  description:
    "Predict the 16-team knockout bracket, climb the leaderboard, and dodge the workout punishments.",
};

export const viewport: Viewport = {
  themeColor: "#0c1445",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${baloo.variable} ${luckiest.variable}`}>
      <body>
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="border-t-4 border-ink py-6 text-center text-sm text-cream/60">
          Kart Hero Cup · original artwork · built for Cloudflare
        </footer>
      </body>
    </html>
  );
}
