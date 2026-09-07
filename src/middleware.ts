import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_CUSTOMER = ["/dashboard", "/profile", "/checkout", "/kyc", "/notifications", "/booking"];
const AUTH_PAGES         = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const isSupabaseConfigured =
    supabaseUrl.length > 0 && !supabaseUrl.includes("your-project-id");

  // Handle API routes and CORS for admin and cross-origin access
  if (pathname.startsWith("/api")) {
    const origin = request.headers.get("origin");
    const isAllowedOrigin =
      !origin ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1") ||
      origin.endsWith(".vercel.app") ||
      origin === process.env.NEXT_PUBLIC_SITE_URL ||
      origin === process.env.NEXT_PUBLIC_ADMIN_URL;

    const allowedOrigin = isAllowedOrigin && origin ? origin : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

    if (request.method === "OPTIONS") {
      const preflightHeaders = new Headers({
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Accept, Accept-Version",
        "Access-Control-Max-Age": "86400",
      });
      return new NextResponse(null, { status: 200, headers: preflightHeaders });
    }

    const res = NextResponse.next();
    res.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Accept, Accept-Version");
    return res;
  }

  // If Supabase is not configured, skip auth middleware
  if (!isSupabaseConfigured) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh session with a 2-second timeout to prevent hanging middleware
  const user = await Promise.race([
    supabase.auth.getUser().then((res) => res.data?.user || null).catch(() => null),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
  ]);

  const isProtectedCustomer = PROTECTED_CUSTOMER.some((p) =>
    pathname.startsWith(p)
  );
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // Not logged in → redirect to login for protected routes
  if (!user && isProtectedCustomer) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged-in user visiting auth pages → redirect to customer dashboard
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
