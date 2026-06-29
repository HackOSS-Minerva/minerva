import { useMutation } from "@tanstack/react-query";
import { SuperUser } from "@/types/users";
import { EmailType } from "@/types/email";

type Role = "judge" | "participant" | "superadmin" | "volunteer";

interface SendEmailPayload {
  role: Role;
  type: EmailType;
  user: SuperUser;
  tenant: string;
}

export const useSendEmail = () => {
  return useMutation({
    mutationFn: async (payload: SendEmailPayload) => {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      return response.json();
    },
  });
};
