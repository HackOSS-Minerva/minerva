"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useEmail } from "@/hooks/use-email";
import type { EmailRole, EmailType } from "@/types/email";
import type { Table } from "@tanstack/react-table";

type DecisionStatus = Exclude<EmailType, "CONFIRMATION"> | "PENDING";

interface ApplicantRow {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  status: DecisionStatus;
}

interface StatusActionsProps {
  table: Table<ApplicantRow>;
  role: EmailRole;
  tenant: string;
  onSuccess: () => void;
}

export function StatusActions({
  table,
  role,
  tenant,
  onSuccess,
}: StatusActionsProps) {
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
      await setStatusMany(
        selectedUsers.map((user) => user._id),
        status,
      );

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
              tenant,
              user: {
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
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
      console.error("Failed to update applicant statuses", {
        role,
        tenant,
        status,
        error,
      });
      toast.error("Failed to update applicant statuses.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => void updateStatus("ACCEPTANCE")}
        disabled={selectedCount === 0 || isUpdating}
        className="hover:bg-green-500 hover:text-white"
      >
        Accept
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => void updateStatus("PENDING")}
        disabled={selectedCount === 0 || isUpdating}
      >
        Pending
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => void updateStatus("REJECTION")}
        disabled={selectedCount === 0 || isUpdating}
        className="hover:bg-red-500 hover:text-white"
      >
        Reject
      </Button>
    </div>
  );
}
