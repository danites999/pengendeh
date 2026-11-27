import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });
const body = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Pengen Deh — Wishlist & Planner Tabungan",
  description: "Rencanakan dan lacak tabungan untuk semua keinginanmu.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffb627" };

// Pasang kelas dark sebelum render pertama supaya tidak berkedip.
const themeScript = `try{var t=localStorage.getItem("pengen-deh:theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="bg-bg font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
