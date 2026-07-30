export const PHOTO_QUOTA_BYTES = 5_000_000_000;
export const PHOTO_MAX_SOURCE_BYTES = 20_000_000;
export const PHOTO_MAX_BATCH_SIZE = 25;
export const PHOTO_CONCURRENCY = 3;
export const PHOTO_PAGE_SIZE = 48;

export const PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type PhotoMimeType = (typeof PHOTO_MIME_TYPES)[number];

export interface PhotoInputMetadata {
  uploadId: string;
  storagePath: string;
  filename: string;
  mimeType: PhotoMimeType;
  byteSize: number;
  width: number;
  height: number;
}

export interface PhotoFileRejection {
  file: File;
  reason: string;
}

export interface PhotoValidationResult {
  accepted: File[];
  rejected: PhotoFileRejection[];
}

const PHOTO_PATH_SEGMENT = /^[a-zA-Z0-9_-]+$/;

export function isPhotoMimeType(value: string): value is PhotoMimeType {
  return PHOTO_MIME_TYPES.some((mimeType) => mimeType === value);
}

export function validatePhotoFiles(
  files: readonly File[],
): PhotoValidationResult {
  const accepted: File[] = [];
  const rejected: PhotoFileRejection[] = [];
  const limitedFiles = files.slice(0, PHOTO_MAX_BATCH_SIZE);

  for (const file of limitedFiles) {
    if (!isPhotoMimeType(file.type)) {
      rejected.push({
        file,
        reason: "Choose a JPEG, PNG, or WebP image.",
      });
      continue;
    }

    if (file.size > PHOTO_MAX_SOURCE_BYTES) {
      rejected.push({
        file,
        reason: "Each photo must be 20 MB or smaller.",
      });
      continue;
    }

    accepted.push(file);
  }

  for (const file of files.slice(PHOTO_MAX_BATCH_SIZE)) {
    rejected.push({
      file,
      reason: "Upload up to 25 photos at a time.",
    });
  }

  return {
    accepted,
    rejected,
  };
}

export function createPhotoStoragePath(
  tenant: string,
  eventId: string,
  uploadId: string,
): string {
  if (
    ![tenant, eventId, uploadId].every((segment) =>
      PHOTO_PATH_SEGMENT.test(segment),
    )
  ) {
    throw new Error("Invalid photo path segment");
  }

  return `${tenant}/events/${eventId}/photos/${uploadId}`;
}

export function mergePhotoPages<T extends { _id: string; createdAt: number }>(
  pages: readonly (readonly T[])[],
): T[] {
  const photosById = new Map<string, T>();

  for (const page of pages) {
    for (const photo of page) {
      photosById.set(photo._id, photo);
    }
  }

  return Array.from(photosById.values()).sort(
    (left, right) =>
      right.createdAt - left.createdAt || right._id.localeCompare(left._id),
  );
}

export function formatPhotoBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) {
    return `${(bytes / 1_000_000_000).toFixed(2)} GB`;
  }

  if (bytes >= 1_000_000) {
    return `${(bytes / 1_000_000).toFixed(1)} MB`;
  }

  if (bytes >= 1_000) {
    return `${(bytes / 1_000).toFixed(1)} KB`;
  }

  return `${bytes} B`;
}
