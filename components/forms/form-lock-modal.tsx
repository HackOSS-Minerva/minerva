"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon, ClockIcon } from "lucide-react";
import { useFormLock } from "@/hooks/use-form-lock";
import { toast } from "sonner";

interface FormLockModalProps {
  form: string;
}

export function FormLockModal({ form }: FormLockModalProps) {
  const { isLocked, opensLabel, closesLabel, opensIn } = useFormLock({ form });

  useEffect(() => {
    if (isLocked && opensIn === 0) {
      toast.success("Form is now open! You can proceed.");
    }
  }, [isLocked, opensIn]);

  return (
    <Dialog open={isLocked}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-amber-500" />
            Form Currently Closed
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              This form is not yet open. Please check back during the active
              window.
            </p>
            <div className="flex items-center gap-2 rounded-md bg-muted/50 p-3 text-sm">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              <span>
                {opensLabel ? `Opens ${opensLabel}` : "Opening time TBD"}
                {closesLabel ? ` · Closes ${closesLabel}` : ""}
              </span>
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
