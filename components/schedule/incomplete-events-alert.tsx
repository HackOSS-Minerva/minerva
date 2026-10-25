"use client";

import { useState } from "react";
import type { IncompleteScheduleEvent, MissingScheduleField } from "@/types/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  RiAlertLine as AlertTriangle,
  RiArrowDropDownLine as ChevronDown,
  RiArrowDropUpLine as ChevronUp,
  RiExternalLinkLine as ExternalLink,
  RiCalendarLine as Calendar,
  RiTimeLine as Clock,
  RiMapPinLine as MapPin,
  RiFileTextLine as FileText,
} from "@remixicon/react";
import { getDayOfWeek } from "@/lib/schedule";

interface IncompleteEventsAlertProps {
  incompleteEvents: IncompleteScheduleEvent[];
}

const FIELD_ICONS: Record<MissingScheduleField, React.ReactNode> = {
  Title: null,
  Description: <FileText className="size-3" />,
  Date: <Calendar className="size-3" />,
  Time: <Clock className="size-3" />,
  Location: <MapPin className="size-3" />,
};

export function IncompleteEventsAlert({ incompleteEvents }: IncompleteEventsAlertProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (incompleteEvents.length === 0) {
    return null;
  }

  const formatEventTime = (dateTime?: string, timeZone?: string) => {
    if (!dateTime) return null;
    try {
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timeZone || undefined,
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 shadow-xs dark:border-amber-500/30 dark:bg-amber-500/10">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <AlertTriangle className="size-4.5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">
                {incompleteEvents.length} Incomplete Event(s) Detected
              </h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Every schedule event must have all of:{" "}
              <span className="font-medium text-foreground">title</span>,{" "}
              <span className="font-medium text-foreground">description</span>,{" "}
              <span className="font-medium text-foreground">date</span>,{" "}
              <span className="font-medium text-foreground">time</span>, and{" "}
              <span className="font-medium text-foreground">location</span>. The events below are
              missing one or more of these fields.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <>
                <span>Hide</span>
                <ChevronUp className="size-3.5" />
              </>
            ) : (
              <>
                <span>View Details</span>
                <ChevronDown className="size-3.5" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Expanded List of Incomplete Events */}
      {isExpanded && (
        <div className="mt-4 space-y-2.5 border-t border-amber-500/20 pt-4">
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {incompleteEvents.map(({ event, id, title, missingFields }) => {
              const startDateTime = event.start?.dateTime;
              const startDate = event.start?.date;
              const timeZone = event.start?.timeZone ?? "America/Los_Angeles";
              const formattedTime = formatEventTime(startDateTime, timeZone);
              const dayLabel = getDayOfWeek(startDateTime ?? startDate, timeZone);

              return (
                <div
                  key={id}
                  className="flex flex-col gap-2 rounded-lg border border-border/60 bg-background/80 p-3 shadow-2xs transition-colors sm:flex-row sm:items-center sm:justify-between dark:bg-card/70"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {missingFields.includes("Title") ? (
                        <Badge
                          variant="destructive"
                          className="h-5 gap-1 px-1.5 text-xs font-medium"
                        >
                          {FIELD_ICONS.Title}
                          Missing Title
                        </Badge>
                      ) : (
                        <span className="text-sm font-semibold text-foreground truncate">
                          {title}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {/* Date & Time display */}
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3 text-muted-foreground/70" />
                        {dayLabel !== "N/A" ? (
                          dayLabel
                        ) : (
                          <Badge
                            variant="destructive"
                            className="h-5 gap-1 px-1.5 text-xs font-medium"
                          >
                            {FIELD_ICONS.Date}
                            Missing Date
                          </Badge>
                        )}
                        {formattedTime ? (
                          ` at ${formattedTime}`
                        ) : startDate ? (
                          " (All Day)"
                        ) : (
                          <Badge
                            variant="destructive"
                            className="h-5 gap-1 px-1.5 text-xs font-medium"
                          >
                            {FIELD_ICONS.Time}
                            Missing Time
                          </Badge>
                        )}
                      </span>

                      {/* Location display */}
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3 text-muted-foreground/70" />
                        {event.location?.trim() ? (
                          <span className="truncate max-w-50">{event.location.trim()}</span>
                        ) : (
                          <Badge
                            variant="destructive"
                            className="h-5 gap-1 px-1.5 text-xs font-medium"
                          >
                            {FIELD_ICONS.Location}
                            Missing Location
                          </Badge>
                        )}
                      </span>

                      {/* Description status */}
                      <span className="flex items-center gap-1">
                        <FileText className="size-3 text-muted-foreground/70" />
                        {event.description?.trim() ? (
                          <span className="truncate max-w-50">{event.description.trim()}</span>
                        ) : (
                          <Badge
                            variant="destructive"
                            className="h-5 gap-1 px-1.5 text-xs font-medium"
                          >
                            {FIELD_ICONS.Description}
                            Missing Description
                          </Badge>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Open in Google Calendar */}
                  {event.htmlLink && (
                    <div className="shrink-0 self-end sm:self-center">
                      <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" asChild>
                        <a href={event.htmlLink} target="_blank" rel="noopener noreferrer">
                          <span>Edit in GCal</span>
                          <ExternalLink className="size-3" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
