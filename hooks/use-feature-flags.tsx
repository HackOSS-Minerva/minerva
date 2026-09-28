"use client";

import {
  FEATURE_FLAGS,
  getFeatureFlag,
  type FeatureFlagKey,
} from "@/lib/feature-flags";

export type { FeatureFlagKey } from "@/lib/feature-flags";

export interface UseFeatureFlagResult<K extends FeatureFlagKey> {
  /** The flag key being resolved. */
  flag: K;
  /** Whether the flag is enabled in the current environment. */
  isEnabled: boolean;
}

// Resolve one feature flag. `flag` is compile-time checked against the registry
// in `@/lib/feature-flags`; server components/routes use `getFeatureFlag` instead.
export function useFeatureFlag<K extends FeatureFlagKey>(
  flag: K,
): UseFeatureFlagResult<K> {
  return { flag, isEnabled: getFeatureFlag(flag) };
}

// Resolve every flag in one order-stable call. Use this instead of
// {@link useFeatureFlag} in a loop: hook order must be identical on every
// render, so a loop over dynamic content is unsafe.
export function useFeatureFlags(): Record<FeatureFlagKey, boolean> {
  return Object.fromEntries(
    (Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]).map((key) => [
      key,
      getFeatureFlag(key),
    ]),
  ) as Record<FeatureFlagKey, boolean>;
}
