// ==============================================================================
// MADHUS BOUTIQUE: SERVER-SIDE SITE SETTINGS & THEME ENGINE DATABASE SERVICE
// Manages contacts, logos, themes, and dynamic page content with audit logging
// ==============================================================================

import { createServerServiceClient } from "./client";
import { logAuditAction } from "./audit";
import { SiteSettings } from "@/../types/siteSettings";
import { UpdateSiteSettingsInput } from "@/lib/validations/siteSettingsSchemas";

const isOfflineOrTest =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project");

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
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
  updated_by: null,
};

// In-Memory Dev Store
export let DEV_SITE_SETTINGS: SiteSettings = { ...DEFAULT_SITE_SETTINGS };

/**
 * Retrieves the active site settings and theme configuration
 */
export async function getActiveSiteSettings(): Promise<SiteSettings> {
  if (isOfflineOrTest) {
    return { ...DEV_SITE_SETTINGS };
  }

  try {
    const supabase = createServerServiceClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return { ...DEV_SITE_SETTINGS };
    }

    return {
      id: data.id,
      contact_info: data.contact_info || DEFAULT_SITE_SETTINGS.contact_info,
      brand_assets: data.brand_assets || DEFAULT_SITE_SETTINGS.brand_assets,
      theme_colors: data.theme_colors || DEFAULT_SITE_SETTINGS.theme_colors,
      pages_content: data.pages_content || DEFAULT_SITE_SETTINGS.pages_content,
      updated_at: data.updated_at,
      updated_by: data.updated_by,
    };
  } catch {
    return { ...DEV_SITE_SETTINGS };
  }
}

/**
 * Updates site settings, contacts, brand assets, themes, or page content
 */
export async function updateActiveSiteSettings(
  adminId: string,
  input: UpdateSiteSettingsInput,
  clientIp?: string,
  userAgent?: string
): Promise<SiteSettings> {
  const current = await getActiveSiteSettings();

  const updated: SiteSettings = {
    ...current,
    contact_info: input.contact_info ? { ...current.contact_info, ...input.contact_info } : current.contact_info,
    brand_assets: input.brand_assets ? { ...current.brand_assets, ...input.brand_assets } : current.brand_assets,
    theme_colors: input.theme_colors ? { ...current.theme_colors, ...input.theme_colors } : current.theme_colors,
    pages_content: input.pages_content
      ? {
          home: { ...current.pages_content.home, ...input.pages_content.home },
          about: { ...current.pages_content.about, ...input.pages_content.about },
          services: { ...current.pages_content.services, ...input.pages_content.services },
          contact: { ...current.pages_content.contact, ...input.pages_content.contact },
        }
      : current.pages_content,
    updated_at: new Date().toISOString(),
    updated_by: adminId,
  };

  DEV_SITE_SETTINGS = { ...updated };

  if (!isOfflineOrTest) {
    try {
      const supabase = createServerServiceClient();
      await supabase
        .from("site_settings")
        .upsert({
          id: current.id,
          contact_info: updated.contact_info,
          brand_assets: updated.brand_assets,
          theme_colors: updated.theme_colors,
          pages_content: updated.pages_content,
          updated_at: updated.updated_at,
          updated_by: adminId,
        });
    } catch (err) {
      console.warn("Could not persist site_settings to database, using memory store:", err);
    }
  }

  // Immutable audit log
  await logAuditAction(
    adminId,
    "SITE_SETTINGS_UPDATED",
    "site_settings",
    current.id,
    {
      updated_sections: Object.keys(input),
      contact_info_changed: !!input.contact_info,
      brand_assets_changed: !!input.brand_assets,
      theme_colors_changed: !!input.theme_colors,
      pages_content_changed: !!input.pages_content,
    },
    clientIp,
    userAgent
  );

  return updated;
}

/**
 * Resets site settings to factory defaults
 */
export async function resetSiteSettingsToDefault(
  adminId: string = "system",
  clientIp?: string,
  userAgent?: string
): Promise<SiteSettings> {
  const resetData: SiteSettings = {
    ...DEFAULT_SITE_SETTINGS,
    updated_at: new Date().toISOString(),
    updated_by: adminId,
  };

  DEV_SITE_SETTINGS = { ...resetData };

  if (!isOfflineOrTest) {
    try {
      const supabase = createServerServiceClient();
      await supabase
        .from("site_settings")
        .upsert(resetData);
    } catch {
      // Fallback
    }
  }

  await logAuditAction(
    adminId,
    "SITE_SETTINGS_RESET_DEFAULT",
    "site_settings",
    resetData.id,
    {},
    clientIp,
    userAgent
  );

  return resetData;
}
