import type { Doc } from "@/convex/_generated/dataModel";

export type PhotoRecord = Doc<"photos">;

export type PhotoUploadStage =
  | "queued"
  | "compressing"
  | "uploading"
  | "finalizing"
  | "complete"
  | "failed";

export type PhotoUploadErrorSource =
  | "validation"
  | "compression"
  | "firebase"
  | "convex";

export interface PhotoUploadError {
  source: PhotoUploadErrorSource;
  code: string;
  message: string;
  storagePath?: string;
}

export interface PhotoUploadItem {
  uploadId: string;
  sourceFile: File;
  compressedFile?: File;
  stage: PhotoUploadStage;
  progress: number;
  error: PhotoUploadError | null;
}
