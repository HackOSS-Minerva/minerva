"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RiCheckboxCircleLine as CheckCircle2, RiCloseLine as X } from "@remixicon/react";

interface ScheduleValidationSuccessProps {
  totalCount: number;
}

export const ScheduleValidationSuccess = ({ totalCount }: ScheduleValidationSuccessProps) => {
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
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {totalCount > 0
                ? `All ${totalCount} Google Calendar events passed.`
                : "No events were found in Google Calendar."}
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
};
