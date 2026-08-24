"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import type { CalendarResponse } from "@/types/calendar";
import { getTenantConfig, type TenantSlug } from "@/lib/tenant-config";

export const useSchedule = () => {
  const { tenant } = useParams<{ tenant: TenantSlug }>();
  const config = getTenantConfig(tenant);

  const fetchEvents = async (): Promise<CalendarResponse> => {
    if (!config) {
      throw new Error("Unknown tenant");
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${config.calendarid}/events?key=${process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY}&singleEvents=true&orderBy=startTime`,
      { method: "GET" },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch calendar events");
    }

    return response.json();
  };

  return useQuery({
    queryKey: ["schedule", tenant],
    queryFn: fetchEvents,
    enabled: Boolean(config),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
