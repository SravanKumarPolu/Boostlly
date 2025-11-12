/**
 * Badge Component Tests
 * 
 * Tests badge component variants and rendering
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "../components/badge";

describe("Badge", () => {
  describe("Rendering", () => {
    it("should render badge with text", () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText("New")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      const { container } = render(<Badge className="custom-badge">Test</Badge>);
      const badge = container.querySelector("div");
      expect(badge).toHaveClass("custom-badge");
    });
  });

  describe("Variants", () => {
    it("should render default variant", () => {
      render(<Badge variant="default">Default</Badge>);
      const badge = screen.getByText("Default");
      expect(badge).toHaveClass("bg-primary");
    });

    it("should render secondary variant", () => {
      render(<Badge variant="secondary">Secondary</Badge>);
      const badge = screen.getByText("Secondary");
      expect(badge).toHaveClass("bg-secondary");
    });

    it("should render destructive variant", () => {
      render(<Badge variant="destructive">Destructive</Badge>);
      const badge = screen.getByText("Destructive");
      expect(badge).toHaveClass("bg-destructive");
    });

    it("should render outline variant", () => {
      render(<Badge variant="outline">Outline</Badge>);
      const badge = screen.getByText("Outline");
      expect(badge).toHaveClass("border-border");
    });

    it("should render glass variant", () => {
      render(<Badge variant="glass">Glass</Badge>);
      const badge = screen.getByText("Glass");
      expect(badge).toHaveClass("backdrop-blur-xl");
    });

    it("should render gradient variant", () => {
      render(<Badge variant="gradient">Gradient</Badge>);
      const badge = screen.getByText("Gradient");
      expect(badge).toHaveClass("bg-gradient-to-r");
    });

    it("should render success variant", () => {
      render(<Badge variant="success">Success</Badge>);
      const badge = screen.getByText("Success");
      expect(badge).toHaveClass("bg-gradient-to-r");
    });
  });

  describe("Styling", () => {
    it("should have rounded corners", () => {
      render(<Badge>Test</Badge>);
      const badge = screen.getByText("Test");
      expect(badge).toHaveClass("rounded-full");
    });

    it("should have proper padding", () => {
      render(<Badge>Test</Badge>);
      const badge = screen.getByText("Test");
      expect(badge).toHaveClass("px-2.5", "py-0.5");
    });
  });
});

