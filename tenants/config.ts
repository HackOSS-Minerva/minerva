import cutiehack from "./cutiehack/cutiehack.json";
import designverse from "./designverse/designverse.json";
import rosehack from "./rosehack/rosehack.json";

// Keep config separate from the MDX content registry so Convex can consume it.
export const tenantConfigs = { cutiehack, designverse, rosehack };
export const tenantSlugs = ["cutiehack", "designverse", "rosehack"] as const;
export type TenantSlug = (typeof tenantSlugs)[number];

export const isTenantSlug = (slug: string): slug is TenantSlug =>
  tenantSlugs.includes(slug as TenantSlug);
