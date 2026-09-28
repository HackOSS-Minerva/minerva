import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import type { AuthClient } from "@convex-dev/better-auth/react";

// No `baseURL`: the client defaults to the current origin, which is correct for
// Next.js (the auth route handler is served at /api/auth/* on that same origin).
export const authClient = createAuthClient({
  // The `convexClient` plugin exposes `authClient.convex.token()` which the
  // ConvexBetterAuthProvider uses to authenticate the ConvexReactClient.
  plugins: [convexClient()],
});

// Cast the richly-inferred client to the `AuthClient` type the
// `ConvexBetterAuthProvider` expects — a known contravariance quirk in its
// generic type; every member it uses exists on the inferred client.
export const asAuthClient = authClient as unknown as AuthClient;
