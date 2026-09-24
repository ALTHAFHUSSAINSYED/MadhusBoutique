-- ==============================================================================
-- MADHUS BOUTIQUE: SITE SETTINGS & THEME CUSTOMIZER TABLE MIGRATION
-- Enables database-driven management of contacts, logos, themes, and page text
-- ==============================================================================

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_info JSONB NOT NULL DEFAULT '{
    "primary_phone": "8142073385",
    "secondary_phone": "9390213935",
    "whatsapp_number": "918142073385",
    "support_email": "support@madhusboutique.com",
    "physical_address": "Shop No. 4, Madhus Boutique, Main Road, Beside Axis Bank",
    "city_state_pincode": "Kavali, Andhra Pradesh - 524201",
    "maps_url": "https://maps.google.com"
  }'::jsonb,
  brand_assets JSONB NOT NULL DEFAULT '{
    "logo_wide_url": "/logo-text-wide.png",
    "logo_icon_url": "/logo-icon.png",
    "brand_name": "Madhus Boutique",
    "tagline": "Perfection in every stitch and fit"
  }'::jsonb,
  theme_colors JSONB NOT NULL DEFAULT '{
    "primary_color": "#6b1426",
    "primary_dark": "#4a1220",
    "accent_gold": "#dfb15b",
    "accent_gold_dark": "#b8860b",
    "background_tint": "#fbf9f5",
    "announcement_text": "PREMIUM MACHINE EMBROIDERY DESIGNS • DST, PES, JEF & EXP FORMATS AVAILABLE",
    "announcement_bg": "#4a1220",
    "announcement_text_color": "#fef3c7",
    "announcement_visible": true
  }'::jsonb,
  pages_content JSONB NOT NULL DEFAULT '{
    "home": {
      "hero_title": "Beautiful Embroidery. Crafted With Precision.",
      "hero_subtitle": "Download studio-calibrated machine embroidery designs for bridal wear, silk sarees, and designer blouses. Verified formats in DST, PES, JEF, and EXP.",
      "badge_text": "Premier Digital Embroidery Atelier • 2026 Collection"
    },
    "about": {
      "story_title": "Heritage Craftsmanship Meets Modern Machine Precision",
      "story_body": "At Madhus Boutique, we bridge the timeless artistry of South Indian ethnic embroidery with the speed and perfection of modern computer-aided embroidery machines.",
      "craftsmanship_text": "Every motif is hand-digitized with meticulous stitch density, jump minimization, and clean underlay tension.",
      "experience_years": "15+ Years",
      "designs_count": "5,000+ Patterns"
    },
    "services": {
      "title": "Custom Machine Embroidery & Digitizing Services",
      "subtitle": "Bring your unique blouse designs, bridal motifs, and brand emblems to life with expert digitizing and high-speed execution.",
      "turnaround_time": "24 to 48 Hours Express Delivery",
      "machine_specs": "Calibrated for single & multi-head Brother, Usun, Ricoma, and Tajima machines."
    },
    "contact": {
      "working_hours": "Monday to Saturday: 10:00 AM – 8:30 PM",
      "support_notice": "Instant support available via WhatsApp for order tracking and format assistance.",
      "directions_hint": "Located at the central market hub with convenient customer parking."
    }
  }'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_by UUID
);

-- Seed initial row if table is empty
INSERT INTO site_settings (id)
SELECT '00000000-0000-0000-0000-000000000001'
WHERE NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1);

-- Enable Row Level Security
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone (public / guests) can read active site settings
DROP POLICY IF EXISTS "Public can view site settings" ON site_settings;
CREATE POLICY "Public can view site settings"
  ON site_settings FOR SELECT
  USING (true);

-- Policy 2: Super Admins and Content Managers can update site settings
DROP POLICY IF EXISTS "Staff can update site settings" ON site_settings;
CREATE POLICY "Staff can update site settings"
  ON site_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.auth_user_id = auth.uid()
      AND admin_profiles.role IN ('SUPER_ADMIN', 'CONTENT_MANAGER')
    )
  );
