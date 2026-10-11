import { z } from "zod";
import type {
  GoogleEvent,
  IncompleteScheduleEvent,
  MissingScheduleField,
} from "@/types/calendar";

/** A single entry of a day-grouped event selector. */
export interface ScheduleEventOption {
  value: string;
  label: string;
  group: string;
}

/** Weekday label in the event's own time zone (defaults to Eastern if absent). */
export function getDayOfWeek(dateTime?: string, timeZone?: string): string {
  if (!dateTime) return "N/A";
  try {
    // If all-day event, formatting with timeZone="UTC" preserves
    // date without shifting backwards due to local timezone offset.
    const isDateOnly = !dateTime.includes("T");
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: isDateOnly ? "UTC" : timeZone || undefined,
    });
  } catch {
    return "N/A";
  }
}

/** Group events into `[dayLabel, options]` for grouped `<Select>`, API order kept. */
export function groupEventsByDay(
  events: readonly GoogleEvent[],
): [string, ScheduleEventOption[]][] {
  const groups = new Map<string, ScheduleEventOption[]>();

  for (const event of events) {
    const dateTime = event.start?.dateTime ?? event.start?.date;
    const group = dateTime
      ? getDayOfWeek(dateTime, event.start?.timeZone ?? "America/Los_Angeles")
      : "Unscheduled";
    const options = groups.get(group) ?? [];
    options.push({
      value: event.id,
      label: event.summary?.trim() || "Untitled Event",
      group,
    });
    groups.set(group, options);
  }

  return Array.from(groups.entries());
}

/**
 * Zod schema defining the required completeness criteria for a Google Calendar event:
 * - Date & Time (`start`): valid dateTime string (timed event) OR valid date string (all-day event)
 */
const nonBlankString = z.string().trim().min(1);

export const scheduleEventStartSchema = z
  .object({
    dateTime: z.string().optional(),
    date: z.string().optional(),
    timeZone: z.string().optional(),
  })
  .optional()
  .superRefine((start, ctx) => {
    const hasValidDateTime = Boolean(
      start?.dateTime && !isNaN(new Date(start.dateTime).getTime()),
    );
    const hasValidDateOnly = Boolean(
      start?.date && !isNaN(new Date(start.date).getTime()),
    );

    const hasValidSchedule = hasValidDateTime || hasValidDateOnly;

    if (!hasValidSchedule) {
      ctx.addIssue({
        code: "custom",
        message: "Date is required and must be valid",
        path: ["date"],
      });
      ctx.addIssue({
        code: "custom",
        message: "Time is required (timed or all-day)",
        path: ["time"],
      });
    }
  });

export const scheduleEventSchema = z.object({
  summary: nonBlankString,
  description: nonBlankString,
  location: nonBlankString,
  start: scheduleEventStartSchema,
});

export type ValidatedScheduleEvent = z.infer<typeof scheduleEventSchema>;

/**
 * Validates a Google Calendar event against `scheduleEventSchema`.
 * Returns an array of any missing field names (Title, Description, Date, Time, Location).
 */
export function checkEventCompleteness(
  event: GoogleEvent,
): MissingScheduleField[] {
  const result = scheduleEventSchema.safeParse(event);
  if (result.success) {
    return [];
  }

  const missing = new Set<MissingScheduleField>();

  for (const issue of result.error.issues) {
    const rootField = issue.path[0];
    if (rootField === "summary") missing.add("Title");
    else if (rootField === "description") missing.add("Description");
    else if (rootField === "location") missing.add("Location");
    else if (rootField === "start") {
      const startField = issue.path[1];
      if (startField === "date") missing.add("Date");
      if (startField === "time") missing.add("Time");
    }
  }

  const orderedFields: MissingScheduleField[] = [
    "Title",
    "Description",
    "Date",
    "Time",
    "Location",
  ];

  return orderedFields.filter((field) => missing.has(field));
}

export function getIncompleteScheduleEvents(
  events: readonly GoogleEvent[],
): IncompleteScheduleEvent[] {
  const incomplete: IncompleteScheduleEvent[] = [];

  for (const event of events) {
    const missingFields = checkEventCompleteness(event);
    if (missingFields.length > 0) {
      incomplete.push({
        event,
        id: event.id,
        title: event.summary?.trim() || "(Untitled Event)",
        missingFields,
      });
    }
  }

  return incomplete;
}
