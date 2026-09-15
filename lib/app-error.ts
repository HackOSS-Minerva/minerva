/**
 * Unified application error handling.
 *
 * Single source of truth for coded errors across all APIs and services.
 * Generalizes the previous photos-only pattern (`photoError` /
 * `photoErrorResponse` in `lib/google-photos.ts`).
 *
 * Conventions:
 * - In routes/services: `throw new AppError("BAD_REQUEST")` - never
 *   `throw new Error("some string")`.
 * - In routes: wrap handlers with `withFetchHandler("route-name", handler)`.
 *   It assigns a request-id, catches all errors, logs once (structured),
 *   and returns `{ error: { code, message } }` with an `x-request-id` header.
 * - On the client: `if (!res.ok) throw await parseAppError(res)`, display
 *   with `getUserMessage(code)`.
 *
 * Response shape (v1): `{ error: { code, message } }`.
 * The legacy photos shape `{ error: "CODE" }` is still *parsed* for
 * backwards compatibility but never *emitted*.
 */

export const REQUEST_ID_HEADER = "x-request-id";

interface CatalogEntry {
  status: number;
  message: string;
  retryable: boolean;
}

const defineCatalog = <T extends string>(catalog: Record<T, CatalogEntry>) =>
  catalog;

export const ERROR_CATALOG = defineCatalog({
  BAD_REQUEST: { status: 400, message: "Invalid request.", retryable: false },
  VALIDATION_FAILED: {
    status: 400,
    message: "Invalid input.",
    retryable: false,
  },
  TENANT_INVALID: { status: 400, message: "Invalid tenant.", retryable: false },
  FILE_INVALID: { status: 400, message: "Invalid file.", retryable: false },
  FILE_TOO_LARGE: {
    status: 400,
    message: "File is too large.",
    retryable: false,
  },
  UNAUTHORIZED: {
    status: 401,
    message: "Authentication required.",
    retryable: false,
  },
  FORBIDDEN: { status: 403, message: "Access forbidden.", retryable: false },
  FEATURE_DISABLED: {
    status: 403,
    message: "This feature is not available.",
    retryable: false,
  },
  NOT_FOUND: { status: 404, message: "Not found.", retryable: false },
  RATE_LIMITED: {
    status: 429,
    message: "Too many requests. Please try again.",
    retryable: true,
  },
  INTERNAL: { status: 500, message: "Something went wrong.", retryable: false },
  CONFIG_ERROR: {
    status: 500,
    message: "Service is not configured.",
    retryable: false,
  },
  UPSTREAM_UNAVAILABLE: {
    status: 502,
    message: "Upstream service unavailable.",
    retryable: true,
  },
  EMAIL_CONFIG_ERROR: {
    status: 503,
    message: "Email delivery is not configured.",
    retryable: false,
  },
  EMAIL_SEND_FAILED: {
    status: 502,
    message: "Failed to send email.",
    retryable: true,
  },
  ANALYTICS_UNAVAILABLE: {
    status: 502,
    message: "Analytics unavailable.",
    retryable: true,
  },
  CALENDAR_UNAVAILABLE: {
    status: 502,
    message: "Schedule unavailable.",
    retryable: true,
  },
  COMPRESS_FILE_TYPE_INVALID: {
    status: 400,
    message: "Invalid file type.",
    retryable: false,
  },
  COMPRESS_FILE_TOO_LARGE: {
    status: 400,
    message: "File is too large.",
    retryable: false,
  },
  PHOTO_REQUEST_INVALID: {
    status: 400,
    message: "Invalid photo request.",
    retryable: false,
  },
  PHOTO_FILE_INVALID: {
    status: 400,
    message: "Invalid photo file.",
    retryable: false,
  },
  PHOTO_ORIGIN_FORBIDDEN: {
    status: 403,
    message: "Photo request forbidden.",
    retryable: false,
  },
  PHOTO_ADMIN_FORBIDDEN: {
    status: 403,
    message: "Admin access required.",
    retryable: false,
  },
  PHOTO_FEATURE_DISABLED: {
    status: 403,
    message: "Photos are not available.",
    retryable: false,
  },
  PHOTO_EVENT_NOT_FOUND: {
    status: 404,
    message: "Photo event not found.",
    retryable: false,
  },
  PHOTO_CONFIGURATION_INVALID: {
    status: 500,
    message: "Photo service is not configured.",
    retryable: false,
  },
  PHOTO_GOOGLE_UNAVAILABLE: {
    status: 502,
    message: "Photo service unavailable.",
    retryable: true,
  },
  PHOTO_LIST_FAILED: {
    status: 502,
    message: "Unable to load photos.",
    retryable: true,
  },
  PHOTO_UPLOAD_FAILED: {
    status: 502,
    message: "Unable to upload photo.",
    retryable: true,
  },
  PHOTO_REMOVE_FAILED: {
    status: 502,
    message: "Unable to remove photo.",
    retryable: true,
  },
  PHOTO_REQUEST_FAILED: {
    status: 500,
    message: "Photo request failed.",
    retryable: false,
  },
});

export type ErrorCode = keyof typeof ERROR_CATALOG;

const isErrorCode = (value: unknown): value is ErrorCode =>
  typeof value === "string" && value in ERROR_CATALOG;

export interface AppErrorOptions {
  details?: unknown;
  cause?: unknown;
  requestId?: string;
}
/**
 * Unified application error. Construct directly:
 * `throw new AppError("BAD_REQUEST")`.
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly retryable: boolean;
  readonly details?: unknown;
  readonly requestId?: string;

  constructor(code: ErrorCode, opts: AppErrorOptions = {}) {
    const entry = ERROR_CATALOG[code];
    super(entry.message);
    this.name = "AppError";
    this.code = code;
    this.status = entry.status;
    this.retryable = entry.retryable;
    if (opts.details !== undefined) this.details = opts.details;
    if (opts.requestId !== undefined) this.requestId = opts.requestId;
    if (opts.cause !== undefined) {
      (this as { cause?: unknown }).cause = opts.cause;
    }
  }
}

const resolveCode = (error: unknown): ErrorCode => {
  if (error instanceof AppError) return error.code;
  if (error instanceof Error && isErrorCode(error.message))
    return error.message;
  return "INTERNAL";
};

export const getUserMessage = (code: unknown): string => {
  if (isErrorCode(code)) return ERROR_CATALOG[code].message;
  return ERROR_CATALOG.INTERNAL.message;
};

export const toErrorCode = (error: unknown): ErrorCode => resolveCode(error);

const randomRequestId = (): string => {
  try {
    const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
    if (c?.randomUUID) return c.randomUUID();
  } catch {
    // fall through
  }
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

export const getRequestId = (request?: Request): string => {
  const incoming = request?.headers.get(REQUEST_ID_HEADER)?.trim();
  if (incoming) return incoming;
  return randomRequestId();
};
export interface LogAppErrorParams {
  route: string;
  error: unknown;
  requestId: string;
}

export const logAppError = ({
  route,
  error,
  requestId,
}: LogAppErrorParams): void => {
  const code = resolveCode(error);
  const entry = ERROR_CATALOG[code];
  const cause =
    error instanceof Error
      ? ((error as { cause?: unknown }).cause ?? error.stack ?? error.message)
      : error;
  const details = error instanceof AppError ? error.details : undefined;
  console.error(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "error",
      requestId,
      route,
      code,
      status: entry.status,
      msg: entry.message,
      ...(details !== undefined ? { details } : {}),
      ...(cause !== undefined && cause !== entry.message ? { cause } : {}),
    }),
  );
};

export const toErrorResponse = (
  error: unknown,
  requestId?: string,
): Response => {
  const rid = requestId ?? randomRequestId();
  const code = resolveCode(error);
  const entry = ERROR_CATALOG[code];
  return Response.json(
    { error: { code, message: entry.message } },
    { status: entry.status, headers: { [REQUEST_ID_HEADER]: rid } },
  );
};

export const requireFeature = (
  enabled: boolean,
  code: ErrorCode = "FEATURE_DISABLED",
): void => {
  if (!enabled) throw new AppError(code);
};

export type FetchHandlerContext = { requestId: string };
export type FetchHandler = (
  request: Request,
  ctx: FetchHandlerContext,
) => Promise<Response>;

export const withFetchHandler =
  (routeName: string, handler: FetchHandler) =>
  async (request: Request): Promise<Response> => {
    const requestId = getRequestId(request);
    try {
      const response = await handler(request, { requestId });
      try {
        response.headers.set(REQUEST_ID_HEADER, requestId);
      } catch {
        // immutable headers - ignore
      }
      return response;
    } catch (error) {
      logAppError({ route: routeName, error, requestId });
      return toErrorResponse(error, requestId);
    }
  };

interface LegacyErrorBody {
  error?: unknown;
}

export const parseAppError = async (
  response: Response,
  fallbackCode: ErrorCode = "INTERNAL",
): Promise<AppError> => {
  const requestId = response.headers.get(REQUEST_ID_HEADER) ?? undefined;
  let body: LegacyErrorBody | null = null;
  try {
    body = (await response.json()) as LegacyErrorBody;
  } catch {
    body = null;
  }
  const raw = body?.error;
  if (raw && typeof raw === "object") {
    const { code } = raw as { code?: unknown };
    if (isErrorCode(code)) {
      return new AppError(code, {
        ...(requestId ? { requestId } : {}),
        details: body,
      });
    }
  }
  if (typeof raw === "string" && isErrorCode(raw)) {
    return new AppError(raw, {
      ...(requestId ? { requestId } : {}),
      details: body,
    });
  }
  const match = (Object.keys(ERROR_CATALOG) as ErrorCode[]).find(
    (c) => ERROR_CATALOG[c].status === response.status,
  );
  return new AppError(match ?? fallbackCode, {
    ...(requestId ? { requestId } : {}),
    details: body ?? { httpStatus: response.status },
  });
};
