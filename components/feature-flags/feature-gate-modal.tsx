"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConstructionIcon, LockIcon } from "lucide-react";

/**
 * Blocking modal shown when a page's content is gated:
 * - `"locked"` — the admin portal page is locked via the boolean
 *   `locks.admin` entry in the tenant config (see `lib/admin-locks.ts`).
 * - `"disabled"` — the page's feature flag is disabled (see
 *   `lib/feature-flags.ts`).
 */
export type FeatureGateReason = "locked" | "disabled";

const COPY: Record<
  FeatureGateReason,
  {
    icon: typeof LockIcon;
    iconClassName: string;
    title: string;
    description: string;
    note: string;
  }
> = {
  locked: {
    icon: LockIcon,
    iconClassName: "h-5 w-5 text-amber-500",
    title: "Feature Not Enabled",
    description:
      "This page has been enabled by the developers and is not currently available.",
    note: "Please contact the developers if you believe you need access.",
  },
  disabled: {
    icon: ConstructionIcon,
    iconClassName: "h-5 w-5 text-muted-foreground",
    title: "Feature Not Available",
    description: "This feature isn't enabled for this event yet.",
    note: "Check back soon.",
  },
};

interface FeatureGateModalProps {
  reason: FeatureGateReason;
  open?: boolean;
}

export function FeatureGateModal({
  reason,
  open = true,
}: FeatureGateModalProps) {
  const copy = COPY[reason];
  const Icon = copy.icon;

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" showClose={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={copy.iconClassName} />
            {copy.title}
          </DialogTitle>
          <DialogDescription asChild className="space-y-2">
            <div>
              {copy.description}
              <div className="flex items-center gap-2 rounded-md bg-muted/50 p-3 text-sm">
                <LockIcon className="h-4 w-4 text-muted-foreground" />
                <span>{copy.note}</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
