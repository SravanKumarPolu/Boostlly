/**
 * Input Component Tests
 * 
 * Tests input component functionality and accessibility
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../components/input";

describe("Input", () => {
  describe("Rendering", () => {
    it("should render input element", () => {
      render(<Input />);
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("should render with placeholder", () => {
      render(<Input placeholder="Enter text" />);
      const input = screen.getByPlaceholderText("Enter text");
      expect(input).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      const { container } = render(<Input className="custom-input" />);
      const input = container.querySelector("input");
      expect(input).toHaveClass("custom-input");
    });

    it("should render with different input types", () => {
      const { rerender } = render(<Input type="text" />);
      let input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("type", "text");

      rerender(<Input type="email" />);
      input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("type", "email");

      rerender(<Input type="password" />);
      input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("type", "password");
    });
  });

  describe("Interactions", () => {
    it("should handle user input", async () => {
      const user = userEvent.setup();
      render(<Input />);
      const input = screen.getByRole("textbox");
      
      await user.type(input, "Hello World");
      expect(input).toHaveValue("Hello World");
    });

    it("should handle onChange events", async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole("textbox");
      
      await user.type(input, "test");
      expect(handleChange).toHaveBeenCalled();
    });

    it("should be disabled when disabled prop is set", () => {
      render(<Input disabled />);
      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });

    it("should not accept input when disabled", async () => {
      const user = userEvent.setup();
      render(<Input disabled />);
      const input = screen.getByRole("textbox");
      
      await user.type(input, "test");
      expect(input).toHaveValue("");
    });
  });

  describe("Accessibility", () => {
    it("should support aria-label", () => {
      render(<Input aria-label="Search input" />);
      const input = screen.getByLabelText("Search input");
      expect(input).toBeInTheDocument();
    });

    it("should support aria-describedby", () => {
      render(
        <>
          <Input aria-describedby="help-text" />
          <div id="help-text">Help text</div>
        </>
      );
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-describedby", "help-text");
    });

    it("should support required attribute", () => {
      render(<Input required />);
      const input = screen.getByRole("textbox");
      expect(input).toBeRequired();
    });
  });

  describe("Props forwarding", () => {
    it("should forward HTML attributes", () => {
      render(<Input data-testid="custom-input" name="username" />);
      const input = screen.getByTestId("custom-input");
      expect(input).toHaveAttribute("name", "username");
    });

    it("should forward ref", () => {
      const ref = { current: null };
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });
});

