/**
 * Time and Date Display Component
 * 
 * Displays current time and date with customizable formatting
 */

import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { TimeDateState, Variant } from '../types';

interface TimeDateDisplayProps {
  timeDate: TimeDateState;
  variant: Variant;
  palette?: { fg?: string };
}

export function TimeDateDisplay({ timeDate, variant, palette }: TimeDateDisplayProps) {
  if (!timeDate.isClient || !timeDate.showTimeDate) return null;

  // Desktop version (large screens) - for header
  return (
    <div
      className="hidden lg:flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1 rounded-lg backdrop-blur-md border"
      style={{
        color: palette?.fg || "hsl(var(--foreground))",
        backgroundColor: "hsl(var(--bg-hsl) / 0.35)",
        borderColor: "hsl(var(--fg-hsl) / 0.3)",
        textShadow: "0 1px 2px rgba(0,0,0,0.25)",
      }}
    >
      <div className="flex items-center gap-1 sm:gap-2">
        <Clock className="w-3 h-3" />
        <span className="text-[10px] sm:text-xs font-medium">
          {timeDate.currentTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: timeDate.timeFormat === "12",
          })}
        </span>
      </div>
      <div className="w-px h-3 bg-current opacity-30"></div>
      <div className="flex items-center gap-1 sm:gap-2">
        <Calendar className="w-3 h-3" />
        <span className="text-[10px] sm:text-xs font-medium">
          {timeDate.dateFormat === "compact"
            ? timeDate.currentTime.toLocaleDateString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : timeDate.currentTime.toLocaleDateString([], {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
        </span>
      </div>
    </div>
  );
}

/**
 * Mobile Time/Date Display Component
 * 
 * Separate component for mobile time/date display below header
 */
export function MobileTimeDateDisplay({ timeDate, variant, palette }: TimeDateDisplayProps) {
  if (!timeDate.isClient || !timeDate.showTimeDate) return null;

  // Mobile version (small/medium screens) - for below header
  return (
    <div className="lg:hidden container mx-auto px-4 pt-2 pb-3">
      <div
        className="flex items-center justify-center gap-3 px-3 py-2 rounded-lg backdrop-blur-md border"
        style={{
          color: palette?.fg || "hsl(var(--foreground))",
          backgroundColor: "hsl(var(--bg-hsl) / 0.35)",
          borderColor: "hsl(var(--fg-hsl) / 0.3)",
          textShadow: "0 1px 2px rgba(0,0,0,0.25)",
        }}
      >
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">
            {timeDate.currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: timeDate.timeFormat === "12",
            })}
          </span>
        </div>
        <div className="w-px h-4 bg-current opacity-30"></div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">
            {timeDate.currentTime.toLocaleDateString([], {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
