import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Next.js 16 renamed "middleware" to "proxy". This file is the request proxy.
//
// It performs an OPTIMISTIC cookie-existence check for routes that require a
// signed-in user. `getSessionCookie` does NOT validate the session — it only
// confirms that a session cookie is present — so this is purely for UX (early
// redirect to the sign-in page). The real, secure authorization checks happen
// server-side in the route components/layouts via authenticated Convex queries.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes that require a signed-in user:
  //   - /:tenant/admin/*            (admin section — also checks superadmin role)
  //   - /:tenant/forms/:form        (all registration forms — login only)
  //   - /:tenant/live/submit        (project submission form — login only)
  //
  // The feedback form (/:tenant/feedback) is intentionally NOT gated and stays
  // public, so it is excluded from both this proxy check and the secure
  // server-side checks in the route components.
  const isAdmin = /^\/[^/]+\/admin(?:\/|$)/.test(pathname);
  const isForm = /^\/[^/]+\/forms\/[^/]+$/.test(pathname);
  const isSubmission = /^\/[^/]+\/live\/submit$/.test(pathname);
  if (!isAdmin && !isForm && !isSubmission) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const tenant = pathname.split("/")[1];
    const signInUrl = new URL(`/${tenant}/sign-in`, request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/:tenant/admin/:path*",
    "/:tenant/forms/:form",
    "/:tenant/live/submit",
  ],
};
