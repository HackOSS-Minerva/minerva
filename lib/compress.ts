import Compressor from "compressorjs";

export interface CompressionOptions {
  quality: number;
  maxWidth: number;
  maxHeight: number;
}

export const DEFAULT_IMAGE_COMPRESSION = {
  quality: 0.8,
  maxWidth: 800,
  maxHeight: 800,
} as const satisfies CompressionOptions;

export const PHOTO_IMAGE_COMPRESSION = {
  quality: 0.82,
  maxWidth: 1920,
  maxHeight: 1920,
} as const satisfies CompressionOptions;

export const compress = async (
  file: File,
  options: CompressionOptions = DEFAULT_IMAGE_COMPRESSION,
): Promise<File> => {
  if (!file.type.startsWith("image/")) return file;

  return new Promise<File>((resolve, reject) => {
    new Compressor(file, {
      ...options,
      success(result) {
        if (result instanceof File) {
          resolve(result);
          return;
        }

        resolve(
          new File([result], file.name, {
            type: result.type || file.type,
            lastModified: file.lastModified,
          }),
        );
      },
      error(err) {
        reject(err);
      },
    });
  });
};
