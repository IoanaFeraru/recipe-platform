/**
 * ProfileNameSection component.
 *
 * Provides a focused UI for viewing and updating the user’s display name while
 * showing the associated email address in a read-only manner. This component
 * is intentionally limited to presentation and interaction handling; all
 * persistence and validation logic is delegated to the parent.
 *
 * Responsibilities:
 * - Render a controlled input for editing the display name
 * - Trigger a save action via a callback
 * - Display success or error feedback messages
 * - Show the user’s email address as contextual, non-editable information
 * - Disable actions while a save operation is in progress
 *
 * UX and design considerations:
 * - Centers content to align with profile-focused layouts
 * - Uses concise feedback messaging to communicate save results
 * - Keeps email read-only to avoid confusion about editable fields
 *
 * Accessibility considerations:
 * - Uses an explicit label/input association for screen readers
 * - Relies on semantic form controls and buttons
 *
 * @module ProfileNameSection
 */

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

      <Button variant="primary" onClick={onSave} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Name"}
      </Button>

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

      {email && (
        <p className="text-(--color-text-muted) text-sm mt-2">{email}</p>
      )}
    </div>
  );
};

export default ProfileNameSection;