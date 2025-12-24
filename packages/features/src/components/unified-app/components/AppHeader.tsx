/**
 * App Header Component
 * 
 * Full-featured header with logo, time/date display, and voice controls
 */

import React from 'react';
import { Button } from '@boostlly/ui';
import { Mic, MicOff } from 'lucide-react';
import { Variant, TimeDateState } from '../types';
import { TimeDateDisplay } from './TimeDateDisplay';

interface AppHeaderProps {
  variant: Variant;
  timeDate: TimeDateState;
  voiceEnabled: boolean;
  voiceStatus: "off" | "ready" | "listening" | "error";
  palette?: { fg?: string; bg?: string };
  onVoiceToggle: () => void;
}

export function AppHeader({
  variant,
  timeDate,
  voiceEnabled,
  voiceStatus,
  palette,
  onVoiceToggle,
}: AppHeaderProps) {
  return (
    <header role="banner" className={variant === "popup" ? "mb-4" : "mb-6 sm:mb-8"}>
      <div
        className={
          variant === "popup" ? "mb-4" : "container mx-auto px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6 max-w-7xl"
        }
      >
        <div
          className={
            variant === "popup"
              ? "flex items-center justify-between"
              : "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0"
          }
        >
          {/* Logo and Title Section */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div
              className={
                variant === "popup"
                  ? "flex items-center gap-2"
                  : "flex items-center gap-2 sm:gap-3"
              }
            >
              <img
                src="/boostlly-logo.png"
                alt="Boostlly - Motivational Quotes App"
                className={
                  variant === "popup"
                    ? "w-8 h-8 rounded-lg"
                    : "w-8 sm:w-10 h-8 sm:h-10 rounded-lg"
                }
                width={variant === "popup" ? 32 : 40}
                height={variant === "popup" ? 32 : 40}
              />
              <div>
                <h1
                  id="site-title"
                  className={
                    variant === "popup"
                      ? "text-lg font-bold tracking-tight leading-tight"
                      : "text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-tight"
                  }
                  style={{ color: palette?.fg || "hsl(var(--foreground))" }}
                >
                  Boostlly
                </h1>
                <p
                  className={
                    variant === "popup"
                      ? "text-xs font-medium leading-normal mt-0.5"
                      : "text-xs sm:text-sm leading-normal mt-1 text-muted-foreground"
                  }
                  style={{ 
                    color: variant === "popup" 
                      ? (palette?.fg || "hsl(var(--foreground))")
                      : undefined
                  }}
                >
                  Tiny words. Big impact.
                </p>
              </div>
            </div>

            {/* Mic button - mobile only (right side of logo/title) */}
            <div className="sm:hidden">
              <Button
                variant={voiceEnabled ? "default" : "outline"}
                size="icon"
                title={
                  voiceEnabled
                    ? "Voice listening: on"
                    : "Voice listening: off"
                }
                aria-pressed={voiceEnabled}
                onClick={onVoiceToggle}
                className={
                  variant === "popup"
                    ? "text-foreground h-7 w-7"
                    : "text-foreground"
                }
                style={{
                  backgroundColor: voiceEnabled
                    ? palette?.bg
                    : "transparent",
                  color: palette?.fg || "hsl(var(--foreground))",
                  borderColor: palette?.fg || "hsl(var(--foreground))",
                }}
              >
                {voiceEnabled ? (
                  <Mic className="w-3 h-3" />
                ) : (
                  <MicOff className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Time and Date Display - Large Desktop only (center of header) */}
          <TimeDateDisplay timeDate={timeDate} variant={variant} palette={palette} />

          {/* Mic toggle placed in the header top-right - Desktop only */}
          <div className="hidden sm:flex items-center gap-2">
            {voiceEnabled && (
              <span className="text-xs md:text-sm text-muted-foreground leading-normal max-w-[40vw] truncate font-medium">
                {voiceStatus === "listening"
                  ? "Listening..."
                  : voiceStatus === "ready"
                    ? "Ready"
                    : voiceStatus === "error"
                      ? "Mic error"
                      : "Off"}
              </span>
            )}
            <Button
              variant={voiceEnabled ? "default" : "outline"}
              size="icon"
              title={
                voiceEnabled
                  ? "Voice listening: on"
                  : "Voice listening: off"
              }
              aria-pressed={voiceEnabled}
              onClick={onVoiceToggle}
              className={`rounded-2xl border backdrop-blur-md ${voiceEnabled ? "shadow-md" : "opacity-90"}`}
              style={{
                backgroundColor: "hsl(var(--bg-hsl) / 0.35)",
                color: "hsl(var(--fg-hsl))",
                borderColor: "hsl(var(--fg-hsl) / 0.3)",
              }}
            >
              {voiceEnabled ? (
                <Mic
                  className={variant === "popup" ? "w-3 h-3" : "w-4 h-4"}
                />
              ) : (
                <MicOff
                  className={variant === "popup" ? "w-3 h-3" : "w-4 h-4"}
                />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
