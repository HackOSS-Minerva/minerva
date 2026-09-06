"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon, LockIcon } from "lucide-react";

interface AdminLockModalProps {
  open?: boolean;
}

/**
 * Blocking modal shown when an admin portal page is locked via
 * the boolean `locks.admin` entry in the tenant config.
 */
export function AdminLockModal({ open = true }: AdminLockModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" showClose={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-amber-500" />
            This Page is Locked
          </DialogTitle>
          <DialogDescription asChild className="space-y-2">
            <div>
              This page has been locked by the event organizers and is not
              currently available.
              <div className="flex items-center gap-2 rounded-md bg-muted/50 p-3 text-sm">
                <LockIcon className="h-4 w-4 text-muted-foreground" />
                <span>
                  Please contact your admin if you believe you need access.
                </span>
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
