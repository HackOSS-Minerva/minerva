import { getTenant } from "@/hooks/get-tenant";
import type { TenantSlug } from "@/hooks/get-tenant";

// Server-safe lock config lookup. Admin locks are booleans in
// `config.locks.admin[page]`; missing entries are unlocked. All pages are
// unlocked in dev, but production still enforces the tenant config.
export function getAdminPageLock(tenant: TenantSlug, page: string): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  const adminLocks = getTenant(tenant).config.locks?.admin;
  if (
    !adminLocks ||
    typeof adminLocks !== "object" ||
    Array.isArray(adminLocks)
  ) {
    return false;
  }
  return (adminLocks as Record<string, boolean>)[page] === true;
}
