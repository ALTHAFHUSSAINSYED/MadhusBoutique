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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  const handleMobileSearchSelect = (term: string) => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
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

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-22">
            {/* Logo & Brand Identity (Optimized so it never causes mobile overflow) */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0 mr-1 sm:mr-4">
              {/* Logo Icon */}
              <div className="relative w-10 h-10 sm:w-13 sm:h-13 lg:w-16 lg:h-16 shrink-0 group-hover:scale-105 transition-transform duration-200">
                <Image
                  src="/logo-icon.png"
                  alt="Madhus Boutique Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Brand Name & Tagline */}
              <div className="relative h-9 sm:h-12 lg:h-16 w-36 sm:w-56 md:w-80 lg:w-[380px] group-hover:scale-[1.02] transition-transform duration-200">
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

            {/* Right Action Icons (Mobile Search, Desktop Explore & Designs, Cart & Hamburger Menu) */}
            <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
              {/* Mobile Search Trigger Button (search icon function in mobile view) */}
              <button
                type="button"
                onClick={() => {
                  setMobileSearchOpen(!mobileSearchOpen);
                  if (mobileMenuOpen) setMobileMenuOpen(false);
                }}
                className={cn(
                  "md:hidden p-2 rounded-full border transition-all cursor-pointer shadow-xs shrink-0 flex items-center justify-center",
                  mobileSearchOpen
                    ? "bg-[#6b1426] text-white border-[#6b1426]"
                    : "bg-white border-[#e7dfd5] text-[#6b1426] hover:border-[#dfb15b]"
                )}
                aria-label="Search embroidery designs"
                title="Search embroidery designs"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              {/* Explore & Designs Link with Search Icon (Desktop View) */}
              <Link
                href="/designs"
                className="hidden md:inline-flex items-center gap-2 text-xs font-semibold pl-2 pr-3.5 py-1.5 rounded-full bg-[#f6efe2] text-[#4a1220] hover:bg-[#ebdcc3] border border-[#dfb15b]/60 hover:border-[#b8860b] transition-all cursor-pointer shadow-xs group shrink-0"
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
                className="relative p-2 sm:p-2.5 rounded-full bg-white border border-[#e7dfd5] text-stone-800 hover:border-[#d4af37] hover:bg-[#fbf9f5] transition-all cursor-pointer shadow-xs shrink-0"
                aria-label="View Shopping Cart"
              >
                <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#6b1426]" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-[#d4af37] text-[10px] sm:text-[11px] font-bold text-[#2a1402] shadow-sm animate-scale">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile menu trigger with three horizontal lines */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(!mobileMenuOpen);
                  if (mobileSearchOpen) setMobileSearchOpen(false);
                }}
                className={cn(
                  "md:hidden p-2 rounded-xl border transition-all cursor-pointer shrink-0 flex items-center justify-center",
                  mobileMenuOpen
                    ? "bg-[#6b1426] text-white border-[#6b1426]"
                    : "bg-[#f6efe2] text-[#4a1220] border-[#dfb15b]/50 hover:bg-[#ebdcc3]"
                )}
                aria-label="Toggle navigation menu"
                title="Navigation Menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar Dropdown (When search icon is tapped in mobile) */}
        {mobileSearchOpen && (
          <div className="md:hidden border-b border-[#e7dfd5] bg-[#fbf9f5] px-4 py-3 space-y-2.5 shadow-md animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
              <span className="flex items-center gap-1.5 text-[#6b1426] font-semibold">
                <Search className="w-3.5 h-3.5" />
                <span>Search Embroidery Designs</span>
              </span>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <SearchBar
              query={headerSearchQuery}
              onQueryChange={setHeaderSearchQuery}
              onSelectSuggestion={(sug) => {
                handleMobileSearchSelect(sug);
              }}
              placeholder="Search motif (Peacock, Aari), code, subcategory..."
              autoFocus
              className="w-full"
            />
          </div>
        )}

        {/* Mobile Menu Dropdown (All features from attached picture) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#e7dfd5] bg-[#fdfbf7] px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2">
            {/* 1. Search Bar inside Mobile Menu */}
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

            {/* 2. Primary Navigation Links (Home, Designs, Services, About, Contact, Track Order) */}
            <div className="space-y-1">
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
                      "flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#6b1426] text-white font-semibold shadow-xs"
                        : "text-stone-800 hover:bg-[#f6efe2]"
                    )}
                  >
                    <span>{link.name}</span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* 3. Explore & Designs Hero CTA (with Search Icon) */}
            <div className="pt-2 border-t border-[#e7dfd5]">
              <Link
                href="/designs"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r from-[#6b1426] to-[#4a1220] text-[#fef3c7] font-semibold text-sm shadow-md hover:opacity-95 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[#fef3c7]">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <span>Explore &amp; Designs</span>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
