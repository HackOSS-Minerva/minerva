"use client";

import { useQuery } from "@tanstack/react-query";
import type { AnalyticsData } from "@/lib/posthog";

export function useAnalytics(tenant: string) {
  return useQuery({
    queryKey: ["analytics", tenant],
    queryFn: async (): Promise<AnalyticsData> => {
      const response = await fetch(
        `/api/analytics?tenant=${encodeURIComponent(tenant)}`,
      );

      if (!response.ok) throw new Error("Failed to load analytics");
      return response.json();
    },
    staleTime: 60_000,
    retry: 1,
  });
}
