"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";

export default function FullCartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, subtotal, totalItems } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          title="Your Embroidery Bag is Empty"
          description="You haven't selected any designs yet. Explore our curated collections of bridal blouse yokes, saree borders, and floral patterns."
          actionText="Browse Design Catalogue"
          actionHref="/designs"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#e7dfd5]">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#b8860b]">
            Review & Order
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4a1220]">
            Your Embroidery Bag ({totalItems})
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-stone-500 hover:text-rose-700 underline cursor-pointer"
        >
          Clear entire bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="p-5 rounded-2xl bg-white border border-[#e7dfd5] shadow-xs flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
            >
              {/* Product Info with Image */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-950 border border-stone-200 relative shrink-0">
                  <Image
                    src={product.preview_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#b8860b] uppercase">
                    {product.product_code}
                  </span>
                  <Link
                    href={`/designs/${product.slug}`}
                    className="font-serif text-base font-bold text-[#4a1220] hover:text-[#6b1426] transition-colors block"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-stone-500">
                    {product.dimensions} • {product.stitch_count.toLocaleString()} stitches
                  </p>
                  <div className="flex gap-1 pt-0.5">
                    {product.file_formats.map((f) => (
                      <span
                        key={f}
                        className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#f6efe2] text-[#6b1426] border border-[#dfb15b]/30"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quantity & Pricing */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="px-2.5 py-1.5 text-stone-600 hover:text-stone-900 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-stone-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="px-2.5 py-1.5 text-stone-600 hover:text-stone-900 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[90px]">
                  <span className="text-base font-serif font-bold text-[#6b1426] block">
                    {formatPrice(product.price * quantity)}
                  </span>
                  {quantity > 1 && (
                    <span className="text-[10px] text-stone-400 block">
                      {formatPrice(product.price)} each
                    </span>
                  )}
                </div>

                <button
                  onClick={() => removeFromCart(product.id)}
                  className="text-stone-400 hover:text-rose-600 transition-colors p-2"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Delivery Note */}
          <div className="p-4 rounded-xl bg-[#fbf8f2] border border-[#dfb15b]/40 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#b8860b] shrink-0 mt-0.5" />
            <div className="text-xs text-[#5c4933] space-y-0.5">
              <strong className="block font-semibold">
                Protected Multi-File ZIP Generation
              </strong>
              <p>
                When purchasing multiple designs, our serverless pipeline bundles all required files (.DST, .PES, .JEF, .EXP) into a single unified ZIP archive generated upon payment verification.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Order Summary Card */}
        <div className="lg:col-span-4">
          <div className="rounded-3xl bg-white border border-[#e7dfd5] p-6 shadow-sm space-y-6 sticky top-28">
            <h3 className="font-serif text-lg font-bold text-[#4a1220] border-b border-stone-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-stone-600">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span>Digital Delivery & ZIP generation</span>
                <span className="text-emerald-700 font-semibold">FREE (Serverless)</span>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span>Taxes & GST</span>
                <span className="text-stone-500">Included</span>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-base font-bold text-[#4a1220]">
                <span>Total Payable</span>
                <span className="text-2xl font-serif text-[#6b1426]">
                  {formatPrice(subtotal)}
                </span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-12 text-sm font-serif flex items-center justify-center gap-2"
              asChild
            >
              <Link href="/checkout">
                Proceed to UPI Checkout
                <ArrowRight className="w-4 h-4 text-[#dfb15b]" />
              </Link>
            </Button>

            <div className="space-y-2 text-[11px] text-stone-500 text-center">
              <p>✓ No forced account signup needed</p>
              <p>✓ Instant UPI QR with GPay / PhonePe / Paytm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
