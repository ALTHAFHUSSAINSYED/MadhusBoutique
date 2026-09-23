import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Lock, Sparkles, Phone, Mail } from "lucide-react";

export function Footer() {
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
                  src="/logo.png"
                  alt="Madhus Boutique"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Premier Indian atelier crafting high-precision machine embroidery designs and exquisite custom bridal embroidery. Built for boutique owners, digitizers, and fashion enthusiasts.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#dfb15b] font-medium pt-2">
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
                  Bridal Blouse & Yokes
                </Link>
              </li>
              <li>
                <Link href="/designs?category=Floral" className="hover:text-white transition-colors">
                  English & Indian Floral Motifs
                </Link>
              </li>
              <li>
                <Link href="/designs?category=Saree" className="hover:text-white transition-colors">
                  Saree Borders & Pallu Kalka
                </Link>
              </li>
              <li>
                <Link href="/designs?category=Neck+Designs" className="hover:text-white transition-colors">
                  Aari & Maggam Neck Work
                </Link>
              </li>
              <li>
                <Link href="/designs?category=Kids" className="hover:text-white transition-colors">
                  Kids Romper & Soft Embroidery
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
              Orders & Support
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
            </ul>
            <div className="pt-2 space-y-1.5 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#dfb15b]" />
                <a href="tel:+919390213935" className="hover:text-white transition-colors">+91 93902 13935</a>
                <span className="text-stone-600">|</span>
                <a href="tel:+918142073385" className="hover:text-white transition-colors">+91 81420 73385</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#dfb15b]" />
                <a href="mailto:Madhusboutiquenrt@gmail.com" className="hover:text-white transition-colors">Madhusboutiquenrt@gmail.com</a>
              </div>
            </div>
          </div>

          {/* Column 4: Machine Formats & Security Badge */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider text-[#d4af37] uppercase font-sans">
              Digital Delivery & Security
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
        <div className="mt-12 pt-6 border-t border-[#4a1220] flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} Madhus Boutique. All rights reserved. Crafted with precision.</p>
          <div className="flex items-center gap-4 text-stone-400 text-xs">
            <span>UPI QR Verified Delivery</span>
            <span>•</span>
            <Link href="/track-order" className="hover:text-white transition-colors">
              Self-Serve Order Lookup
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
