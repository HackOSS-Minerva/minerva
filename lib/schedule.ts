import type { GoogleEvent } from "@/types/calendar";

/** A single entry of a day-grouped event selector. */
export interface ScheduleEventOption {
  value: string;
  label: string;
  group: string;
}

/** Weekday label in the event's own time zone (defaults to Eastern if absent). */
export function getDayOfWeek(dateTime: string, timeZone: string): string {
  return new Date(dateTime).toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: timeZone,
  });
}

/** Group events into `[dayLabel, options]` for grouped `<Select>`, API order kept. */
export function groupEventsByDay(
  events: readonly GoogleEvent[],
): [string, ScheduleEventOption[]][] {
  const groups = new Map<string, ScheduleEventOption[]>();

  for (const event of events) {
    const group = getDayOfWeek(
      event.start.dateTime,
      event.start.timeZone ?? "America/New_York",
    );
    const options = groups.get(group) ?? [];
    options.push({ value: event.id, label: event.summary, group });
    groups.set(group, options);
  }

  return Array.from(groups.entries());
}
