import type { TenantSlug } from "@/hooks/get-tenant";

export type EmailType = "CONFIRMATION" | "ACCEPTANCE" | "REJECTION";

export type EmailRole =
  | "judge"
  | "participant"
  | "speaker"
  | "superadmin"
  | "volunteer";

export type EmailRecipient = {
  firstname: string;
  lastname: string;
  email: string;
};

export type SendEmailPayload = {
  type: EmailType;
  role: EmailRole;
  tenant: TenantSlug;
  user: EmailRecipient;
  idempotencyKey: string;
};
