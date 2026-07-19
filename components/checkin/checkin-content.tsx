"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useZxing } from "react-zxing";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useSchedule } from "@/hooks/use-schedule";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import { UserCheck } from "lucide-react";
import { trackCheckinCompleted } from "@/lib/posthog";

interface DecodedQR {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
}

const CheckinContent = () => {
  const anchor = useComboboxAnchor();
  const params = useParams<{ tenant: string }>();
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [lastScan, setLastScan] = useState<DecodedQR | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [inputValue, setInputValue] = React.useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const isSelecting = React.useRef(false);

  const { data: schedule, isLoading, isError, error } = useSchedule();
  const doCheckin = useMutation(api.checkins.checkin);

  const tenant = params.tenant;

  const events = schedule?.items?.filter((event) => event.summary) ?? [];
  const isPaused = !selectedEventId;

  const getDayOfWeek = (dateTime: string, timeZone: string): string => {
    return new Date(dateTime).toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: timeZone,
    });
  };

  // Build filter options grouped by day, matching toolbar pattern
  const allFilterOptions = React.useMemo(() => {
    return events.map((event) => {
      const day = getDayOfWeek(
        event.start.dateTime,
        event.start.timeZone ?? "America/New_York",
      );
      return {
        value: event.id,
        label: event.summary,
        group: day,
      };
    });
  }, [events]);

  // Filter options based on input value
  const filteredOptions = React.useMemo(() => {
    if (!inputValue) return allFilterOptions;
    const q = inputValue.toLowerCase();
    return allFilterOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.group.toLowerCase().includes(q),
    );
  }, [inputValue, allFilterOptions]);

  // Group options for rendering
  const groupedOptions = React.useMemo(() => {
    const map = new Map<string, typeof allFilterOptions>();
    for (const opt of filteredOptions) {
      const group = map.get(opt.group) ?? [];
      group.push(opt);
      map.set(opt.group, group);
    }
    return Array.from(map.entries());
  }, [filteredOptions]);

  const onDecodeResult = useCallback(
    async (result: { getText: () => string }) => {
      try {
        const raw = result.getText();
        const parsed: DecodedQR = JSON.parse(raw);

        if (!parsed.id || !parsed.firstname || !parsed.lastname) {
          toast.error("Invalid QR code format");
          return;
        }

        if (!selectedEventId) {
          toast.error("No event selected", {
            description: "Please select an event before scanning",
          });
          return;
        }

        setLastScan(parsed);
        setScanError(null);
        setIsCheckingIn(true);

        try {
          const checkin = await doCheckin({
            userid: parsed.id,
            eventid: selectedEventId,
            firstname: parsed.firstname,
            lastname: parsed.lastname,
            email: parsed.email,
            tenant,
          });

          const checkedInRole = checkin.checkin.role.toLowerCase();
          const analyticsRole = [
            "participant",
            "judge",
            "speaker",
            "volunteer",
            "visitor",
          ].includes(checkedInRole)
            ? (checkedInRole as
                | "participant"
                | "judge"
                | "speaker"
                | "volunteer"
                | "visitor")
            : "visitor";
          trackCheckinCompleted({ tenant, role: analyticsRole });

          toast.success(`Checked in: ${parsed.firstname} ${parsed.lastname}`, {
            description: parsed.email,
            icon: <UserCheck className="h-4 w-4" />,
          });

          // Auto-reset after 3 seconds (only on success)
          setTimeout(() => {
            setLastScan(null);
          }, 3000);
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Check-in failed";
          if (message.includes("User already checked into this event")) {
            toast("Note: User is already checked in", {
              description: `${parsed.firstname} ${parsed.lastname}`,
              icon: <UserCheck className="h-4 w-4" />,
            });
          } else {
            toast.error(message, {
              description: `${parsed.firstname} ${parsed.lastname}`,
            });
          }
          setLastScan(null);
        } finally {
          setIsCheckingIn(false);
        }
      } catch {
        toast.error("Failed to read QR code. Please try again.");
        setScanError("Invalid QR data");
      }
    },
    [doCheckin, selectedEventId, tenant],
  );

  const onDecodeError = useCallback(() => {
    // Decode errors are expected during normal scanning (frames without a code)
    // We don't need to show these to the user
  }, []);

  const onError = useCallback((err: unknown) => {
    const message = err instanceof Error ? err.message : "Unknown camera error";
    toast.error(`Camera error: ${message}`);
    setScanError(message);
  }, []);

  const { ref } = useZxing({
    onDecodeResult,
    onDecodeError,
    onError,
    paused: isPaused,
    constraints: {
      video: { facingMode: "environment" },
      audio: false,
    },
  });

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-6 px-4 lg:px-6">
        <div className="h-9 w-32 animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
        <div className="aspect-[4/3] w-full animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  // --- Error state ---
  if (isError) {
    return (
      <div className="flex h-full flex-col gap-6 px-4 lg:px-6">
        <span className="text-2xl font-bold">Checkin</span>
        <div className="rounded-lg border border-destructive/50 p-4">
          <p className="text-lg font-semibold text-destructive">
            Failed to load events
          </p>
          <p className="text-sm text-muted-foreground">
            {(error as Error)?.message ?? "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6 px-4 lg:px-6">
      {/* Event selector - toolbar style */}
      <Combobox
        value={selectedEventId}
        onValueChange={(value: string | null) => {
          setSelectedEventId(value ?? "");
          setInputValue("");
          isSelecting.current = true;
        }}
        onInputValueChange={(value: string) => {
          if (isSelecting.current) {
            isSelecting.current = false;
            return;
          }
          setInputValue(value);
        }}
        filteredItems={filteredOptions}
      >
        <ComboboxChips ref={anchor} className="w-full min-w-0">
          <ComboboxValue>
            {(value: string) => {
              if (!value) return null;
              const option = allFilterOptions.find((o) => o.value === value);
              const label = option?.label ?? value;
              const group = option?.group ?? "";

              return (
                <ComboboxChip key={value}>
                  {group ? `${group}: ${label}` : label}
                </ComboboxChip>
              );
            }}
          </ComboboxValue>
          <ComboboxChipsInput
            placeholder={
              events.length > 0 ? "Select an event..." : "No events available"
            }
          />
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No events found.</ComboboxEmpty>
          <ComboboxList>
            {groupedOptions.map(([groupLabel, options]) => (
              <ComboboxGroup key={groupLabel}>
                <ComboboxLabel>{groupLabel}</ComboboxLabel>
                {options.map((opt) => (
                  <ComboboxItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {/* QR Scanner */}
      <div className="rounded-lg border bg-muted p-3">
        {isPaused ? (
          <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 text-muted-foreground">
            <span className="text-sm font-medium">Scanner paused</span>
            <span className="text-xs">Select an event to start scanning</span>
          </div>
        ) : (
          <video
            ref={ref}
            className="aspect-[4/3] w-full object-cover -scale-x-100"
          />
        )}
      </div>

      {/* Scan result */}
      {lastScan && (
        <div className="flex items-center gap-3 rounded-lg border border-green-500/50 bg-green-50 p-4 dark:bg-green-950/20">
          <UserCheck className="h-6 w-6 shrink-0 text-green-600" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-green-700 dark:text-green-400">
              {lastScan.firstname} {lastScan.lastname}
            </p>
            <p className="truncate text-sm text-green-600/80 dark:text-green-500/80">
              {lastScan.email}
            </p>
          </div>
          <Badge
            variant="outline"
            className="shrink-0 border-green-500 text-green-700 dark:text-green-400"
          >
            Checked in
          </Badge>
        </div>
      )}

      {scanError && !lastScan && (
        <p className="text-sm text-destructive">{scanError}</p>
      )}
    </div>
  );
};

export default CheckinContent;
