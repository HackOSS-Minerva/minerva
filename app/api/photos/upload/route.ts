import {
  assertPhotoOrigin,
  getConfiguredPhotoEvent,
  uploadEventPhoto,
} from "@/lib/google-photos";
import { AppError, requireFeature, withFetchHandler } from "@/lib/app-error";
import { getFeatureFlag } from "@/lib/feature-flags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withFetchHandler("photos-upload", async (request) => {
  requireFeature(getFeatureFlag("photos"), "PHOTO_FEATURE_DISABLED");

  assertPhotoOrigin(request);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    throw new AppError("PHOTO_REQUEST_INVALID");
  }

  const tenants = formData.getAll("tenant");
  const photos = formData.getAll("photo");
  if (
    tenants.length !== 1 ||
    typeof tenants[0] !== "string" ||
    !tenants[0] ||
    photos.length !== 1 ||
    !(photos[0] instanceof File)
  ) {
    throw new AppError("PHOTO_REQUEST_INVALID");
  }

  const event = getConfiguredPhotoEvent(tenants[0]);

  const photo = await uploadEventPhoto(event, photos[0]);
  return Response.json({ photo }, { status: 201 });
});
