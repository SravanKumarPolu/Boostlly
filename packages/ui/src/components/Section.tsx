import React from 'react';
import { TYPOGRAPHY, COMMON } from '../constants/styles';

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

/**
 * Reusable Section Component
 * 
 * Eliminates the repeated pattern of section headers with consistent styling.
 * Used throughout the application for consistent section layouts.
 */
export function Section({
  title,
  description,
  children,
  className = '',
  headerClassName = '',
  contentClassName = '',
}: SectionProps) {
  return (
    <div className={`${COMMON.SECTION} ${className}`}>
      <h2 className={`text-xl md:text-2xl font-semibold tracking-tight leading-snug mb-4 md:mb-6 ${headerClassName}`}>
        {title}
      </h2>
      {description && (
        <p className={`text-sm md:text-base text-muted-foreground leading-relaxed mb-4 ${contentClassName}`}>
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

export default Section;
