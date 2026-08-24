import designverse from "@/tenants/designverse/designverse.json";
import cutiehack from "@/tenants/cutiehack/cutiehack.json";

export const tenantSlugs = ["designverse", "cutiehack"] as const;
export type TenantSlug = (typeof tenantSlugs)[number];

export interface TenantConfig {
  slug: TenantSlug;
  name: string;
  domain: string;
  discord: string;
  email: string;
  instagram: string;
  linkedin: string;
  devpost?: string;
  heart: string;
  logo: string;
  calendarid: string;
  event: {
    name: string;
    startTime: string;
    endTime: string;
    deadline: string;
    status?: string;
    openOffset?: string;
  };
  locks?: Record<string, string[] | Record<string, string[]>>;
  formLocks?: Record<string, { opens: string; closes: string }>;
}

const tenantConfigs: Record<TenantSlug, TenantConfig> = {
  designverse: {
    ...designverse,
    slug: "designverse",
    event: {
      ...designverse.event,
      deadline: designverse.event.submission.deadline,
    },
  },
  cutiehack: {
    ...cutiehack,
    slug: "cutiehack",
  },
};

export function getTenantConfig(slug: TenantSlug): TenantConfig;
export function getTenantConfig(slug: string): TenantConfig | undefined;
export function getTenantConfig(slug: string): TenantConfig | undefined {
  return tenantConfigs[slug as TenantSlug];
}
