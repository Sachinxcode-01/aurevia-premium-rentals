import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const errorDescription = searchParams.get("error_description");

  if (errorDescription) {
    console.error("[OAuth Callback Error]:", errorDescription);
    return NextResponse.redirect(`${origin}/login?error=google_auth_failed`);
  }

  if (code) {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const user = data.user;

      // Check if profile exists in database
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, role, full_name, avatar_url")
        .eq("id", user.id)
        .single();

      const googleAvatar =
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        null;

      const googleName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "AUREVIA Member";

      if (!existingProfile) {
        // Create customer profile safely for first-time Google sign in
        await supabase.from("profiles").upsert([
          {
            id: user.id,
            email: user.email,
            full_name: googleName,
            avatar_url: googleAvatar,
            role: "customer", // Enforce CUSTOMER role strictly
          },
        ] as never[]);
      } else {
        // Update avatar_url if missing, preserving existing profile information & role
        if (googleAvatar && !existingProfile.avatar_url) {
          await supabase
            .from("profiles")
            .update({ avatar_url: googleAvatar } as never)
            .eq("id", user.id);
        }
      }

      const target = next.startsWith("/") ? `${origin}${next}` : `${origin}/${next}`;
      return NextResponse.redirect(target);
    }
  }

  // Fallback redirect for missing code or exchange error
  const fallbackTarget = `${origin}/login?error=verification_failed`;
  return NextResponse.redirect(fallbackTarget);
}
