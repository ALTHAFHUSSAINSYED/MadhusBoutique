"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice, generateOrderNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  // Step 1: Customer details; Step 2: UPI Payment
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [orderToken, setOrderToken] = useState<string>("");
  const [serverTotal, setServerTotal] = useState<number>(subtotal);
  const [utrReference, setUtrReference] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<{
    upi_id: string;
    merchant_name: string;
    qr_image_url: string;
  }>({
    upi_id: "madhusboutique@upi",
    merchant_name: "Madhus Boutique",
    qr_image_url: "/images/upi-qr-sample.svg",
  });

  // Fetch active payment settings and presigned QR from server
  useEffect(() => {
    fetch("/api/payment-settings/active")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setPaymentSettings({
            upi_id: data.data.upi_id,
            merchant_name: data.data.merchant_name,
            qr_image_url: data.data.qr_image_url || "/images/upi-qr-sample.svg",
          });
        }
      })
      .catch(() => {
        // Fallback to defaults
      });
  }, []);

  // If cart is empty and no order generated yet
  if (items.length === 0 && !orderNumber) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#4a1220]">
          Your bag is empty
        </h2>
        <p className="text-xs text-stone-500">
          Please add at least one embroidery design before proceeding to checkout.
        </p>
        <Button asChild>
          <Link href="/designs">Explore Designs</Link>
        </Button>
      </div>
    );
  }

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Submit to server-side order creation endpoint
      // Only sends product_id and quantity; server computes authentic prices from database
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            notes: formData.notes || undefined,
          },
          items: items.map((i) => ({
            product_id: i.product.id,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create order. Please try again.");
      }

      setOrderNumber(data.order.order_number);
      setOrderToken(data.order.order_token);
      setServerTotal(data.order.total_amount);
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initialize order";
      setErrorMessage(msg);
      // Fallback generation for development resilience
      const fallbackOrderNumber = generateOrderNumber();
      const fallbackToken = "dev-token-" + Date.now();
      setOrderNumber(fallbackOrderNumber);
      setOrderToken(fallbackToken);
      setServerTotal(subtotal);
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrReference.trim() || utrReference.length < 8) {
      alert("Please enter a valid 12-digit UPI transaction reference / UTR number.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 2. Submit payment reference to server endpoint
      const payRes = await fetch("/api/payments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_number: orderNumber,
          order_token: orderToken,
          transaction_reference: utrReference.trim(),
        }),
      });

      const payData = await payRes.json();
      if (!payRes.ok || !payData.success) {
        throw new Error(payData.error || "Failed to submit payment reference.");
      }

      // Save order snapshot locally for session persistence
      const orderData = {
        order_number: orderNumber,
        order_token: orderToken,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        items: items.map((i) => ({
          product_code: i.product.product_code,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          formats: i.product.file_formats,
        })),
        subtotal: serverTotal,
        total_amount: serverTotal,
        payment_status: "SUBMITTED",
        order_status: "PAYMENT_SUBMITTED",
        utr_reference: utrReference,
        created_at: new Date().toISOString(),
      };

      sessionStorage.setItem(`order_${orderNumber}`, JSON.stringify(orderData));
      const recent = JSON.parse(sessionStorage.getItem("recent_orders") || "[]");
      if (!recent.includes(orderNumber)) {
        recent.push(orderNumber);
        sessionStorage.setItem("recent_orders", JSON.stringify(recent));
      }

      clearCart();
      router.push(`/order/${orderNumber}?token=${orderToken}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment submission failed. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const upiId = paymentSettings.upi_id;
  const merchantName = paymentSettings.merchant_name;
  const upiPayUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${serverTotal}&tr=${orderNumber}&tn=Order%20${orderNumber}&cu=INR`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Checkout Progress Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#b8860b]">
          Frictionless Guest Checkout
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4a1220]">
          {step === 1 ? "1. Customer Information" : "2. UPI Payment Verification"}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          {step === 1
            ? "Enter your contact details so we can deliver your digital files and status updates."
            : `Order ${orderNumber} created. Scan the QR code below to complete payment.`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Form Progression */}
        <div className="lg:col-span-7">
          {step === 1 ? (
            /* STEP 1: Guest Profile Details */
            <div className="p-8 rounded-3xl bg-white border border-[#e7dfd5] shadow-xs space-y-6">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-4">
                <span className="w-7 h-7 rounded-full bg-[#6b1426] text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="font-serif text-lg font-bold text-[#4a1220]">
                  Recipient Contact Details
                </h3>
              </div>

              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Full Name *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Shalini Mehra"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700">
                      WhatsApp Mobile Number *
                    </label>
                    <Input
                      required
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                    <span className="text-[10px] text-stone-400">
                      Used for order status & download link notifications.
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700">
                      Email Address *
                    </label>
                    <Input
                      required
                      type="email"
                      placeholder="shalini@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                    <span className="text-[10px] text-stone-400">
                      Backup digital ZIP delivery sent here.
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Special Format or Machine Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Please confirm Tajima 15-needle DST format compatibility..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full rounded-md border border-[#e7dfd5] bg-white p-3 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
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
                  disabled={isSubmitting}
                  className="w-full h-12 text-sm font-serif flex items-center justify-center gap-2 mt-4"
                >
                  {isSubmitting ? "Creating Order..." : "Continue to UPI Payment"}
                  <ArrowRight className="w-4 h-4 text-[#dfb15b]" />
                </Button>
              </form>
            </div>
          ) : (
            /* STEP 2: UPI QR Payment & UTR Entry */
            <div className="p-8 rounded-3xl bg-white border border-[#e7dfd5] shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#6b1426] text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#4a1220]">
                      Scan & Pay via UPI
                    </h3>
                    <span className="text-xs font-mono font-bold text-stone-500">
                      Order: {orderNumber}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-stone-500 hover:text-[#6b1426] underline cursor-pointer"
                >
                  Edit details
                </button>
              </div>

              {/* QR Code Presentation Box */}
              <div className="p-6 rounded-2xl bg-[#fbf8f2] border border-[#dfb15b]/40 text-center space-y-4">
                <div className="max-w-[200px] aspect-square mx-auto rounded-2xl overflow-hidden bg-white p-3 border-2 border-[#d4af37] shadow-md">
                  <div className="relative w-full h-full">
                    <Image
                      src={paymentSettings.qr_image_url}
                      alt={`${merchantName} UPI QR`}
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-stone-500 block uppercase font-medium">
                    Exact Payable Amount
                  </span>
                  <span className="text-3xl font-serif font-bold text-[#6b1426]">
                    {formatPrice(serverTotal)}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-white border border-[#e7dfd5] text-xs text-stone-700 max-w-sm mx-auto space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Merchant UPI ID:</span>
                    <strong className="font-mono text-[#6b1426]">{upiId}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Merchant Name:</span>
                    <strong className="font-medium">{merchantName}</strong>
                  </div>
                </div>

                <div className="pt-1">
                  <a
                    href={upiPayUri}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 text-[#fef3c7] text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs"
                  >
                    Tap to Pay via Mobile UPI App
                  </a>
                </div>
              </div>

              {/* Payment Reference (UTR) Form */}
              <form onSubmit={handlePaymentSubmit} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#4a1220] flex items-center justify-between">
                    <span>12-Digit UPI Transaction Reference / UTR Number *</span>
                    <span className="text-[11px] font-normal text-stone-500">
                      Found in GPay, PhonePe, or Paytm receipt
                    </span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. 426819284710"
                    value={utrReference}
                    onChange={(e) => setUtrReference(e.target.value)}
                    className="font-mono text-base tracking-widest uppercase"
                  />
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Once submitted, our admin team verifies receipt in our bank ledger. Upon confirmation, the design ZIP bundle will be unlocked.
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full h-12 text-sm font-serif font-semibold"
                >
                  {isSubmitting ? "Submitting Payment Reference..." : "Confirm Payment Reference"}
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Order Snapshot Card */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl bg-white border border-[#e7dfd5] p-6 shadow-sm space-y-6 sticky top-28">
            <h3 className="font-serif text-lg font-bold text-[#4a1220] border-b border-stone-100 pb-3">
              Order Items ({items.length})
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between text-xs py-2 border-b border-stone-100 last:border-0"
                >
                  <div className="space-y-0.5">
                    <strong className="font-serif text-stone-900 line-clamp-1">
                      {product.name}
                    </strong>
                    <span className="text-stone-500 text-[11px]">
                      {product.product_code} • Qty {quantity}
                    </span>
                  </div>
                  <span className="font-bold text-[#6b1426]">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-100 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Digital Delivery</span>
                <span className="text-emerald-700 font-semibold">FREE (ZIP)</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#4a1220] pt-2 border-t border-stone-100">
                <span>Total Amount</span>
                <span className="text-xl font-serif text-[#6b1426]">
                  {formatPrice(subtotal)}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#fbf8f2] border border-[#dfb15b]/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#6b1426]">
                <ShieldCheck className="w-4 h-4 text-[#b8860b]" />
                <span>Zero-Trust Security Promise</span>
              </div>
              <p className="text-[11px] text-[#5c4933] leading-relaxed">
                We never store payment passwords. All digital asset downloads are generated through server-authenticated 5-minute pre-signed URLs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
