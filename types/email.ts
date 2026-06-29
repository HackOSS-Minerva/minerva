export type EmailType = "CONFIRMATION" | "ACCEPTANCE" | "REJECTION";

export type EmailPayload = {
  name: string;
  position: string;
  preview: string;
  type: EmailType;
};
