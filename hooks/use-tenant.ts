"use client";

import { useParams } from "next/navigation";
import { getTenantConfig, type TenantSlug } from "@/lib/tenant-config";
import { getTenantContent } from "@/lib/tenant-content";

export const useTenant = () => {
  const { tenant: slug } = useParams<{ tenant: TenantSlug }>();
  const config = getTenantConfig(slug);
  const content = getTenantContent(slug);

  return {
    headers: content?.headers,
    tenant: config,
    name: slug,
    live: config?.event ?? null,
    markdown: content?.markdown,
  } as const;
};
