"use client";

/**
 * ConfirmationModal component.
 *
 * Displays a reusable confirmation dialog for potentially destructive or
 * high-impact user actions. The modal renders only when `isOpen` is true and
 * provides two explicit actions: cancel (close) and confirm (execute).
 *
 * Key behaviors:
 * - Backdrop click cancels via `onClose`
 * - Confirm triggers `onConfirm` and then closes (non-async by design)
 * - `isDangerous` visually emphasizes destructive actions
 */

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
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="bg-(--color-bg-primary) rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-(--color-border)"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-(--color-text) mb-4 garet-heavy">
          {title}
        </h2>

        <p className="text-(--color-text-muted) mb-6 leading-relaxed">
          {message}
        </p>

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
              isDangerous ? "bg-(--color-danger)" : "bg-(--color-primary)"
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