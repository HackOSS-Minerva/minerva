"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { getTenant, type TenantSlug } from "./get-tenant";

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

export function useAdminLock({
  page,
}: UseAdminLockOptions): UseAdminLockResult {
  const { tenant } = useParams<{ tenant: TenantSlug }>();
  const { config } = getTenant(tenant);

  const isLocked = useMemo(() => {
    // Dev-mode unlock: admin sidebar entries never show as locked in `next dev`.
    if (process.env.NODE_ENV !== "production") return false;
    const adminLocks = config?.locks?.admin;
    if (
      !adminLocks ||
      typeof adminLocks !== "object" ||
      Array.isArray(adminLocks)
    ) {
      return false;
    }
    return (adminLocks as Record<string, boolean>)[page] === true;
  }, [config?.locks?.admin, page]);

  return { isLocked };
}
