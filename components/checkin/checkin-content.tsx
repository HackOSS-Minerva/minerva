"use client";

import { useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useZxing } from "react-zxing";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useSchedule } from "@/hooks/use-schedule";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RiUserLine } from "@remixicon/react";
import { getUserMessage } from "@/lib/app-error";
import { resolveAppErrorCode, toastAppError } from "@/hooks/use-app-error";
import { groupEventsByDay } from "@/lib/schedule";
import { parseCheckinQr, type CheckinQrPayload } from "@/lib/checkin";
import type { TenantSlug } from "@/hooks/get-tenant";

/** How long the success toast + QR preview stay on screen after a scan. */
const SCAN_RESULT_RESET_MS = 3000;

const CheckinContent = () => {
  const params = useParams<{ tenant: TenantSlug }>();
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [lastScan, setLastScan] = useState<CheckinQrPayload | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [, setIsCheckingIn] = useState(false);

  const { data: schedule, isLoading, isError, error } = useSchedule();
  const doCheckin = useMutation(api.checkins.checkin);

  const tenant = params.tenant;

  const events = useMemo(() => schedule?.items?.filter((event) => event.summary) ?? [], [schedule]);
  const isPaused = !selectedEventId;

  // Grouped options for the event selector
  const groupedEventOptions = useMemo(() => groupEventsByDay(events), [events]);

  const onDecodeResult = useCallback(
    async (result: { getText: () => string }) => {
      try {
        const raw = result.getText();
        const decoded = parseCheckinQr(raw);

        if (!decoded.ok) {
          if (decoded.reason === "legacy-placeholder") {
            // Old builds shipped a hardcoded guest QR; reject it explicitly
            // instead of writing a junk shared `visitor` check-in.
            toast.error("Placeholder QR code", {
              description: "Ask the attendee to reopen their live check-in page for a valid code.",
            });
            setScanError("Placeholder QR code");
          } else {
            toast.error("Invalid QR code format");
            setScanError("Invalid QR code format");
          }
          return;
        }

        if (!selectedEventId) {
          toast.error("No event selected", {
            description: "Please select an event before scanning",
          });
          return;
        }

        const scan = decoded.payload;
        const scanName = [scan.firstname, scan.lastname].filter(Boolean).join(" ");

        setLastScan(scan);
        setScanError(null);
        setIsCheckingIn(true);

        try {
          await doCheckin({
            userid: scan.id,
            eventid: selectedEventId,
            firstname: scan.firstname,
            lastname: scan.lastname,
            email: scan.email,
            tenant,
          });

          toast.success(`Checked in: ${scanName}`, {
            description: scan.email,
            icon: <RiUserLine className="h-4 w-4" />,
          });

          // Auto-reset after the scan window (only on success)
          setTimeout(() => {
            setLastScan(null);
          }, SCAN_RESULT_RESET_MS);
        } catch (err) {
          const code = resolveAppErrorCode(err);
          const message = getUserMessage(code);
          if (code === "VALIDATION_FAILED") {
            toast("Note: User is already checked in", {
              description: scanName,
              icon: <RiUserLine className="h-4 w-4" />,
            });
          } else {
            toastAppError(err, message);
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
      <div className="flex h-full flex-col gap-6">
        <div className="h-9 w-32 animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
        <div className="aspect-4-3 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  // --- Error state ---
  if (isError) {
    return (
      <div className="flex h-full flex-col gap-6">
        <span className="text-2xl font-bold">Checkin</span>
        <div className="rounded-lg border border-destructive/50 p-4">
          <p className="text-lg font-semibold text-destructive">Failed to load events</p>
          <p className="text-sm text-muted-foreground">
            {(error as Error)?.message ?? "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Event selector */}
      <Select value={selectedEventId || undefined} onValueChange={setSelectedEventId}>
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={events.length > 0 ? "Select an event..." : "No events available"}
          />
        </SelectTrigger>
        <SelectContent>
          {groupedEventOptions.map(([groupLabel, options]) => (
            <SelectGroup key={groupLabel}>
              <SelectLabel>{groupLabel}</SelectLabel>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>

      {/* QR Scanner */}
      <div className="rounded-lg border bg-muted p-3">
        {isPaused ? (
          <div className="flex aspect-4-3 flex-col items-center justify-center gap-3 text-muted-foreground">
            <span className="text-sm font-medium">Scanner paused</span>
            <span className="text-xs">Select an event to start scanning</span>
          </div>
        ) : (
          <video ref={ref} className="aspect-4-3 w-full object-cover -scale-100" />
        )}
      </div>

      {/* Scan result */}
      {lastScan && (
        <div className="flex items-center gap-3 rounded-lg border border-green-500/50 bg-green-50 p-4 dark:bg-green-950/20">
          <RiUserLine className="h-6 w-6 shrink-0 text-green-600" />
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

      {scanError && !lastScan && <p className="text-sm text-destructive">{scanError}</p>}
    </div>
  );
};

export default CheckinContent;
