"use client";

import React from "react";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="flex justify-center items-start px-4 pt-20 pb-6 bg-(--color-bg)">
      <div className="w-full max-w-md bg-(--color-bg-secondary) rounded-xl shadow-lg p-6">
        <h1 className="text-3xl mb-1 text-center garet-heavy text-(--color-text)">
          {title}
        </h1>
        {subtitle && (
          <p className="text-center text-(--color-text-muted) mb-4">
            {subtitle}
          </p>
        )}

        {children}
      </div>
    </div>
  );
}
