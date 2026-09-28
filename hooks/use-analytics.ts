"use client";

import { useQuery } from "@tanstack/react-query";
import type { AnalyticsData } from "@/lib/posthog";
import { parseAppError } from "@/lib/app-error";
import type { TenantSlug } from "@/hooks/get-tenant";

export function useAnalytics(tenant: TenantSlug) {
  return useQuery({
    queryKey: ["analytics", tenant],
    queryFn: async (): Promise<AnalyticsData> => {
      const response = await fetch(
        `/api/analytics?tenant=${encodeURIComponent(tenant)}`,
      );

      if (!response.ok)
        throw await parseAppError(response, "ANALYTICS_UNAVAILABLE");
      return response.json();
    },
  });
}
