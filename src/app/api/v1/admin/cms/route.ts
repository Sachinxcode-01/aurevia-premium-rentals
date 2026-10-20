import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { verifyApiAuth, recordAuditLog } from "@/lib/auth/rbac";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, db } from "@/lib/db/store";

export interface CmsContentSettings {
  homepage_banner_title: string;
  homepage_banner_subtitle: string;
  hero_badge_text: string;
  announcement_bar_text: string;
  announcement_bar_active: string;
  announcement_bar_link: string;
  promo_countdown_active: string;
  promo_countdown_title: string;
  promo_countdown_code: string;
  promo_countdown_discount: string;
  featured_gear_id: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  updatedAt?: string;
  updatedBy?: string;
}

const DEFAULT_CMS_SETTINGS: CmsContentSettings = {
  homepage_banner_title: "Frame the Extraordinary",
  homepage_banner_subtitle:
    "Rent calibrated cinema cameras, cinema glass, and production grip across Karnataka and India.",
  hero_badge_text: "SOUTH INDIA'S LUXURY CINEMA CONCIERGE",
  announcement_bar_text:
    "⚡ SPECIAL OFFER: Save ₹199/day on all cameras with coupon AUREVIA199!",
  announcement_bar_active: "true",
  announcement_bar_link: "/explore",
  promo_countdown_active: "true",
  promo_countdown_title: "Monsoon Production Pass",
  promo_countdown_code: "AUREVIA199",
  promo_countdown_discount: "Flat ₹199 OFF",
  featured_gear_id: "canon-eos-r5",
  contact_phone: "+91 96869 09048",
  contact_email: "premmundargi135@gmail.com",
  contact_address:
    "Aurevia Studio Vault, Gadag Main Road, Karnataka, India - 582101",
};

let inMemoryCmsSettings: CmsContentSettings = { ...DEFAULT_CMS_SETTINGS };

export async function GET(req: NextRequest) {
  try {
    // Optional auth: Admins get full metadata; public callers can retrieve published settings
    const authHeader = req.headers.get("authorization");
    const isExplicitAdminCall = req.nextUrl.searchParams.get("admin") === "true" || !!authHeader;

    if (isExplicitAdminCall) {
      const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
      if (response || !user) return response!;
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServiceSupabaseClient();
        const { data } = await supabase
          .from("website_settings")
          .select("value")
          .eq("key", "cms_content_settings")
          .maybeSingle();

        if (data?.value) {
          const parsed = JSON.parse(data.value);
          return successResponse({ ...DEFAULT_CMS_SETTINGS, ...parsed });
        }
      } catch (err) {
        console.warn("[CMS GET] Supabase fallback to memory/db store:", err);
      }
    }

    // Fallback: check individual keys from store
    const storeSettings = await db.getAllWebsiteSettings();
    const merged: CmsContentSettings = {
      ...inMemoryCmsSettings,
      homepage_banner_title:
        storeSettings["homepage_banner_title"] || inMemoryCmsSettings.homepage_banner_title,
      homepage_banner_subtitle:
        storeSettings["homepage_banner_subtitle"] || inMemoryCmsSettings.homepage_banner_subtitle,
      announcement_bar_text:
        storeSettings["announcement_bar_text"] || inMemoryCmsSettings.announcement_bar_text,
      announcement_bar_active:
        storeSettings["announcement_bar_active"] || inMemoryCmsSettings.announcement_bar_active,
    };

    return successResponse(merged);
  } catch (err: any) {
    console.error("[CMS GET] Error:", err);
    return errorResponse("CMS_FETCH_FAILED", err.message || "Failed to fetch CMS content", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const body = await req.json().catch(() => ({}));

    const updated: CmsContentSettings = {
      homepage_banner_title: String(body.homepage_banner_title ?? inMemoryCmsSettings.homepage_banner_title),
      homepage_banner_subtitle: String(body.homepage_banner_subtitle ?? inMemoryCmsSettings.homepage_banner_subtitle),
      hero_badge_text: String(body.hero_badge_text ?? inMemoryCmsSettings.hero_badge_text),
      announcement_bar_text: String(body.announcement_bar_text ?? inMemoryCmsSettings.announcement_bar_text),
      announcement_bar_active: String(body.announcement_bar_active ?? inMemoryCmsSettings.announcement_bar_active),
      announcement_bar_link: String(body.announcement_bar_link ?? inMemoryCmsSettings.announcement_bar_link),
      promo_countdown_active: String(body.promo_countdown_active ?? inMemoryCmsSettings.promo_countdown_active),
      promo_countdown_title: String(body.promo_countdown_title ?? inMemoryCmsSettings.promo_countdown_title),
      promo_countdown_code: String(body.promo_countdown_code ?? inMemoryCmsSettings.promo_countdown_code),
      promo_countdown_discount: String(body.promo_countdown_discount ?? inMemoryCmsSettings.promo_countdown_discount),
      featured_gear_id: String(body.featured_gear_id ?? inMemoryCmsSettings.featured_gear_id),
      contact_phone: String(body.contact_phone ?? inMemoryCmsSettings.contact_phone),
      contact_email: String(body.contact_email ?? inMemoryCmsSettings.contact_email),
      contact_address: String(body.contact_address ?? inMemoryCmsSettings.contact_address),
      updatedAt: new Date().toISOString(),
      updatedBy: user.email || user.fullName,
    };

    inMemoryCmsSettings = updated;

    // Sync to store.ts local/memory settings
    await db.saveWebsiteSetting("homepage_banner_title", updated.homepage_banner_title);
    await db.saveWebsiteSetting("homepage_banner_subtitle", updated.homepage_banner_subtitle);
    await db.saveWebsiteSetting("announcement_bar_text", updated.announcement_bar_text);
    await db.saveWebsiteSetting("announcement_bar_active", updated.announcement_bar_active);
    await db.saveWebsiteSetting("hero_badge_text", updated.hero_badge_text);

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServiceSupabaseClient();
        await supabase.from("website_settings").upsert(
          {
            key: "cms_content_settings",
            value: JSON.stringify(updated),
          },
          { onConflict: "key" }
        );
      } catch (err) {
        console.warn("[CMS POST] Failed to sync to Supabase website_settings:", err);
      }
    }

    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "UPDATE_CMS_CONTENT",
      resource: "website_cms",
      resourceId: "cms_content_settings",
      metadata: {
        announcementActive: updated.announcement_bar_active,
        bannerTitle: updated.homepage_banner_title,
      },
    });

    return successResponse(updated, "Public website content updated and published successfully.");
  } catch (err: any) {
    console.error("[CMS POST] Error:", err);
    return errorResponse("CMS_UPDATE_FAILED", err.message || "Failed to update CMS settings", 500);
  }
}
