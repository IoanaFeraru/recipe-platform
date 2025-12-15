"use client";

import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

/**
 * ConfirmationModal - Reusable confirmation dialog
 * Displays a modal with a message and confirm/cancel buttons
 */
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-(--color-bg-primary) rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-(--color-border)"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2 className="text-2xl font-bold text-(--color-text) mb-4 garet-heavy">
          {title}
        </h2>

        {/* Message */}
        <p className="text-(--color-text-muted) mb-6 leading-relaxed">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full border-2 border-(--color-border) text-(--color-text) font-semibold hover:bg-(--color-bg-secondary) transition"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-6 py-2 rounded-full font-semibold text-white transition hover:brightness-110 ${
              isDangerous
                ? "bg-(--color-danger)"
                : "bg-(--color-primary)"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
