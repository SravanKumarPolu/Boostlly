/**
 * Vitest setup file
 * Configures test environment and mocks
 */

import { vi } from "vitest";

// Mock Web APIs that might not be available in test environment
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

Object.defineProperty(window, "sessionStorage", {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock fetch
global.fetch = vi.fn();

// Mock AudioContext for sound tests
Object.defineProperty(window, "AudioContext", {
  value: vi.fn(() => ({
    createOscillator: vi.fn(() => ({
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 440 },
      type: "sine",
    })),
    createGain: vi.fn(() => ({
      connect: vi.fn(),
      gain: { value: 0.5 },
    })),
    currentTime: 0,
    destination: {},
  })),
  writable: true,
});

// Mock Howler.js
vi.mock("howler", () => ({
  Howl: vi.fn(() => ({
    play: vi.fn(),
    stop: vi.fn(),
    volume: vi.fn(),
    on: vi.fn(),
  })),
  Howler: {
    volume: vi.fn(),
    stop: vi.fn(),
  },
}));

// Mock fast-average-color
vi.mock("fast-average-color", () => ({
  FastAverageColor: vi.fn(() => ({
    getColorAsync: vi.fn().mockResolvedValue({
      value: [100, 150, 200],
      isDark: false,
    }),
  })),
}));

// Mock chrome APIs for extension tests
Object.defineProperty(global, "chrome", {
  value: {
    storage: {
      local: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
        clear: vi.fn(),
      },
    },
    alarms: {
      create: vi.fn(),
      clear: vi.fn(),
      getAll: vi.fn(),
    },
    notifications: {
      create: vi.fn(),
      clear: vi.fn(),
    },
  },
  writable: true,
});

// Mock date-fns
vi.mock("date-fns", () => ({
  format: vi.fn((date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }),
}));

console.log("Vitest setup completed");
