"use client";

// ==============================================================================
// MADHUS BOUTIQUE: DYNAMIC SITE CONFIG & THEME CONTEXT
// Injects database-driven theme colors, contacts, logos, and CMS page content
// ==============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SiteSettings } from "@/../types/siteSettings";

const DEFAULT_SETTINGS: SiteSettings = {
  id: "00000000-0000-0000-0000-000000000001",
  contact_info: {
    primary_phone: "8142073385",
    secondary_phone: "9390213935",
    whatsapp_number: "918142073385",
    support_email: "support@madhusboutique.com",
    physical_address: "Shop No. 4, Madhus Boutique, Main Road, Beside Axis Bank",
    city_state_pincode: "Kavali, Andhra Pradesh - 524201",
    maps_url: "https://maps.google.com",
  },
  brand_assets: {
    logo_wide_url: "/logo-text-wide.png",
    logo_icon_url: "/logo-icon.png",
    brand_name: "Madhus Boutique",
    tagline: "Perfection in every stitch and fit",
  },
  theme_colors: {
    primary_color: "#6b1426",
    primary_dark: "#4a1220",
    accent_gold: "#dfb15b",
    accent_gold_dark: "#b8860b",
    background_tint: "#fbf9f5",
    announcement_text: "PREMIUM MACHINE EMBROIDERY DESIGNS • DST, PES, JEF & EXP FORMATS AVAILABLE",
    announcement_bg: "#4a1220",
    announcement_text_color: "#fef3c7",
    announcement_visible: true,
  },
  pages_content: {
    home: {
      hero_title: "Beautiful Embroidery. Crafted With Precision.",
      hero_subtitle: "Download studio-calibrated machine embroidery designs for bridal wear, silk sarees, and designer blouses. Verified formats in DST, PES, JEF, and EXP.",
      badge_text: "Premier Digital Embroidery Atelier • 2026 Collection",
    },
    about: {
      story_title: "Heritage Craftsmanship Meets Modern Machine Precision",
      story_body: "At Madhus Boutique, we bridge the timeless artistry of South Indian ethnic embroidery with the speed and perfection of modern computer-aided embroidery machines.",
      craftsmanship_text: "Every motif is hand-digitized with meticulous stitch density, jump minimization, and clean underlay tension.",
      experience_years: "15+ Years",
      designs_count: "5,000+ Patterns",
    },
    services: {
      title: "Custom Machine Embroidery & Digitizing Services",
      subtitle: "Bring your unique blouse designs, bridal motifs, and brand emblems to life with expert digitizing and high-speed execution.",
      turnaround_time: "24 to 48 Hours Express Delivery",
      machine_specs: "Calibrated for single & multi-head Brother, Usun, Ricoma, and Tajima machines.",
    },
    contact: {
      working_hours: "Monday to Saturday: 10:00 AM – 8:30 PM",
      support_notice: "Instant support available via WhatsApp for order tracking and format assistance.",
      directions_hint: "Located at the central market hub with convenient customer parking.",
    },
  },
  updated_at: new Date().toISOString(),
};

interface SiteConfigContextType {
  settings: SiteSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettingsState: (partial: Partial<SiteSettings>) => void;
}

const SiteConfigContext = createContext<SiteConfigContextType>({
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  refreshSettings: async () => {},
  updateSettingsState: () => {},
});

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Apply dynamic CSS variables to document root
  const applyThemeVariables = useCallback((theme: SiteSettings["theme_colors"]) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--brand-primary", theme.primary_color);
    root.style.setProperty("--brand-primary-dark", theme.primary_dark);
    root.style.setProperty("--brand-gold", theme.accent_gold);
    root.style.setProperty("--brand-gold-dark", theme.accent_gold_dark);
    root.style.setProperty("--brand-bg", theme.background_tint);
    root.style.setProperty("--announcement-bg", theme.announcement_bg);
    root.style.setProperty("--announcement-text", theme.announcement_text_color);

    // Also update base design tokens
    if (theme.primary_color) root.style.setProperty("--primary", theme.primary_color);
    if (theme.accent_gold) root.style.setProperty("--accent", theme.accent_gold);
    if (theme.background_tint) {
      root.style.setProperty("--background", theme.background_tint);
      if (document.body) {
        document.body.style.backgroundColor = theme.background_tint;
      }
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/site-settings");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setSettings(data.data);
          applyThemeVariables(data.data.theme_colors);
        }
      }
    } catch (err) {
      console.warn("Could not load dynamic site settings, using defaults:", err);
    } finally {
      setIsLoading(false);
    }
  }, [applyThemeVariables]);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const updateSettingsState = useCallback(
    (partial: Partial<SiteSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...partial };
        if (next.theme_colors) {
          applyThemeVariables(next.theme_colors);
        }
        return next;
      });
    },
    [applyThemeVariables]
  );

  return (
    <SiteConfigContext.Provider
      value={{
        settings,
        isLoading,
        refreshSettings,
        updateSettingsState,
      }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const ctx = useContext(SiteConfigContext);
  return {
    ...ctx,
    contact: ctx.settings.contact_info,
    brand: ctx.settings.brand_assets,
    theme: ctx.settings.theme_colors,
    pages: ctx.settings.pages_content,
  };
}
