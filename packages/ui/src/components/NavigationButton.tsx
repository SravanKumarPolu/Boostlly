import React from 'react';
import { BUTTONS } from '../constants/styles';

interface NavigationButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

/**
 * Reusable Navigation Button Component
 * 
 * Eliminates the repeated navigation button styling patterns.
 * Provides consistent styling for active, inactive, and disabled states.
 */
export function NavigationButton({
  children,
  onClick,
  isActive = false,
  isDisabled = false,
  className = '',
  icon,
}: NavigationButtonProps) {
  const getButtonClasses = () => {
    if (isDisabled) {
      return `${BUTTONS.NAV_BASE} ${BUTTONS.NAV_DISABLED}`;
    }
    if (isActive) {
      return `${BUTTONS.NAV_BASE} ${BUTTONS.NAV_ACTIVE}`;
    }
    return `${BUTTONS.NAV_BASE} ${BUTTONS.NAV_INACTIVE}`;
  };

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`${getButtonClasses()} ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}

export default NavigationButton;
