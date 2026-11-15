import type { TenantSlug } from "@/hooks/get-tenant";
import type { UserRole } from "@/data/information";

export type EmailType = "CONFIRMATION" | "ACCEPTANCE" | "REJECTION";

export type EmailRole = UserRole;

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
