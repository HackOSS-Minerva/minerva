"use client";

import { useQuery } from "@tanstack/react-query";
import type { CalendarResponse } from "@/types/calendar";
import { useParams } from "next/navigation";
import { getTenant, type TenantSlug } from "./get-tenant";
import { AppError } from "@/lib/app-error";
import {
  buildScheduleUrl,
  SCHEDULE_RETRY_COUNT,
  SCHEDULE_STALE_MS,
} from "@/lib/schedule";

export const useSchedule = (initialData?: CalendarResponse) => {
  const { tenant } = useParams<{ tenant: TenantSlug }>();
  const { config } = getTenant(tenant);

  const fetchEvents = async (): Promise<CalendarResponse> => {
    if (!config) {
      throw new AppError("TENANT_INVALID");
    }

    const response = await fetch(
      buildScheduleUrl(
        config.calendarid,
        process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY ?? "",
      ),
      { method: "GET" },
    );

    if (!response.ok) {
      throw new AppError("CALENDAR_UNAVAILABLE");
    }

    return response.json();
  };

  return useQuery({
    queryKey: ["schedule", tenant],
    queryFn: fetchEvents,
    enabled: Boolean(config),
    // SSR'd payload from the server page: first paint without a waterfall,
    // then React Query revalidates in the background.
    initialData,
    staleTime: SCHEDULE_STALE_MS, // 5 minutes
    retry: SCHEDULE_RETRY_COUNT,
  });
};
