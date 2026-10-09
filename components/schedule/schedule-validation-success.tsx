"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X } from "lucide-react";

interface ScheduleValidationSuccessProps {
  totalCount: number;
}

export function ScheduleValidationSuccess({
  totalCount,
}: ScheduleValidationSuccessProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-xs dark:border-emerald-500/20 dark:bg-emerald-500/10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <CheckCircle2 className="size-4.5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">
                Schedule Validation Passed
              </h3>
              <Badge className="border-emerald-500/30 bg-emerald-500/10 font-semibold text-emerald-700 text-xs hover:bg-emerald-500/15 dark:text-emerald-300">
                {totalCount > 0
                  ? `All ${totalCount} Events Valid`
                  : "Validation Complete"}
              </Badge>
            </div>
            <p className="mt-1 text-muted-foreground text-sm">
              {totalCount > 0
                ? `Validation ran successfully on page load. All ${totalCount} Google Calendar events have a valid Title, description, date, time, and location.`
                : "Validation ran on page load. No events were found in Google Calendar."}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDismissed(true)}
          className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss notification"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
