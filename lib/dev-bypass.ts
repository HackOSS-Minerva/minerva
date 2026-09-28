// Dev-mode auth bypass (server-safe, no React). `true` in every non-production
// build, so local development never needs sign-in or a registered account.
// `process.env.NODE_ENV` is statically inlined, so prod always enforces auth.
export const BYPASS_AUTH_IN_DEV = process.env.NODE_ENV !== "production";
