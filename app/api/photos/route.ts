import {
  assertPhotoOrigin,
  getConfiguredPhotoEvent,
  listEventPhotos,
  removeEventPhoto,
} from "@/lib/google-photos";
import { AppError, requireFeature, withFetchHandler } from "@/lib/app-error";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";
import { getFeatureFlag } from "@/lib/feature-flags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withFetchHandler("photos-list", async (request) => {
  requireFeature(getFeatureFlag("photos"), "PHOTO_FEATURE_DISABLED");

  const searchParams = new URL(request.url).searchParams;
  const tenants = searchParams.getAll("tenant");
  const pageTokens = searchParams.getAll("pageToken");
  if (
    tenants.length !== 1 ||
    !tenants[0] ||
    pageTokens.length > 1 ||
    (pageTokens.length === 1 && !pageTokens[0])
  ) {
    throw new AppError("PHOTO_REQUEST_INVALID");
  }

  const event = getConfiguredPhotoEvent(tenants[0]);
  const page = await listEventPhotos(event, pageTokens[0]);
  return Response.json(page);
});

export const DELETE = withFetchHandler("photos-remove", async (request) => {
  requireFeature(getFeatureFlag("photos"), "PHOTO_FEATURE_DISABLED");

  assertPhotoOrigin(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new AppError("PHOTO_REQUEST_INVALID");
  }

  if (!body || typeof body !== "object") {
    throw new AppError("PHOTO_REQUEST_INVALID");
  }

  const { tenant, mediaItemId } = body as Record<string, unknown>;
  if (
    typeof tenant !== "string" ||
    !tenant ||
    typeof mediaItemId !== "string" ||
    !mediaItemId ||
    mediaItemId.length > 2_048
  ) {
    throw new AppError("PHOTO_REQUEST_INVALID");
  }

  const event = getConfiguredPhotoEvent(tenant);
  const access = await fetchAuthQuery(api.auth.getAdminAccess, { tenant });
  if (!access.authenticated || !access.authorized) {
    throw new AppError("PHOTO_ADMIN_FORBIDDEN");
  }

  await removeEventPhoto(event, mediaItemId);
  return new Response(null, { status: 204 });
});
