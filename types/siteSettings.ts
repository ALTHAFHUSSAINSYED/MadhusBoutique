// ==============================================================================
// MADHUS BOUTIQUE: SITE SETTINGS & THEME CUSTOMIZER TYPE DEFINITIONS
// Database-driven CMS, brand assets, dynamic theme colors, and page content
// ==============================================================================

export interface ContactInfo {
  primary_phone: string;
  secondary_phone: string;
  whatsapp_number: string;
  support_email: string;
  physical_address: string;
  city_state_pincode: string;
  maps_url: string;
}

export interface BrandAssets {
  logo_wide_url: string;
  logo_icon_url: string;
  brand_name: string;
  tagline: string;
}

export interface ThemeColors {
  primary_color: string;
  primary_dark: string;
  accent_gold: string;
  accent_gold_dark: string;
  background_tint: string;
  announcement_text: string;
  announcement_bg: string;
  announcement_text_color: string;
  announcement_visible: boolean;
}

export interface HomePageContent {
  hero_title: string;
  hero_subtitle: string;
  badge_text: string;
}

export interface AboutPageContent {
  story_title: string;
  story_body: string;
  craftsmanship_text: string;
  experience_years: string;
  designs_count: string;
}

export interface ServicesPageContent {
  title: string;
  subtitle: string;
  turnaround_time: string;
  machine_specs: string;
}

export interface ContactPageContent {
  working_hours: string;
  support_notice: string;
  directions_hint: string;
}

export interface PagesContent {
  home: HomePageContent;
  about: AboutPageContent;
  services: ServicesPageContent;
  contact: ContactPageContent;
}

export interface SiteSettings {
  id: string;
  contact_info: ContactInfo;
  brand_assets: BrandAssets;
  theme_colors: ThemeColors;
  pages_content: PagesContent;
  updated_at: string;
  updated_by?: string | null;
}
