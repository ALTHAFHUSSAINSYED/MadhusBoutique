import { describe, it, expect, beforeEach } from "vitest";
import { updateSiteSettingsInputSchema } from "@/lib/validations/siteSettingsSchemas";
import { hasPermission } from "@/lib/server/adminAuth";
import {
  getActiveSiteSettings,
  updateActiveSiteSettings,
  resetSiteSettingsToDefault,
} from "@/lib/server/db/siteSettings";

describe("Site Settings & Theme Customizer Engine", () => {
  beforeEach(async () => {
    await resetSiteSettingsToDefault();
  });

  describe("Validation Schemas", () => {
    it("validates full valid site settings update payload", () => {
      const validPayload = {
        contact_info: {
          primary_phone: "9876543210",
          secondary_phone: "9123456780",
          whatsapp_number: "919876543210",
          support_email: "help@madhusboutique.com",
          physical_address: "123 Heritage Silk Road",
          city_state_pincode: "Hyderabad, Telangana - 500001",
          maps_url: "https://maps.google.com/test",
        },
        brand_assets: {
          logo_wide_url: "https://example.com/logo-wide.png",
          logo_icon_url: "https://example.com/logo-icon.png",
          brand_name: "Madhus Atelier",
          tagline: "Royal Stitches",
        },
        theme_colors: {
          primary_color: "#7a1a2f",
          primary_dark: "#501220",
          accent_gold: "#e5b95f",
          accent_gold_dark: "#c29315",
          background_tint: "#faf7f2",
          announcement_text: "FESTIVE SALE ON ALL BLOUSE MOTIFS",
          announcement_bg: "#501220",
          announcement_text_color: "#ffffff",
          announcement_visible: true,
        },
        pages_content: {
          home: {
            hero_title: "Custom Bridal Elegance",
            hero_subtitle: "Handcrafted digitized embroidery patterns for luxury silk.",
            badge_text: "Exclusive 2026 Collection",
          },
          about: {
            story_title: "Artisanal Heritage",
            story_body: "Crafted with passion and technological precision.",
            craftsmanship_text: "Every stitch tested on multi-head Tajima embroidery machines.",
            experience_years: "20+ Years",
            designs_count: "10,000+ Patterns",
          },
          services: {
            title: "Expert Digitizing Services",
            subtitle: "Convert sketches into machine formats effortlessly.",
            turnaround_time: "12 to 24 Hours",
            machine_specs: "Compatible with Brother, Tajima, Janome",
          },
          contact: {
            working_hours: "10am - 9pm",
            support_notice: "WhatsApp chat available 24/7",
            directions_hint: "Opposite Landmark Bank",
          },
        },
      };

      const parsed = updateSiteSettingsInputSchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);
    });

    it("rejects invalid hex color format", () => {
      const invalidPayload = {
        theme_colors: {
          primary_color: "not-a-color",
          primary_dark: "#501220",
          accent_gold: "#e5b95f",
          accent_gold_dark: "#c29315",
          background_tint: "#faf7f2",
          announcement_text: "Test",
          announcement_bg: "#501220",
          announcement_text_color: "#ffffff",
          announcement_visible: true,
        },
      };

      const parsed = updateSiteSettingsInputSchema.safeParse(invalidPayload);
      expect(parsed.success).toBe(false);
    });

    it("rejects invalid email in contact_info", () => {
      const invalidPayload = {
        contact_info: {
          primary_phone: "9876543210",
          secondary_phone: "",
          whatsapp_number: "9876543210",
          support_email: "not-an-email",
          physical_address: "Address",
          city_state_pincode: "City",
          maps_url: "",
        },
      };

      const parsed = updateSiteSettingsInputSchema.safeParse(invalidPayload);
      expect(parsed.success).toBe(false);
    });
  });

  describe("RBAC Permissions", () => {
    it("authorizes SUPER_ADMIN to manage site settings", () => {
      expect(hasPermission("SUPER_ADMIN", "manage:site_settings")).toBe(true);
    });

    it("authorizes CONTENT_MANAGER to manage site settings", () => {
      expect(hasPermission("CONTENT_MANAGER", "manage:site_settings")).toBe(true);
    });

    it("denies ORDER_MANAGER from managing site settings", () => {
      expect(hasPermission("ORDER_MANAGER", "manage:site_settings")).toBe(false);
    });
  });

  describe("Service Layer Persistence & Updating", () => {
    it("fetches active site settings with all configured defaults", async () => {
      const settings = await getActiveSiteSettings();
      expect(settings).toBeDefined();
      expect(settings.brand_assets.brand_name).toBe("Madhus Boutique");
      expect(settings.theme_colors.primary_color).toBe("#6b1426");
      expect(settings.contact_info.whatsapp_number).toBe("918142073385");
    });

    it("updates contact, colors, brand assets, and page content dynamically", async () => {
      const updated = await updateActiveSiteSettings(
        "admin-user-123",
        {
          contact_info: {
            primary_phone: "9998887776",
            secondary_phone: "8887776665",
            whatsapp_number: "919998887776",
            support_email: "custom@madhus.in",
            physical_address: "New Fashion Boulevard",
            city_state_pincode: "Vijayawada - 520001",
            maps_url: "https://maps.google.com",
          },
          theme_colors: {
            primary_color: "#800020",
            primary_dark: "#4d0013",
            accent_gold: "#ffd700",
            accent_gold_dark: "#ccac00",
            background_tint: "#fffaf0",
            announcement_text: "Special Spring Collection Live!",
            announcement_bg: "#4d0013",
            announcement_text_color: "#ffffff",
            announcement_visible: true,
          },
          brand_assets: {
            logo_wide_url: "/custom-logo.png",
            logo_icon_url: "/custom-icon.png",
            brand_name: "Madhus Haute Couture",
            tagline: "Mastery in thread",
          },
        },
        "127.0.0.1",
        "Vitest/Runner"
      );

      expect(updated.brand_assets.brand_name).toBe("Madhus Haute Couture");
      expect(updated.theme_colors.primary_color).toBe("#800020");
      expect(updated.contact_info.primary_phone).toBe("9998887776");

      // Verify subsequent fetch returns updated record
      const reFetched = await getActiveSiteSettings();
      expect(reFetched.brand_assets.brand_name).toBe("Madhus Haute Couture");
      expect(reFetched.theme_colors.accent_gold).toBe("#ffd700");
    });
  });
});
