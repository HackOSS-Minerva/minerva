import designverse from "./designverse/designverse.json" with { type: "json" };

export interface LiveInfo {
  name: string;
  status: string;
  startTime: string;
  endTime: string;
  openOffset?: string;
  submission: {
    url: string;
    deadline: string;
    requirements: string;
  };
}

export interface FormLock {
  opens: string;
  closes: string;
}

export interface TenantConfig {
  name: string;
  domain: string;
  discord: string;
  email: string;
  instagram: string;
  linkedin: string;
  heart: string;
  logo: string;
  calendarid: string;
  event?: LiveInfo;
  formLocks?: Record<string, FormLock>;
}

export const tenantConfigByIdentifier = {
  designverse: designverse as TenantConfig,
} as const;

export const tenantIdentifiers = Object.keys(tenantConfigByIdentifier);
