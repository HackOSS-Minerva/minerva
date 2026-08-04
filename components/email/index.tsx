import Acceptance from "./acceptance";
import Confirmation from "./confirmation";
import Rejection from "./rejection";
import type { EmailRole, EmailType } from "@/types/email";
import type { TenantConfig } from "@/lib/tenant-config";

interface EmailProps {
  type: EmailType;
  role: EmailRole;
  name: string;
  tenant: TenantConfig;
}

const copy: Record<EmailType, { preview: string; subject: string }> = {
  CONFIRMATION: {
    preview: "Thank you for applying.",
    subject: "Thank you for applying",
  },
  ACCEPTANCE: {
    preview: "You have been accepted!",
    subject: "You have been accepted!",
  },
  REJECTION: {
    preview: "Application update",
    subject: "Application update",
  },
};

const Email = ({ type, role, name, tenant }: EmailProps) => {
  const position = role === "superadmin" ? "super admin" : role;

  switch (type) {
    case "CONFIRMATION":
      return (
        <Confirmation
          name={name}
          position={position}
          preview={copy.CONFIRMATION.preview}
          tenant={tenant}
        />
      );
    case "ACCEPTANCE":
      return (
        <Acceptance
          name={name}
          position={position}
          preview={copy.ACCEPTANCE.preview}
          tenant={tenant}
        />
      );
    case "REJECTION":
      return (
        <Rejection
          name={name}
          position={position}
          preview={copy.REJECTION.preview}
          tenant={tenant}
        />
      );
    default: {
      const unsupportedType: never = type;
      throw new Error(`Unsupported email type: ${unsupportedType}`);
    }
  }
};

export const getEmailSubject = (type: EmailType) => copy[type].subject;

export default Email;
