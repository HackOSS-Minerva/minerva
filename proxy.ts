import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Next.js 16 renamed "middleware" to "proxy". This only checks that a session
// cookie exists (UX-level early redirect); real authorization happens in the
// layouts/routes via authenticated Convex queries. Skipped in dev.
const BYPASS_AUTH_IN_DEV = process.env.NODE_ENV !== "production";
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Propagate the unified error-handling request-id (`x-request-id`) so page
  // navigations stay in the same trace as API responses.
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  // Gated routes: /:tenant/admin/*, /:tenant/judge/* (both also check the role),
  // /:tenant/forms/:form and /:tenant/live/submit (login only). The feedback
  // form is intentionally public and excluded from here and from the layouts.
  const isAdmin = /^\/[^/]+\/admin(?:\/|$)/.test(pathname);
  const isJudge = /^\/[^/]+\/judge(?:\/|$)/.test(pathname);
  const isForm = /^\/[^/]+\/forms\/[^/]+$/.test(pathname);
  const isSubmission = /^\/[^/]+\/live\/submit$/.test(pathname);
  if (BYPASS_AUTH_IN_DEV) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }
  if (!isAdmin && !isJudge && !isForm && !isSubmission) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const tenant = pathname.split("/")[1];
    const signInUrl = new URL(`/${tenant}/sign-in`, request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl, { headers: requestHeaders });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/:tenant/admin/:path*",
    "/:tenant/judge/:path*",
    "/:tenant/forms/:form",
    "/:tenant/live/submit",
  ],
};
