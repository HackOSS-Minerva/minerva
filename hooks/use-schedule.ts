"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import type { CalendarResponse } from "@/types/calendar";
import designverse from "@/tenants/designverse/designverse.json";
import cutiehack from "@/tenants/cutiehack/cutiehack.json";

type tenantSlug = "designverse" | "cutiehack";

export const useSchedule = () => {
  const { tenant } = useParams<{ tenant: tenantSlug }>();
  const configs: Record<string, typeof designverse | typeof cutiehack> = {
    designverse,
    cutiehack,
  };
  const config = configs[tenant] ?? designverse;

  const fetchEvents = async (): Promise<CalendarResponse> => {
    console.log();

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
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
