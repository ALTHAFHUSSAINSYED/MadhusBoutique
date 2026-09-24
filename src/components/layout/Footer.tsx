"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Lock, Sparkles, Phone, Mail, MapPin } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { useSiteConfig } from "@/context/SiteConfigContext";

export function Footer() {
  const { settings } = useSiteConfig();
  const contact = settings.contact_info;
  const brand = settings.brand_assets;
  const waNumber = (contact.whatsapp_number || "918142073385").replace(/[^0-9]/g, "");

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const isMobile =
      typeof navigator !== "undefined" &&
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const text = encodeURIComponent(
      `Hello ${brand.brand_name || "Madhus Boutique"}! 🌸 I would like to inquire about your embroidery designs and services.`
    );
    const url = isMobile
      ? `https://wa.me/${waNumber}?text=${text}`
      : `https://web.whatsapp.com/send?phone=${waNumber}&text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <footer className="bg-[#24060f] text-[#f5eee6] border-t border-[#4a1220]">
      {/* Decorative Gold Stitch Divider */}
      <div className="w-full h-1.5 bg-gradient-to-r from-[#6b1426] via-[#d4af37] to-[#6b1426]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand Atelier */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-36 h-10 shrink-0">
                <Image
                  src={brand.logo_wide_url || "/logo.png"}
                  alt={brand.brand_name || "Madhus Boutique"}
                  fill
                  className="object-contain object-left"
                  unoptimized={brand.logo_wide_url?.startsWith("data:") || brand.logo_wide_url?.startsWith("http")}
                />
              </div>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Premier Indian atelier crafting high-precision machine embroidery designs and exquisite custom bridal embroidery. Built for boutique owners, digitizers, and fashion enthusiasts.
            </p>
            {contact.physical_address && (
              <div className="flex items-start gap-2 text-xs text-stone-400 pt-1">
                <MapPin className="w-4 h-4 text-[#dfb15b] shrink-0 mt-0.5" />
                <span>{contact.physical_address}{contact.city_state_pincode ? `, ${contact.city_state_pincode}` : ""}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-[#dfb15b] font-medium pt-1">
              <Sparkles className="w-4 h-4" />
              <span>Authentic Stitch Calibration</span>
            </div>
          </div>

          {/* Column 2: Design Collections */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider text-[#d4af37] uppercase font-sans">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <Link href="/designs?category=Bridal" className="hover:text-white transition-colors">
                  Bridal Blouse &amp; Yokes
                </Link>
              </li>
              <li>
                <Link href="/designs?category=Floral" className="hover:text-white transition-colors">
                  English &amp; Indian Floral Motifs
                </Link>
              </li>
              <li>
                <Link href="/designs?category=Saree" className="hover:text-white transition-colors">
                  Saree Borders &amp; Pallu Kalka
                </Link>
              </li>
              <li>
                <Link href="/designs?category=Neck+Designs" className="hover:text-white transition-colors">
                  Aari &amp; Maggam Neck Work
                </Link>
              </li>
              <li>
                <Link href="/designs?category=Kids" className="hover:text-white transition-colors">
                  Kids Romper &amp; Soft Embroidery
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Custom Embroidery Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Tracking */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider text-[#d4af37] uppercase font-sans">
              Orders &amp; Support
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <Link href="/track-order" className="hover:text-white transition-colors font-medium text-[#fef3c7]">
                  → Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Our Atelier Story
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Customer Assistance
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-[#dfb15b] transition-colors flex items-center gap-1.5 text-stone-300">
                  <Lock className="w-3.5 h-3.5 text-[#dfb15b]" />
                  <span>Staff / Admin Login</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("mb:replay-intro"));
                    }
                  }}
                  className="hover:text-[#fef3c7] transition-colors text-left flex items-center gap-1.5 cursor-pointer text-[#dfb15b] font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Replay Stitching Craft Intro</span>
                </button>
              </li>
            </ul>
            <div className="pt-2 space-y-2 text-xs text-stone-300">
              {contact.whatsapp_number && (
                <div className="flex items-center gap-2">
                  <WhatsAppIcon variant="3d" size={16} />
                  <a
                    href={`https://wa.me/${waNumber}`}
                    onClick={handleWhatsAppClick}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-400 text-emerald-300 font-medium transition-colors"
                  >
                    WhatsApp: +{waNumber.startsWith("91") ? waNumber.slice(0, 2) + " " + waNumber.slice(2) : waNumber}
                  </a>
                </div>
              )}
              {(contact.primary_phone || contact.secondary_phone) && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#dfb15b]" />
                  {contact.primary_phone && (
                    <a href={`tel:${contact.primary_phone}`} className="hover:text-white transition-colors">
                      {contact.primary_phone}
                    </a>
                  )}
                  {contact.primary_phone && contact.secondary_phone && (
                    <span className="text-stone-600">|</span>
                  )}
                  {contact.secondary_phone && (
                    <a href={`tel:${contact.secondary_phone}`} className="hover:text-white transition-colors">
                      {contact.secondary_phone}
                    </a>
                  )}
                </div>
              )}
              {contact.support_email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#dfb15b]" />
                  <a href={`mailto:${contact.support_email}`} className="hover:text-white transition-colors">
                    {contact.support_email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Column 4: Machine Formats & Security Badge */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider text-[#d4af37] uppercase font-sans">
              Digital Delivery &amp; Security
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Every digital purchase is delivered as a verified ZIP archive containing industry standard formats.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["DST", "PES", "JEF", "EXP", "COLOR CHART"].map((fmt) => (
                <span
                  key={fmt}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#3b0a16] text-[#fef3c7] border border-[#6b1426]"
                >
                  {fmt}
                </span>
              ))}
            </div>
            <div className="p-3 rounded-lg bg-[#19030a] border border-[#6b1426] space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero-Leakage Private S3</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-stone-300">
                <Lock className="w-3.5 h-3.5 text-[#dfb15b]" />
                <span>5-Minute Expiring Secure Pre-signed Links</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#4a1220] flex flex-col sm:flex-row items-center sm:items-start justify-between text-xs text-stone-400 gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p>© {new Date().getFullYear()} {brand.brand_name || "Madhus Boutique"}. All rights reserved. Crafted with precision.</p>
            <p className="text-stone-400">
              Designed &amp; Managed by{" "}
              <span className="text-stone-300 hover:text-[#dfb15b] transition-colors">
                Althaf Web &amp; Cloud Solutions, Narasaraopet
              </span>
            </p>
          </div>
          <div className="flex items-center gap-4 text-stone-400 text-xs shrink-0">
            <span>UPI QR Verified Delivery</span>
            <span>•</span>
            <Link href="/track-order" className="hover:text-white transition-colors">
              Self-Serve Order Lookup
            </Link>
            <span>•</span>
            <Link href="/admin/login" className="hover:text-[#dfb15b] transition-colors flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#dfb15b]" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
