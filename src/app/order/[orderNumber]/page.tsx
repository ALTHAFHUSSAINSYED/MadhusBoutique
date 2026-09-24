"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Download,
  Lock,
  FileArchive,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderSnapshot } from "@/types/store";

import { Input } from "@/components/ui/input";

interface OrderPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default function OrderStatusPage({ params }: OrderPageProps) {
  const resolvedParams = use(params);
  const { orderNumber } = resolvedParams;

  const [downloading, setDownloading] = useState(false);
  const [verificationInput, setVerificationInput] = useState("");
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Check if caller has valid token in URL query or sessionStorage
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const urlToken = new URLSearchParams(window.location.search).get("token");
      if (urlToken) return true;
      const stored = sessionStorage.getItem(`order_${orderNumber}`);
      if (stored) return true;
    }
    return false;
  });

  // Lazy initializer for order snapshot
  const [order, setOrder] = useState<OrderSnapshot>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem(`order_${orderNumber}`);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return {
      order_number: orderNumber,
      order_token: "",
      customer_name: "Customer (Verified)",
      customer_email: "customer@madhusboutique.com",
      customer_phone: "+91 98765 43210",
      items: [
        {
          product_code: "MB-001",
          name: "Royal Zardozi Peacock Bridal Blouse",
          price: 499,
          quantity: 1,
          formats: ["DST", "PES", "JEF", "EXP"],
        },
      ],
      subtotal: 499,
      discount: 0,
      total_amount: 499,
      payment_status: "SUBMITTED",
      order_status: "PAYMENT_SUBMITTED",
      created_at: new Date().toISOString(),
    };
  });

  // Handle IDOR verification submit
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationInput.trim()) {
      setVerificationError("Please enter your WhatsApp phone or email address.");
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_number: orderNumber,
          verification: verificationInput.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setVerificationError(
          data.error || "Access Denied: Verification does not match this order."
        );
        return;
      }

      // Success: IDOR verification passed!
      setIsAuthorized(true);
      if (data.order) {
        setOrder({
          order_number: data.order.order_number,
          order_token: data.order.order_token,
          customer_name: "Verified Customer",
          customer_email: verificationInput.includes("@") ? verificationInput : "Verified",
          customer_phone: !verificationInput.includes("@") ? verificationInput : "Verified",
          items: data.items.map((it: { product_name_snapshot: string; price_snapshot: number; quantity: number }) => ({
            product_code: "MB-DESIGN",
            name: it.product_name_snapshot,
            price: it.price_snapshot,
            quantity: it.quantity,
            formats: ["DST", "PES", "JEF", "EXP"],
          })),
          subtotal: data.order.subtotal,
          discount: data.order.discount,
          total_amount: data.order.total_amount,
          payment_status: data.order.payment_status,
          order_status: data.order.order_status,
          created_at: data.order.created_at,
        });
      }
    } catch {
      setVerificationError("Verification service temporarily unavailable. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const isVerified = order.payment_status === "VERIFIED";

  // Simulate admin verification toggle for review
  const toggleDemoVerification = () => {
    const updated: OrderSnapshot = {
      ...order,
      payment_status: isVerified ? "SUBMITTED" : "VERIFIED",
      order_status: isVerified ? "PAYMENT_SUBMITTED" : "PAYMENT_VERIFIED",
    };
    setOrder(updated);
    try {
      sessionStorage.setItem(`order_${orderNumber}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadInfo, setDownloadInfo] = useState<{
    download_count: number;
    max_downloads: number;
  } | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError(null);

    try {
      // Retrieve token from order state or URL query
      let token = order.order_token;
      if (!token && typeof window !== "undefined") {
        token = new URLSearchParams(window.location.search).get("token") || "";
      }

      if (!token) {
        throw new Error("Missing security token. Please verify order ownership.");
      }

      const res = await fetch(`/api/orders/${orderNumber}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_token: token }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate digital download link.");
      }

      setDownloadInfo({
        download_count: data.data.download_count,
        max_downloads: data.data.max_downloads,
      });

      // Direct browser to presigned attachment download URL
      window.location.href = data.data.download_url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Download failed. Please try again.";
      setDownloadError(msg);
    } finally {
      setDownloading(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Madhus Boutique! Checking on the status of my order ${order.order_number}.`
  );

  // If user changed the order number in the URL without token or verification
  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 space-y-6">
        <div className="p-8 rounded-3xl bg-white border border-[#e7dfd5] shadow-xs space-y-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-serif text-2xl font-bold text-[#4a1220]">
              Security Verification
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              To protect customer privacy and prevent unauthorized access by altering order numbers in the URL, please verify the contact information used when placing order{" "}
              <span className="font-mono font-bold text-stone-800">{orderNumber}</span>.
            </p>
          </div>

          <form onSubmit={handleVerifySubmit} className="space-y-3.5 text-left pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">
                WhatsApp Phone or Email Address *
              </label>
              <Input
                required
                placeholder="+91 98765 43210 or name@example.com"
                value={verificationInput}
                onChange={(e) => setVerificationInput(e.target.value)}
              />
            </div>

            {verificationError && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {verificationError}
              </p>
            )}

            <Button
              type="submit"
              disabled={isVerifying}
              className="w-full h-11 text-xs font-semibold"
            >
              {isVerifying ? "Verifying..." : "Verify & View Order"}
            </Button>
          </form>

          <div className="pt-2">
            <Link
              href="/track-order"
              className="text-xs text-[#6b1426] hover:underline"
            >
              Go to Order Tracking Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Back button */}
      <div>
        <Link
          href="/designs"
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#6b1426] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Continue Shopping
        </Link>
      </div>

      {/* Main Order Header Banner */}
      <div className="p-8 rounded-3xl bg-white border border-[#e7dfd5] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-[#b8860b] uppercase">
              Digital Order Reference
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#4a1220]">
              {order.order_number}
            </h1>
            <span className="text-xs text-stone-400 block">
              Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })}
            </span>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <Badge
              variant={isVerified ? "gold" : "default"}
              className="text-xs font-semibold px-3 py-1"
            >
              {isVerified ? "Payment Verified" : "Payment Verification Pending"}
            </Badge>
            <span className="text-xs text-stone-500 block">
              Customer: {order.customer_name}
            </span>
          </div>
        </div>

        {/* Status Lifecycle Progress Steps */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-sans">
            Fulfillment Progress
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>1. UTR Submitted</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Registered in ledger
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border space-y-1 ${
                isVerified
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <div
                className={`flex items-center gap-2 text-xs font-bold ${
                  isVerified ? "text-emerald-800" : "text-amber-800"
                }`}
              >
                {isVerified ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                )}
                <span>2. Bank Verification</span>
              </div>
              <p className="text-[11px] text-stone-600">
                {isVerified
                  ? "Verified by Boutique Admin"
                  : "Admin verifying bank ledger credit"}
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border space-y-1 ${
                isVerified
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-stone-50 border-stone-200"
              }`}
            >
              <div
                className={`flex items-center gap-2 text-xs font-bold ${
                  isVerified ? "text-emerald-800" : "text-stone-500"
                }`}
              >
                {isVerified ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Lock className="w-4 h-4 text-stone-400" />
                )}
                <span>3. S3 ZIP Download</span>
              </div>
              <p className="text-[11px] text-stone-600">
                {isVerified ? "Unlocked & Ready" : "Guarded until verified"}
              </p>
            </div>
          </div>
        </div>

        {/* Digital Asset Download Box */}
        <div className="p-6 rounded-2xl bg-[#fbf8f2] border border-[#dfb15b]/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileArchive className="w-5 h-5 text-[#b8860b]" />
                <h3 className="font-serif text-base font-bold text-[#4a1220]">
                  Embroidery Package ZIP Archive
                </h3>
              </div>
              <p className="text-xs text-[#5c4933]">
                Contains .DST, .PES, .JEF, .EXP formats and Color Chart sequence PDF.
              </p>
            </div>

            {isVerified ? (
              <Button
                onClick={handleDownload}
                disabled={downloading}
                size="lg"
                className="font-serif text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4 text-[#dfb15b]" />
                {downloading ? "Signing S3 Link..." : "Download Verified ZIP"}
              </Button>
            ) : (
              <button
                disabled
                className="px-5 py-3 rounded-lg bg-stone-200 text-stone-500 text-xs font-semibold flex items-center gap-2 cursor-not-allowed border border-stone-300"
              >
                <Lock className="w-4 h-4" />
                Locked — Awaiting Verification
              </button>
            )}
          </div>

          {downloadError && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
              {downloadError}
            </p>
          )}

          {downloadInfo && (
            <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              Download initiated! Remaining quota: {downloadInfo.max_downloads - downloadInfo.download_count} of {downloadInfo.max_downloads} downloads.
            </p>
          )}

          {/* Security rule reminder */}
          <div className="pt-2 border-t border-[#dfb15b]/20 flex items-start gap-2 text-[11px] text-stone-500">
            <ShieldCheck className="w-4 h-4 text-[#b8860b] shrink-0 mt-0.5" />
            <span>
              Server-Enforced Security: Raw files are stored in private AWS S3 storage. Downloads are exclusively authorized via short-lived 5-minute pre-signed URLs.
            </span>
          </div>
        </div>

        {/* Demonstration Toggle (For Sprint 1 UI Validation) */}
        <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <strong className="text-stone-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#b8860b]" />
              Sprint 1 UI Demonstration Helper
            </strong>
            <p className="text-stone-500 text-[11px]">
              Toggle admin payment verification state to test both locked and unlocked UI layouts.
            </p>
          </div>
          <button
            onClick={toggleDemoVerification}
            className="px-3 py-1.5 rounded-md bg-stone-900 text-[#fef3c7] text-xs font-medium hover:bg-stone-800 transition-colors shrink-0 cursor-pointer"
          >
            {isVerified ? "Simulate: Pending State" : "Simulate: Admin Verified"}
          </button>
        </div>

        {/* Purchased Items List */}
        <div className="space-y-3 pt-4 border-t border-stone-100">
          <h3 className="font-serif text-base font-bold text-[#4a1220]">
            Purchased Designs
          </h3>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 border border-stone-100 text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-mono font-bold text-[#b8860b] text-[10px]">
                    {item.product_code}
                  </span>
                  <strong className="font-serif text-stone-900 block text-sm">
                    {item.name}
                  </strong>
                  <span className="text-stone-500 text-[11px]">
                    Formats: {item.formats.join(", ")}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#6b1426] text-sm">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                  <span className="text-[10px] text-stone-400 block">
                    Qty: {item.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-stone-100 text-sm font-bold text-[#4a1220]">
            <span>Total Paid</span>
            <span className="text-xl font-serif text-[#6b1426]">
              {formatPrice(order.total_amount)}
            </span>
          </div>
        </div>

        {/* WhatsApp Assistance Button */}
        <div className="pt-2 text-center">
          <a
            href={`https://web.whatsapp.com/send?phone=918142073385&text=${encodeURIComponent(
              `Hello Madhus Boutique! 🌸 I am inquiring about Order #${order.order_number} 🪡📦`
            )}`}
            onClick={(e) => {
              e.preventDefault();
              const isMobile =
                typeof navigator !== "undefined" &&
                /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
              const text = encodeURIComponent(
                `Hello Madhus Boutique! 🌸 I am inquiring about Order #${order.order_number} 🪡📦`
              );
              const url = isMobile
                ? `https://wa.me/918142073385?text=${text}`
                : `https://web.whatsapp.com/send?phone=918142073385&text=${text}`;
              window.open(url, "_blank", "noopener,noreferrer");
            }}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors"
          >
            <WhatsAppIcon variant="3d" size={18} />
            Need instant verification update? Inquire on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
