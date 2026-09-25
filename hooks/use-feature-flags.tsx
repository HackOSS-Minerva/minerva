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

/**
 * Resolve every registered flag in a single, order-stable hook call.
 *
 * Use this instead of calling {@link useFeatureFlag} in a loop: hook order must
 * be identical on every render, so a loop whose length depends on props/state
 * (e.g. the flags referenced by a dynamic nav config) is unsafe. The registry is
 * a compile-time constant, so this is a single call with a fixed evaluation
 * order in every environment.
 */
export function useFeatureFlags(): Record<FeatureFlagKey, boolean> {
  return Object.fromEntries(
    (Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]).map((key) => [
      key,
      getFeatureFlag(key),
    ]),
  ) as Record<FeatureFlagKey, boolean>;
}
