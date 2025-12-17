/**
 * ProfilePhotoSection component.
 *
 * Provides a focused UI for displaying and updating the user’s profile photo.
 * This component is presentation-only and delegates validation, upload logic,
 * and persistence to its parent container.
 *
 * Responsibilities:
 * - Display the current profile photo or a local preview of a newly selected image
 * - Allow the user to select a new image file from their device
 * - Expose an explicit upload action once a new photo is selected
 * - Reflect upload progress and disabled states during asynchronous operations
 * - Display success or error feedback messages related to photo updates
 *
 * UX and interaction notes:
 * - The file input is visually hidden and triggered via a styled label
 * - The upload button is only rendered when a new photo has been selected
 * - Buttons are disabled while an upload is in progress to prevent duplicate actions
 *
 * Accessibility considerations:
 * - Uses semantic image and button elements
 * - Provides descriptive alternative text for the profile image
 * - Ensures disabled states are communicated via native HTML attributes
 *
 * @module ProfilePhotoSection
 */

"use client";

import React from "react";
import Button from "@/components/UI/Button";

interface ProfileMessage {
  type: "success" | "error";
  text: string;
}

interface ProfilePhotoSectionProps {
  currentPhotoURL: string;
  photoPreview: string | null;
  newPhoto: File | null;
  message: ProfileMessage | null;
  isUploading: boolean;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
}

export const ProfilePhotoSection: React.FC<ProfilePhotoSectionProps> = ({
  currentPhotoURL,
  photoPreview,
  newPhoto,
  message,
  isUploading,
  onPhotoChange,
  onUpload,
}) => {
  const displayPhoto = photoPreview || currentPhotoURL;

  return (
    <div className="flex flex-col items-center gap-4">
      <img
        src={displayPhoto}
        alt="Profile"
        className="w-28 h-28 rounded-full object-cover border-2 border-(--color-border)"
      />

      <label className="cursor-pointer bg-(--color-primary) text-white px-4 py-2 rounded-full hover:brightness-110 transition text-sm font-semibold">
        Change Photo
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPhotoChange}
          disabled={isUploading}
        />
      </label>

      {newPhoto && (
        <Button variant="primary" onClick={onUpload} disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload Photo"}
        </Button>
      )}

      {message && (
        <p
          className={`text-sm ${
            message.type === "success"
              ? "text-(--color-success)"
              : "text-(--color-danger)"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
};

export default ProfilePhotoSection;