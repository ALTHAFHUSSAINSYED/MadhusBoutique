"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    totalItems,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#fdfbf7] shadow-2xl border-l border-[#e7dfd5] flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-[#e7dfd5] bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#6b1426]" />
              <h2 className="font-serif text-lg font-bold text-[#4a1220]">
                Your Embroidery Bag
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#f6efe2] text-[#6b1426] font-semibold">
                {totalItems}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#f6efe2] border border-[#dfb15b]/40 flex items-center justify-center mx-auto text-[#6b1426]">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-semibold text-stone-800">
                    Your bag is empty
                  </h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Explore our collection of bridal, floral, and traditional embroidery patterns.
                  </p>
                </div>
                <Button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4"
                  asChild
                >
                  <Link href="/designs">Explore Designs</Link>
                </Button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="p-4 rounded-xl bg-white border border-[#e7dfd5] shadow-xs flex gap-4 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-stone-200 bg-stone-900 relative shrink-0">
                    <Image
                      src={product.preview_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[10px] font-mono tracking-wider text-[#b8860b] uppercase font-bold">
                          {product.product_code}
                        </span>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          aria-label={`Remove ${product.name} from bag`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="font-serif text-sm font-semibold text-stone-900 line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        {product.file_formats.join(", ")} • {product.stitch_count.toLocaleString()} stitches
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-stone-200 rounded-md bg-stone-50">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="px-2 py-1 text-stone-600 hover:text-stone-900 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-stone-800">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="px-2 py-1 text-stone-600 hover:text-stone-900 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Subtotal */}
                      <span className="text-sm font-bold text-[#6b1426]">
                        {formatPrice(product.price * quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#e7dfd5] bg-white space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>ZIP Generation & Digital Delivery</span>
                  <span className="text-emerald-700 font-semibold">FREE</span>
                </div>
                <div className="flex items-center justify-between text-base font-bold text-[#4a1220] pt-2 border-t border-stone-100">
                  <span>Total Amount</span>
                  <span className="text-xl font-serif text-[#6b1426]">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </div>

              {/* Delivery info box */}
              <div className="p-3 rounded-lg bg-[#fbf8f2] border border-[#dfb15b]/40 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#b8860b] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#5c4933] leading-relaxed">
                  Fast UPI Payment. Your high-res digital ZIP archive will be instantly unlocked upon admin verification.
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => setIsCartOpen(false)}
                  className="w-full h-12 text-base font-serif flex items-center justify-center gap-2"
                  asChild
                >
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 text-[#dfb15b]" />
                  </Link>
                </Button>
                <div className="flex items-center justify-between text-xs pt-1">
                  <Link
                    href="/cart"
                    onClick={() => setIsCartOpen(false)}
                    className="text-stone-600 hover:text-[#6b1426] underline font-medium"
                  >
                    View detailed bag
                  </Link>
                  <span className="text-stone-400 text-[11px]">
                    Guest Checkout Available
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
