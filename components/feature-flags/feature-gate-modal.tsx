"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RiToolsLine, RiLockLine } from "@remixicon/react";

// Blocking modal for gated content: "disabled" (page feature flag, see
// `lib/feature-flags.ts`).
export type FeatureGateReason = "disabled";

const COPY: Record<
  FeatureGateReason,
  {
    icon: typeof RiLockLine;
    iconClassName: string;
    title: string;
    description: string;
    note: string;
  }
> = {
  disabled: {
    icon: RiToolsLine,
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

export function FeatureGateModal({ reason, open = true }: FeatureGateModalProps) {
  const copy = COPY[reason];
  const Icon = copy.icon;

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={copy.iconClassName} />
            {copy.title}
          </DialogTitle>
          <DialogDescription asChild className="space-y-2">
            <div>
              {copy.description}
              <div className="flex items-center gap-2 rounded-md bg-muted/50 p-3 text-sm">
                <RiLockLine className="h-4 w-4 text-muted-foreground" />
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
