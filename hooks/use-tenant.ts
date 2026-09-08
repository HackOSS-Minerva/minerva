"use client";

import { useParams } from "next/navigation";
import { getTenant, type TenantSlug } from "./get-tenant";

export const useTenant = () => {
  const { tenant: slug } = useParams<{ tenant: TenantSlug }>();
  const { config, headers, markdown } = getTenant(slug);

  return {
    headers,
    tenant: config,
    name: slug,
    live: config?.event ?? null,
    markdown,
  } as const;
};
