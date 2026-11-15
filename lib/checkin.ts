import type { TenantSlug } from "@/hooks/get-tenant";

/**
 * Display-only placeholders for the avatar/sidebar UI while `useSession()`
 * is still loading. These are NEVER used to build check-in QR codes — QR
 * payloads must always come from the signed-in user.
 */
export const PLACEHOLDER_DISPLAY_NAME = "Guest User";
export const PLACEHOLDER_DISPLAY_EMAIL = "guest@example.com";

/**
 * The id baked into the old hardcoded guest QR code. Nothing generates it
 * anymore; kept only so {@link parseCheckinQr} can reject stale codes that
 * still carry it instead of writing a junk shared `visitor` check-in.
 */
export const LEGACY_GUEST_QR_ID = "visitor";

export interface CheckinQrPayload {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
}

/** The signed-in identity a check-in QR is built from (session-derived). */
export interface CheckinQrIdentity {
  id?: string | null;
  name?: string | null;
  email?: string | null;
}

/** Result of parsing a scanned QR: a real attendee code, or why it was rejected. */
export type ParseCheckinQrResult =
  | { ok: true; payload: CheckinQrPayload }
  | { ok: false; reason: "invalid" | "legacy-placeholder" };

/** Split "Anna Marie Lopez" -> ["Anna", "Marie Lopez"] (multi-word last kept). */
export function splitName(name: string): {
  firstname: string;
  lastname: string;
} {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstname: parts[0] ?? "",
    lastname: parts.slice(1).join(" "),
  };
}

/**
 * Single builder for the `{id, firstname, lastname, email}` QR JSON shape.
 *
 * Every field comes from the signed-in user; there are deliberately no guest
 * fallbacks, because a QR without a real id/email would check the wrong person
 * in (historically every attendee shared the `visitor` record). Returns `null`
 * when no usable identity is available, so callers render a loading or
 * signed-out state instead of a placeholder code.
 */
export function buildCheckinQrPayload(input: CheckinQrIdentity): string | null {
  const id = input.id?.trim();
  const email = input.email?.trim();
  if (!id || !email) return null;

  const { firstname, lastname } = splitName(input.name ?? "");
  // The email local-part keeps the code scannable for users without a real
  // name — it is derived from the signed-in user, not a hardcoded placeholder.
  const resolvedFirstname = firstname || email.split("@")[0];
  if (!resolvedFirstname) return null;

  return JSON.stringify({
    id,
    firstname: resolvedFirstname,
    lastname,
    email,
  } satisfies CheckinQrPayload);
}

/**
 * Parse + validate a scanned check-in QR. Never throws; reports why a code
 * was rejected so the scanner can show an accurate message — including
 * explicitly flagging legacy placeholder codes so they are never written to
 * the database.
 */
export function parseCheckinQr(raw: string): ParseCheckinQrResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: "invalid" };
  }

  if (typeof parsed !== "object" || parsed === null) {
    return { ok: false, reason: "invalid" };
  }

  const { id, firstname, lastname, email } = parsed as Partial<CheckinQrPayload>;

  if (typeof id !== "string" || !id) {
    return { ok: false, reason: "invalid" };
  }
  if (id === LEGACY_GUEST_QR_ID) {
    return { ok: false, reason: "legacy-placeholder" };
  }
  if (typeof firstname !== "string" || !firstname) {
    return { ok: false, reason: "invalid" };
  }
  if (typeof email !== "string" || !email) {
    return { ok: false, reason: "invalid" };
  }

  return {
    ok: true,
    payload: {
      id,
      firstname,
      lastname: typeof lastname === "string" ? lastname : "",
      email,
    },
  };
}

/** Storage path helper — `crypto.randomUUID()` with a collision-safe fallback. */
export function newUploadId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

export function uploadPath(
  tenant: TenantSlug,
  kind: "resumes" | "pictures",
  role: string,
  ext = "",
): string {
  return `${tenant}/${role}/${kind}/${newUploadId()}${ext}`;
}
