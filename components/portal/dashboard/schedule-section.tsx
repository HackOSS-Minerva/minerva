"use client";

import { useState, useMemo } from "react";
import { useSchedule } from "@/hooks/use-schedule";
import type { CalendarResponse } from "@/types/calendar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useCountdown } from "@/hooks/use-countdown";
import { IconClock, IconSearch } from "@tabler/icons-react";

interface ScheduleSectionProps {
  /** SSR'd calendar payload from the server page — used as React Query
   * `initialData` so first paint has no client fetch waterfall. */
  initialData?: CalendarResponse;
}

// Client island: search / day tabs / countdown need browser state. Data
// itself is SSR'd by the page and passed as `initialData`.
export function ScheduleSection({ initialData }: ScheduleSectionProps) {
  const { data, isLoading, isError, error } = useSchedule(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [showPastEvents, setShowPastEvents] = useState(false);

  const [now] = useState(Date.now);

  const getEventTimestamp = (
    point?: { dateTime?: string; date?: string },
    isEnd = false,
  ) => {
    if (!point) return 0;
    if (point.dateTime) return new Date(point.dateTime).getTime();
    if (point.date) {
      return new Date(
        `${point.date}T${isEnd ? "23:59:59" : "00:00:00"}`,
      ).getTime();
    }
    return 0;
  };

  const getCurrentAndNextEvents = () => {
    if (!data?.items) return { current: null, next: null };

    const sorted = [...data.items].sort(
      (a, b) => getEventTimestamp(a.start) - getEventTimestamp(b.start),
    );

    let current = null;
    let next = null;

    for (const event of sorted) {
      const start = getEventTimestamp(event.start);
      const end = getEventTimestamp(event.end, true);

      if (now >= start && now <= end) {
        current = event;
      } else if (start > now && !next) {
        next = event;
      }
    }

    return { current, next };
  };

  const { current, next } = getCurrentAndNextEvents();
  const nextStartTime = next?.start?.dateTime
    ? next.start.dateTime
    : next?.start?.date
      ? `${next.start.date}T00:00:00`
      : null;
  const nextEventCountdown = useCountdown(
    nextStartTime ? new Date(nextStartTime) : null,
  );

  const formatTime = (dateTime?: string, timeZone?: string) => {
    if (!dateTime) return "All Day";
    return new Date(dateTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timeZone || undefined,
    });
  };

  const formatEventTimes = (
    start?: { dateTime?: string; date?: string; timeZone?: string },
    end?: { dateTime?: string; date?: string; timeZone?: string },
  ) => {
    if (!start?.dateTime) return "All Day";
    return `${formatTime(start.dateTime, start.timeZone)} – ${formatTime(end?.dateTime, end?.timeZone)}`;
  };

  const getEventDayLabel = (dateTime?: string) => {
    if (!dateTime) return "Unknown";
    const isDateOnly = !dateTime.includes("T");
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return "Unknown";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: isDateOnly ? "UTC" : undefined,
    });
  };

  const formatDayButtonLabel = (dateTime?: string) => {
    if (!dateTime) return "Unknown";
    const isDateOnly = !dateTime.includes("T");
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return "Unknown";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: isDateOnly ? "UTC" : undefined,
    });
  };

  const uniqueDays = useMemo(() => {
    if (!data?.items) return [];
    const days = [
      ...new Set(
        data.items.map((e) =>
          getEventDayLabel(e.start?.dateTime ?? e.start?.date),
        ),
      ),
    ];
    return days;
  }, [data]);

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter((event) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        event.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ??
          false);

      const matchesDay =
        selectedDay === "all" ||
        getEventDayLabel(event.start?.dateTime ?? event.start?.date) ===
          selectedDay;

      return matchesSearch && matchesDay;
    });
  }, [data, searchQuery, selectedDay]);

  const filteredCurrent = current
    ? filteredItems.find((e) => e.id === current.id) || null
    : null;
  const filteredNext = next
    ? filteredItems.find((e) => e.id === next.id) || null
    : null;

  if (isLoading) {
    return (
      <div>
        <h2 className="mb-4 text-lg font-semibold">Schedule</h2>
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h2 className="mb-4 text-lg font-semibold">Schedule</h2>
        <p className="text-sm text-destructive">
          Failed to load schedule:{" "}
          {(error as Error)?.message ?? "Unknown error"}
        </p>
      </div>
    );
  }

  const otherEvents = filteredItems.filter(
    (e) => e.id !== filteredCurrent?.id && e.id !== filteredNext?.id,
  );

  const pastEvents = otherEvents.filter((event) => {
    const end = getEventTimestamp(event.end);
    return now > end;
  });

  const upcomingEvents = otherEvents.filter((event) => {
    const end = getEventTimestamp(event.end);
    return now <= end;
  });

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Schedule</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {uniqueDays.length > 1 && (
          <Tabs value={selectedDay} onValueChange={setSelectedDay}>
            <TabsList className="flex-wrap">
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
              {uniqueDays.map((day) => (
                <TabsTrigger key={day} value={day} className="text-xs">
                  {formatDayButtonLabel(
                    data?.items.find(
                      (e) =>
                        getEventDayLabel(e.start?.dateTime ?? e.start?.date) ===
                        day,
                    )?.start?.dateTime ??
                      data?.items.find(
                        (e) =>
                          getEventDayLabel(
                            e.start?.dateTime ?? e.start?.date,
                          ) === day,
                      )?.start?.date ??
                      day,
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {filteredCurrent && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Now
              </span>
            </div>
            <h3 className="font-semibold">{filteredCurrent.summary}</h3>
            <p className="text-sm text-muted-foreground">
              {formatEventTimes(filteredCurrent.start, filteredCurrent.end)}
            </p>
            {filteredCurrent.location && (
              <p className="mt-1 text-xs text-muted-foreground">
                📍 {filteredCurrent.location}
              </p>
            )}
          </div>
        )}

        {filteredNext && (
          <div className="rounded-lg border p-4">
            <div className="mb-1 flex items-center gap-2">
              <IconClock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Up Next
              </span>
              {nextEventCountdown && (
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  {nextEventCountdown.hours > 0
                    ? `${nextEventCountdown.hours}h `
                    : ""}
                  {nextEventCountdown.minutes}m {nextEventCountdown.seconds}s
                </Badge>
              )}
            </div>
            <h3 className="font-semibold">{filteredNext.summary}</h3>
            <p className="text-sm text-muted-foreground">
              {formatEventTimes(filteredNext.start, filteredNext.end)}
            </p>
            {filteredNext.location && (
              <p className="mt-1 text-xs text-muted-foreground">
                📍 {filteredNext.location}
              </p>
            )}
          </div>
        )}

        {!filteredCurrent && !filteredNext && upcomingEvents.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No upcoming events.
          </p>
        )}

        {upcomingEvents.length > 0 && (
          <div className="mt-3 space-y-2">
            {upcomingEvents
              .sort(
                (a, b) =>
                  getEventTimestamp(a.start) - getEventTimestamp(b.start),
              )
              .map((event) => (
                <div key={event.id} className="rounded-lg border p-3">
                  <h4 className="text-sm font-medium">{event.summary}</h4>
                  <p className="text-xs text-muted-foreground">
                    {formatEventTimes(event.start, event.end)}
                    {event.location && ` · ${event.location}`}
                  </p>
                </div>
              ))}
          </div>
        )}

        {pastEvents.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPastEvents(!showPastEvents)}
                className="w-full"
              >
                {showPastEvents ? "Hide past events" : "Show past events"}
              </Button>
            </div>
            {showPastEvents && (
              <div className="space-y-2">
                {pastEvents
                  .sort(
                    (a, b) =>
                      getEventTimestamp(a.start) - getEventTimestamp(b.start),
                  )
                  .map((event) => (
                    <div
                      key={event.id}
                      className="rounded-lg border p-3 opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{event.summary}</h4>
                        <Badge variant="outline" className="text-[10px]">
                          Past
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatEventTimes(event.start, event.end)}
                        {event.location && ` · ${event.location}`}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
