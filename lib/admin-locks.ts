import designverse from "@/tenants/designverse/designverse.json";
import cutiehack from "@/tenants/cutiehack/cutiehack.json";

/**
 * Server-safe lock config lookup. Admin locks are simple booleans stored in
 * the tenant config under `locks.admin[page]`; missing entries are unlocked.
 */
export function getAdminPageLock(tenant: string, page: string): boolean {
  const configs: Record<string, unknown> = { designverse, cutiehack };
  const config = configs[tenant] as
    | { locks?: { admin?: Record<string, boolean> } }
    | undefined;
  return config?.locks?.admin?.[page] === true;
}
