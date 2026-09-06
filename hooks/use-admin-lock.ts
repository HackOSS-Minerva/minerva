"use client";

import { useMemo } from "react";
import { useTenant } from "./use-tenant";

export interface UseAdminLockOptions {
  /**
   * Admin page slug, e.g. "analytics", "assignments", "participants"
   */
  page: string;
}

export interface UseAdminLockResult {
  /**
   * Whether the admin page is locked. Admin locks are simple booleans
   * (no start/end dates), resolved from `tenant.locks.admin[page]`.
   * Defaults to false (unlocked) when not configured.
   */
  isLocked: boolean;
}

export function useAdminLock({ page }: UseAdminLockOptions): UseAdminLockResult {
  const { tenant } = useTenant();

  const isLocked = useMemo(() => {
    const adminLocks = tenant?.locks?.admin;
    if (
      !adminLocks ||
      typeof adminLocks !== "object" ||
      Array.isArray(adminLocks)
    ) {
      return false;
    }
    return (adminLocks as Record<string, boolean>)[page] === true;
  }, [tenant?.locks?.admin, page]);

  return { isLocked };
}
