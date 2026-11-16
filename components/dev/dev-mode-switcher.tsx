"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ApplicationStatus } from "@/components/portal/dashboard/application-status-badge";
import { BYPASS_AUTH_IN_DEV } from "@/lib/dev-bypass";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DevModeRole = "participant" | "judge" | "superadmin";

interface DevModeSwitcherProps {
  role: DevModeRole;
  status: ApplicationStatus;
}

const STATUS_QUERY_PARAM: Record<DevModeRole, string> = {
  participant: "devParticipantStatus",
  judge: "devJudgeStatus",
  superadmin: "devSuperadminStatus",
};

const isApplicationStatus = (value: string | null): value is Exclude<ApplicationStatus, null> =>
  value === "ACCEPTANCE" || value === "PENDING" || value === "REJECTION";

const ROLE_LABEL: Record<DevModeRole, string> = {
  participant: "Participant",
  judge: "Judge",
  superadmin: "Superadmin",
};

export function DevModeSwitcher({ role, status }: DevModeSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryParam = STATUS_QUERY_PARAM[role];
  const queryStatus = searchParams.get(queryParam);
  const selectedStatus = isApplicationStatus(queryStatus)
    ? queryStatus
    : queryStatus === "NONE"
      ? "NONE"
      : (status ?? "REAL");

  if (!BYPASS_AUTH_IN_DEV) return null;

  const updateStatus = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "REAL") {
      params.delete(queryParam);
    } else {
      params.set(queryParam, value);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className="fixed right-4 bottom-4 left-4 z-50 flex w-fit flex-wrap items-center gap-2 rounded-lg border bg-background p-3 shadow-lg">
      <label htmlFor="dev-mode-status" className="text-sm font-medium">
        Dev mode · {ROLE_LABEL[role]}
      </label>
      <Select value={selectedStatus} onValueChange={updateStatus}>
        <SelectTrigger id="dev-mode-status" className="min-w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="REAL">Use actual status</SelectItem>
          <SelectItem value="NONE">Not applied</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="ACCEPTANCE">Accepted</SelectItem>
          <SelectItem value="REJECTION">Rejected</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
