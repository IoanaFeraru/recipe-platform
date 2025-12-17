/**
 * ProfileDangerZone component.
 *
 * Provides a dedicated section for irreversible and high-risk account actions,
 * specifically permanent account deletion. This component encapsulates all UI
 * and interaction logic required to safely trigger destructive operations,
 * including explicit user confirmation via a modal dialog.
 *
 * Responsibilities:
 * - Clearly communicate the irreversible nature of account deletion
 * - Prevent accidental deletion through a confirmation modal
 * - Disable destructive actions while a deletion request is in progress
 * - Delegate the actual deletion logic to the parent via a callback
 *
 * Design and UX considerations:
 * - Visually separated from other profile actions using a "danger zone" pattern
 * - Uses strong warning language and color cues to indicate risk
 * - Requires explicit confirmation before invoking the delete callback
 *
 * Accessibility considerations:
 * - Uses semantic buttons for all actions
 * - Confirmation modal ensures deliberate user intent
 *
 * @module ProfileDangerZone
 */

"use client";

import React, { useState } from "react";
import Button from "@/components/UI/Button";
import ConfirmationModal from "@/components/UI/ConfirmationModal";

interface ProfileDangerZoneProps {
  isDeleting: boolean;
  onDelete: () => void;
}

export const ProfileDangerZone: React.FC<ProfileDangerZoneProps> = ({
  isDeleting,
  onDelete,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleConfirmDelete = () => {
    setShowConfirmation(false);
    onDelete();
  };

  return (
    <div className="flex flex-col items-center gap-3 mt-6 pt-6 border-t-2 border-(--color-border) w-full max-w-sm">
      <h3 className="text-lg font-semibold text-(--color-danger)">
        Danger Zone
      </h3>

      <p className="text-sm text-(--color-text-muted) text-center">
        Once you delete your account, there is no going back. Please be certain.
      </p>

      <Button
        variant="danger"
        onClick={() => setShowConfirmation(true)}
        disabled={isDeleting}
      >
        {isDeleting ? "Deleting..." : "Delete Account"}
      </Button>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and all your recipes will be permanently deleted."
        confirmText="Delete My Account"
        cancelText="Cancel"
        isDangerous
      />
    </div>
  );
};

export default ProfileDangerZone;