"use client";

import React from "react";
import Button from "@/components/UI/Button";

interface ProfileMessage {
  type: "success" | "error";
  text: string;
}

interface ProfileNameSectionProps {
  name: string;
  email: string | null;
  message: ProfileMessage | null;
  isSaving: boolean;
  onNameChange: (value: string) => void;
  onSave: () => void;
}

/**
 * ProfileNameSection - Name editing and email display
 */
export const ProfileNameSection: React.FC<ProfileNameSectionProps> = ({
  name,
  email,
  message,
  isSaving,
  onNameChange,
  onSave,
}) => {
  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm">
      {/* Name input */}
      <div className="w-full">
        <label 
          htmlFor="displayName"
          className="block text-sm font-medium text-(--color-text) mb-1"
        >
          Display Name
        </label>
        <input
          id="displayName"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-(--color-border) bg-(--color-bg) focus:outline-none focus:ring-2 focus:ring-(--color-primary) text-center"
          placeholder="Your name"
        />
      </div>
      
      {/* Save button */}
      <Button 
        variant="primary" 
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save Name"}
      </Button>
      
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
      
      {/* Email display (read-only) */}
      {email && (
        <p className="text-(--color-text-muted) text-sm mt-2">
          {email}
        </p>
      )}
    </div>
  );
};

export default ProfileNameSection;