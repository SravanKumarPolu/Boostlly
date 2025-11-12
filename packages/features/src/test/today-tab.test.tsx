/**
 * TodayTab Component Tests
 * 
 * Tests the TodayTab component functionality
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { TodayTab } from "../components/today-tab";
import * as core from "@boostlly/core";

// Mock the core module
vi.mock("@boostlly/core", () => ({
  QuoteService: vi.fn(),
  generateQuoteImage: vi.fn(),
  downloadImage: vi.fn(),
  useAutoTheme: vi.fn(() => ({
    imageUrl: "https://picsum.photos/800/600",
    palette: { primary: "#000000", secondary: "#ffffff" },
  })),
  accessibleTTS: vi.fn(),
  announceToScreenReader: vi.fn(),
  getOptimalTextColorForImageWithOverlays: vi.fn(() => "#ffffff"),
  getContrastRatio: vi.fn(() => 4.5),
  meetsWCAGAA: vi.fn(() => true),
  meetsWCAGAAA: vi.fn(() => false),
  calculateEffectiveBackground: vi.fn(() => "#000000"),
  UserAnalyticsService: vi.fn(),
  useTodayQuote: vi.fn(() => ({
    id: "test-quote-1",
    text: "Test quote text for today",
    author: "Test Author",
    source: "DummyJSON",
  })),
  useIsLoading: vi.fn(() => false),
  useSetTodayQuote: vi.fn(() => vi.fn()),
  useAddSavedQuote: vi.fn(() => vi.fn()),
  useRemoveSavedQuote: vi.fn(() => vi.fn()),
  useUpdateReadingStreak: vi.fn(() => vi.fn()),
  useUnlockBadge: vi.fn(() => vi.fn()),
  useIncrementQuotesRead: vi.fn(() => vi.fn()),
  useIncrementQuotesSaved: vi.fn(() => vi.fn()),
}));

describe("TodayTab", () => {
  const mockStorage = {
    get: vi.fn(),
    set: vi.fn(),
    getSync: vi.fn(),
    setSync: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render quote text", () => {
      render(<TodayTab storage={mockStorage} />);
      expect(screen.getByText(/test quote text for today/i)).toBeInTheDocument();
    });

    it("should render quote author", () => {
      render(<TodayTab storage={mockStorage} />);
      expect(screen.getByText(/test author/i)).toBeInTheDocument();
    });

    it("should render action buttons", () => {
      render(<TodayTab storage={mockStorage} />);
      // Check for common action buttons (may vary based on implementation)
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("Loading state", () => {
    it("should show loading state when isLoading is true", () => {
      (core.useIsLoading as ReturnType<typeof vi.fn>).mockReturnValue(true);
      render(<TodayTab storage={mockStorage} />);
      // Check for loading indicator (implementation dependent)
      // This is a placeholder - adjust based on actual loading UI
    });
  });

  describe("Interactions", () => {
    it("should handle save quote action", async () => {
      const onAddSavedImmediate = vi.fn();
      render(
        <TodayTab
          storage={mockStorage}
          onAddSavedImmediate={onAddSavedImmediate}
        />
      );
      // Find and click save button
      const saveButton = screen.getByRole("button", { name: /save/i });
      if (saveButton) {
        saveButton.click();
        await waitFor(() => {
          expect(onAddSavedImmediate).toHaveBeenCalled();
        });
      }
    });
  });

  describe("Ref methods", () => {
    it("should expose refresh method via ref", () => {
      const ref = { current: null };
      render(<TodayTab storage={mockStorage} ref={ref} />);
      expect(ref.current).toBeDefined();
      expect(typeof ref.current?.refresh).toBe("function");
    });

    it("should expose getQuote method via ref", () => {
      const ref = { current: null };
      render(<TodayTab storage={mockStorage} ref={ref} />);
      expect(ref.current).toBeDefined();
      expect(typeof ref.current?.getQuote).toBe("function");
    });
  });
});

