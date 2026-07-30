import {
  PHOTO_IMAGE_COMPRESSION,
  type CompressionOptions,
} from "@/lib/compress";
import {
  createPhotoStoragePath,
  isPhotoMimeType,
  type PhotoInputMetadata,
} from "@/lib/photos";
import type {
  PhotoUploadError,
  PhotoUploadItem,
  PhotoUploadErrorSource,
} from "@/types/photos";

export interface PhotoUploadContext {
  tenant: string;
  eventId: string;
  eventName: string;
}

export interface PhotoFinalizeArgs extends PhotoInputMetadata {
  tenant: string;
  eventId: string;
  eventName: string;
  downloadUrl: string;
}

export interface PhotoUploadDependencies {
  compress: (file: File, options: CompressionOptions) => Promise<File>;
  readDimensions: (file: File) => Promise<{ width: number; height: number }>;
  upload: (
    path: string,
    file: File,
    onProgress: (progress: number) => void,
  ) => Promise<{ path: string; url: string }>;
  finalize: (args: PhotoFinalizeArgs) => Promise<unknown>;
  remove: (path: string) => Promise<void>;
}

export type PhotoUploadUpdate = Partial<
  Pick<PhotoUploadItem, "compressedFile" | "stage" | "progress" | "error">
>;

export class PhotoUploadFailure extends Error implements PhotoUploadError {
  readonly source: PhotoUploadErrorSource;
  readonly code: string;
  readonly storagePath?: string;

  constructor({ source, code, message, storagePath }: PhotoUploadError) {
    super(message);
    this.name = "PhotoUploadFailure";
    this.source = source;
    this.code = code;
    this.storagePath = storagePath;
  }
}

const isQuotaError = (error: unknown): boolean => {
  if (typeof error !== "object" || error === null) return false;

  if ("data" in error && error.data === "PHOTO_QUOTA_EXCEEDED") {
    return true;
  }

  return (
    "message" in error &&
    typeof error.message === "string" &&
    error.message.includes("PHOTO_QUOTA_EXCEEDED")
  );
};

const finalizeOrReconcile = async (
  args: PhotoFinalizeArgs,
  finalize: PhotoUploadDependencies["finalize"],
): Promise<void> => {
  try {
    await finalize(args);
  } catch (firstError) {
    if (isQuotaError(firstError)) throw firstError;

    await finalize(args);
  }
};

export async function readPhotoDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  try {
    return { width: bitmap.width, height: bitmap.height };
  } finally {
    bitmap.close();
  }
}

export async function processPhotoUpload(
  item: PhotoUploadItem,
  context: PhotoUploadContext,
  dependencies: PhotoUploadDependencies,
  onUpdate: (update: PhotoUploadUpdate) => void,
): Promise<PhotoUploadItem> {
  let compressedFile = item.compressedFile;

  if (!compressedFile) {
    onUpdate({ stage: "compressing", progress: 0, error: null });
    try {
      compressedFile = await dependencies.compress(
        item.sourceFile,
        PHOTO_IMAGE_COMPRESSION,
      );
    } catch {
      throw new PhotoUploadFailure({
        source: "compression",
        code: "PHOTO_COMPRESSION_FAILED",
        message: "This photo could not be compressed. Try another image.",
      });
    }
  }

  if (!isPhotoMimeType(compressedFile.type)) {
    throw new PhotoUploadFailure({
      source: "validation",
      code: "PHOTO_TYPE_UNSUPPORTED",
      message: "Choose a JPEG, PNG, or WebP image.",
    });
  }

  let dimensions: { width: number; height: number };
  try {
    dimensions = await dependencies.readDimensions(compressedFile);
  } catch {
    throw new PhotoUploadFailure({
      source: "validation",
      code: "PHOTO_DECODE_FAILED",
      message: "This image cannot be opened by your browser.",
    });
  }

  const storagePath = createPhotoStoragePath(
    context.tenant,
    context.eventId,
    item.uploadId,
  );

  onUpdate({
    compressedFile,
    stage: "uploading",
    progress: 0,
    error: null,
  });

  let uploaded: { path: string; url: string };
  try {
    uploaded = await dependencies.upload(
      storagePath,
      compressedFile,
      (progress) => onUpdate({ progress }),
    );
  } catch {
    throw new PhotoUploadFailure({
      source: "firebase",
      code: "PHOTO_UPLOAD_FAILED",
      message: "Upload interrupted. Try this photo again.",
      storagePath,
    });
  }

  onUpdate({ stage: "finalizing", progress: 1 });
  const finalizeArgs: PhotoFinalizeArgs = {
    ...context,
    uploadId: item.uploadId,
    storagePath: uploaded.path,
    downloadUrl: uploaded.url,
    filename: compressedFile.name,
    mimeType: compressedFile.type,
    byteSize: compressedFile.size,
    ...dimensions,
  };

  try {
    await finalizeOrReconcile(finalizeArgs, dependencies.finalize);
  } catch (error) {
    if (isQuotaError(error)) {
      try {
        await dependencies.remove(storagePath);
      } catch {
        throw new PhotoUploadFailure({
          source: "firebase",
          code: "PHOTO_CLEANUP_FAILED",
          message: `Album storage is full. Cleanup failed for ${storagePath}.`,
          storagePath,
        });
      }

      throw new PhotoUploadFailure({
        source: "convex",
        code: "PHOTO_QUOTA_EXCEEDED",
        message: "This event album has reached its 5 GB limit.",
        storagePath,
      });
    }

    throw new PhotoUploadFailure({
      source: "convex",
      code: "PHOTO_FINALIZE_UNCERTAIN",
      message:
        "The upload finished, but the album could not confirm it. Try again to reconcile this photo.",
      storagePath,
    });
  }

  const completed: PhotoUploadItem = {
    ...item,
    compressedFile,
    stage: "complete",
    progress: 1,
    error: null,
  };
  onUpdate({
    compressedFile,
    stage: "complete",
    progress: 1,
    error: null,
  });
  return completed;
}
