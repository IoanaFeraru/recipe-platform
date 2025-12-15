"use client";

import React from "react";
import Image from "next/image";

interface Step {
  text: string;
  imageUrl?: string;
}

interface RecipeInstructionsProps {
  steps: Step[];
}

/**
 * RecipeInstructions - Displays step-by-step cooking instructions
 */
export const RecipeInstructions: React.FC<RecipeInstructionsProps> = ({
  steps,
}) => {
  return (
    <div className="bg-(--color-bg) rounded-2xl p-6 border-2 border-(--color-border)">
      <h2 className="text-2xl font-bold mb-6 garet-heavy text-(--color-text)">
        Instructions
      </h2>
      <ol className="space-y-6">
        {steps.map((step, index) => (
          <InstructionStep
            key={index}
            step={step}
            stepNumber={index + 1}
          />
        ))}
      </ol>
    </div>
  );
};

/**
 * InstructionStep - Individual instruction step with optional image
 */
const InstructionStep: React.FC<{
  step: Step;
  stepNumber: number;
}> = React.memo(({ step, stepNumber }) => (
  <li className="flex gap-4">
    {/* Step Number */}
    <div className="shrink-0">
      <div className="w-10 h-10 rounded-full bg-(--color-primary) text-white font-bold text-lg flex items-center justify-center">
        {stepNumber}
      </div>
    </div>

    {/* Step Content */}
    <div className="flex-1">
      <p className="text-(--color-text) leading-relaxed mb-3 text-lg">
        {step.text}
      </p>

      {/* Step Image */}
      {step.imageUrl && (
        <div className="relative w-full h-80 rounded-lg overflow-hidden border-2 border-(--color-border)">
          <Image
            src={step.imageUrl}
            alt={`Step ${stepNumber}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
    </div>
  </li>
));

InstructionStep.displayName = "InstructionStep";