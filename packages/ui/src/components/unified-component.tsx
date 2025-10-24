/**
 * Unified Component Architecture
 * 
 * Provides a consistent foundation for all UI components with common patterns
 * for styling, behavior, accessibility, and performance optimization.
 */

import React, { forwardRef, useMemo, useCallback, useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { usePerformanceMonitor } from '@boostlly/core';

/**
 * Base component props interface
 */
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  testId?: string;
  'data-testid'?: string;
}

/**
 * Component state interface
 */
export interface ComponentState {
  isHovered: boolean;
  isFocused: boolean;
  isPressed: boolean;
  isDisabled: boolean;
  isLoading: boolean;
  hasError: boolean;
}

/**
 * Component configuration interface
 */
export interface ComponentConfig {
  enablePerformanceMonitoring: boolean;
  enableAccessibility: boolean;
  enableAnimations: boolean;
  enableHoverEffects: boolean;
  enableFocusManagement: boolean;
}

/**
 * Base component hook for common functionality
 */
export function useBaseComponent(
  props: BaseComponentProps,
  config: Partial<ComponentConfig> = {}
) {
  const {
    enablePerformanceMonitoring = true,
    enableAccessibility = true,
    enableAnimations = true,
    enableHoverEffects = true,
    enableFocusManagement = true,
  } = config;

  const [state, setState] = useState<ComponentState>({
    isHovered: false,
    isFocused: false,
    isPressed: false,
    isDisabled: props.disabled || false,
    isLoading: props.loading || false,
    hasError: !!props.error,
  });

  const { metrics, measureRender } = usePerformanceMonitor();

  // Update state when props change
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isDisabled: props.disabled || false,
      isLoading: props.loading || false,
      hasError: !!props.error,
    }));
  }, [props.disabled, props.loading, props.error]);

  // Event handlers
  const handleMouseEnter = useCallback(() => {
    if (enableHoverEffects && !state.isDisabled) {
      setState(prev => ({ ...prev, isHovered: true }));
    }
  }, [enableHoverEffects, state.isDisabled]);

  const handleMouseLeave = useCallback(() => {
    if (enableHoverEffects) {
      setState(prev => ({ ...prev, isHovered: false, isPressed: false }));
    }
  }, [enableHoverEffects]);

  const handleMouseDown = useCallback(() => {
    if (!state.isDisabled) {
      setState(prev => ({ ...prev, isPressed: true }));
    }
  }, [state.isDisabled]);

  const handleMouseUp = useCallback(() => {
    setState(prev => ({ ...prev, isPressed: false }));
  }, []);

  const handleFocus = useCallback(() => {
    if (enableFocusManagement && !state.isDisabled) {
      setState(prev => ({ ...prev, isFocused: true }));
    }
  }, [enableFocusManagement, state.isDisabled]);

  const handleBlur = useCallback(() => {
    if (enableFocusManagement) {
      setState(prev => ({ ...prev, isFocused: false }));
    }
  }, [enableFocusManagement]);

  // Generate class names
  const classNames = useMemo(() => {
    const baseClasses = [
      'relative',
      'transition-all',
      'duration-200',
      'ease-in-out',
    ];

    const stateClasses = [
      state.isDisabled && 'opacity-50 cursor-not-allowed',
      state.isLoading && 'cursor-wait',
      state.hasError && 'border-red-500',
      state.isHovered && enableHoverEffects && 'hover:scale-105',
      state.isFocused && 'ring-2 ring-blue-500 ring-opacity-50',
      state.isPressed && 'scale-95',
    ].filter(Boolean);

    const variantClasses = {
      default: 'bg-white border border-gray-300 text-gray-900',
      primary: 'bg-blue-600 border-blue-600 text-white',
      secondary: 'bg-gray-600 border-gray-600 text-white',
      destructive: 'bg-red-600 border-red-600 text-white',
      outline: 'bg-transparent border border-gray-300 text-gray-900',
      ghost: 'bg-transparent border-transparent text-gray-900',
    };

    const sizeClasses = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl',
    };

    return cn(
      baseClasses,
      stateClasses,
      variantClasses[props.variant || 'default'],
      sizeClasses[props.size || 'md'],
      props.className
    );
  }, [props, state, enableHoverEffects]);

  // Generate accessibility attributes
  const accessibilityProps = useMemo(() => {
    if (!enableAccessibility) return {};

    return {
      'aria-disabled': state.isDisabled,
      'aria-busy': state.isLoading,
      'aria-invalid': state.hasError,
      'aria-describedby': state.hasError ? `${props.testId || 'component'}-error` : undefined,
      role: 'button',
      tabIndex: state.isDisabled ? -1 : 0,
    };
  }, [enableAccessibility, state, props.testId]);

  // Performance monitoring
  const measurePerformance = useCallback(
    (operation: string, fn: () => void) => {
      if (enablePerformanceMonitoring) {
        measureRender(operation, fn);
      } else {
        fn();
      }
    },
    [enablePerformanceMonitoring, measureRender]
  );

  return {
    state,
    classNames,
    accessibilityProps,
    eventHandlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
    measurePerformance,
    metrics,
  };
}

/**
 * Base component wrapper with common functionality
 */
export const BaseComponent = forwardRef<
  HTMLDivElement,
  BaseComponentProps & {
    as?: 'div' | 'span' | 'section' | 'article' | 'main' | 'header' | 'footer' | 'nav' | 'aside';
    config?: Partial<ComponentConfig>;
  }
>(({ as: Component = 'div', config, children, ...props }, ref) => {
  const {
    state,
    classNames,
    accessibilityProps,
    eventHandlers,
    measurePerformance,
  } = useBaseComponent(props, config);

  const renderContent = useCallback(() => {
    return (
      <>
        {state.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
        {children}
        {state.hasError && props.error && (
          <div
            id={`${props.testId || 'component'}-error`}
            className="absolute -bottom-6 left-0 text-xs text-red-500"
          >
            {props.error}
          </div>
        )}
      </>
    );
  }, [children, state, props.error, props.testId]);

  const content = (
    <Component
      ref={ref}
      className={classNames}
      data-testid={props.testId || props['data-testid']}
      {...accessibilityProps}
      {...eventHandlers}
    >
      {renderContent()}
    </Component>
  );

  measurePerformance('BaseComponent', () => {});
  return content;
});

BaseComponent.displayName = 'BaseComponent';

/**
 * Higher-order component for adding common functionality
 */
export function withBaseComponent<P extends BaseComponentProps>(
  WrappedComponent: React.ComponentType<P>,
  defaultConfig?: Partial<ComponentConfig>
) {
  return forwardRef<any, P & { config?: Partial<ComponentConfig> }>(
    (props, ref) => {
      const config = { ...defaultConfig, ...props.config };
      
      return (
        <BaseComponent
          {...(props as any)}
          config={config}
          ref={ref}
        >
          <WrappedComponent {...(props as P)} />
        </BaseComponent>
      );
    }
  );
}

/**
 * Component composition utilities
 */
export const ComponentUtils = {
  /**
   * Create variant-based class names
   */
  createVariantClasses: (
    baseClasses: string,
    variant: string,
    size: string,
    state: ComponentState
  ) => {
    return cn(
      baseClasses,
      `variant-${variant}`,
      `size-${size}`,
      state.isDisabled && 'disabled',
      state.isLoading && 'loading',
      state.hasError && 'error',
      state.isHovered && 'hovered',
      state.isFocused && 'focused',
      state.isPressed && 'pressed'
    );
  },

  /**
   * Generate responsive class names
   */
  createResponsiveClasses: (classes: Record<string, string>) => {
    return Object.entries(classes)
      .map(([breakpoint, className]) => {
        if (breakpoint === 'default') return className;
        return `${breakpoint}:${className}`;
      })
      .join(' ');
  },

  /**
   * Create animation classes
   */
  createAnimationClasses: (
    enableAnimations: boolean,
    animationType: 'fade' | 'slide' | 'scale' | 'bounce' = 'fade'
  ) => {
    if (!enableAnimations) return '';
    
    const animations = {
      fade: 'animate-fade-in',
      slide: 'animate-slide-in',
      scale: 'animate-scale-in',
      bounce: 'animate-bounce-in',
    };

    return `transition-all duration-300 ease-in-out ${animations[animationType]}`;
  },

  /**
   * Generate accessibility attributes
   */
  createAccessibilityProps: (
    state: ComponentState,
    testId?: string,
    label?: string
  ) => {
    return {
      'aria-disabled': state.isDisabled,
      'aria-busy': state.isLoading,
      'aria-invalid': state.hasError,
      'aria-label': label,
      'aria-describedby': state.hasError ? `${testId}-error` : undefined,
      role: 'button',
      tabIndex: state.isDisabled ? -1 : 0,
    };
  },
};

/**
 * Performance-optimized component wrapper
 */
export function withPerformanceOptimization<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    enableMemo?: boolean;
    enableCallback?: boolean;
    enableLazyLoading?: boolean;
    performanceThreshold?: number;
  } = {}
) {
  const {
    enableMemo = true,
    enableCallback = true,
    enableLazyLoading = false,
    performanceThreshold = 16, // 60fps
  } = options;

  return React.memo(
    forwardRef<any, P>((props, ref) => {
      const [shouldRender, setShouldRender] = useState(!enableLazyLoading);

      useEffect(() => {
        if (enableLazyLoading) {
          const timer = setTimeout(() => setShouldRender(true), 0);
          return () => clearTimeout(timer);
        }
      }, [enableLazyLoading]);

      if (enableLazyLoading && !shouldRender) {
        return <div className="animate-pulse bg-gray-200 rounded h-8 w-full" />;
      }

      return <Component {...(props as P)} ref={ref} />;
    }),
    (prevProps, nextProps) => {
      if (!enableMemo) return false;
      
      // Custom comparison logic for performance optimization
      return JSON.stringify(prevProps) === JSON.stringify(nextProps);
    }
  );
}
