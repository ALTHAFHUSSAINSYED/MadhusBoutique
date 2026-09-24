"use client";

import React, { useState } from "react";
import {
  Shirt,
  Cpu,
  Scissors,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { useSiteConfig } from "@/context/SiteConfigContext";

export default function ServicesPage() {
  const { settings } = useSiteConfig();
  const services = settings.pages_content.services;
  const brand = settings.brand_assets;
  const contact = settings.contact_info;
  const rawWa = (contact.whatsapp_number || "918142073385").replace(/[^0-9]/g, "");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    serviceType: "Bridal Blouse Custom Embroidery",
    fabric: "Raw Silk",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const directWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `Hello ${brand.brand_name || "Madhus Boutique"}! 🌸✨ I want to inquire about custom embroidery services 🪡🧵\nName: ${formData.name || "Customer"}\nService: ${formData.serviceType}\nFabric: ${formData.fabric}\nNotes: ${formData.notes || "None"}`
    );
    const isMobile =
      typeof navigator !== "undefined" &&
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
          Atelier Craftsmanship
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#4a1220]">
          {services.title || "Custom Embroidery Services"}
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          {services.subtitle || "From bridal blouse masterpieces to custom digital file conversion, our studio delivers bespoke artisan quality tailored to your exact measurements."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-medium text-[#6b1426]">
          <span className="px-3 py-1 rounded-full bg-[#f6efe2] border border-[#dfb15b]/40">
            ⚡ Turnaround: {services.turnaround_time || "24 to 48 Hours Express Delivery"}
          </span>
          <span className="px-3 py-1 rounded-full bg-[#f6efe2] border border-[#dfb15b]/40">
            🪡 Calibration: {services.machine_specs || "Calibrated for single & multi-head machines"}
          </span>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            title: "Bespoke Bridal Blouse Embroidery",
            icon: Shirt,
            desc: "Custom handcrafted Aari and precision machine embroidery on bridal silk blouses with authentic Zari, mirror work, and bead embellishments.",
            features: [
              "Custom neckline contouring",
              "Matching sleeve cuffs & back yokes",
              "Premium non-tarnish gold Zari",
              "7 to 10 days studio turnaround",
            ],
          },
          {
            title: "Custom Machine Digitization",
            icon: Cpu,
            desc: "Have a sketch or photo? We convert your custom motifs into stitch-tested machine embroidery formats (DST, PES, JEF) calibrated for your hooping size.",
            features: [
              "Zero thread break density calibration",
              "Underlay stitch optimization",
              "Multiple format delivery (DST/PES/JEF)",
              "Free sample stitch simulation PDF",
            ],
          },
          {
            title: "Saree & Lehenga Border Work",
            icon: Scissors,
            desc: "Continuous luxury borders, pallu kalka motifs, and scalloped laser edges for designer sarees, dupattas, and festive lehengas.",
            features: [
              "Repeat pattern alignment",
              "Organza, raw silk & georgette expertise",
              "Sequence & cord work options",
              "Boutique batch orders welcome",
            ],
          },
        ].map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.title}
              className="p-8 rounded-2xl bg-white border border-[#e7dfd5] shadow-sm flex flex-col justify-between space-y-6 luxury-card-hover"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#f6efe2] text-[#6b1426] flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#4a1220]">
                  {service.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {service.desc}
                </p>
                <div className="pt-2 border-t border-stone-100 space-y-2">
                  {service.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-stone-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#b8860b] shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setFormData((prev) => ({ ...prev, serviceType: service.title }));
                  const element = document.getElementById("inquiry-form");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full py-2.5 rounded-lg border border-[#6b1426] text-[#6b1426] hover:bg-[#6b1426] hover:text-white text-xs font-semibold transition-colors cursor-pointer text-center"
              >
                Request Consultation
              </button>
            </div>
          );
        })}
      </div>

      {/* Inquiry Form Section */}
      <div id="inquiry-form" className="rounded-3xl bg-[#f7f2e7] border border-[#e7dfd5] p-8 sm:p-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#b8860b]">
              Start Your Bespoke Commission
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4a1220]">
              Request Custom Embroidery Consultation
            </h2>
            <p className="text-xs text-stone-600">
              Fill in your specifications below or connect with our lead digitizer directly over WhatsApp.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-white border border-[#dfb15b] text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Inquiry Received with Thanks!
              </h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Our atelier team will review your specifications and contact you via WhatsApp / Phone within 24 hours.
              </p>
              <div className="pt-2">
                <Button onClick={directWhatsAppInquiry} variant="gold" className="text-stone-900 text-xs font-bold flex items-center gap-2">
                  <WhatsAppIcon variant="3d" size={18} />
                  Speed Up via WhatsApp
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-[#e7dfd5] shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Full Name</label>
                  <Input
                    required
                    placeholder="e.g. Priya Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">WhatsApp / Mobile</label>
                  <Input
                    required
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Email Address</label>
                  <Input
                    required
                    type="email"
                    placeholder="priya@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Service Category</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full h-10 rounded-md border border-[#e7dfd5] bg-white px-3 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  >
                    <option>Bridal Blouse Custom Embroidery</option>
                    <option>Custom Machine Digitization (DST/PES)</option>
                    <option>Saree & Lehenga Border Work</option>
                    <option>Kurti Neckline Motifs</option>
                    <option>Boutique Bulk Inquiries</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Fabric & Design Details</label>
                <textarea
                  rows={3}
                  placeholder="Tell us about the fabric (Raw Silk, Organza, Velvet), measurements, color palette, or hooping limits..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-md border border-[#e7dfd5] bg-white p-3 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Button type="submit" className="w-full sm:flex-1 h-11 text-xs font-bold uppercase tracking-wider">
                  Submit Consultation Request
                </Button>
                <button
                  type="button"
                  onClick={directWhatsAppInquiry}
                  className="w-full sm:w-auto h-11 px-5 rounded-lg bg-[#25D366] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#20ba59] transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-98"
                >
                  <WhatsAppIcon variant="3d" size={22} className="drop-shadow-sm" />
                  <span>Chat Directly on WhatsApp</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
