"use client";

import { useState, useMemo } from "react";
import { useSchedule } from "@/hooks/use-schedule";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCountdown } from "@/hooks/use-countdown";
import { IconClock, IconSearch } from "@tabler/icons-react";

export function ScheduleSection() {
  const { data, isLoading, isError, error } = useSchedule();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState<string>("all");

  const now = Date.now();

  const getCurrentAndNextEvents = () => {
    if (!data?.items) return { current: null, next: null };

    const sorted = [...data.items].sort(
      (a, b) =>
        new Date(a.start.dateTime).getTime() -
        new Date(b.start.dateTime).getTime(),
    );

    let current = null;
    let next = null;

    for (const event of sorted) {
      const start = new Date(event.start.dateTime).getTime();
      const end = new Date(event.end.dateTime).getTime();

      if (now >= start && now <= end) {
        current = event;
      } else if (start > now && !next) {
        next = event;
      }
    }

    return { current, next };
  };

  const { current, next } = getCurrentAndNextEvents();
  const nextEventCountdown = useCountdown(
    next ? new Date(next.start.dateTime) : null,
  );

  const formatTime = (dateTime: string, timeZone: string) => {
    return new Date(dateTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
    });
  };

  const getEventDayLabel = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatDayButtonLabel = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const uniqueDays = useMemo(() => {
    if (!data?.items) return [];
    const days = [...new Set(data.items.map((e) => getEventDayLabel(e.start.dateTime)))];
    return days;
  }, [data]);

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter((event) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        event.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesDay =
        selectedDay === "all" || getEventDayLabel(event.start.dateTime) === selectedDay;

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
          Failed to load schedule: {(error as Error)?.message ?? "Unknown error"}
        </p>
      </div>
    );
  }

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
                  data?.items.find((e) => getEventDayLabel(e.start.dateTime) === day)
                    ?.start.dateTime ?? day,
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
              {formatTime(filteredCurrent.start.dateTime, filteredCurrent.start.timeZone)} –{" "}
              {formatTime(filteredCurrent.end.dateTime, filteredCurrent.end.timeZone)}
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
              {formatTime(filteredNext.start.dateTime, filteredNext.start.timeZone)} –{" "}
              {formatTime(filteredNext.end.dateTime, filteredNext.end.timeZone)}
            </p>
            {filteredNext.location && (
              <p className="mt-1 text-xs text-muted-foreground">
                📍 {filteredNext.location}
              </p>
            )}
          </div>
        )}

        {!filteredCurrent && !filteredNext && (
          <p className="text-sm text-muted-foreground">No upcoming events.</p>
        )}

        {filteredItems.length > 0 && (
          <div className="mt-3 space-y-2">
              {filteredItems
                .filter(
                  (e) =>
                    e.id !== filteredCurrent?.id &&
                    e.id !== filteredNext?.id,
                )
                .sort(
                  (a, b) =>
                    new Date(a.start.dateTime).getTime() -
                    new Date(b.start.dateTime).getTime(),
                )
                .map((event) => {
                  const start = new Date(event.start.dateTime).getTime();
                  const end = new Date(event.end.dateTime).getTime();
                  const isPast = now > end;
                  return (
                    <div
                      key={event.id}
                      className={`rounded-lg border p-3 ${
                        isPast
                          ? "opacity-50"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{event.summary}</h4>
                        {isPast && (
                          <Badge variant="outline" className="text-[10px]">
                            Past
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(event.start.dateTime, event.start.timeZone)} –{" "}
                        {formatTime(event.end.dateTime, event.end.timeZone)}
                        {event.location && ` · ${event.location}`}
                      </p>
                    </div>
                  );
                })}
            </div>
          )}
      </div>
    </div>
  );
}