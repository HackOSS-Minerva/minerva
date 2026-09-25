import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase.config";
import { compress } from "@/lib/compress";

export const uploadFile = async (path: string, file: File): Promise<string> => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, await compress(file));
  return await getDownloadURL(snapshot.ref);
};
