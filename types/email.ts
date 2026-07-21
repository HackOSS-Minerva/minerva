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
  tenant: string;
  user: EmailRecipient;
  idempotencyKey: string;
};

export type EmailPayload = {
  name: string;
  position: string;
  preview: string;
  type: EmailType;
};
