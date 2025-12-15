"use client";

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