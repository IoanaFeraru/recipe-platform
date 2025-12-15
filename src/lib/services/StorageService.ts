// src/lib/services/StorageService.ts
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask,
} from "firebase/storage";
import { storage } from "../firebase";
import { validateImageFile } from "../imageValidation";

export interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
}

/**
 * StorageService - Handles all file upload operations
 * Encapsulates Firebase Storage interactions
 */
export class StorageService {
  /**
   * Upload a single image with progress tracking
   */
  async uploadImage(
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = {
            progress:
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
          };

          onProgress?.(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          reject(new Error(`Upload failed: ${error.message}`));
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  /**
   * Upload multiple images
   */
  async uploadImages(
    files: File[],
    basePath: string,
    onProgress?: (index: number, progress: UploadProgress) => void
  ): Promise<string[]> {
    const uploadPromises = files.map((file, index) => {
      const path = `${basePath}/${Date.now()}_${index}_${file.name}`;
      return this.uploadImage(file, path, (progress) => {
        onProgress?.(index, progress);
      });
    });

    return Promise.all(uploadPromises);
  }

  /**
   * Upload recipe main image
   */
  async uploadRecipeImage(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const path = `recipes/${Date.now()}_${file.name}`;
    return this.uploadImage(file, path, onProgress);
  }

  /**
   * Upload recipe step image
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
   * Upload profile photo
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
   * Delete an image from storage
   */
  async deleteImage(url: string): Promise<void> {
    try {
      const imageRef = ref(storage, url);
      await deleteObject(imageRef);
    } catch (error) {
      console.error("Delete error:", error);
      throw new Error(`Failed to delete image: ${error}`);
    }
  }

  /**
   * Generate unique filename
   */
  generateFilename(originalName: string, prefix: string = ""): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const extension = originalName.split(".").pop();
    return `${prefix}${timestamp}_${random}.${extension}`;
  }

  /**
   * Get file size in MB
   */
  getFileSizeMB(file: File): number {
    return file.size / (1024 * 1024);
  }
}

// Export singleton instance
export const storageService = new StorageService();