import { ConvexError } from "convex/values";

// Convex-side counterpart to `AppError`. Convex can't return a `Response`, so
// coded failures throw `ConvexError({ code, message })`. Convention:
// `throw convexError("NOT_FOUND")`, never `throw new Error("...")`.

export const CONVEX_ERROR_MESSAGES = {
  BAD_REQUEST: "Invalid request.",
  VALIDATION_FAILED: "Invalid input.",
  TENANT_INVALID: "Invalid tenant.",
  UNAUTHORIZED: "Authentication required.",
  FORBIDDEN: "Access forbidden.",
  NOT_FOUND: "Not found.",
  RATE_LIMITED: "Too many requests. Please try again.",
  UPSTREAM_UNAVAILABLE: "Upstream service unavailable.",
  CONFIG_ERROR: "Service is not configured.",
  INTERNAL: "Something went wrong.",
} as const;

export type ConvexErrorCode = keyof typeof CONVEX_ERROR_MESSAGES;

export const convexError = (code: ConvexErrorCode, message?: string) =>
  new ConvexError({
    code,
    message: message ?? CONVEX_ERROR_MESSAGES[code],
  });

export const isConvexErrorCode = (value: unknown): value is ConvexErrorCode =>
  typeof value === "string" && value in CONVEX_ERROR_MESSAGES;
