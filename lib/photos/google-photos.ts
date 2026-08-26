import designverse from "@/tenants/designverse/designverse.json";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_PHOTOS_URL = "https://photoslibrary.googleapis.com/v1";
const MAX_FILE_SIZE = 8_000_000;
const TOKEN_EXPIRY_BUFFER_MS = 60_000;
const PHOTO_ERROR_STATUS: Record<string, number> = {
  PHOTO_REQUEST_INVALID: 400,
  PHOTO_FILE_INVALID: 400,
  PHOTO_ORIGIN_FORBIDDEN: 403,
  PHOTO_ADMIN_FORBIDDEN: 403,
  PHOTO_EVENT_NOT_LIVE: 403,
  PHOTO_EVENT_NOT_FOUND: 404,
  PHOTO_CONFIGURATION_INVALID: 500,
  PHOTO_GOOGLE_UNAVAILABLE: 502,
  PHOTO_LIST_FAILED: 502,
  PHOTO_UPLOAD_FAILED: 502,
  PHOTO_REMOVE_FAILED: 502,
};

export interface PhotoEvent {
  tenant: string;
  eventName: string;
  status: "live" | "scheduled" | "ended";
}

export interface PhotoItem {
  id: string;
  filename: string;
  thumbnailUrl: string;
  viewerUrl: string;
}

export interface PhotoPage {
  photos: PhotoItem[];
  nextPageToken?: string;
}

interface GoogleCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  cacheKey: string;
}

interface AccessTokenCache {
  credentialKey: string;
  token: string;
  expiresAt: number;
}

interface GoogleMediaItem {
  id?: string;
  filename?: string;
  baseUrl?: string;
}

let accessTokenCache: AccessTokenCache | null = null;

const photoError = (code: string): Error => new Error(code);

const readJson = async <T>(response: Response, code: string): Promise<T> => {
  try {
    return (await response.json()) as T;
  } catch {
    throw photoError(code);
  }
};

const configuredOrigin = (): string => {
  const value = process.env.PHOTO_APP_ORIGIN;
  if (!value) throw photoError("PHOTO_CONFIGURATION_INVALID");

  try {
    return new URL(value).origin;
  } catch {
    throw photoError("PHOTO_CONFIGURATION_INVALID");
  }
};

export const assertPhotoOrigin = (request: Request): void => {
  if (request.headers.get("origin") !== configuredOrigin()) {
    throw photoError("PHOTO_ORIGIN_FORBIDDEN");
  }
};

export const photoErrorResponse = (error: unknown): Response => {
  const code = error instanceof Error ? error.message : "";
  const status = PHOTO_ERROR_STATUS[code];

  return Response.json(
    { error: status ? code : "PHOTO_REQUEST_FAILED" },
    { status: status ?? 500 },
  );
};

const getCredentials = (): GoogleCredentials => {
  const clientId = process.env.GOOGLE_PHOTOS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_PHOTOS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_PHOTOS_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw photoError("PHOTO_CONFIGURATION_INVALID");
  }

  return {
    clientId,
    clientSecret,
    refreshToken,
    cacheKey: `${clientId}\u0000${clientSecret}\u0000${refreshToken}`,
  };
};

const getAccessToken = async (forceRefresh = false): Promise<string> => {
  const credentials = getCredentials();
  const now = Date.now();

  if (
    !forceRefresh &&
    accessTokenCache?.credentialKey === credentials.cacheKey &&
    accessTokenCache.expiresAt - TOKEN_EXPIRY_BUFFER_MS > now
  ) {
    return accessTokenCache.token;
  }

  let response: Response;
  try {
    response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        refresh_token: credentials.refreshToken,
        grant_type: "refresh_token",
      }),
    });
  } catch {
    throw photoError("PHOTO_GOOGLE_UNAVAILABLE");
  }

  if (!response.ok) throw photoError("PHOTO_GOOGLE_UNAVAILABLE");

  const body = await readJson<{
    access_token?: unknown;
    expires_in?: unknown;
  }>(response, "PHOTO_GOOGLE_UNAVAILABLE");

  if (
    typeof body.access_token !== "string" ||
    typeof body.expires_in !== "number"
  ) {
    throw photoError("PHOTO_GOOGLE_UNAVAILABLE");
  }

  accessTokenCache = {
    credentialKey: credentials.cacheKey,
    token: body.access_token,
    expiresAt: now + body.expires_in * 1_000,
  };

  return body.access_token;
};

const googleRequest = async (
  path: string,
  init: RequestInit = {},
): Promise<Response> => {
  const request = async (forceRefresh: boolean): Promise<Response> => {
    const token = await getAccessToken(forceRefresh);

    try {
      return await fetch(`${GOOGLE_PHOTOS_URL}${path}`, {
        ...init,
        headers: {
          ...init.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      throw photoError("PHOTO_GOOGLE_UNAVAILABLE");
    }
  };

  let response = await request(false);
  if (response.status === 401) {
    accessTokenCache = null;
    response = await request(true);
  }

  return response;
};

const requireOk = async (
  response: Response,
  code: string,
): Promise<Response> => {
  if (!response.ok) throw photoError(code);
  return response;
};

const getConfiguredAlbumId = (event: PhotoEvent): string => {
  const albumId =
    event.tenant === "designverse"
      ? process.env.GOOGLE_PHOTOS_ALBUM_ID?.trim()
      : undefined;
  if (!albumId) throw photoError("PHOTO_CONFIGURATION_INVALID");
  return albumId;
};

const toPhotoItem = (item: GoogleMediaItem): PhotoItem | null => {
  if (
    typeof item.id !== "string" ||
    typeof item.filename !== "string" ||
    typeof item.baseUrl !== "string"
  ) {
    return null;
  }

  return {
    id: item.id,
    filename: item.filename,
    thumbnailUrl: `${item.baseUrl}=w640-h640-c`,
    viewerUrl: `${item.baseUrl}=w1920-h1920`,
  };
};

export const getConfiguredPhotoEvent = (tenant: string): PhotoEvent => {
  if (tenant !== "designverse") throw photoError("PHOTO_EVENT_NOT_FOUND");
  const status = designverse.event.status;
  if (status !== "live" && status !== "scheduled" && status !== "ended") {
    throw photoError("PHOTO_CONFIGURATION_INVALID");
  }

  return {
    tenant,
    eventName: designverse.event.name,
    status,
  };
};

const validateServerPhoto = async (file: File): Promise<void> => {
  if (
    file.size === 0 ||
    file.size > MAX_FILE_SIZE ||
    (file.type !== "image/jpeg" && file.type !== "image/webp")
  ) {
    throw photoError("PHOTO_FILE_INVALID");
  }

  const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isJpeg =
    signature.length >= 3 &&
    signature[0] === 0xff &&
    signature[1] === 0xd8 &&
    signature[2] === 0xff;
  const isWebp =
    signature.length >= 12 &&
    new TextDecoder().decode(signature.slice(0, 4)) === "RIFF" &&
    new TextDecoder().decode(signature.slice(8, 12)) === "WEBP";

  const signatureMatchesType =
    (file.type === "image/jpeg" && isJpeg) ||
    (file.type === "image/webp" && isWebp);
  if (!signatureMatchesType) throw photoError("PHOTO_FILE_INVALID");
};

export const listEventPhotos = async (
  event: PhotoEvent,
  pageToken?: string,
): Promise<PhotoPage> => {
  const albumId = getConfiguredAlbumId(event);

  const response = await googleRequest("/mediaItems:search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      albumId,
      pageSize: 100,
      ...(pageToken ? { pageToken } : {}),
    }),
  });
  await requireOk(response, "PHOTO_LIST_FAILED");
  const body = await readJson<unknown>(response, "PHOTO_LIST_FAILED");
  if (!body || typeof body !== "object") {
    throw photoError("PHOTO_LIST_FAILED");
  }

  const data = body as {
    mediaItems?: GoogleMediaItem[];
    nextPageToken?: unknown;
  };

  if (
    (data.mediaItems !== undefined &&
      (!Array.isArray(data.mediaItems) ||
        data.mediaItems.some((item) => !item || typeof item !== "object"))) ||
    (data.nextPageToken !== undefined && typeof data.nextPageToken !== "string")
  ) {
    throw photoError("PHOTO_LIST_FAILED");
  }

  return {
    photos: (data.mediaItems ?? [])
      .map(toPhotoItem)
      .filter((item): item is PhotoItem => item !== null),
    ...(data.nextPageToken ? { nextPageToken: data.nextPageToken } : {}),
  };
};

export const removeEventPhoto = async (
  event: PhotoEvent,
  mediaItemId: string,
): Promise<void> => {
  const albumId = getConfiguredAlbumId(event);
  const response = await googleRequest(
    `/albums/${encodeURIComponent(albumId)}:batchRemoveMediaItems`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaItemIds: [mediaItemId] }),
    },
  );
  await requireOk(response, "PHOTO_REMOVE_FAILED");
};

export const uploadEventPhoto = async (
  event: PhotoEvent,
  file: File,
): Promise<PhotoItem> => {
  await validateServerPhoto(file);
  const albumId = getConfiguredAlbumId(event);
  const uploadResponse = await googleRequest("/uploads", {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "X-Goog-Upload-Content-Type": file.type,
      "X-Goog-Upload-Protocol": "raw",
    },
    body: await file.arrayBuffer(),
  });
  await requireOk(uploadResponse, "PHOTO_UPLOAD_FAILED");
  const uploadToken = await uploadResponse.text();
  if (!uploadToken) throw photoError("PHOTO_UPLOAD_FAILED");

  const createResponse = await googleRequest("/mediaItems:batchCreate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      albumId,
      albumPosition: { position: "FIRST_IN_ALBUM" },
      newMediaItems: [
        {
          simpleMediaItem: {
            fileName: file.name,
            uploadToken,
          },
        },
      ],
    }),
  });
  await requireOk(createResponse, "PHOTO_UPLOAD_FAILED");
  const body = await readJson<{
    newMediaItemResults?: Array<{ mediaItem?: GoogleMediaItem }>;
  }>(createResponse, "PHOTO_UPLOAD_FAILED");
  const photo = body.newMediaItemResults?.[0]?.mediaItem;
  const result = photo ? toPhotoItem(photo) : null;

  if (!result) throw photoError("PHOTO_UPLOAD_FAILED");
  return result;
};
