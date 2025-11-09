import React from 'react';
import { cn } from '../lib/utils';

interface NavigationButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  'aria-label'?: string;
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
}

/**
 * Reusable Navigation Button Component
 * 
 * Modern, accessible navigation button with smooth transitions
 * and WCAG AA+ compliant contrast ratios.
 */
export function NavigationButton({
  children,
  onClick,
  isActive = false,
  isDisabled = false,
  className = '',
  icon,
  'aria-label': ariaLabel,
  'aria-current': ariaCurrent,
}: NavigationButtonProps) {
  const baseClasses = cn(
    "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl",
    "text-sm font-medium transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
    "min-h-[44px] min-w-[44px]", // WCAG AA: minimum tap target size
  );

  const activeClasses = isActive
    ? "bg-primary text-primary-foreground shadow-sm"
    : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent/10";

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-current={isActive ? (ariaCurrent || 'page') : undefined}
      className={cn(baseClasses, activeClasses, className)}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

export default NavigationButton;
