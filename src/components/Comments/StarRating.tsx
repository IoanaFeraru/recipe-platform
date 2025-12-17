"use client";

/**
 * StarRating
 *
 * Reusable star-based rating component that supports both interactive and
 * read-only modes. It renders a fixed five-star scale, allows users to select
 * a rating via click interactions, and optionally exposes hover state for
 * previewing a rating before selection.
 *
 * Responsibilities:
 * - Render a consistent five-star rating UI
 * - Support configurable sizes (small, medium, large)
 * - Allow controlled rating selection via callbacks
 * - Provide optional hover feedback for interactive use cases
 * - Support read-only display for existing ratings
 *
 * @component
 *
 * @param {Object} props
 * @param {number} props.value - Current rating value (1–5)
 * @param {(rating: Rating) => void} [props.onChange] - Callback fired when a rating is selected
 * @param {boolean} [props.readonly=false] - Disables interaction when true
 * @param {"sm" | "md" | "lg"} [props.size="md"] - Visual size of the stars
 * @param {(rating: Rating | null) => void} [props.onHover] - Callback fired on hover enter/leave
 *
 * @example
 * ```tsx
 * <StarRating
 *   value={4}
 *   onChange={(rating) => setRating(rating)}
 *   onHover={(rating) => setPreview(rating)}
 *   size="lg"
 * />
 * ```
 */

import { Rating } from "@/types/comment";

interface StarRatingProps {
  value: number;
  onChange?: (rating: Rating) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  onHover?: (rating: Rating | null) => void;
}

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
  onHover,
}: StarRatingProps) {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  const starSize = sizes[size];

  const handleClick = (rating: Rating) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: Rating) => {
    if (!readonly && onHover) {
      onHover(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly && onHover) {
      onHover(null);
    }
  };

  return (
    <div className="flex gap-1" onMouseLeave={handleMouseLeave}>
      {([1, 2, 3, 4, 5] as Rating[]).map((rating) => (
        <button
          key={rating}
          type="button"
          disabled={readonly}
          onClick={() => handleClick(rating)}
          onMouseEnter={() => handleMouseEnter(rating)}
          className={`transition-transform ${
            !readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"
          }`}
          aria-label={`Rate ${rating} stars`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={starSize}
            height={starSize}
            fill={rating <= value ? "#f59e0b" : "#d1d5db"}
            className="transition-colors"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </button>
      ))}
    </div>
  );
}