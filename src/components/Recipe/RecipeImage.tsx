/**
 * RecipeImage component.
 *
 * Renders the hero image at the top of a recipe detail page. This component is
 * intentionally simple and presentation-focused, providing a visually engaging
 * full-width image while gracefully handling cases where no image is available.
 *
 * Responsibilities:
 * - Display a large, responsive hero image for the recipe
 * - Optimize image loading using Next.js Image component
 * - Apply a subtle bottom fade-out mask for smooth visual transition into content
 * - Render nothing when no image URL is provided (no empty placeholders)
 *
 * Design considerations:
 * - Uses full-width, fixed-height layout to create strong visual impact
 * - Object-cover ensures consistent cropping across aspect ratios
 * - Gradient mask softens the edge between image and page content
 *
 * Performance considerations:
 * - `priority` flag ensures fast loading for above-the-fold content
 * - Responsive sizing (`sizes="100vw"`) enables optimal image selection
 *
 * Accessibility notes:
 * - Alt text is derived from the recipe title for meaningful context
 *
 * @param {RecipeImageProps} props - Recipe image URL and title.
 * @returns A full-width hero image for the recipe, or null if no image is provided.
 */

"use client";

import React from "react";
import Image from "next/image";

interface RecipeImageProps {
  imageUrl?: string;
  title: string;
}

export const RecipeImage: React.FC<RecipeImageProps> = ({
  imageUrl,
  title,
}) => {
  if (!imageUrl) return null;

  return (
    <div className="relative w-full h-96 overflow-hidden">
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-cover"
        priority
        sizes="100vw"
        style={{
          maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, transparent 100%)",
        }}
      />
    </div>
  );
};