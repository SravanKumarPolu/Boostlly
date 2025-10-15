import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "../lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      // Container
      "peer inline-flex h-[28px] w-[52px] shrink-0 cursor-pointer items-center rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-60",
      // OFF state
      "data-[state=unchecked]:bg-[hsl(var(--bg-hsl)/0.6)] data-[state=unchecked]:border-[hsl(var(--fg-hsl)/0.25)]",
      // ON state gradient + ring glow using design tokens
      "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:via-violet-500 data-[state=checked]:to-blue-500 data-[state=checked]:border-transparent data-[state=checked]:ring-4 data-[state=checked]:ring-purple-600/15 data-[state=checked]:ring-offset-0",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        // Knob size and animation
        "pointer-events-none block h-5 w-5 rounded-full transition-all duration-200 will-change-transform",
        // OFF knob
        "data-[state=unchecked]:translate-x-1 data-[state=unchecked]:bg-[hsl(var(--fg-hsl)/0.85)] data-[state=unchecked]:shadow-[inset_0_0_0_2px_hsl(var(--bg-hsl)/0.9),0_1px_2px_hsl(var(--fg-hsl)/0.25)]",
        // ON knob (light thumb on gradient track) with subtle elevation
        "data-[state=checked]:translate-x-[23px] data-[state=checked]:bg-card data-[state=checked]:shadow-lg data-[state=checked]:shadow-purple-600/35",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
