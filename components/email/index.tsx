import Acceptance from "./acceptance";
import Confirmation from "./confirmation";
import Rejection from "./rejection";
import type { EmailRole, EmailType } from "@/types/email";

interface EmailProps {
  type: EmailType;
  role: EmailRole;
  name: string;
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

const Email = ({ type, role, name }: EmailProps) => {
  const { preview } = copy[type];
  const position = role === "superadmin" ? "super admin" : role;

  if (type === "CONFIRMATION") {
    return <Confirmation name={name} position={position} preview={preview} />;
  }

  if (type === "ACCEPTANCE") {
    return <Acceptance name={name} position={position} preview={preview} />;
  }

  return <Rejection name={name} position={position} preview={preview} />;
};

export const getEmailSubject = (type: EmailType) => copy[type].subject;

export default Email;
