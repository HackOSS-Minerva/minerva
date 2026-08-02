import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL!;

const {
  handler: authHandler,
  preloadAuthQuery,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
  isAuthenticated,
  getToken,
} = convexBetterAuthNextJs({ convexUrl, convexSiteUrl });

export {
  authHandler,
  preloadAuthQuery,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
  isAuthenticated,
  getToken,
};
