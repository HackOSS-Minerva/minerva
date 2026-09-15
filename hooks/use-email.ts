import { useMutation } from "@tanstack/react-query";
import type { SendEmailPayload } from "@/types/email";
import { useTenant } from "./use-tenant";
import { AppError, parseAppError } from "@/lib/app-error";

type ClientSendEmailPayload = Omit<SendEmailPayload, "tenant">;

const sendEmailRequest = async (payload: SendEmailPayload) => {
  const response = await fetch("/api/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseAppError(response, "EMAIL_SEND_FAILED");
  }

  const result = await response.json();

  return result as { id: string };
};

export const useEmail = () => {
  const mutation = useMutation({ mutationFn: sendEmailRequest });
  const { tenant } = useTenant();

  if (!tenant) {
    throw new AppError("TENANT_INVALID");
  }

  return {
    ...mutation,
    sendEmail: (payload: ClientSendEmailPayload) => {
      const requestPayload: SendEmailPayload = {
        ...payload,
        tenant: tenant.slug,
      };
      return mutation.mutateAsync(requestPayload);
    },
  };
};
