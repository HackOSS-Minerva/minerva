import {
  assertPhotoOrigin,
  getConfiguredPhotoEvent,
  listEventPhotos,
  photoErrorResponse,
  removeEventPhoto,
} from "@/lib/photos/google-photos";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async (request: Request): Promise<Response> => {
  const searchParams = new URL(request.url).searchParams;
  const tenants = searchParams.getAll("tenant");
  const pageTokens = searchParams.getAll("pageToken");
  if (
    tenants.length !== 1 ||
    !tenants[0] ||
    pageTokens.length > 1 ||
    (pageTokens.length === 1 && !pageTokens[0])
  ) {
    return photoErrorResponse(new Error("PHOTO_REQUEST_INVALID"));
  }

  try {
    const event = getConfiguredPhotoEvent(tenants[0]);
    const page = await listEventPhotos(event, pageTokens[0]);
    return Response.json(page);
  } catch (error) {
    return photoErrorResponse(error);
  }
};

export const DELETE = async (request: Request): Promise<Response> => {
  try {
    assertPhotoOrigin(request);

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
    return photoErrorResponse(error);
  }
};
