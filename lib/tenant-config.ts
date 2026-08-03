import designverse from "@/tenants/designverse/designverse.json";

export const tenantSlugs = ["designverse"] as const;
export type TenantSlug = (typeof tenantSlugs)[number];

export interface TenantConfig {
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
    event: {
      ...designverse.event,
      deadline: designverse.event.submission.deadline,
    },
  },
};

export function getTenantConfig(slug: TenantSlug): TenantConfig;
export function getTenantConfig(slug: string): TenantConfig | undefined;
export function getTenantConfig(slug: string): TenantConfig | undefined {
  return tenantConfigs[slug as TenantSlug];
}
