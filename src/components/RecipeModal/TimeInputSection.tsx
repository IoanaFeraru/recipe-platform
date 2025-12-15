"use client";

import React from "react";

interface TimeInputSectionProps {
  minActiveHours: number;
  minActiveMinutes: number;
  maxActiveHours: number;
  maxActiveMinutes: number;
  minPassiveHours: number;
  minPassiveMinutes: number;
  maxPassiveHours: number;
  maxPassiveMinutes: number;
  hasPassiveTime: boolean;
  onMinActiveHoursChange: (value: number) => void;
  onMinActiveMinutesChange: (value: number) => void;
  onMaxActiveHoursChange: (value: number) => void;
  onMaxActiveMinutesChange: (value: number) => void;
  onMinPassiveHoursChange: (value: number) => void;
  onMinPassiveMinutesChange: (value: number) => void;
  onMaxPassiveHoursChange: (value: number) => void;
  onMaxPassiveMinutesChange: (value: number) => void;
  onHasPassiveTimeChange: (value: boolean) => void;
  errors?: {
    maxActivePrepTime?: string;
  };
}

/**
 * TimeInputSection - Active and passive time inputs
 * Includes min/max ranges for both active and passive time
 */
export const TimeInputSection: React.FC<TimeInputSectionProps> = ({
  minActiveHours,
  minActiveMinutes,
  maxActiveHours,
  maxActiveMinutes,
  minPassiveHours,
  minPassiveMinutes,
  maxPassiveHours,
  maxPassiveMinutes,
  hasPassiveTime,
  onMinActiveHoursChange,
  onMinActiveMinutesChange,
  onMaxActiveHoursChange,
  onMaxActiveMinutesChange,
  onMinPassiveHoursChange,
  onMinPassiveMinutesChange,
  onMaxPassiveHoursChange,
  onMaxPassiveMinutesChange,
  onHasPassiveTimeChange,
  errors,
}) => {
  return (
    <div className="border-2 border-(--color-border) rounded-lg p-4 bg-(--color-bg-secondary)">
      <label className="block text-sm font-semibold mb-3 text-(--color-text)">
        Time Information *
      </label>

      {errors?.maxActivePrepTime && (
        <p className="text-sm text-(--color-danger) mb-2">
          {errors.maxActivePrepTime}
        </p>
      )}

      {/* Active Prep Time */}
      <div className="mb-3">
        <label className="block text-xs font-medium mb-2 text-(--color-text-muted)">
          Active Prep Time *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {/* Min Time */}
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm"
              placeholder="0"
              value={minActiveHours || ""}
              onChange={(e) => onMinActiveHoursChange(parseInt(e.target.value) || 0)}
            />
            <span className="text-xs self-center text-(--color-text-muted)">h</span>
            <input
              type="number"
              min="0"
              max="59"
              className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm"
              placeholder="0"
              value={minActiveMinutes || ""}
              onChange={(e) => onMinActiveMinutesChange(parseInt(e.target.value) || 0)}
            />
            <span className="text-xs self-center text-(--color-text-muted)">m</span>
          </div>

          {/* Max Time */}
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm"
              placeholder="0"
              value={maxActiveHours || ""}
              onChange={(e) => onMaxActiveHoursChange(parseInt(e.target.value) || 0)}
            />
            <span className="text-xs self-center text-(--color-text-muted)">h</span>
            <input
              type="number"
              min="0"
              max="59"
              className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm"
              placeholder="0"
              value={maxActiveMinutes || ""}
              onChange={(e) => onMaxActiveMinutesChange(parseInt(e.target.value) || 0)}
            />
            <span className="text-xs self-center text-(--color-text-muted)">m</span>
          </div>
        </div>
      </div>

      {/* Passive Time Toggle */}
      <label className="flex items-center gap-2 cursor-pointer mb-2">
        <input
          type="checkbox"
          checked={hasPassiveTime}
          onChange={(e) => onHasPassiveTimeChange(e.target.checked)}
          className="w-4 h-4"
        />
        <span className="text-sm text-(--color-text)">Add passive time</span>
      </label>

      {/* Passive Time Inputs */}
      {hasPassiveTime && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {/* Min Passive Time */}
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm"
              placeholder="0"
              value={minPassiveHours || ""}
              onChange={(e) => onMinPassiveHoursChange(parseInt(e.target.value) || 0)}
            />
            <span className="text-xs self-center text-(--color-text-muted)">h</span>
            <input
              type="number"
              min="0"
              max="59"
              className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm"
              placeholder="0"
              value={minPassiveMinutes || ""}
              onChange={(e) => onMinPassiveMinutesChange(parseInt(e.target.value) || 0)}
            />
            <span className="text-xs self-center text-(--color-text-muted)">m</span>
          </div>

          {/* Max Passive Time */}
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm"
              placeholder="0"
              value={maxPassiveHours || ""}
              onChange={(e) => onMaxPassiveHoursChange(parseInt(e.target.value) || 0)}
            />
            <span className="text-xs self-center text-(--color-text-muted)">h</span>
            <input
              type="number"
              min="0"
              max="59"
              className="w-full border border-(--color-border) rounded p-2 bg-(--color-bg) text-(--color-text) text-sm"
              placeholder="0"
              value={maxPassiveMinutes || ""}
              onChange={(e) => onMaxPassiveMinutesChange(parseInt(e.target.value) || 0)}
            />
            <span className="text-xs self-center text-(--color-text-muted)">m</span>
          </div>
        </div>
      )}
    </div>
  );
};