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
      <h2 className={`${TYPOGRAPHY.SECTION_HEADER} ${headerClassName}`}>
        {title}
      </h2>
      {description && (
        <p className={`${TYPOGRAPHY.MUTED} ${contentClassName}`}>
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

export default Section;
