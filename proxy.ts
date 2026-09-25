import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Next.js 16 renamed "middleware" to "proxy". This file is the request proxy.
//
// It performs an OPTIMISTIC cookie-existence check for routes that require a
// signed-in user. `getSessionCookie` does NOT validate the session — it only
// confirms that a session cookie is present — so this is purely for UX (early
// redirect to the sign-in page). The real, secure authorization checks happen
// server-side in the route components/layouts via authenticated Convex queries.
//
// Auth redirects are skipped entirely in non-production builds so local
// development never requires sign-in. `process.env.NODE_ENV` is statically
// inlined at build time, so production builds always enforce the checks.
const BYPASS_AUTH_IN_DEV = process.env.NODE_ENV !== "production";
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Propagate the unified error-handling request-id (`x-request-id`).
  // `withFetchHandler` in `@/lib/app-error` echoes it on API responses;
  // forwarding it here keeps page navigations in the same trace.
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  // Routes that require a signed-in user:
  //   - /:tenant/admin/*            (admin section — also checks superadmin role)
  //   - /:tenant/judge/*            (judge section — also checks judge role)
  //   - /:tenant/forms/:form        (all registration forms — login only)
  //   - /:tenant/live/submit        (project submission form — login only)
  //
  // The feedback form (/:tenant/feedback) is intentionally NOT gated and stays
  // public, so it is excluded from both this proxy check and the secure
  // server-side checks in the route components.
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
