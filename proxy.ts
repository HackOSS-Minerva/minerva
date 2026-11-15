import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const BYPASS_AUTH_IN_DEV = process.env.NODE_ENV !== "production";

export const proxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  const isAdmin = /^\/[^/]+\/admin(?:\/|$)/.test(pathname);
  const isJudge = /^\/[^/]+\/judge(?:\/|$)/.test(pathname);
  const isForm = /^\/[^/]+\/forms\/[^/]+$/.test(pathname);
  const isParticipantPage =
    /^\/[^/]+\/live\/(submit|teams|checkin|venue|hackpacks|dev-tools|packing-list|rules|code-of-conduct)$/.test(
      pathname,
    );
  if (BYPASS_AUTH_IN_DEV) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }
  if (!isAdmin && !isJudge && !isForm && !isParticipantPage) {
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
};

export const config = {
  matcher: [
    "/:tenant/admin/:path*",
    "/:tenant/judge/:path*",
    "/:tenant/forms/:form",
    "/:tenant/live/submit",
    "/:tenant/live/teams",
    "/:tenant/live/checkin",
    "/:tenant/live/venue",
    "/:tenant/live/hackpacks",
    "/:tenant/live/dev-tools",
    "/:tenant/live/packing-list",
    "/:tenant/live/rules",
    "/:tenant/live/code-of-conduct",
  ],
};
