"use client";

import React from "react";

interface Step {
  text: string;
  imageUrl?: string;
  imageFile?: File;
}

interface StepsSectionProps {
  steps: Step[];
  stepsProgress: number[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdateText: (index: number, value: string) => void;
  onUpdateImage: (index: number, file: File) => void;
  errors?: {
    steps?: string;
  };
}

/**
 * StepsSection - Recipe steps management
 * Add, remove, and update steps with optional images and progress tracking
 */
export const StepsSection: React.FC<StepsSectionProps> = ({
  steps,
  stepsProgress,
  onAdd,
  onRemove,
  onUpdateText,
  onUpdateImage,
  errors,
}) => {
  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdateImage(index, file);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-(--color-text)">
        Steps *
      </label>

      {errors?.steps && (
        <p className="text-sm text-(--color-danger) mb-2">{errors.steps}</p>
      )}

      <div className="space-y-3">
        {steps.map((step, i) => (
          <div
            key={i}
            className="border-2 border-(--color-border) rounded-lg p-3 bg-(--color-bg-secondary)"
          >
            {/* Step Number and Text */}
            <div className="flex gap-2 mb-2">
              <span className="font-bold text-(--color-primary) shrink-0">
                {i + 1}.
              </span>
              <textarea
                className="flex-1 border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) min-h-16 text-sm focus:outline-none focus:border-(--color-primary)"
                placeholder={`Step ${i + 1} instructions...`}
                value={step.text}
                onChange={(e) => onUpdateText(i, e.target.value)}
              />
              {steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="px-3 h-8 rounded-full bg-(--color-danger) text-white hover:brightness-110 transition font-bold text-lg self-start"
                  aria-label="Remove step"
                >
                  ×
                </button>
              )}
            </div>

            {/* Image Upload */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(i, e)}
              className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:bg-(--color-secondary) file:text-white file:cursor-pointer file:text-xs"
            />

            {/* Image Preview */}
            {step.imageUrl && (
              <img
                src={step.imageUrl}
                alt={`Step ${i + 1}`}
                className="mt-2 w-full h-24 object-cover rounded border border-(--color-border)"
              />
            )}

            {/* Upload Progress */}
            {step.imageFile &&
              stepsProgress[i] > 0 &&
              stepsProgress[i] < 100 && (
                <div className="mt-1">
                  <div className="w-full bg-(--color-bg) rounded-full h-1.5">
                    <div
                      className="h-1.5 bg-(--color-success) rounded-full transition-all"
                      style={{ width: `${stepsProgress[i]}%` }}
                    />
                  </div>
                  <p className="text-xs text-(--color-text-muted) mt-0.5 text-center">
                    {Math.round(stepsProgress[i])}%
                  </p>
                </div>
              )}
          </div>
        ))}

        {/* Add Button */}
        <button
          type="button"
          onClick={onAdd}
          className="text-(--color-primary) hover:text-(--color-secondary) font-semibold text-sm transition"
        >
          + Add Step
        </button>
      </div>
    </div>
  );
};