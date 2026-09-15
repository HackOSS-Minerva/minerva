import { ConvexError } from "convex/values";

/**
 * Convex-side counterpart to `AppError` (`@/lib/app-error`).
 *
 * Convex functions cannot return `Response`, so coded failures are thrown
 * as `ConvexError({ code, message })`. Clients read `err.data.code` and map
 * it with `getUserMessage(code)` from `@/lib/app-error` (see
 * `@/hooks/use-app-error`).
 *
 * Convention: `throw convexError("NOT_FOUND")` - never
 * `throw new Error("some string")` in new Convex code.
 */

export const CONVEX_ERROR_MESSAGES = {
  BAD_REQUEST: "Invalid request.",
  VALIDATION_FAILED: "Invalid input.",
  TENANT_INVALID: "Invalid tenant.",
  UNAUTHORIZED: "Authentication required.",
  FORBIDDEN: "Access forbidden.",
  NOT_FOUND: "Not found.",
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
