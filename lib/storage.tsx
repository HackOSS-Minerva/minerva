import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
import { storage } from "../firebase.config";
import { compress } from "@/lib/compress";

export interface StorageState {
  loading: boolean;
  error: string | null;
  progress: number;
}

export interface UploadResult {
  url: string;
  path: string;
}

export type UploadProgressHandler = (progress: number) => void;

export const uploadFile = async (path: string, file: File): Promise<string> => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, await compress(file));
  return await getDownloadURL(snapshot.ref);
};

export const uploadStorageFile = (
  path: string,
  file: File,
  onProgress?: UploadProgressHandler,
): Promise<UploadResult> => {
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
  });

  return new Promise<UploadResult>((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot) => {
        if (snapshot.totalBytes > 0) {
          onProgress?.(snapshot.bytesTransferred / snapshot.totalBytes);
        }
      },
      reject,
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve({ url, path });
        } catch (error) {
          reject(error);
        }
      },
    );
  });
};

export const isStorageObjectNotFound = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === "storage/object-not-found";

export const deleteStorageFile = async (path: string): Promise<void> => {
  try {
    await deleteObject(ref(storage, path));
  } catch (error) {
    if (!isStorageObjectNotFound(error)) {
      throw error;
    }
  }
};

export const getFileUrl = async (path: string): Promise<string | null> => {
  const storageRef = ref(storage, path);
  return await getDownloadURL(storageRef);
};
