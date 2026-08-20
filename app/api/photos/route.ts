import {
  getConfiguredPhotoEvent,
  listEventPhotos,
  removeEventPhoto,
} from "@/lib/photos/google-photos";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ERROR_STATUS: Record<string, number> = {
  PHOTO_REQUEST_INVALID: 400,
  PHOTO_ORIGIN_FORBIDDEN: 403,
  PHOTO_ADMIN_FORBIDDEN: 403,
  PHOTO_EVENT_NOT_FOUND: 404,
  PHOTO_CONFIGURATION_INVALID: 500,
  PHOTO_GOOGLE_UNAVAILABLE: 502,
  PHOTO_LIST_FAILED: 502,
  PHOTO_REMOVE_FAILED: 502,
};

function errorResponse(error: unknown): Response {
  const code = error instanceof Error ? error.message : "";
  const status = ERROR_STATUS[code];

  return Response.json(
    { error: status ? code : "PHOTO_REQUEST_FAILED" },
    { status: status ?? 500 },
  );
}

function configuredOrigin(): string {
  const value = process.env.PHOTO_APP_ORIGIN;
  if (!value) throw new Error("PHOTO_CONFIGURATION_INVALID");

  try {
    return new URL(value).origin;
  } catch {
    throw new Error("PHOTO_CONFIGURATION_INVALID");
  }
}

export async function GET(request: Request): Promise<Response> {
  const searchParams = new URL(request.url).searchParams;
  const tenants = searchParams.getAll("tenant");
  const pageTokens = searchParams.getAll("pageToken");
  if (
    tenants.length !== 1 ||
    !tenants[0] ||
    pageTokens.length > 1 ||
    (pageTokens.length === 1 && !pageTokens[0])
  ) {
    return errorResponse(new Error("PHOTO_REQUEST_INVALID"));
  }

  try {
    const event = getConfiguredPhotoEvent(tenants[0]);
    const page = await listEventPhotos(event, pageTokens[0]);
    return Response.json(page);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    if (request.headers.get("origin") !== configuredOrigin()) {
      throw new Error("PHOTO_ORIGIN_FORBIDDEN");
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new Error("PHOTO_REQUEST_INVALID");
    }

    if (!body || typeof body !== "object") {
      throw new Error("PHOTO_REQUEST_INVALID");
    }

    const { tenant, mediaItemId } = body as Record<string, unknown>;
    if (
      typeof tenant !== "string" ||
      !tenant ||
      typeof mediaItemId !== "string" ||
      !mediaItemId ||
      mediaItemId.length > 2_048
    ) {
      throw new Error("PHOTO_REQUEST_INVALID");
    }

    const event = getConfiguredPhotoEvent(tenant);
    const access = await fetchAuthQuery(api.auth.getAdminAccess, { tenant });
    if (!access.authenticated || !access.authorized) {
      throw new Error("PHOTO_ADMIN_FORBIDDEN");
    }

    await removeEventPhoto(event, mediaItemId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
