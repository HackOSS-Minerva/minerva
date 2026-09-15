"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { AppError, getUserMessage, toErrorCode } from "@/lib/app-error";
import { isConvexErrorCode } from "@/convex/app-error";

/** Extract a unified ErrorCode from fetch AppErrors or Convex throws. */
export const resolveAppErrorCode = (error: unknown): string => {
  if (error instanceof AppError) return error.code;
  if (error instanceof Error) {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === "object") {
      const code = (data as { code?: unknown }).code;
      if (isConvexErrorCode(code)) return code;
    }
    return toErrorCode(error);
  }
  return "INTERNAL";
};

export const toastAppError = (error: unknown, fallback?: string): string => {
  const code = resolveAppErrorCode(error);
  const message = fallback ?? getUserMessage(code);
  const requestId = error instanceof AppError ? error.requestId : undefined;
  toast.error(message, {
    ...(requestId ? { description: `Request ID: ${requestId}` } : {}),
  });
  return message;
};

export const useAppError = () => {
  const notify = useCallback(
    (error: unknown, fallback?: string) => toastAppError(error, fallback),
    [],
  );
  return { toastAppError: notify, resolveAppErrorCode, getUserMessage };
};
