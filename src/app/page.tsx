"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Compass,
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
  CheckCircle2,
  Shirt,
} from "lucide-react";
import { MOCK_PRODUCTS } from "@/data/mockProducts";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Button } from "@/components/ui/button";
import { AnimatedHeroHoop } from "@/components/home/AnimatedHeroHoop";
import { useSiteConfig } from "@/context/SiteConfigContext";

export default function HomePage() {
  const { settings } = useSiteConfig();
  const featuredProducts = MOCK_PRODUCTS.filter((p) => p.featured).slice(0, 4);
  const homeContent = settings.pages_content.home;

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fbf8f2] via-[#f7f2e7] to-[#fdfbf7] border-b border-[#e7dfd5] py-16 sm:py-24">


        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f6efe2] border border-[#dfb15b]/50 text-xs font-semibold text-[#6b1426]">
                <Sparkles className="w-3.5 h-3.5 text-[#b8860b]" />
                <span>{homeContent.badge_text || "Premier Digital Embroidery Atelier • 2026 Collection"}</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#4a1220] tracking-tight leading-[1.12]">
                {homeContent.hero_title || "Beautiful Embroidery. Crafted With Precision."}
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {homeContent.hero_subtitle || "Download studio-calibrated machine embroidery designs for bridal wear, silk sarees, and designer blouses. Verified formats in DST, PES, JEF, and EXP."}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Button size="lg" className="w-full sm:w-auto font-serif text-base" asChild>
                  <Link href="/designs">
                    <Compass className="w-4 h-4 mr-2 text-[#dfb15b]" />
                    Explore Design Catalog
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto font-serif text-base border-[#6b1426]/30 text-[#4a1220] hover:bg-[#f6efe2]"
                  asChild
                >
                  <Link href="/services">Request Custom Embroidery</Link>
                </Button>
              </div>

              {/* Technical Trust Strip */}
              <div className="pt-6 border-t border-[#e7dfd5] grid grid-cols-3 gap-4 text-center sm:text-left">
                <div>
                  <span className="font-serif text-xl sm:text-2xl font-bold text-[#4a1220] block">
                    100%
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    Machine Tested Stitches
                  </span>
                </div>
                <div>
                  <span className="font-serif text-xl sm:text-2xl font-bold text-[#4a1220] block">
                    4+ Formats
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    DST, PES, JEF, EXP
                  </span>
                </div>
                <div>
                  <span className="font-serif text-xl sm:text-2xl font-bold text-[#4a1220] block">
                    Verified ZIP
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    Encrypted Delivery
                  </span>
                </div>
              </div>
            </div>

            {/* Right Media Hero Showcase */}
            <div className="lg:col-span-5 relative">
              {/* Main: Embroidery Hoop — restored */}
              <div className="relative mx-auto max-w-md aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#d4af37]/60 p-2 bg-[#2a050f]">
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-stone-950">
                  <AnimatedHeroHoop />
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 1b. Full-Width Boutique Brand Banner */}
      <section className="relative overflow-hidden">
        <div className="relative w-full aspect-[16/6] sm:aspect-[16/5] max-h-[420px]">
          <Image
            src="/boutique-banner.jpg"
            alt="Madhus Boutique — Perfection in every stitch and fit"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Subtle overlay for text readability if needed */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-900/10 via-transparent to-pink-900/10" />
        </div>
      </section>

      {/* 2. Featured Designs Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#b8860b]">
              Curated Atelier Picks
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4a1220]">
              Featured Embroidery Designs
            </h2>
            <p className="text-sm text-stone-600 max-w-lg">
              Precision digitized motifs engineered for high-speed multi-head and single-head embroidery machines.
            </p>
          </div>
          <Link
            href="/designs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6b1426] hover:text-[#4a1220] group"
          >
            <span>View All Collections</span>
            <ArrowRight className="w-4 h-4 text-[#d4af37] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 3. Category Showcase */}
      <section className="bg-[#f7f2e7] py-16 border-y border-[#e7dfd5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-[#b8860b]">
              Browse By Silhouette
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4a1220]">
              Signature Collections
            </h2>
            <p className="text-sm text-stone-600">
              Select a specialized category tailored to your apparel specifications.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Bridal", count: "18+ Designs", icon: Sparkles, query: "Bridal" },
              { name: "Floral", count: "34+ Motifs", icon: Layers, query: "Floral" },
              { name: "Blouse", count: "25+ Yokes", icon: Shirt, query: "Blouse" },
              { name: "Saree", count: "20+ Borders", icon: Cpu, query: "Saree" },
              { name: "Neck Designs", count: "22+ Patterns", icon: CheckCircle2, query: "Neck Designs" },
              { name: "Kids", count: "15+ Soft Embroideries", icon: Sparkles, query: "Kids" },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={`/designs?category=${encodeURIComponent(cat.query)}`}
                  className="group p-5 rounded-2xl bg-white border border-[#e7dfd5] text-center hover:border-[#d4af37] hover:shadow-md transition-all flex flex-col items-center justify-between"
                >
                  <div className="w-12 h-12 rounded-full bg-[#f6efe2] group-hover:bg-[#6b1426] group-hover:text-white text-[#6b1426] flex items-center justify-center transition-colors mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-stone-900 group-hover:text-[#6b1426] transition-colors">
                      {cat.name}
                    </h3>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      {cat.count}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. How Digital Delivery Works (Step-by-Step) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#b8860b]">
            Transparent & Secure
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4a1220]">
            How It Works
          </h2>
          <p className="text-sm text-stone-600">
            Frictionless zero-cost serverless checkout designed for instant boutique fulfillment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {[
            {
              step: "01",
              title: "Select Design",
              desc: "Choose from our catalog of stitch-optimized machine designs.",
            },
            {
              step: "02",
              title: "Add to Bag",
              desc: "Guest checkout with no forced account registration.",
            },
            {
              step: "03",
              title: "Scan UPI QR",
              desc: "Pay directly via GPay, PhonePe, Paytm, or BHIM.",
            },
            {
              step: "04",
              title: "Admin Verifies",
              desc: "Our team verifies your 12-digit UTR reference.",
            },
            {
              step: "05",
              title: "Download ZIP",
              desc: "Secure 5-minute pre-signed S3 download unlocked.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="relative p-6 rounded-2xl bg-white border border-[#e7dfd5] text-center space-y-3 luxury-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-[#6b1426] text-[#fef3c7] font-serif font-bold text-sm flex items-center justify-center mx-auto border-2 border-[#d4af37]">
                {item.step}
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900">
                {item.title}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Custom Embroidery Services Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#3b0a16] text-[#fdfbf7] p-8 sm:p-12 lg:p-16 border border-[#6b1426] relative overflow-hidden">
          {/* Subtle gold stitch decoration */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full border border-dashed border-[#dfb15b]/20 -mr-20 -mt-20 pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#520f1f] text-xs font-semibold text-[#dfb15b] border border-[#dfb15b]/30">
              <Sparkles className="w-3.5 h-3.5" />
              Bespoke Atelier Services
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#fef3c7] leading-tight">
              Looking for Customized Bridal Embroidery?
            </h2>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
              In addition to ready-to-stitch digital machine files, our master artisans craft bespoke hand Aari and high-end computer embroidery on raw silk, organza, and velvet fabrics.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                variant="gold"
                size="lg"
                className="font-serif font-semibold text-stone-900"
                asChild
              >
                <Link href="/services">Explore Custom Services</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent text-white border-white/30 hover:bg-white/10 font-serif"
                asChild
              >
                <Link href="/contact">Inquire with Artisan</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
