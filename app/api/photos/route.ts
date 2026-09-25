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
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const deletePhotoSchema = z.object({
  tenant: z.string().min(1),
  mediaItemId: z.string().min(1).max(2_048),
});

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

  const parsed = deletePhotoSchema.safeParse(body);
  if (!parsed.success) {
    throw new AppError("PHOTO_REQUEST_INVALID");
  }
  const { tenant, mediaItemId } = parsed.data;

  const event = getConfiguredPhotoEvent(tenant);
  // Dev-mode unlock: photo deletion never requires superadmin in `next dev`.
  if (process.env.NODE_ENV === "production") {
    const access = await fetchAuthQuery(api.auth.getAdminAccess, { tenant });
    if (!access.authenticated || !access.authorized) {
      throw new AppError("PHOTO_ADMIN_FORBIDDEN");
    }
  }

  await removeEventPhoto(event, mediaItemId);
  return new Response(null, { status: 204 });
});
