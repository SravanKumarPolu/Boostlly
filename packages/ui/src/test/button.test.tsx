/**
 * Button Component Tests
 * 
 * Tests all button variants, sizes, and accessibility features
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../components/button";

describe("Button", () => {
  describe("Rendering", () => {
    it("should render button with text", () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
    });

    it("should render button with custom className", () => {
      const { container } = render(<Button className="custom-class">Test</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("custom-class");
    });

    it("should render disabled button", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("Variants", () => {
    it("should render default variant", () => {
      render(<Button variant="default">Default</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-primary");
    });

    it("should render destructive variant", () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-destructive");
    });

    it("should render outline variant", () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("border-2");
    });

    it("should render ghost variant", () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("text-foreground");
    });

    it("should render link variant", () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("underline-offset-4");
    });
  });

  describe("Sizes", () => {
    it("should render default size", () => {
      render(<Button size="default">Default</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-11");
    });

    it("should render small size", () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-9");
    });

    it("should render large size", () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-12");
    });

    it("should render extra large size", () => {
      render(<Button size="xl">XL</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-14");
    });

    it("should render icon size", () => {
      render(<Button size="icon">Icon</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-11", "w-11");
    });
  });

  describe("Accessibility", () => {
    it("should have aria-label when provided", () => {
      render(<Button ariaLabel="Close dialog">×</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Close dialog");
    });

    it("should have aria-describedby when provided", () => {
      render(<Button ariaDescribedBy="help-text">Help</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-describedby", "help-text");
    });

    it("should be keyboard accessible", () => {
      render(<Button>Keyboard</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("tabIndex", "0");
    });

    it("should have minimum tap target size (WCAG AA)", () => {
      render(<Button>Accessible</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("min-h-[44px]");
    });
  });

  describe("Interactions", () => {
    it("should call onClick when clicked", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(<Button onClick={handleClick}>Click</Button>);
      
      await user.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when disabled", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      
      await user.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should handle keyboard events", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(<Button onClick={handleClick}>Keyboard</Button>);
      
      const button = screen.getByRole("button");
      await user.type(button, "{Enter}");
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe("Props forwarding", () => {
    it("should forward HTML attributes", () => {
      render(<Button data-testid="custom-button" type="submit">Submit</Button>);
      const button = screen.getByTestId("custom-button");
      expect(button).toHaveAttribute("type", "submit");
    });

    it("should forward style prop", () => {
      render(<Button style={{ color: "red" }}>Styled</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveStyle({ color: "red" });
    });
  });
});

