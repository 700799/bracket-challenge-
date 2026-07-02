import { NextResponse, type NextRequest } from "next/server";

/**
 * Lightweight guard: if there's no Auth.js session cookie at all, bounce
 * /admin visitors to sign-in before rendering. Full authorization (valid
 * session AND ADMIN_EMAILS membership) is enforced server-side in
 * src/app/admin/page.tsx. We avoid the NextAuth `auth()` middleware wrapper
 * here because it doesn't survive the OpenNext edge bundling.
 */
export function middleware(req: NextRequest) {
  const hasSession =
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("__Secure-authjs.session-token");

  if (!hasSession) {
    const url = new URL("/login", req.nextUrl);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
