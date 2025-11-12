/**
 * Card Component Tests
 * 
 * Tests card component and its subcomponents
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/card";

describe("Card", () => {
  describe("Rendering", () => {
    it("should render card with children", () => {
      render(
        <Card>
          <div>Card content</div>
        </Card>
      );
      expect(screen.getByText("Card content")).toBeInTheDocument();
    });

    it("should render card with custom className", () => {
      const { container } = render(<Card className="custom-card">Test</Card>);
      const card = container.querySelector('[data-card="true"]');
      expect(card).toHaveClass("custom-card");
    });

    it("should have data-card attribute", () => {
      const { container } = render(<Card>Test</Card>);
      const card = container.querySelector('[data-card="true"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("should render default card", () => {
      const { container } = render(<Card>Default</Card>);
      const card = container.querySelector('[data-card="true"]');
      expect(card).toHaveClass("bg-card");
    });

    it("should render adaptive card", () => {
      const { container } = render(<Card adaptive>Adaptive</Card>);
      const card = container.querySelector('[data-card="true"]');
      expect(card).toHaveClass("backdrop-blur-xl");
    });

    it("should render glass card", () => {
      const { container } = render(<Card glass>Glass</Card>);
      const card = container.querySelector('[data-card="true"]');
      expect(card).toHaveClass("backdrop-blur-xl");
    });
  });

  describe("Card Subcomponents", () => {
    it("should render CardHeader", () => {
      render(
        <Card>
          <CardHeader>Header</CardHeader>
        </Card>
      );
      expect(screen.getByText("Header")).toBeInTheDocument();
    });

    it("should render CardTitle", () => {
      render(
        <Card>
          <CardTitle>Title</CardTitle>
        </Card>
      );
      const title = screen.getByText("Title");
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe("H3");
    });

    it("should render CardDescription", () => {
      render(
        <Card>
          <CardDescription>Description</CardDescription>
        </Card>
      );
      expect(screen.getByText("Description")).toBeInTheDocument();
    });

    it("should render CardContent", () => {
      render(
        <Card>
          <CardContent>Content</CardContent>
        </Card>
      );
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("should render CardFooter", () => {
      render(
        <Card>
          <CardFooter>Footer</CardFooter>
        </Card>
      );
      expect(screen.getByText("Footer")).toBeInTheDocument();
    });

    it("should render complete card structure", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Card Content</CardContent>
          <CardFooter>Card Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText("Card Title")).toBeInTheDocument();
      expect(screen.getByText("Card Description")).toBeInTheDocument();
      expect(screen.getByText("Card Content")).toBeInTheDocument();
      expect(screen.getByText("Card Footer")).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should apply rounded corners", () => {
      const { container } = render(<Card>Test</Card>);
      const card = container.querySelector('[data-card="true"]');
      expect(card).toHaveClass("rounded-xl");
    });

    it("should apply border", () => {
      const { container } = render(<Card>Test</Card>);
      const card = container.querySelector('[data-card="true"]');
      expect(card).toHaveClass("border");
    });

    it("should apply shadow", () => {
      const { container } = render(<Card>Test</Card>);
      const card = container.querySelector('[data-card="true"]');
      expect(card).toHaveClass("shadow-sm");
    });
  });
});

