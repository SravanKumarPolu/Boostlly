/**
 * Tests for useTheme hook
 * 
 * Tests theme application to document root, storage integration,
 * and system preference handling.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTheme } from '../hooks/useTheme';

// Mock the Zustand store
const mockSetStoreTheme = vi.fn();
vi.mock('@boostlly/core', async () => {
  const actual = await vi.importActual('@boostlly/core');
  return {
    ...actual,
    useStore: vi.fn((selector: any) => {
      if (typeof selector === 'function') {
        // Mock store state - default to 'auto' theme
        const mockState = {
          settings: {
            theme: 'auto',
          },
          setTheme: mockSetStoreTheme,
        };
        return selector(mockState);
      }
      return selector;
    }),
  };
});

describe('useTheme', () => {
  let mockStorage: any;

  beforeEach(() => {
    // Reset DOM
    document.documentElement.className = '';
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock storage
    mockStorage = {
      get: vi.fn(),
      set: vi.fn(),
    };
    
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)' ? false : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.documentElement.className = '';
  });

  it('should initialize with auto theme when no storage provided', async () => {
    const { result } = renderHook(() => useTheme());
    
    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
    });
    
    expect(result.current.theme).toBe('auto');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should load theme from storage settings when store has auto', async () => {
    mockStorage.get.mockImplementation((key: string) => {
      if (key === 'settings') {
        return Promise.resolve({ theme: 'dark' });
      }
      return Promise.resolve(null);
    });
    
    const { result } = renderHook(() => useTheme(mockStorage));
    
    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
    });
    
    // Should load from storage
    await waitFor(() => {
      expect(result.current.theme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  it('should load theme from storage settings', async () => {
    mockStorage.get.mockImplementation((key: string) => {
      if (key === 'settings') {
        return Promise.resolve({ theme: 'light' });
      }
      return Promise.resolve(null);
    });
    
    const { result } = renderHook(() => useTheme(mockStorage));
    
    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
    });
    
    await waitFor(() => {
      expect(result.current.theme).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
    
    expect(mockStorage.get).toHaveBeenCalledWith('settings');
  });

  it('should load theme from onboarding data', async () => {
    mockStorage.get.mockImplementation((key: string) => {
      if (key === 'settings') {
        return Promise.resolve({});
      }
      if (key === 'onboardingData') {
        return Promise.resolve({ theme: 'dark' });
      }
      return Promise.resolve(null);
    });
    
    const { result } = renderHook(() => useTheme(mockStorage));
    
    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
    });
    
    await waitFor(() => {
      expect(result.current.theme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  it('should apply dark theme to document root', async () => {
    const { result } = renderHook(() => useTheme());
    
    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
    });
    
    await act(async () => {
      await result.current.setTheme('dark');
    });
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(result.current.theme).toBe('dark');
  });

  it('should apply light theme to document root', async () => {
    // Start with dark theme
    document.documentElement.classList.add('dark');
    
    const { result } = renderHook(() => useTheme());
    
    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
    });
    
    await act(async () => {
      await result.current.setTheme('light');
    });
    
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(result.current.theme).toBe('light');
  });

  it('should apply auto theme based on system preference', async () => {
    // Mock system prefers dark
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)' ? true : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    
    const { result } = renderHook(() => useTheme());
    
    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
    });
    
    await act(async () => {
      await result.current.setTheme('auto');
    });
    
    // Should apply dark class when system prefers dark
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should save theme to storage when set', async () => {
    const { result } = renderHook(() => useTheme(mockStorage));
    
    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
    });
    
    await act(async () => {
      await result.current.setTheme('dark');
    });
    
    expect(mockStorage.set).toHaveBeenCalledWith('settings', expect.objectContaining({
      theme: 'dark',
    }));
    expect(mockStorage.set).toHaveBeenCalledWith('userPreferences', expect.objectContaining({
      theme: 'dark',
    }));
  });

  it('should update Zustand store when theme is set', async () => {
    const { result } = renderHook(() => useTheme(mockStorage));
    
    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
    });
    
    await act(async () => {
      await result.current.setTheme('light');
    });
    
    // setStoreTheme should be called
    expect(mockSetStoreTheme).toHaveBeenCalledWith('light');
  });

  it('should handle storage errors gracefully', async () => {
    mockStorage.get.mockRejectedValue(new Error('Storage error'));
    mockStorage.set.mockRejectedValue(new Error('Storage error'));
    
    const { result } = renderHook(() => useTheme(mockStorage));
    
    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
    });
    
    // Should not throw, should fallback to default
    expect(result.current.theme).toBe('auto');
    
    // Setting theme should not throw
    await act(async () => {
      await result.current.setTheme('dark');
    });
    
    // Theme should still be applied to DOM even if storage fails
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should return auto during SSR (before mount)', () => {
    // Simulate SSR environment
    const { result } = renderHook(() => useTheme());
    
    // Before mount, should return 'auto'
    expect(result.current.mounted).toBe(false);
    expect(result.current.theme).toBe('auto');
  });

  it('should listen to system preference changes when in auto mode', async () => {
    let mockListener: any;
    const addEventListener = vi.fn((event: string, listener: any) => {
      if (event === 'change') {
        mockListener = listener;
      }
    });
    const removeEventListener = vi.fn();
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)' ? false : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener,
        removeEventListener,
        dispatchEvent: vi.fn(),
      })),
      configurable: true,
    });
    
    const { result } = renderHook(() => useTheme());
    
    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
    });
    
    await act(async () => {
      await result.current.setTheme('auto');
    });
    
    // Should have registered listener for system preference changes
    await waitFor(() => {
      expect(addEventListener).toHaveBeenCalled();
    });
  });
});

