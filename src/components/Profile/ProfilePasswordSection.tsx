"use client";

import React from "react";
import Button from "@/components/UI/Button";

interface ProfileMessage {
  type: "success" | "error";
  text: string;
}

interface ProfilePasswordSectionProps {
  currentPassword: string;
  newPassword: string;
  error: string;
  message: ProfileMessage | null;
  isChanging: boolean;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onSubmit: () => void;
}

/**
 * ProfilePasswordSection - Password change form
 */
export const ProfilePasswordSection: React.FC<ProfilePasswordSectionProps> = ({
  currentPassword,
  newPassword,
  error,
  message,
  isChanging,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onSubmit,
}) => {
  return (
    <div className="flex flex-col gap-3 w-full max-w-sm">
      <h3 className="text-lg font-semibold text-(--color-text) text-center">
        Change Password
      </h3>
      
      {/* Current password */}
      <input
        type="password"
        placeholder="Current password"
        value={currentPassword}
        onChange={(e) => onCurrentPasswordChange(e.target.value)}
        className="px-3 py-2 rounded-md border border-(--color-border) bg-(--color-bg) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
        autoComplete="current-password"
      />
      
      {/* New password */}
      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => onNewPasswordChange(e.target.value)}
        className="px-3 py-2 rounded-md border border-(--color-border) bg-(--color-bg) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
        autoComplete="new-password"
      />
      
      {/* Submit button */}
      <Button 
        variant="primary" 
        onClick={onSubmit}
        disabled={isChanging}
      >
        {isChanging ? "Changing..." : "Change Password"}
      </Button>
      
      {/* Error message */}
      {error && (
        <p className="text-sm text-(--color-danger)">
          {error}
        </p>
      )}
      
      {/* Success message */}
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

export default ProfilePasswordSection;