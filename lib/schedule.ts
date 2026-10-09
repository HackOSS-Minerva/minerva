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
      ? getDayOfWeek(dateTime, event.start?.timeZone ?? "America/New_York")
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
 * Checks if a Google Calendar event contains all required fields:
 * Title, description, date, time, and location.
 * Returns an array of any missing field names.
 */
export function checkEventCompleteness(
  event: GoogleEvent,
): MissingScheduleField[] {
  const missing: MissingScheduleField[] = [];

  // Title: Google Calendar uses 'summary' for the event title
  const summary = (event.summary as string | undefined)?.trim();
  if (!summary) {
    missing.push("Title");
  }

  // Description: Google Calendar event description
  const description = (event.description as string | undefined)?.trim();
  if (!description) {
    missing.push("Description");
  }

  // Date and Time:
  // Google Calendar timed events have start.dateTime (RFC3339 string containing date and time).
  // All-day events have only start.date ("YYYY-MM-DD" date with no time of day).
  const start = event.start as
    | { dateTime?: string; date?: string; timeZone?: string }
    | undefined;

  const hasValidDateTime = Boolean(
    start?.dateTime && !isNaN(new Date(start.dateTime).getTime()),
  );
  const hasValidDateOnly = Boolean(
    start?.date && !isNaN(new Date(start.date).getTime()),
  );

  const hasDate = hasValidDateTime || hasValidDateOnly;
  const hasTime = hasValidDateTime;

  if (!hasDate) {
    missing.push("Date");
  }

  if (!hasTime) {
    missing.push("Time");
  }

  // Location: Google Calendar location
  const location = (event.location as string | undefined)?.trim();
  if (!location) {
    missing.push("Location");
  }

  return missing;
}

/**
 * Parses through a list of Google Calendar events and returns
 * all events that do not have all of (Title, description, date, time, location).
 */
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
