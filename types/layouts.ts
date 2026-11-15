import type { TenantSlug } from "@/hooks/get-tenant";

export type LayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export type TenantPageProps = Readonly<{
  params: Promise<{
    tenant: TenantSlug;
  }>;
}>;
