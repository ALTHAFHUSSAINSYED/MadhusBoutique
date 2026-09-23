"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Check, Eye, Layers } from "lucide-react";
import { Product } from "@/types/store";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, items } = useCart();
  const isAlreadyInCart = items.some((item) => item.product.id === product.id);

  return (
    <div className="group relative rounded-2xl bg-white border border-[#e7dfd5] overflow-hidden luxury-shadow luxury-card-hover flex flex-col justify-between">
      {/* Top Media Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-stone-950">
        <Link href={`/designs/${product.slug}`} className="block w-full h-full">
          <Image
            src={product.preview_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Category & Code Overlay Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <Badge variant="gold" className="text-[10px] font-semibold tracking-wider uppercase backdrop-blur-xs bg-white/90">
            {product.category}
          </Badge>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-black/75 text-[#fef3c7] backdrop-blur-xs">
            {product.product_code}
          </span>
        </div>

        {/* Quick View Button on Hover */}
        <Link
          href={`/designs/${product.slug}`}
          className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
        >
          <span className="px-4 py-2 rounded-full bg-white text-stone-900 text-xs font-semibold flex items-center gap-1.5 shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5 text-[#6b1426]" />
            Inspect Design
          </span>
        </Link>
      </div>

      {/* Card Details & Specifications */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#b8860b]" />
              {product.stitch_count.toLocaleString()} stitches
            </span>
            <span>{product.dimensions}</span>
          </div>

          <Link href={`/designs/${product.slug}`} className="block">
            <h3 className="font-serif text-base font-bold text-[#4a1220] group-hover:text-[#6b1426] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-stone-600 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#f4efe6]">
          {/* Format pills */}
          <div className="flex items-center gap-1 mb-3">
            <span className="text-[10px] uppercase font-bold text-stone-400 mr-1">
              Formats:
            </span>
            {product.file_formats.map((fmt) => (
              <span
                key={fmt}
                className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#f6efe2] text-[#4a1220] border border-[#dfb15b]/40"
              >
                {fmt}
              </span>
            ))}
          </div>

          {/* Pricing & Add to Cart */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-stone-500 block uppercase font-medium">
                Digital ZIP
              </span>
              <span className="text-xl font-serif font-bold text-[#6b1426]">
                {formatPrice(product.price)}
              </span>
            </div>

            <button
              onClick={() => addToCart(product)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#6b1426] text-white hover:bg-[#520f1d] active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              {isAlreadyInCart ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#dfb15b]" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Bag</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
