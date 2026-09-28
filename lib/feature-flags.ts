/** Central feature flag definitions (server-safe, no React). Values are
 * compile-time constants, so flags resolve synchronously and are
 * hydration-safe. Client: {@link useFeatureFlag}; server: {@link getFeatureFlag}. */

export interface FeatureFlagDefinition {
  /** What this flag does, where it's used, and when it can be removed. */
  description: string;
  /** Whether the flag is enabled by default (development). */
  value: boolean;
  /** Optional production override. Defaults to `value` when omitted. */
  production?: boolean;
}

export type FeatureFlagRegistry = Record<string, FeatureFlagDefinition>;

// `process.env.NODE_ENV` is statically inlined in client bundles, so this is
// free at runtime and never mismatches between server and client render.
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
      "Event analytics dashboards (admin, judge) and the analytics API backed by PostHog.",
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

/** Resolve a flag by key; `flag` is checked against {@link FEATURE_FLAGS}. */
export function getFeatureFlag(flag: FeatureFlagKey): boolean {
  // Dev-mode unlock: flag-gated pages (photos, analytics, assignments) render in
  // `next dev` without setup. Production still respects the registry values.
  if (process.env.NODE_ENV !== "production") return true;
  const { value, production } = REGISTRY[flag] as FeatureFlagDefinition;
  return IS_PRODUCTION ? (production ?? value) : value;
}
