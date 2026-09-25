import { getTenant } from "@/hooks/get-tenant";

/**
 * Server-safe lock config lookup. Admin locks are simple booleans stored in
 * the tenant config under `locks.admin[page]`; missing entries are unlocked.
 * All admin pages are unlocked in dev (`next dev`) so local development never
 * hits a lock screen; production still enforces the tenant config.
 */
export function getAdminPageLock(tenant: string, page: string): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  const adminLocks = getTenant(tenant).config?.locks?.admin;
  if (
    !adminLocks ||
    typeof adminLocks !== "object" ||
    Array.isArray(adminLocks)
  ) {
    return false;
  }
  return (adminLocks as Record<string, boolean>)[page] === true;
}
