"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Menu, X, Compass, Sparkles, Search } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/storefront/SearchBar";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Designs", href: "/designs" },
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Track Order", href: "/track-order" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMobileSearchSelect = (term: string) => {
    setMobileMenuOpen(false);
    router.push(`/designs?search=${encodeURIComponent(term)}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#e7dfd5] glass-header transition-all">
        {/* Top micro-announcement banner */}
        <div className="bg-[#4a1220] text-[#fef3c7] text-[11px] tracking-wider py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#dfb15b] animate-pulse" />
          <span>PREMIUM MACHINE EMBROIDERY DESIGNS • DST, PES, JEF & EXP FORMATS AVAILABLE</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-22">
            {/* Logo & Brand Identity */}
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3.5 group shrink-0 mr-2 sm:mr-4">
              {/* Logo Icon (authentic size preserved) */}
              <div className="relative w-13 h-13 sm:w-15 sm:h-15 lg:w-16 lg:h-16 shrink-0 group-hover:scale-105 transition-transform duration-200">
                <Image
                  src="/logo-icon.png"
                  alt="Madhus Boutique Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Brand Name & Tagline — font enlarged till Home nav */}
              <div className="relative h-12 sm:h-14 lg:h-16 w-56 sm:w-72 md:w-80 lg:w-[380px] group-hover:scale-[1.02] transition-transform duration-200">
                <Image
                  src="/logo-text-wide.png"
                  alt="Madhus Boutique — Perfection in every stitch and fit"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {NAV_LINKS.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "px-3.5 py-2 rounded-md text-sm font-medium transition-colors relative",
                      isActive
                        ? "text-[#6b1426] font-semibold"
                        : "text-stone-700 hover:text-[#6b1426] hover:bg-[#f6efe2]/60"
                    )}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#d4af37] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons (Merged Search & Explore, Cart & Mobile Menu) */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Explore & Designs Link with Search Icon */}
              <Link
                href="/designs"
                className="relative inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold pl-1.5 sm:pl-2 pr-2.5 sm:pr-3.5 py-1 sm:py-1.5 rounded-full bg-[#f6efe2] text-[#4a1220] hover:bg-[#ebdcc3] border border-[#dfb15b]/60 hover:border-[#b8860b] transition-all cursor-pointer shadow-xs group"
                aria-label="Explore & Designs"
                title="Explore & Designs"
              >
                <div className="w-6 h-6 rounded-full bg-white border border-[#dfb15b]/40 flex items-center justify-center text-[#6b1426] shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                  <Search className="w-3.5 h-3.5 text-[#6b1426]" />
                </div>
                <span className="font-semibold text-stone-800 group-hover:text-[#6b1426] transition-colors whitespace-nowrap">
                  Explore &amp; Designs
                </span>
              </Link>

              {/* Shopping Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-full bg-white border border-[#e7dfd5] text-stone-800 hover:border-[#d4af37] hover:bg-[#fbf9f5] transition-all cursor-pointer shadow-xs"
                aria-label="View Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5 text-[#6b1426]" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#d4af37] text-[11px] font-bold text-[#2a1402] shadow-sm animate-scale">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-stone-700 hover:text-[#6b1426] hover:bg-[#f6efe2] transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#e7dfd5] bg-[#fdfbf7] px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2">
            {/* Quick search inside mobile menu */}
            <div className="pt-1">
              <SearchBar
                query={headerSearchQuery}
                onQueryChange={setHeaderSearchQuery}
                onSelectSuggestion={(sug) => {
                  handleMobileSearchSelect(sug);
                }}
                placeholder="Search embroidery..."
                className="w-full"
              />
            </div>

            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-2.5 rounded-lg text-base font-medium transition-colors",
                    isActive
                      ? "bg-[#6b1426] text-white font-semibold"
                      : "text-stone-800 hover:bg-[#f6efe2]"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-[#e7dfd5]">
              <Link
                href="/designs"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#6b1426] text-white font-medium text-sm"
              >
                <Compass className="w-4 h-4 text-[#dfb15b]" />
                Browse All Embroidery Designs
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
