"use client";

import React from "react";

interface ImageUploadSectionProps {
  preview: string;
  progress: number;
  isUploading: boolean;
  onChange: (file: File) => void;
}

/**
 * ImageUploadSection - Main recipe image upload with preview
 * Shows upload progress when uploading
 */
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

      {/* Image Preview */}
      {preview && (
        <img
          src={preview}
          alt="Recipe preview"
          className="mt-2 w-full h-40 object-cover rounded-lg border-2 border-(--color-border)"
        />
      )}

      {/* Upload Progress */}
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