"use client";

import { useQuery } from "@tanstack/react-query";
import type { CalendarResponse } from "@/types/calendar";
import { useParams } from "next/navigation";
import { getTenant, type TenantSlug } from "./get-tenant";
import { AppError } from "@/lib/app-error";

export const useSchedule = (initialData?: CalendarResponse) => {
  const { tenant } = useParams<{ tenant: TenantSlug }>();
  const { config } = getTenant(tenant);

  const fetchEvents = async (): Promise<CalendarResponse> => {
    if (!config) {
      throw new AppError("TENANT_INVALID");
    }

    const response = await fetch(
      // `https://www.googleapis.com/calendar/v3/calendars/${config.calendarid}/events?key=${process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY}&singleEvents=true&orderBy=startTime`,
      `https://www.googleapis.com/calendar/v3/calendars/schopra579@gmail.com/events?key=${process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY}&singleEvents=true&orderBy=startTime&timeMin=2026-09-26T00:00:00Z&timeMax=2026-10-03T23:59:59Z`,
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
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
