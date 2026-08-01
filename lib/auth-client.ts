import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import type { AuthClient } from "@convex-dev/better-auth/react";

// No `baseURL` is set: the client defaults to the current origin, which is
// correct for Next.js (the auth route handler is served at /api/auth/* on the
// same origin).
//
// The client keeps full type inference for its own consumers (e.g. the sign-in
// page's `authClient.useSession()`). At the single place that requires the
// provider's stricter `AuthClient` type (`ConvexBetterAuthProvider`), we cast
// via `asAuthClient` below — see `lib/convex-provider.tsx`.
export const authClient = createAuthClient({
  // The `convexClient` plugin exposes `authClient.convex.token()` which the
  // ConvexBetterAuthProvider uses to authenticate the ConvexReactClient.
  plugins: [convexClient()],
});

// Bridge the richly-inferred client type to the `AuthClient` type expected by
// `ConvexBetterAuthProvider`. The provider only uses `useSession`,
// `convex.token`, `getSession`, and `updateSession`, all of which exist on the
// inferred client; the type mismatch is a known inference/contravariance quirk
// in the component's generic `AuthClient` type.
export const asAuthClient = authClient as unknown as AuthClient;
