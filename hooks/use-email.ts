import { useMutation } from "@tanstack/react-query";
import type { SendEmailPayload } from "@/types/email";

const sendEmailRequest = async (payload: SendEmailPayload) => {
  const response = await fetch("/api/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error ?? "Failed to send email");
  }

  return result as { id: string };
};

export const useEmail = () => {
  const mutation = useMutation({ mutationFn: sendEmailRequest });

  return {
    ...mutation,
    sendEmail: mutation.mutateAsync,
  };
};
