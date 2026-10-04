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
    openOffset?: string;
  };
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

export interface TenantData {
  config: TenantConfig;
  headers: TenantContent["headers"];
  markdown: TenantContent["markdown"];
}

// Resolves a validated slug to its config and MDX content (always complete).
// Validate untrusted strings with `isTenantSlug` before calling this.
export function getTenant(slug: TenantSlug): TenantData {
  return {
    config: typedTenantConfigs[slug],
    headers: tenantContent[slug].headers,
    markdown: tenantContent[slug].markdown,
  };
}
