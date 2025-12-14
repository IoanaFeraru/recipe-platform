import { useState } from "react";
import imageCompression from "browser-image-compression";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const useImageUpload = () => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File, path: string) => {
    try {
      setError(null);

      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });

      const storage = getStorage();
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, compressedFile);

      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (err: any) {
      console.error("Image upload failed:", err);
      setError(err.message || "Upload failed");
      return null;
    }
  };

  return { uploadImage, progress, error };
};
