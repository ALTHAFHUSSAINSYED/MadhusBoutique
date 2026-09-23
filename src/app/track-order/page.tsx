"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, PackageCheck, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [recentOrders] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(sessionStorage.getItem("recent_orders") || "[]");
    } catch {
      return [];
    }
  });

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setErrorMessage("Please enter an order number.");
      return;
    }
    if (!phoneOrEmail.trim()) {
      setErrorMessage("Please enter your phone number or email address for verification.");
      return;
    }

    setIsSearching(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_number: orderNumber.trim().toUpperCase(),
          verification: phoneOrEmail.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(
          data.error || "No matching order found. Please verify your order number and contact info."
        );
        return;
      }

      // Redirect with verified token to unlock order status
      const token = data.verified_token || "verified";
      router.push(`/order/${data.order.order_number}?token=${token}`);
    } catch {
      setErrorMessage("Failed to connect to tracking service. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#b8860b]">
          Order Verification & Status
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4a1220]">
          Track Your Digital Order
        </h1>
        <p className="text-sm text-stone-600">
          Enter your Order Number and verified mobile number or email to check payment verification status and access your download links.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#e7dfd5] shadow-xs space-y-6 max-w-xl mx-auto">
        <form onSubmit={handleTrackSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">
              Order Number *
            </label>
            <Input
              required
              placeholder="e.g. MB-20260923-00421"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="font-mono text-base uppercase"
            />
            <span className="text-[11px] text-stone-400 block">
              Found on your order confirmation page or WhatsApp notification.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">
              WhatsApp Phone or Email Address
            </label>
            <Input
              placeholder="+91 98765 43210 or your email"
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
            />
          </div>

          {errorMessage && (
            <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
              {errorMessage}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isSearching}
            className="w-full h-12 text-sm font-serif font-semibold flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4 text-[#dfb15b]" />
            {isSearching ? "Searching..." : "Lookup Order Status"}
          </Button>
        </form>

        {/* Recent session orders convenience */}
        {recentOrders.length > 0 && (
          <div className="pt-4 border-t border-stone-100 space-y-2">
            <span className="text-xs text-stone-500 font-medium block">
              Recent Orders placed in this session:
            </span>
            <div className="flex flex-wrap gap-2">
              {recentOrders.map((ord) => (
                <button
                  key={ord}
                  onClick={() => router.push(`/order/${ord}`)}
                  className="px-3 py-1.5 rounded-lg bg-[#f6efe2] text-[#4a1220] border border-[#dfb15b]/40 text-xs font-mono font-bold hover:bg-[#ede1cc] transition-colors"
                >
                  {ord} →
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        <div className="p-5 rounded-2xl bg-[#f7f2e7] border border-[#e7dfd5] text-center space-y-2">
          <Clock className="w-6 h-6 text-[#b8860b] mx-auto" />
          <h4 className="font-serif text-sm font-bold text-stone-900">
            Payment Submitted
          </h4>
          <p className="text-[11px] text-stone-500">
            UTR submitted. Admin verifies receipt against bank records within 15–60 minutes.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#f7f2e7] border border-[#e7dfd5] text-center space-y-2">
          <PackageCheck className="w-6 h-6 text-[#b8860b] mx-auto" />
          <h4 className="font-serif text-sm font-bold text-stone-900">
            Payment Verified
          </h4>
          <p className="text-[11px] text-stone-500">
            Serverless function generates private ZIP bundle on S3.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#f7f2e7] border border-[#e7dfd5] text-center space-y-2">
          <ShieldCheck className="w-6 h-6 text-[#b8860b] mx-auto" />
          <h4 className="font-serif text-sm font-bold text-stone-900">
            Instant Download
          </h4>
          <p className="text-[11px] text-stone-500">
            Click to generate your short-lived 5-minute pre-signed S3 download URL.
          </p>
        </div>
      </div>
    </div>
  );
}
