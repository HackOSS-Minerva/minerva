import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { TenantSlug } from "@/hooks/get-tenant";

export function useIdeas(tenant: TenantSlug) {
  return useQuery(api.ideas.list, { tenant });
}
