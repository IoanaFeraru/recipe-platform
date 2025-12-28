import { useState } from "react";
import imageCompression from "browser-image-compression";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Image upload hook with client-side compression for Firebase Storage.
 *
 * Encapsulates the image upload pipeline used by the application:
 * 1) Compress the selected image in the browser (size/dimensions constrained).
 * 2) Upload the compressed file to Firebase Storage at the provided path.
 * 3) Return the public download URL for persistence in Firestore or UI rendering.
 *
 * Non-obvious business rules:
 * - Images are always compressed before upload to reduce bandwidth and storage
 *   costs while keeping quality acceptable for web display.
 * - Errors are handled internally and surfaced via the `error` state; the
 *   function returns `null` on failure to simplify caller logic.
 *
 * Notes:
 * - `progress` is exposed for UI integration, but this implementation does not
 *   currently emit progress updates because it uses `uploadBytes` (non-resumable).
 *   If progress indicators are required, switch to `uploadBytesResumable` and
 *   update `progress` from the `state_changed` listener.
 *
 * @returns Upload function plus lightweight UI state for error handling and progress display.
 */
export const useImageUpload = () => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File, path: string) => {
    try {
      setError(null);
      setProgress(0);

      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });

      const storage = getStorage();
      const storageRef = ref(storage, path);

      // Non-resumable upload (no progress events). Keep `progress` for UI API consistency.
      const snapshot = await uploadBytes(storageRef, compressedFile);

      const url = await getDownloadURL(snapshot.ref);
      setProgress(100);
      return url;
    } catch (err: unknown) {
      console.error("Image upload failed:", err);
      setError((err instanceof Error && err.message) || "Upload failed");
      return null;
    }
  };

  return { uploadImage, progress, error };
};