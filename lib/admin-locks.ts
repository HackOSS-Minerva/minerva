import { getTenant } from "@/hooks/get-tenant";

/**
 * Server-safe lock config lookup. Admin locks are simple booleans stored in
 * the tenant config under `locks.admin[page]`; missing entries are unlocked.
 */
export function getAdminPageLock(tenant: string, page: string): boolean {
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
