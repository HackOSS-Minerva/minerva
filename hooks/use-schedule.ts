"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  CalendarResponse,
  IncompleteScheduleEvent,
} from "@/types/calendar";
import { useParams } from "next/navigation";
import { getTenant, type TenantSlug } from "./get-tenant";
import { AppError } from "@/lib/app-error";
import { getIncompleteScheduleEvents } from "@/lib/schedule";

export const useSchedule = (initialData?: CalendarResponse) => {
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
    // SSR'd payload from the server page: first paint without a waterfall,
    // then React Query revalidates in the background.
    initialData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};

export const useScheduleValidation = (
  initialData?: CalendarResponse,
): {
  incompleteEvents: IncompleteScheduleEvent[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  totalCount: number;
} => {
  const { data, isLoading, isError, error } = useSchedule(initialData);

  const items = data?.items;
  const incompleteEvents = useMemo(() => {
    if (!items) return [];
    return getIncompleteScheduleEvents(items);
  }, [items]);

  return {
    incompleteEvents,
    isLoading,
    isError,
    error,
    totalCount: data?.items?.length ?? 0,
  };
};
