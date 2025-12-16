"use client";

import React, { useState } from "react";
import Button from "@/components/Button";
import ConfirmationModal from "@/components/UI/ConfirmationModal";

interface ProfileDangerZoneProps {
  isDeleting: boolean;
  onDelete: () => void;
}

/**
 * ProfileDangerZone - Dangerous account actions (deletion)
 * Includes confirmation dialog for safety
 */
export const ProfileDangerZone: React.FC<ProfileDangerZoneProps> = ({
  isDeleting,
  onDelete,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

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
        onClick={handleDeleteClick}
        disabled={isDeleting}
      >
        {isDeleting ? "Deleting..." : "Delete Account"}
      </Button>
      
      {/* Confirmation Modal */}
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