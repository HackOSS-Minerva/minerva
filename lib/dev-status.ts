import type { ApplicationStatus } from "@/components/portal/dashboard/application-status-badge";
import { BYPASS_AUTH_IN_DEV } from "@/lib/dev-bypass";

export const getDevStatusOverride = (
  value: string | undefined,
  actualStatus: ApplicationStatus,
): ApplicationStatus => {
  if (!BYPASS_AUTH_IN_DEV) return actualStatus;
  if (value === "NONE") return null;
  if (value === "ACCEPTANCE" || value === "PENDING" || value === "REJECTION") return value;
  return actualStatus;
};
