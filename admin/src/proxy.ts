import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Attach Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Allow static files, auth callback, and admin-login without auth redirection
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/aurevia-logo.png") ||
    pathname.startsWith("/auth/callback") ||
    pathname === "/admin-login"
  ) {
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uoutovqmmxzawhvpahcg.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || supabaseUrl.includes("your-project-id")) {
    return response;
  }

  // Quick check: does the request carry any Supabase auth cookies?
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.includes("-auth-token") || c.name.startsWith("sb-")
  );

  if (!hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin-login";
    url.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(url);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
    global: {
      fetch: (input, init) => {
        return fetch(input, {
          ...init,
          signal: controller.signal,
        });
      },
    },
  });

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    user = null;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin-login";
    url.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(url);
  }

  // Verify RBAC Privileges
  let profile = null;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    profile = data;
  } catch {
    profile = null;
  }

  const role = profile?.role || user.user_metadata?.role || "customer";

  if (!["admin", "staff", "super_admin"].includes(role)) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore signout failure during redirect
    }
    const url = request.nextUrl.clone();
    url.pathname = "/admin-login";
    url.searchParams.set("error", "insufficient_permissions");
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
