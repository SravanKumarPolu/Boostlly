/**
 * Vitest setup file for feature components
 * Configures test environment and mocks
 */

import { vi } from "vitest";
import "@testing-library/jest-dom";

// Mock Web APIs
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock @boostlly/core hooks
vi.mock("@boostlly/core", async () => {
  const actual = await vi.importActual("@boostlly/core");
  return {
    ...actual,
    useTodayQuote: vi.fn(() => ({
      id: "test-quote-1",
      text: "Test quote text",
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
    useAutoTheme: vi.fn(() => ({
      imageUrl: "https://picsum.photos/800/600",
      palette: { primary: "#000000", secondary: "#ffffff" },
    })),
  };
});

console.log("Features Vitest setup completed");

