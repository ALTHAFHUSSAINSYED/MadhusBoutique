import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { WhatsAppBubble } from "@/components/layout/WhatsAppBubble";
import { StitchingIntroAnimation } from "@/components/layout/StitchingIntroAnimation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Madhus Boutique | Machine Embroidery Designs & Digital Delivery",
  description:
    "Premier Indian embroidery studio offering high-precision digital machine embroidery designs in DST, PES, JEF, and EXP formats, alongside bespoke bridal embroidery services.",
  keywords: [
    "embroidery designs",
    "machine embroidery",
    "bridal blouse embroidery",
    "DST file download",
    "PES embroidery",
    "Aari work neck design",
    "Madhus Boutique",
    "digital embroidery patterns"
  ],
  icons: {
    icon: "/icon.jpg",
    apple: "/icon.jpg",
    shortcut: "/icon.jpg",
  },
  openGraph: {
    title: "Madhus Boutique | Exquisite Embroidery Designs & Services",
    description:
      "Explore curated machine embroidery designs for bridal wear, sarees, and kurtis. Instant verified ZIP delivery in DST, PES & JEF formats.",
    url: "https://madhusboutique.com",
    siteName: "Madhus Boutique",
    images: [{ url: "/boutique-banner.jpg", width: 1280, height: 480, alt: "Madhus Boutique — Perfection in every stitch and fit" }],
    locale: "en_IN",
    type: "website",
  },
};


import { SiteConfigProvider } from "@/context/SiteConfigContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--brand-bg,#fdfbf7)] text-[#1c1917] selection:bg-[#6b1426] selection:text-[#fef3c7] transition-colors duration-300">
        <SiteConfigProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <CartDrawer />
            <WhatsAppBubble />
            <StitchingIntroAnimation />
          </CartProvider>
        </SiteConfigProvider>
      </body>
    </html>
  );
}
