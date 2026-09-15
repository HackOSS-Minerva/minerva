import Compressor from "compressorjs";
import { AppError } from "@/lib/app-error";

export const MAX_IMAGE_FILE_SIZE = 800_000;

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
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
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
