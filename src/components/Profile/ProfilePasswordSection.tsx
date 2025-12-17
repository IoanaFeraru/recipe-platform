/**
 * ProfilePasswordSection component.
 *
 * Renders a focused form for updating the authenticated user’s password.
 * This component is presentation-oriented and delegates all validation,
 * authentication, and persistence logic to the parent layer.
 *
 * Responsibilities:
 * - Render controlled inputs for current and new passwords
 * - Trigger a password change action via callback
 * - Reflect loading state during an in-progress update
 * - Display validation or authentication errors
 * - Display success or failure feedback messages
 *
 * UX and security considerations:
 * - Separates current and new password inputs to align with re-authentication flows
 * - Disables the submit action while a password change is in progress
 * - Uses appropriate autocomplete attributes for password managers
 *
 * Accessibility considerations:
 * - Uses semantic form controls and buttons
 * - Provides clear, textual feedback for error and success states
 *
 * @module ProfilePasswordSection
 */

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

      <input
        type="password"
        placeholder="Current password"
        value={currentPassword}
        onChange={(e) => onCurrentPasswordChange(e.target.value)}
        className="px-3 py-2 rounded-md border border-(--color-border) bg-(--color-bg) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
        autoComplete="current-password"
      />

      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => onNewPasswordChange(e.target.value)}
        className="px-3 py-2 rounded-md border border-(--color-border) bg-(--color-bg) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
        autoComplete="new-password"
      />

      <Button variant="primary" onClick={onSubmit} disabled={isChanging}>
        {isChanging ? "Changing..." : "Change Password"}
      </Button>

      {error && <p className="text-sm text-(--color-danger)">{error}</p>}

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

export default ProfilePasswordSection;