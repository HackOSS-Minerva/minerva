import {
  getConfiguredPhotoEvent,
  uploadEventPhoto,
  validateServerPhoto,
} from "@/lib/photos/google-photos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ERROR_STATUS: Record<string, number> = {
  PHOTO_REQUEST_INVALID: 400,
  PHOTO_FILE_INVALID: 400,
  PHOTO_ORIGIN_FORBIDDEN: 403,
  PHOTO_EVENT_NOT_LIVE: 403,
  PHOTO_EVENT_NOT_FOUND: 404,
  PHOTO_CONFIGURATION_INVALID: 500,
  PHOTO_GOOGLE_UNAVAILABLE: 502,
  PHOTO_UPLOAD_FAILED: 502,
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

export async function POST(request: Request): Promise<Response> {
  try {
    if (request.headers.get("origin") !== configuredOrigin()) {
      throw new Error("PHOTO_ORIGIN_FORBIDDEN");
    }

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

    await validateServerPhoto(photos[0]);
    const photo = await uploadEventPhoto(event, photos[0]);
    return Response.json({ photo }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
