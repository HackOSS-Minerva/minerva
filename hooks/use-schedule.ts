"use client";

import { useQuery } from "@tanstack/react-query";
import type { CalendarResponse } from "@/types/calendar";
import { useParams } from "next/navigation";
import { getTenant, type TenantSlug } from "./get-tenant";
import { AppError } from "@/lib/app-error";

export const useSchedule = () => {
  const { tenant } = useParams<{ tenant: TenantSlug }>();
  const { config } = getTenant(tenant);

  const fetchEvents = async (): Promise<CalendarResponse> => {
    if (!config) {
      throw new AppError("TENANT_INVALID");
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${config.calendarid}/events?key=${process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY}&singleEvents=true&orderBy=startTime`,
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
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
