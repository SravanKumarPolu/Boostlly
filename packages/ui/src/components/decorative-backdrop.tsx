// import * as React from "react";
import { cn } from "../lib/utils";

export interface DecorativeBackdropProps {
  className?: string;
  density?: "none" | "low" | "medium";
}

/**
 * DecorativeBackdrop renders extremely subtle, low-contrast shapes behind content.
 * - Respects prefers-reduced-motion (no animation when reduced)
 * - Intended for landing/empty states only
 */
export function DecorativeBackdrop({
  className,
  density = "low",
}: DecorativeBackdropProps) {
  if (density === "none") return null;

  const items = density === "medium" ? 4 : 2;

  return (
    <div
      aria-hidden
      data-decorative="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "absolute rounded-full blur-3xl opacity-10 will-change-transform",
            "bg-gradient-to-br from-purple-500/40 to-indigo-500/40",
            "animate-[backdropDrift_22s_linear_infinite]",
          )}
          style={{
            width: i % 2 === 0 ? 320 : 220,
            height: i % 2 === 0 ? 320 : 220,
            top: i % 2 === 0 ? -40 : 60,
            left: i % 2 === 0 ? -30 : undefined,
            right: i % 2 === 1 ? -30 : undefined,
            animationDelay: `${i * 2.5}s`,
          }}
        />
      ))}
      <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(ellipse_at_top_left,theme(colors.purple.400/.35),transparent_60%),radial-gradient(ellipse_at_bottom_right,theme(colors.indigo.400/.35),transparent_60%)]" />
    </div>
  );
}

export default DecorativeBackdrop;
