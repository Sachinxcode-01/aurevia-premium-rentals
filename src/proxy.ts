import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_CUSTOMER = ["/dashboard", "/profile", "/checkout", "/kyc", "/notifications", "/booking"];
const AUTH_PAGES         = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const isSupabaseConfigured =
    supabaseUrl.length > 0 && !supabaseUrl.includes("your-project-id");

  // Handle API routes and CORS for admin and cross-origin access
  if (pathname.startsWith("/api")) {
    const origin = request.headers.get("origin");
    const trustedOrigins = [
      process.env.NEXT_PUBLIC_SITE_URL,
      process.env.NEXT_PUBLIC_ADMIN_URL,
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
    ].filter(Boolean) as string[];

    const isAllowedOrigin =
      !origin ||
      trustedOrigins.includes(origin) ||
      (origin.startsWith("http://localhost:") && process.env.NODE_ENV === "development") ||
      (origin.startsWith("http://127.0.0.1:") && process.env.NODE_ENV === "development");

    const defaultOrigin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const allowedOrigin = isAllowedOrigin && origin ? origin : defaultOrigin;

    if (request.method === "OPTIONS") {
      if (!isAllowedOrigin && origin) {
        return new NextResponse(null, { status: 403 });
      }
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
    if (isAllowedOrigin) {
      res.headers.set("Access-Control-Allow-Origin", allowedOrigin);
      res.headers.set("Access-Control-Allow-Credentials", "true");
      res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Accept, Accept-Version");
    }
    return res;
  }

  // If Supabase is not configured, skip auth middleware
  if (!isSupabaseConfigured) {
    return NextResponse.next();
  }

  // Skip auth checks on Server Actions and non-GET requests (e.g. form POST, action POST)
  // Server actions run in server component context and handle their own authentication.
  // Running Supabase auth network calls on Server Action POSTs locks the body stream and causes connection resets.
  const isServerAction = request.headers.has("next-action");
  if (request.method !== "GET" || isServerAction) {
    return NextResponse.next();
  }

  const isProtectedCustomer = PROTECTED_CUSTOMER.some((p) =>
    pathname.startsWith(p)
  );
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // If this route is neither a protected customer route nor an auth page, skip session refresh
  if (!isProtectedCustomer && !isAuthPage) {
    return NextResponse.next();
  }

  // Quick check: does the request even carry any Supabase auth cookies?
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.includes("-auth-token") || c.name.startsWith("sb-")
  );

  // If no auth cookie exists:
  if (!hasAuthCookie) {
    if (isProtectedCustomer) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Visiting an auth page without cookies is completely valid (anonymous user)
    return NextResponse.next();
  }

  // At this point, the user has an auth cookie and is accessing either a protected page or an auth page.
  // Validate the session with an AbortController timeout so the connection is cleanly aborted if Supabase stalls.
  let response = NextResponse.next({ request });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  let user = null;
  try {
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
      global: {
        fetch: (input, init) => {
          return fetch(input, {
            ...init,
            signal: controller.signal,
          });
        },
      },
    });

    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    user = null;
  } finally {
    clearTimeout(timeoutId);
  }

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
