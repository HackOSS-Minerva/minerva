"use client";

import { useState } from "react";
import { Check, Clock, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEmail } from "@/hooks/use-email";
import { logAppError } from "@/lib/app-error";
import { toastAppError } from "@/hooks/use-app-error";
import type { EmailRole, EmailType } from "@/types/email";
import type { Table } from "@tanstack/react-table";

type DecisionStatus = Exclude<EmailType, "CONFIRMATION"> | "PENDING";

/**
 * Shape StatusActions needs from a table row. Only applicant dashboards
 * (participants/judges/speakers/superadmins/volunteers) render this component,
 * so person fields are guaranteed at runtime — but the table itself is generic
 * over every dashboard row type, hence the optional fields here.
 */
export interface ApplicantRow {
  _id: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  status?: DecisionStatus;
}

interface StatusActionsProps<T extends ApplicantRow> {
  table: Table<T>;
  role: EmailRole;
  onSuccess: () => void;
}

export function StatusActions<T extends ApplicantRow>({
  table,
  role,
  onSuccess,
}: StatusActionsProps<T>) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { sendEmail } = useEmail();
  const selectedCount = table.getSelectedRowModel().rows.length;

  const updateStatus = async (status: DecisionStatus) => {
    const selectedUsers = table
      .getSelectedRowModel()
      .rows.map((row) => row.original)
      .filter((user) => user.status !== status);

    if (selectedUsers.length === 0) {
      toast.info(`Selected applicants are already ${status.toLowerCase()}.`);
      return;
    }

    const setStatusMany = table.options.meta?.setStatusMany;
    if (!setStatusMany) {
      toast.error("Status updates are unavailable.");
      return;
    }

    setIsUpdating(true);

    try {
      await setStatusMany({
        ids: selectedUsers.map((user) => user._id),
        status,
      });

      if (status === "PENDING") {
        toast.success(
          `Updated ${selectedUsers.length} applicant(s) to pending.`,
        );
      } else {
        const emailResults = await Promise.allSettled(
          selectedUsers.map((user) =>
            sendEmail({
              type: status,
              role,
              user: {
                firstname: user.firstname ?? "",
                lastname: user.lastname ?? "",
                email: user.email ?? "",
              },
              idempotencyKey: `${user._id}:${status}`,
            }),
          ),
        );
        const failedCount = emailResults.filter(
          (result) => result.status === "rejected",
        ).length;

        if (failedCount > 0) {
          toast.warning(
            `Statuses updated, but ${failedCount} email(s) could not be sent.`,
          );
        } else {
          toast.success(
            `Updated ${selectedUsers.length} applicant(s) and sent their emails.`,
          );
        }
      }

      onSuccess();
    } catch (error) {
      logAppError({ route: "status-actions", error, requestId: "client" });
      toastAppError(error, "Failed to update applicant statuses.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Accept"
            onClick={() => void updateStatus("ACCEPTANCE")}
            disabled={selectedCount === 0 || isUpdating}
            className="cursor-pointer border-green-500 text-green-500 transition-all hover:scale-105 hover:bg-green-500 hover:text-white hover:shadow-md hover:shadow-green-500/25 active:scale-95"
          >
            <Check />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Accept</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Waitlist"
            onClick={() => void updateStatus("PENDING")}
            disabled={selectedCount === 0 || isUpdating}
            className="cursor-pointer border-yellow-500 text-yellow-500 transition-all hover:scale-105 hover:bg-yellow-500 hover:text-white hover:shadow-md hover:shadow-yellow-500/25 active:scale-95"
          >
            <Clock />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Waitlist</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Reject"
            onClick={() => void updateStatus("REJECTION")}
            disabled={selectedCount === 0 || isUpdating}
            className="cursor-pointer border-red-500 text-red-500 transition-all hover:scale-105 hover:bg-red-500 hover:text-white hover:shadow-md hover:shadow-red-500/25 active:scale-95"
          >
            <X />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Reject</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
