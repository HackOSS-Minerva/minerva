import {
  assertPhotoOrigin,
  getConfiguredPhotoEvent,
  photoErrorResponse,
  uploadEventPhoto,
} from "@/lib/google-photos";
import { getFeatureFlag } from "@/lib/feature-flags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = async (request: Request): Promise<Response> => {
  try {
    if (!getFeatureFlag("photos")) {
      throw new Error("PHOTO_FEATURE_DISABLED");
    }

    assertPhotoOrigin(request);

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      throw new Error("PHOTO_REQUEST_INVALID");
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
      throw new Error("PHOTO_REQUEST_INVALID");
    }

    const event = getConfiguredPhotoEvent(tenants[0]);
    if (event.status !== "live") throw new Error("PHOTO_EVENT_NOT_LIVE");

    const photo = await uploadEventPhoto(event, photos[0]);
    return Response.json({ photo }, { status: 201 });
  } catch (error) {
    return photoErrorResponse(error);
  }
};
