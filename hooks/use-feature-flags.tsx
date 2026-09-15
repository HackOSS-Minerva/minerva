"use client";

import { getFeatureFlag, type FeatureFlagKey } from "@/lib/feature-flags";

export type { FeatureFlagKey } from "@/lib/feature-flags";

export interface UseFeatureFlagResult<K extends FeatureFlagKey> {
  /** The flag key being resolved. */
  flag: K;
  /** Whether the flag is enabled in the current environment. */
  isEnabled: boolean;
}

/**
 * Resolve a single feature flag. The `flag` argument is compile-time checked
 * against the central registry in `@/lib/feature-flags`, so unknown keys are a
 * type error. For server components and API routes, use
 * `getFeatureFlag` from `@/lib/feature-flags` instead.
 */
export function useFeatureFlag<K extends FeatureFlagKey>(
  flag: K,
): UseFeatureFlagResult<K> {
  return { flag, isEnabled: getFeatureFlag(flag) };
}
