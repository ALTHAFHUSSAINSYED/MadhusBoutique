"use client";

import React, { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ShieldCheck,
  Check,
  Plus,
  Layers,
  MessageCircle,
} from "lucide-react";
import { MOCK_PRODUCTS } from "@/data/mockProducts";
import { ProductCard } from "@/components/storefront/ProductCard";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const product = MOCK_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const { addToCart, items } = useCart();
  const isAlreadyInCart = items.some((item) => item.product.id === product.id);

  // Related products from same category
  const relatedProducts = MOCK_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 3);

  const whatsappInquiryUrl = `https://wa.me/919390213935?text=${encodeURIComponent(
    `Hello Madhus Boutique! 🌸✨ I would like to inquire about design ${product.product_code} (${product.name}) 🪡🧵👗`
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <Link href="/" className="hover:text-[#6b1426] transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/designs" className="hover:text-[#6b1426] transition-colors">
          Designs
        </Link>
        <span>/</span>
        <Link
          href={`/designs?category=${encodeURIComponent(product.category)}`}
          className="hover:text-[#6b1426] transition-colors"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-stone-900 font-semibold line-clamp-1">
          {product.name}
        </span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Design Preview Image with Watermark notice */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-stone-950 border-2 border-[#e7dfd5] shadow-xl">
            <Image
              src={product.preview_url}
              alt={product.name}
              fill
              priority
              className="object-cover"
            />
            {/* Design Watermark Indicator */}
            <div className="absolute top-4 left-4">
              <Badge variant="gold" className="text-xs backdrop-blur-xs bg-white/90">
                Watermarked Studio Preview
              </Badge>
            </div>
            <div className="absolute bottom-4 right-4">
              <span className="px-3 py-1 rounded-full bg-black/80 text-[#fef3c7] text-xs font-mono font-bold backdrop-blur-xs">
                {product.product_code}
              </span>
            </div>
          </div>

          {/* Security & Authenticity notice */}
          <div className="p-4 rounded-xl bg-[#fbf8f2] border border-[#dfb15b]/40 flex items-start gap-3 text-xs text-[#5c4933]">
            <ShieldCheck className="w-5 h-5 text-[#b8860b] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="block font-semibold">Protected Digital Asset</strong>
              <p>
                Preview image is intentionally watermarked. Full high-resolution stitch vector files ({product.file_formats.join(", ")}) are stored in encrypted private storage and delivered as a verified ZIP after payment.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Technical Specs & Add to Bag */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs font-semibold">
                {product.category}
              </Badge>
              <span className="text-xs font-mono font-bold text-stone-500">
                Code: {product.product_code}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4a1220]">
              {product.name}
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed pt-1">
              {product.description}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-2xl bg-white border border-[#e7dfd5] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-500 uppercase font-medium block">
                Digital ZIP Package
              </span>
              <span className="text-3xl font-serif font-bold text-[#6b1426]">
                {formatPrice(product.price)}
              </span>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <Check className="w-3.5 h-3.5" />
                Ready to Stitch
              </span>
              <span className="text-[11px] text-stone-400 block mt-1">
                Instant UPI QR Checkout
              </span>
            </div>
          </div>

          {/* Technical Specifications Grid */}
          <div className="rounded-2xl bg-white border border-[#e7dfd5] p-6 space-y-4 shadow-xs">
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-[#4a1220] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#b8860b]" />
              Machine Stitch Specifications
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-500 block">Total Stitches</span>
                <strong className="text-stone-900 font-bold text-sm block mt-0.5">
                  {product.stitch_count.toLocaleString()}
                </strong>
              </div>

              <div className="p-3 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-500 block">Dimensions</span>
                <strong className="text-stone-900 font-bold text-sm block mt-0.5">
                  {product.dimensions}
                </strong>
              </div>

              <div className="p-3 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-500 block">Color Stops</span>
                <strong className="text-stone-900 font-bold text-sm block mt-0.5">
                  {product.color_stops} Changes
                </strong>
              </div>

              <div className="p-3 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-500 block">Archive Size</span>
                <strong className="text-stone-900 font-bold text-sm block mt-0.5">
                  {product.file_size}
                </strong>
              </div>
            </div>

            {/* Formats Included */}
            <div className="pt-2">
              <span className="text-xs text-stone-500 block mb-2 font-medium">
                Machine Formats Bundled in ZIP:
              </span>
              <div className="flex flex-wrap gap-2">
                {product.file_formats.map((fmt) => (
                  <span
                    key={fmt}
                    className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-[#f6efe2] text-[#4a1220] border border-[#dfb15b]/40"
                  >
                    .{fmt.toLowerCase()} ({fmt})
                  </span>
                ))}
                <span className="px-3 py-1 rounded-md text-xs font-mono font-medium bg-stone-100 text-stone-600 border border-stone-200">
                  .pdf (Color Chart)
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3">
            <Button
              size="lg"
              onClick={() => addToCart(product)}
              className="w-full h-13 text-base font-serif flex items-center justify-center gap-2"
            >
              {isAlreadyInCart ? (
                <>
                  <Check className="w-5 h-5 text-[#dfb15b]" />
                  <span>Added to Bag — View Bag</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-[#dfb15b]" />
                  <span>Add Design to Bag</span>
                </>
              )}
            </Button>

            <a
              href={`https://web.whatsapp.com/send?phone=919390213935&text=${encodeURIComponent(
                `Hello Madhus Boutique! 🌸✨ I would like to inquire about design ${product.product_code} (${product.name}) 🪡🧵👗`
              )}`}
              onClick={(e) => {
                e.preventDefault();
                const isMobile =
                  typeof navigator !== "undefined" &&
                  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                const text = encodeURIComponent(
                  `Hello Madhus Boutique! 🌸✨ I would like to inquire about design ${product.product_code} (${product.name}) 🪡🧵👗`
                );
                const url = isMobile
                  ? `https://wa.me/919390213935?text=${text}`
                  : `https://web.whatsapp.com/send?phone=919390213935&text=${text}`;
                window.open(url, "_blank", "noopener,noreferrer");
              }}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 rounded-lg border border-[#e7dfd5] bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              Inquire about this design on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Related Designs Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-[#e7dfd5]">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-[#4a1220]">
              More in {product.category}
            </h2>
            <p className="text-xs text-stone-500">
              Coordinating patterns and matching elements from the same atelier series.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
