// ==============================================================================
// MADHUS BOUTIQUE: SITE SETTINGS VALIDATION SCHEMAS
// Validates updates to business contacts, brand assets, themes, and pages
// ==============================================================================

import { z } from "zod";

export const contactInfoSchema = z.object({
  primary_phone: z.string().min(8, "Valid primary phone number required"),
  secondary_phone: z.string().optional().default(""),
  whatsapp_number: z.string().min(8, "Valid WhatsApp number required"),
  support_email: z.string().email("Valid support email address required"),
  physical_address: z.string().min(5, "Physical address cannot be empty"),
  city_state_pincode: z.string().min(3, "City/state/pincode required"),
  maps_url: z.string().optional().default(""),
});

export const brandAssetsSchema = z.object({
  logo_wide_url: z.string().min(1, "Main logo URL or path required"),
  logo_icon_url: z.string().min(1, "Logo icon URL or path required"),
  brand_name: z.string().min(2, "Brand name required"),
  tagline: z.string().optional().default("Perfection in every stitch and fit"),
});

export const themeColorsSchema = z.object({
  primary_color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Must be valid hex color"),
  primary_dark: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Must be valid hex color"),
  accent_gold: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Must be valid hex color"),
  accent_gold_dark: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Must be valid hex color"),
  background_tint: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Must be valid hex color"),
  announcement_text: z.string().min(1, "Announcement text cannot be empty"),
  announcement_bg: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Must be valid hex color"),
  announcement_text_color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Must be valid hex color"),
  announcement_visible: z.boolean().default(true),
});

export const pagesContentSchema = z.object({
  home: z.object({
    hero_title: z.string().min(3, "Hero title required"),
    hero_subtitle: z.string().min(5, "Hero subtitle required"),
    badge_text: z.string().optional().default("Premier Digital Embroidery Atelier • 2026 Collection"),
  }),
  about: z.object({
    story_title: z.string().min(3, "Story title required"),
    story_body: z.string().min(10, "Story body required"),
    craftsmanship_text: z.string().optional().default(""),
    experience_years: z.string().optional().default("15+ Years"),
    designs_count: z.string().optional().default("5,000+ Patterns"),
  }),
  services: z.object({
    title: z.string().min(3, "Services title required"),
    subtitle: z.string().min(5, "Services subtitle required"),
    turnaround_time: z.string().optional().default("24 to 48 Hours Express Delivery"),
    machine_specs: z.string().optional().default("Calibrated for Brother, Usun, Ricoma, and Tajima."),
  }),
  contact: z.object({
    working_hours: z.string().min(3, "Working hours required"),
    support_notice: z.string().optional().default(""),
    directions_hint: z.string().optional().default(""),
  }),
});

export const updateSiteSettingsInputSchema = z.object({
  contact_info: contactInfoSchema.optional(),
  brand_assets: brandAssetsSchema.optional(),
  theme_colors: themeColorsSchema.optional(),
  pages_content: pagesContentSchema.optional(),
});

export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsInputSchema>;
