/**
 * ImageUploadSection component.
 *
 * Provides a controlled UI for uploading and previewing a recipe’s main image.
 * This component is presentation-focused and delegates all upload logic and
 * state management (progress, uploading state, and file handling) to its parent.
 *
 * Responsibilities:
 * - Accepts image files via a file input restricted to image MIME types
 * - Emits the selected file through a callback for external handling
 * - Displays a preview of the selected or existing image
 * - Shows a visual progress indicator while an upload is in progress
 *
 * UX considerations:
 * - Disables the file input while an upload is active to prevent conflicts
 * - Shows real-time progress feedback to communicate upload status
 * - Uses responsive, theme-aware styling consistent with the application design system
 *
 * @param {ImageUploadSectionProps} props - Image preview URL, upload state, and change handler.
 * @returns A form section for selecting, previewing, and tracking upload progress of a recipe image.
 */

"use client";

import React from "react";

interface ImageUploadSectionProps {
  preview: string;
  progress: number;
  isUploading: boolean;
  onChange: (file: File) => void;
}

export const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  preview,
  progress,
  isUploading,
  onChange,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-(--color-text)">
        Recipe Image
      </label>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="w-full border-2 border-(--color-border) rounded-lg p-2 bg-(--color-bg-secondary) text-(--color-text) text-sm file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-(--color-primary) file:text-white file:cursor-pointer disabled:opacity-50"
      />

      {preview && (
        <img
          src={preview}
          alt="Recipe preview"
          className="mt-2 w-full h-40 object-cover rounded-lg border-2 border-(--color-border)"
        />
      )}

      {isUploading && progress > 0 && progress < 100 && (
        <div className="mt-2">
          <div className="w-full bg-(--color-bg-secondary) rounded-full h-2">
            <div
              className="h-2 bg-(--color-primary) rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-(--color-text-muted) mt-1 text-center">
            Uploading... {Math.round(progress)}%
          </p>
        </div>
      )}
    </div>
  );
};