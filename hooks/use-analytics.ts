"use client";

import { useQuery } from "@tanstack/react-query";
import type { AnalyticsData } from "@/lib/posthog";
import { parseAppError } from "@/lib/app-error";
import type { TenantSlug } from "@/hooks/get-tenant";
export const useAnalytics = (tenant: TenantSlug) => {

}`);

      if (!response.ok) throw await parseAppError(response, "ANALYTICS_UNAVAILABLE");
      return response.json();
    },
  });
}
