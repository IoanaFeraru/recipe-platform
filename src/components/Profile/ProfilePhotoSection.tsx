"use client";

import React from "react";
import Button from "@/components/Button";

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

/**
 * ProfilePhotoSection - Profile photo display and upload
 */
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
      {/* Photo display */}
      <img
        src={displayPhoto}
        alt="Profile"
        className="w-28 h-28 rounded-full object-cover border-2 border-(--color-border)"
      />
      
      {/* Change photo button */}
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
      
      {/* Upload button (shows when new photo selected) */}
      {newPhoto && (
        <Button 
          variant="primary" 
          onClick={onUpload}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload Photo"}
        </Button>
      )}
      
      {/* Status message */}
      {message && (
        <p className={`text-sm ${
          message.type === "success" 
            ? "text-(--color-success)" 
            : "text-(--color-danger)"
        }`}>
          {message.text}
        </p>
      )}
    </div>
  );
};

export default ProfilePhotoSection;