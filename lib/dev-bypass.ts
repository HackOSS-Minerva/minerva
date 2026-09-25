/**
 * Dev-mode auth bypass (server-safe, no React).
 *
 * `true` in every non-production build (`next dev`, tests, preview builds).
 * Next.js statically inlines `process.env.NODE_ENV`, so this is free at
 * runtime, hydration-safe, and can never be true in a production build —
 * prod always enforces auth, locks, and feature flags.
 *
 * Use it to skip sign-in / role checks, tenant page locks, and feature-flag
 * gates while developing locally so you don't need a registered participant /
 * judge / superadmin account.
 */
export const BYPASS_AUTH_IN_DEV = process.env.NODE_ENV !== "production";
