import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from "firebase/storage";
import { storage } from "../firebase";
import { validateImageFile } from "../imageValidation";

/**
 * Upload progress payload used by UI consumers.
 */
export interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
}

/**
 * Firebase Storage service wrapper.
 *
 * Centralizes file validation, upload orchestration, and deletion in one place.
 * Exposes a small API surface that is easy to consume from UI code while keeping
 * Firebase-specific details contained.
 */
export class StorageService {
  /**
   * Uploads a single file to the provided storage path.
   *
   * - Validates the file before starting the upload.
   * - Uses resumable uploads and emits progress updates (if requested).
   * - Resolves with a download URL when the upload completes.
   */
  async uploadImage(
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error || "Invalid image file");
    }

    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        snapshot => {
          onProgress?.({
            progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes
          });
        },
        error => {
          reject(new Error(`Upload failed: ${error.message}`));
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  }

  /**
   * Uploads multiple images in parallel under a base path.
   *
   * Paths are generated with timestamp + index + original filename to reduce
   * collision risk. The returned URLs preserve the input order.
   */
  async uploadImages(
    files: File[],
    basePath: string,
    onProgress?: (index: number, progress: UploadProgress) => void
  ): Promise<string[]> {
    const uploadPromises = files.map((file, index) => {
      const path = `${basePath}/${Date.now()}_${index}_${file.name}`;
      return this.uploadImage(file, path, progress => {
        onProgress?.(index, progress);
      });
    });

    return Promise.all(uploadPromises);
  }

  /**
   * Uploads a recipe cover image to `recipes/`.
   */
  async uploadRecipeImage(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const path = `recipes/${Date.now()}_${file.name}`;
    return this.uploadImage(file, path, onProgress);
  }

  /**
   * Uploads an image associated with a recipe step to `recipes/steps/`.
   */
  async uploadStepImage(
    file: File,
    stepIndex: number,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const path = `recipes/steps/${Date.now()}_step${stepIndex}_${file.name}`;
    return this.uploadImage(file, path, onProgress);
  }

  /**
   * Uploads a user profile photo to a stable path.
   *
   * Using a stable path makes "update" semantics straightforward (new upload
   * overwrites the previous object at the same path).
   */
  async uploadProfilePhoto(
    userId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const path = `profilePhotos/${userId}`;
    return this.uploadImage(file, path, onProgress);
  }

  /**
   * Deletes an object from Storage using a URL or storage path.
   *
   * Caller is responsible for removing any Firestore references to the asset.
   */
  async deleteImage(urlOrPath: string): Promise<void> {
    try {
      await deleteObject(ref(storage, urlOrPath));
    } catch (error) {
      throw new Error(`Failed to delete image: ${String(error)}`);
    }
  }

  /**
   * Generates a collision-resistant filename while preserving the extension.
   */
  generateFilename(originalName: string, prefix: string = ""): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);

    const extension = originalName.split(".").pop() || "bin";
    return `${prefix}${timestamp}_${random}.${extension}`;
  }

  getFileSizeMB(file: File): number {
    return file.size / (1024 * 1024);
  }
}

export const storageService = new StorageService();