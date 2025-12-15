"use client";

import React from "react";

interface DifficultySliderProps {
  difficulty: "easy" | "medium" | "hard" | null;
  onDifficultyChange: (difficulty: "easy" | "medium" | "hard" | null) => void;
}

const DIFFICULTY_OPTIONS = [
  { value: "easy" as const, label: "Easy", emoji: "😊", color: "#90A493" },
  { value: "medium" as const, label: "Medium", emoji: "😐", color: "#D68662" },
  { value: "hard" as const, label: "Hard", emoji: "😤", color: "#e04038" },
];

export const DifficultySlider: React.FC<DifficultySliderProps> = ({
  difficulty,
  onDifficultyChange,
}) => {
  const handleSelect = (value: "easy" | "medium" | "hard") => {
    if (difficulty === value) {
      onDifficultyChange(null);
    } else {
      onDifficultyChange(value);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-3 text-(--color-text)">
        🎯 Difficulty Level
      </label>

      {/* Slider Track */}
      <div className="relative">
        {/* Background gradient track */}
        <div
          className="h-3 rounded-full mb-4"
          style={{
            background: "linear-gradient(to right, #90A493 0%, #D68662 50%, #e04038 100%)",
            opacity: 0.3,
          }}
        />

        {/* Difficulty buttons */}
        <div className="flex justify-between items-center -mt-6 relative">
          {DIFFICULTY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                flex flex-col items-center gap-1 transition-all duration-300
                ${difficulty === option.value ? "scale-125" : "scale-100 opacity-70 hover:opacity-100 hover:scale-110"}
              `}
              aria-label={`Set difficulty to ${option.label}`}
            >
              {/* Emoji circle */}
              <div
                className={`
                  w-14 h-14 rounded-full flex items-center justify-center text-2xl
                  transition-all duration-300
                  ${
                    difficulty === option.value
                      ? "shadow-[0_0_20px_rgba(0,0,0,0.3)] ring-4 ring-white"
                      : "shadow-[0_4px_10px_rgba(0,0,0,0.2)]"
                  }
                `}
                style={{
                  backgroundColor: option.color,
                }}
              >
                {option.emoji}
              </div>

              {/* Label */}
              <span
                className={`
                  text-xs font-semibold transition-all
                  ${difficulty === option.value ? "text-(--color-text) scale-110" : "text-(--color-text-muted)"}
                `}
              >
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};