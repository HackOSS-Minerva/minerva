import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import type { SendEmailPayload } from "@/types/email";
import { getTenant, type TenantSlug } from "./get-tenant";
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
  const { tenant } = useParams<{ tenant: TenantSlug }>();
  const { config } = getTenant(tenant);

  if (!config) {
    throw new AppError("TENANT_INVALID");
  }

  return {
    ...mutation,
    sendEmail: (payload: ClientSendEmailPayload) => {
      const requestPayload: SendEmailPayload = {
        ...payload,
        tenant: config.slug,
      };
      return mutation.mutateAsync(requestPayload);
    },
  };
};
