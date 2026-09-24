"use client";

// ==============================================================================
// MADHUS BOUTIQUE: SITE SETTINGS, CMS & THEME CUSTOMIZER ADMIN COMPONENT
// Real-time visual color pickers, brand assets, contact fields, and CMS content
// ==============================================================================

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Phone,
  Palette,
  Image as ImageIcon,
  FileText,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SiteSettings } from "@/../types/siteSettings";
import { useSiteConfig } from "@/context/SiteConfigContext";

export function SiteSettingsManager() {
  const { settings: globalSettings, refreshSettings } = useSiteConfig();
  const [formData, setFormData] = useState<SiteSettings>(globalSettings);
  const [activeSubTab, setActiveSubTab] = useState<"contacts" | "theme" | "branding" | "pages">("contacts");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (globalSettings) {
      setFormData(globalSettings);
    }
  }, [globalSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_info: formData.contact_info,
          brand_assets: formData.brand_assets,
          theme_colors: formData.theme_colors,
          pages_content: formData.pages_content,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save site settings.");
      }

      setSaveSuccess("Changes successfully saved and published across the website!");
      await refreshSettings();
      setTimeout(() => setSaveSuccess(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update settings.";
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset all site settings and colors to factory defaults?")) {
      return;
    }

    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reset settings.");
      }

      setFormData(data.data);
      setSaveSuccess("Site settings successfully reset to factory defaults.");
      await refreshSettings();
      setTimeout(() => setSaveSuccess(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reset settings.";
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl font-bold text-[#4a1220]">
              Store Settings, CMS &amp; Theme Customizer
            </h2>
            <Badge variant="gold" className="text-[10px] font-bold">
              LIVE ENGINE
            </Badge>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Update contacts, WhatsApp numbers, brand logos, color themes, and site pages without touching code.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isSaving}
            className="text-xs text-stone-600 hover:text-stone-900 border-stone-300"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset Defaults
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#6b1426] hover:bg-[#520f1d] text-white text-xs font-semibold shadow-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {isSaving ? "Saving..." : "Save & Publish"}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2 shadow-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab("contacts")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === "contacts"
              ? "bg-[#6b1426] text-white shadow-xs"
              : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          Contacts &amp; Location
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("theme")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === "theme"
              ? "bg-[#6b1426] text-white shadow-xs"
              : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          Theme Colors &amp; Styling
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("branding")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === "branding"
              ? "bg-[#6b1426] text-white shadow-xs"
              : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Brand Logos &amp; Tagline
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("pages")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === "pages"
              ? "bg-[#6b1426] text-white shadow-xs"
              : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Site Pages Content (CMS)
        </button>
      </div>

      {/* 1. CONTACTS & LOCATION */}
      {activeSubTab === "contacts" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#6b1426]" />
                Primary Support Phone
              </label>
              <Input
                value={formData.contact_info.primary_phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact_info: { ...formData.contact_info, primary_phone: e.target.value },
                  })
                }
                placeholder="8142073385"
                className="font-mono text-xs"
              />
              <span className="text-[10px] text-stone-400">Displayed in Header, Footer, and contact cards.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <Phone className="w-3 h-3 text-stone-400" />
                Secondary Support Phone
              </label>
              <Input
                value={formData.contact_info.secondary_phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact_info: { ...formData.contact_info, secondary_phone: e.target.value },
                  })
                }
                placeholder="9390213935"
                className="font-mono text-xs"
              />
              <span className="text-[10px] text-stone-400">Alternate line for customer support.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#25D366] inline-block" />
                WhatsApp Assistance Number (with country code)
              </label>
              <Input
                value={formData.contact_info.whatsapp_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact_info: { ...formData.contact_info, whatsapp_number: e.target.value },
                  })
                }
                placeholder="918142073385"
                className="font-mono text-xs"
              />
              <span className="text-[10px] text-stone-400">Powers the floating WhatsApp button and all chat links.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Support Email Address</label>
              <Input
                type="email"
                value={formData.contact_info.support_email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact_info: { ...formData.contact_info, support_email: e.target.value },
                  })
                }
                placeholder="support@madhusboutique.com"
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-stone-100">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#6b1426]" />
              Store Physical Address &amp; Map
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Street / Shop Address</label>
              <Input
                value={formData.contact_info.physical_address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact_info: { ...formData.contact_info, physical_address: e.target.value },
                  })
                }
                placeholder="Shop No. 4, Madhus Boutique, Main Road, Beside Axis Bank"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">City, State &amp; Pincode</label>
                <Input
                  value={formData.contact_info.city_state_pincode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact_info: { ...formData.contact_info, city_state_pincode: e.target.value },
                    })
                  }
                  placeholder="Kavali, Andhra Pradesh - 524201"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Google Maps Direction URL</label>
                <Input
                  value={formData.contact_info.maps_url}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact_info: { ...formData.contact_info, maps_url: e.target.value },
                    })
                  }
                  placeholder="https://maps.google.com/?q=Madhus+Boutique"
                  className="text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. THEME COLORS & STYLING */}
      {activeSubTab === "theme" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Theme colors are dynamically injected into CSS custom variables. Any change updates the live storefront instantly upon saving.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Primary Color */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2.5">
              <label className="text-xs font-bold text-stone-800 block">Primary Brand Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.theme_colors.primary_color}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      theme_colors: { ...formData.theme_colors, primary_color: e.target.value },
                    })
                  }
                  className="w-10 h-10 rounded-lg cursor-pointer border border-stone-300"
                />
                <Input
                  value={formData.theme_colors.primary_color}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      theme_colors: { ...formData.theme_colors, primary_color: e.target.value },
                    })
                  }
                  className="font-mono text-xs uppercase"
                />
              </div>
              <p className="text-[10px] text-stone-500">Buttons, active links, embroidery hoops, accents.</p>
            </div>

            {/* Primary Dark */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2.5">
              <label className="text-xs font-bold text-stone-800 block">Primary Dark Accent</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.theme_colors.primary_dark}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      theme_colors: { ...formData.theme_colors, primary_dark: e.target.value },
                    })
                  }
                  className="w-10 h-10 rounded-lg cursor-pointer border border-stone-300"
                />
                <Input
                  value={formData.theme_colors.primary_dark}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      theme_colors: { ...formData.theme_colors, primary_dark: e.target.value },
                    })
                  }
                  className="font-mono text-xs uppercase"
                />
              </div>
              <p className="text-[10px] text-stone-500">Headings, announcement bar, deep burgundy accents.</p>
            </div>

            {/* Accent Gold */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2.5">
              <label className="text-xs font-bold text-stone-800 block">Gold Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.theme_colors.accent_gold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      theme_colors: { ...formData.theme_colors, accent_gold: e.target.value },
                    })
                  }
                  className="w-10 h-10 rounded-lg cursor-pointer border border-stone-300"
                />
                <Input
                  value={formData.theme_colors.accent_gold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      theme_colors: { ...formData.theme_colors, accent_gold: e.target.value },
                    })
                  }
                  className="font-mono text-xs uppercase"
                />
              </div>
              <p className="text-[10px] text-stone-500">Zari threads, badges, needle animations, highlights.</p>
            </div>
          </div>

          {/* Announcement Bar Customizer */}
          <div className="p-5 rounded-2xl border border-stone-200 space-y-4">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Top Announcement Bar
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Announcement Text</label>
              <Input
                value={formData.theme_colors.announcement_text}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    theme_colors: { ...formData.theme_colors, announcement_text: e.target.value },
                  })
                }
                placeholder="PREMIUM MACHINE EMBROIDERY DESIGNS • DST, PES, JEF & EXP FORMATS AVAILABLE"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.theme_colors.announcement_bg}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      theme_colors: { ...formData.theme_colors, announcement_bg: e.target.value },
                    })
                  }
                  className="w-9 h-9 rounded-lg cursor-pointer"
                />
                <div className="flex-1 space-y-0.5">
                  <span className="text-[11px] font-semibold text-stone-700">Banner Background</span>
                  <Input
                    value={formData.theme_colors.announcement_bg}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        theme_colors: { ...formData.theme_colors, announcement_bg: e.target.value },
                      })
                    }
                    className="font-mono text-xs h-8"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.theme_colors.announcement_text_color}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      theme_colors: { ...formData.theme_colors, announcement_text_color: e.target.value },
                    })
                  }
                  className="w-9 h-9 rounded-lg cursor-pointer"
                />
                <div className="flex-1 space-y-0.5">
                  <span className="text-[11px] font-semibold text-stone-700">Banner Text Color</span>
                  <Input
                    value={formData.theme_colors.announcement_text_color}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        theme_colors: { ...formData.theme_colors, announcement_text_color: e.target.value },
                      })
                    }
                    className="font-mono text-xs h-8"
                  />
                </div>
              </div>
            </div>

            {/* Live Color Preview Strip */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-bold uppercase text-stone-400">Live Banner Preview</span>
              <div
                style={{
                  backgroundColor: formData.theme_colors.announcement_bg,
                  color: formData.theme_colors.announcement_text_color,
                }}
                className="py-2 px-4 rounded-xl text-center text-xs font-medium flex items-center justify-center gap-2 shadow-xs"
              >
                <Sparkles style={{ color: formData.theme_colors.accent_gold }} className="w-3.5 h-3.5" />
                <span>{formData.theme_colors.announcement_text || "Preview Banner Text"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. BRAND LOGOS & ASSETS */}
      {activeSubTab === "branding" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wide Logo */}
            <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-800">Main Wide Logo URL</label>
                <Eye className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <Input
                value={formData.brand_assets.logo_wide_url}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    brand_assets: { ...formData.brand_assets, logo_wide_url: e.target.value },
                  })
                }
                placeholder="/logo-text-wide.png"
                className="text-xs font-mono"
              />
              <div className="p-4 bg-white rounded-xl border border-stone-200 flex items-center justify-center min-h-[90px]">
                <div className="relative h-12 w-64">
                  <Image
                    src={formData.brand_assets.logo_wide_url || "/logo-text-wide.png"}
                    alt="Logo Preview"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
              <p className="text-[10px] text-stone-400">Supports relative paths (/logo.png) or cloud S3 URLs.</p>
            </div>

            {/* Icon Logo */}
            <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-800">Mobile Logo Icon URL</label>
                <Eye className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <Input
                value={formData.brand_assets.logo_icon_url}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    brand_assets: { ...formData.brand_assets, logo_icon_url: e.target.value },
                  })
                }
                placeholder="/logo-icon.png"
                className="text-xs font-mono"
              />
              <div className="p-4 bg-white rounded-xl border border-stone-200 flex items-center justify-center min-h-[90px]">
                <div className="relative h-12 w-12">
                  <Image
                    src={formData.brand_assets.logo_icon_url || "/logo-icon.png"}
                    alt="Icon Preview"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
              <p className="text-[10px] text-stone-400">Used for mobile header and browser favicon.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Boutique Brand Name</label>
              <Input
                value={formData.brand_assets.brand_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    brand_assets: { ...formData.brand_assets, brand_name: e.target.value },
                  })
                }
                placeholder="Madhus Boutique"
                className="text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Brand Tagline</label>
              <Input
                value={formData.brand_assets.tagline}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    brand_assets: { ...formData.brand_assets, tagline: e.target.value },
                  })
                }
                placeholder="Perfection in every stitch and fit"
                className="text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. PAGES CONTENT (CMS) */}
      {activeSubTab === "pages" && (
        <div className="space-y-8">
          {/* Home Page Content */}
          <div className="p-5 rounded-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
              <span className="w-2 h-2 rounded-full bg-[#6b1426]" />
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Home Page Hero Section
              </h3>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Badge Pill Text</label>
              <Input
                value={formData.pages_content.home.badge_text}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pages_content: {
                      ...formData.pages_content,
                      home: { ...formData.pages_content.home, badge_text: e.target.value },
                    },
                  })
                }
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Hero Main Title</label>
              <Input
                value={formData.pages_content.home.hero_title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pages_content: {
                      ...formData.pages_content,
                      home: { ...formData.pages_content.home, hero_title: e.target.value },
                    },
                  })
                }
                className="text-xs font-serif font-bold text-[#4a1220]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Hero Subtitle</label>
              <textarea
                rows={2}
                value={formData.pages_content.home.hero_subtitle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pages_content: {
                      ...formData.pages_content,
                      home: { ...formData.pages_content.home, hero_subtitle: e.target.value },
                    },
                  })
                }
                className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#6b1426]"
              />
            </div>
          </div>

          {/* About Page Content */}
          <div className="p-5 rounded-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
              <span className="w-2 h-2 rounded-full bg-[#dfb15b]" />
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                About Us Page Content
              </h3>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Story Title</label>
              <Input
                value={formData.pages_content.about.story_title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pages_content: {
                      ...formData.pages_content,
                      about: { ...formData.pages_content.about, story_title: e.target.value },
                    },
                  })
                }
                className="text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Story Description</label>
              <textarea
                rows={3}
                value={formData.pages_content.about.story_body}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pages_content: {
                      ...formData.pages_content,
                      about: { ...formData.pages_content.about, story_body: e.target.value },
                    },
                  })
                }
                className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#6b1426]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Years of Experience</label>
                <Input
                  value={formData.pages_content.about.experience_years}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pages_content: {
                        ...formData.pages_content,
                        about: { ...formData.pages_content.about, experience_years: e.target.value },
                      },
                    })
                  }
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Design Patterns Count</label>
                <Input
                  value={formData.pages_content.about.designs_count}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pages_content: {
                        ...formData.pages_content,
                        about: { ...formData.pages_content.about, designs_count: e.target.value },
                      },
                    })
                  }
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          {/* Services & Contact Pages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl border border-stone-200 space-y-4">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider border-b border-stone-100 pb-2">
                Services Highlights
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Express Turnaround Time</label>
                <Input
                  value={formData.pages_content.services.turnaround_time}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pages_content: {
                        ...formData.pages_content,
                        services: { ...formData.pages_content.services, turnaround_time: e.target.value },
                      },
                    })
                  }
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Machine Specifications</label>
                <Input
                  value={formData.pages_content.services.machine_specs}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pages_content: {
                        ...formData.pages_content,
                        services: { ...formData.pages_content.services, machine_specs: e.target.value },
                      },
                    })
                  }
                  className="text-xs"
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-stone-200 space-y-4">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider border-b border-stone-100 pb-2">
                Contact Page Details
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Operating Hours</label>
                <Input
                  value={formData.pages_content.contact.working_hours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pages_content: {
                        ...formData.pages_content,
                        contact: { ...formData.pages_content.contact, working_hours: e.target.value },
                      },
                    })
                  }
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Visiting Instructions Hint</label>
                <Input
                  value={formData.pages_content.contact.directions_hint}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pages_content: {
                        ...formData.pages_content,
                        contact: { ...formData.pages_content.contact, directions_hint: e.target.value },
                      },
                    })
                  }
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
