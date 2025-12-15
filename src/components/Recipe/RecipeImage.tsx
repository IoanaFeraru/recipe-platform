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
      />
      {/* Gradient overlay for better text readability on following content */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent to-(--color-bg) opacity-30" />
    </div>
  );
};