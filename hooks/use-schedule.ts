"use client";

import { useQuery } from "@tanstack/react-query";
import type { CalendarResponse } from "@/types/calendar";
import config from "@/tenants/designverse/designverse.json";

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

export const useSchedule = () => {
  return useQuery({
    queryKey: ["schedule"],
    queryFn: fetchEvents,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
