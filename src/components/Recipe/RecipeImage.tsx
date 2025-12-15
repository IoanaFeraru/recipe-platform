"use client";

import React from "react";
import Image from "next/image";

interface RecipeImageProps {
  imageUrl?: string;
  title: string;
}

/**
 * RecipeImage - Hero image for recipe page
 * Full-width image with fallback for missing images
 */
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
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
        }}
      />
    </div>
  );
};