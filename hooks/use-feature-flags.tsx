"use client";

import { getFeatureFlag, type FeatureFlagKey } from "@/lib/feature-flags";

export type { FeatureFlagKey } from "@/lib/feature-flags";

export interface UseFeatureFlagResult<K extends FeatureFlagKey> {
  /** The flag key being resolved. */
  flag: K;
  /** Whether the flag is enabled in the current environment. */
  isEnabled: boolean;
}

// Resolve one feature flag. `flag` is compile-time checked against the registry
// in `@/lib/feature-flags`; server components/routes use `getFeatureFlag` instead.
export const useFeatureFlag = <K extends FeatureFlagKey>(flag: K): UseFeatureFlagResult<K> => {
  return { flag, isEnabled: getFeatureFlag(flag) };
};
