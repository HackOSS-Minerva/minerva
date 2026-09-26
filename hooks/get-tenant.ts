import { tenantConfigs, tenantContent, tenantSlugs } from "@/tenants/generated";

export { tenantSlugs };
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
    gitCommitGraceWindowMinutes?: number;
    openOffset?: string;
  };
  locks?: Record<
    string,
    string[] | boolean | Record<string, string[] | boolean>
  >;
  formLocks?: Record<string, { opens: string; closes: string }>;
}

const typedTenantConfigs = Object.fromEntries<TenantConfig>(
  tenantSlugs.map((slug) => [
    slug,
    { ...tenantConfigs[slug], slug } satisfies TenantConfig,
  ]),
) as Record<TenantSlug, TenantConfig>;

type RegistryContent = (typeof tenantContent)[TenantSlug];
type TenantContent = {
  [Section in keyof RegistryContent]: {
    -readonly [Key in keyof RegistryContent[Section]]: RegistryContent[Section][Key];
  };
};

export const isTenantSlug = (slug: string): slug is TenantSlug =>
  tenantSlugs.includes(slug as TenantSlug);

export function getTenant(slug: TenantSlug): {
  config: TenantConfig;
  headers: TenantContent["headers"];
  markdown: TenantContent["markdown"];
};
export function getTenant(slug: string): {
  config: TenantConfig | undefined;
  headers: TenantContent["headers"] | undefined;
  markdown: TenantContent["markdown"] | undefined;
};
export function getTenant(slug: string): {
  config: TenantConfig | undefined;
  headers: TenantContent["headers"] | undefined;
  markdown: TenantContent["markdown"] | undefined;
} {
  if (!isTenantSlug(slug)) {
    return {
      config: undefined,
      headers: undefined,
      markdown: undefined,
    };
  }

  const config = typedTenantConfigs[slug];
  const content = tenantContent[slug];

  return {
    config,
    headers: content?.headers,
    markdown: content?.markdown,
  } as const;
}
