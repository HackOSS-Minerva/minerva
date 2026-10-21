import Compressor from "compressorjs";
import { AppError } from "@/lib/app-error";

export const MAX_IMAGE_FILE_SIZE = 800_000;
/** Human label kept next to the byte limit so copy never drifts. */
export const MAX_IMAGE_FILE_LABEL = "800KB";
/** Default downscale for form uploads (resumes/pictures via `uploadFile`). */
export const DEFAULT_COMPRESS_DIMENSION = 800;
export const DEFAULT_COMPRESS_QUALITY = 0.8;
/** Gallery uploads keep more detail (see `PHOTO_COMPRESSION_OPTIONS`). */
export const PHOTO_COMPRESS_DIMENSION = 1920;
export const PHOTO_COMPRESS_QUALITY = 0.82;

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
  acceptedTypes?: readonly string[];
  maxFileSize?: number;
}

const jpegFilename = (filename: string) => {
  const basename = filename.replace(/\.[^./]+$/, "");
  return `${basename || "image"}.jpg`;
};

export const compress = async (
  file: File,
  {
    maxWidth = DEFAULT_COMPRESS_DIMENSION,
    maxHeight = DEFAULT_COMPRESS_DIMENSION,
    quality = DEFAULT_COMPRESS_QUALITY,
    mimeType,
    acceptedTypes,
    maxFileSize,
  }: CompressOptions = {},
): Promise<File> => {
  if (acceptedTypes && !acceptedTypes.includes(file.type)) {
    throw new AppError("COMPRESS_FILE_TYPE_INVALID");
  }
  if (!file.type.startsWith("image/")) return file;

  return new Promise<File>((resolve, reject) => {
    const compressorOptions: Compressor.Options = {
      quality,
      maxWidth,
      maxHeight,
      success: (result) => {
        if (maxFileSize !== undefined && result.size > maxFileSize) {
          reject(new AppError("COMPRESS_FILE_TOO_LARGE"));
          return;
        }

        resolve(
          new File(
            [result],
            mimeType === "image/jpeg" ? jpegFilename(file.name) : file.name,
            {
              type: result.type,
              lastModified: file.lastModified,
            },
          ),
        );
      },
      error: (error) => reject(error),
    };

    if (mimeType) {
      compressorOptions.mimeType = mimeType;
      compressorOptions.strict = false;
    }

    new Compressor(file, compressorOptions);
  });
};
