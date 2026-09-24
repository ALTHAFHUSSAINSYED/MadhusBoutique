"use client";

import React, { useState } from "react";
import { Phone, Mail, CheckCircle2, HelpCircle, MapPin, Clock } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSiteConfig } from "@/context/SiteConfigContext";

export default function ContactPage() {
  const { settings } = useSiteConfig();
  const brand = settings.brand_assets;
  const contact = settings.contact_info;
  const pageContact = settings.pages_content.contact;
  const rawWa = (contact.whatsapp_number || "918142073385").replace(/[^0-9]/g, "");

  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const handleWhatsAppChat = (e: React.MouseEvent) => {
    e.preventDefault();
    const isMobile =
      typeof navigator !== "undefined" &&
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const text = encodeURIComponent(
      `Hello ${brand.brand_name || "Madhus Boutique"}! 🌸✨ I have an inquiry about your embroidery designs and services.`
    );
    const url = isMobile
      ? `https://wa.me/${rawWa}?text=${text}`
      : `https://web.whatsapp.com/send?phone=${rawWa}&text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#b8860b]">
          We Are Here To Assist
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#4a1220]">
          Contact {brand.brand_name || "Madhus Boutique"}
        </h1>
        <p className="text-sm sm:text-base text-stone-600">
          Have a question regarding stitch formats, your recent order, or bespoke bridal services? Connect with our atelier team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Contact Info & FAQs */}
        <div className="lg:col-span-5 space-y-8">
          <div className="p-6 rounded-2xl bg-white border border-[#e7dfd5] shadow-xs space-y-5">
            <h3 className="font-serif text-lg font-bold text-[#4a1220]">
              Atelier Support Desk
            </h3>
            <div className="space-y-4 text-xs">
              {(contact.primary_phone || contact.secondary_phone) && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#b8860b] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900">Phone Assistance</strong>
                    {contact.primary_phone && (
                      <a href={`tel:${contact.primary_phone}`} className="text-[#6b1426] hover:underline font-semibold">
                        {contact.primary_phone}
                      </a>
                    )}
                    {contact.primary_phone && contact.secondary_phone && (
                      <span className="text-stone-400 mx-1.5">•</span>
                    )}
                    {contact.secondary_phone && (
                      <a href={`tel:${contact.secondary_phone}`} className="text-[#6b1426] hover:underline">
                        {contact.secondary_phone}
                      </a>
                    )}
                  </div>
                </div>
              )}
              {contact.support_email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#b8860b] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900">Email</strong>
                    <a href={`mailto:${contact.support_email}`} className="text-[#6b1426] hover:underline">
                      {contact.support_email}
                    </a>
                  </div>
                </div>
              )}
              {contact.whatsapp_number && (
                <div className="flex items-start gap-3">
                  <WhatsAppIcon variant="3d" size={24} className="mt-0.5" />
                  <div>
                    <strong className="block text-stone-900">WhatsApp Support</strong>
                    <a
                      href={`https://wa.me/${rawWa}`}
                      onClick={handleWhatsAppChat}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#25D366] font-semibold hover:underline flex items-center gap-1.5"
                    >
                      <span>Chat on WhatsApp (+{rawWa})</span>
                    </a>
                    <span className="block text-stone-500 mt-0.5">
                      {pageContact.support_notice || "Mon–Sat, 9AM–8PM IST • Instant Response"}
                    </span>
                  </div>
                </div>
              )}
              {contact.physical_address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#b8860b] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900">Atelier Studio Address</strong>
                    <span className="text-stone-700 block">{contact.physical_address}</span>
                    {contact.city_state_pincode && (
                      <span className="text-stone-500 block">{contact.city_state_pincode}</span>
                    )}
                    {pageContact.directions_hint && (
                      <span className="text-stone-400 block text-[11px] mt-0.5">{pageContact.directions_hint}</span>
                    )}
                  </div>
                </div>
              )}
              {pageContact.working_hours && (
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#b8860b] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900">Visiting Hours</strong>
                    <span className="text-stone-600">{pageContact.working_hours}</span>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <span className="text-[#b8860b] font-bold text-sm shrink-0 mt-0.5">₹</span>
                <div>
                  <strong className="block text-stone-900">UPI Payment</strong>
                  <span className="font-mono text-stone-700 select-all">Madhusboutiquenrt@ybl</span>
                  <span className="block text-stone-500 mt-0.5">(PhonePe — scan QR on checkout)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQs */}
          <div className="p-6 rounded-2xl bg-[#f7f2e7] border border-[#e7dfd5] space-y-4">
            <h3 className="font-serif text-base font-bold text-[#4a1220] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#b8860b]" />
              Frequently Asked Questions
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <strong className="text-stone-900 block font-semibold">
                  How do I get my downloaded embroidery files?
                </strong>
                <p className="text-stone-600 mt-0.5">
                  After you scan the UPI QR and submit your 12-digit UTR, our admin verifies the transfer. You will receive an instant link to download a bundled ZIP file.
                </p>
              </div>
              <div>
                <strong className="text-stone-900 block font-semibold">
                  Which machine formats are included?
                </strong>
                <p className="text-stone-600 mt-0.5">
                  Most designs include DST (Tajima), PES (Brother), JEF (Janome), and EXP (Bernina) alongside a stitch sequence color PDF chart.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-7">
          <div className="p-8 rounded-3xl bg-white border border-[#e7dfd5] shadow-xs">
            {sent ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Message Dispatched
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Thank you for contacting Madhus Boutique. Our atelier team will get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-serif text-xl font-bold text-[#4a1220]">
                    Send a Message
                  </h3>
                  <p className="text-xs text-stone-500">
                    We usually respond within a few hours during business hours.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700">Your Name</label>
                    <Input
                      required
                      placeholder="e.g. Ananya Rao"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700">Phone / WhatsApp</label>
                    <Input
                      required
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Email Address</label>
                  <Input
                    required
                    type="email"
                    placeholder="ananya@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Message / Inquiry</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us what you need assistance with..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-md border border-[#e7dfd5] bg-white p-3 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </div>

                <Button type="submit" className="w-full h-11 text-xs font-bold uppercase tracking-wider">
                  Dispatch Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
