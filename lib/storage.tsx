import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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

export const uploadFile = async (path: string, file: File): Promise<string> => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, await compress(file));
  return await getDownloadURL(snapshot.ref);
};

export const getFileUrl = async (path: string): Promise<string | null> => {
  const storageRef = ref(storage, path);
  return await getDownloadURL(storageRef);
};
