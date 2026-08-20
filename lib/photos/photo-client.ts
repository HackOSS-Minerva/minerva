const MAX_DIMENSION = 1920;
const MAX_FILE_SIZE = 8_000_000;
const ENCODING_QUALITY = 0.82;
const SOURCE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export interface ClientPhotoItem {
  id: string;
  filename: string;
  thumbnailUrl: string;
  viewerUrl: string;
}

function encodeCanvas(
  canvas: HTMLCanvasElement,
  type: "image/webp" | "image/jpeg",
): Promise<Blob | null> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(resolve, type, ENCODING_QUALITY);
    } catch (error) {
      reject(error);
    }
  });
}

function outputName(filename: string, extension: "webp" | "jpg"): string {
  const basename = filename.replace(/\.[^./]+$/, "");
  return `${basename || "photo"}.${extension}`;
}

export async function compressPhoto(file: File): Promise<File> {
  if (!SOURCE_TYPES.has(file.type)) throw new Error("PHOTO_FILE_INVALID");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("PHOTO_COMPRESSION_FAILED");
  }

  const scale = Math.min(
    1,
    MAX_DIMENSION / bitmap.width,
    MAX_DIMENSION / bitmap.height,
  );
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    bitmap.close();
    throw new Error("PHOTO_COMPRESSION_FAILED");
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let output: Blob | null;
  try {
    output = await encodeCanvas(canvas, "image/webp");
  } catch {
    output = null;
  }

  let extension: "webp" | "jpg" = "webp";
  if (!output || output.type !== "image/webp") {
    extension = "jpg";
    try {
      output = await encodeCanvas(canvas, "image/jpeg");
    } catch {
      output = null;
    }
  }

  if (!output) throw new Error("PHOTO_COMPRESSION_FAILED");
  if (output.size > MAX_FILE_SIZE) throw new Error("PHOTO_FILE_TOO_LARGE");

  return new File([output], outputName(file.name, extension), {
    type: output.type,
    lastModified: file.lastModified,
  });
}
