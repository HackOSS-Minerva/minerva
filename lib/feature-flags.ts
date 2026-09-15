/**
 * Central feature flag definitions (server-safe, no React).
 *
 * Each flag requires a human-readable `description` and:
 * - `value` — the default enabled state (used in development),
 * - `production` — optional override for production builds, e.g.
 *   `value: true, production: false` = on in dev, off in prod. When omitted,
 *   production uses `value`.
 *
 * Values are static compile-time constants (no runtime/remote toggling), so
 * flags resolve synchronously and are hydration-safe.
 *
 * For client components use the `useFeatureFlag` hook
 * (`@/hooks/use-feature-flags`); everywhere else (server components, API
 * routes) use {@link getFeatureFlag}.
 */

export interface FeatureFlagDefinition {
  /** What this flag does, where it's used, and when it can be removed. */
  description: string;
  /** Whether the flag is enabled by default (development). */
  value: boolean;
  /** Optional production override. Defaults to `value` when omitted. */
  production?: boolean;
}

export type FeatureFlagRegistry = Record<string, FeatureFlagDefinition>;

/**
 * Whether this bundle was built for production. Next.js statically inlines
 * `process.env.NODE_ENV` in client bundles, so this costs nothing at runtime
 * and never mismatches between server and client render.
 */
export const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const FEATURE_FLAGS = {
  photos: {
    description:
      "Event photo gallery — the live photos page, admin photo management, and the photo upload/list/delete APIs.",
    value: false,
    production: false,
  },
  analytics: {
    description:
      "Event analytics dashboards (admin, judge, sponsor) and the analytics API backed by PostHog.",
    value: true,
  },
  assignments: {
    description:
      "Judge assignment viewing in the judge portal and assignment management in the admin portal.",
    value: true,
  },
} satisfies FeatureFlagRegistry;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

/** Registry-typed view of {@link FEATURE_FLAGS} for uniform flag access. */
const REGISTRY: FeatureFlagRegistry = FEATURE_FLAGS;

/**
 * Resolve a feature flag by key. The `flag` argument is compile-time checked
 * against {@link FEATURE_FLAGS}, so unknown keys are a type error.
 */
export function getFeatureFlag(flag: FeatureFlagKey): boolean {
  const { value, production } = REGISTRY[flag] as FeatureFlagDefinition;
  return IS_PRODUCTION ? (production ?? value) : value;
}
