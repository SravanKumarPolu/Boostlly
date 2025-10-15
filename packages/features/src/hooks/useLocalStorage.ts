import { logError, logDebug, logWarning } from "@boostlly/core";
import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for managing localStorage with type safety and error handling
 *
 * @param key - The localStorage key
 * @param initialValue - The initial value if key doesn't exist
 * @returns Array containing the stored value and setter function
 *
 * @example
 * ```tsx
 * const [user, setUser] = useLocalStorage('user', { name: '', email: '' });
 *
 * // Update user
 * setUser({ name: 'John', email: 'john@example.com' });
 *
 * // Remove user
 * setUser(null);
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | null | ((prev: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);

      // Parse stored json or return initial value
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      logWarning(`Error reading localStorage key "${key}":`, { error: error });
      return initialValue;
    }
  });

  /**
   * Return a wrapped version of useState's setter function that persists the new value to localStorage
   *
   * @param value - The value to set
   */
  const setValue = useCallback(
    (value: T | null | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore as T);

        // Save to local storage
        if (valueToStore === null) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        // A more advanced implementation would handle the error case
        logWarning(`Error setting localStorage key "${key}":`, {
          error: error,
        });
      }
    },
    [key, storedValue],
  );

  // Listen for changes to this localStorage key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          logWarning(
            `Error parsing localStorage key "${key}" from storage event`,
            { error },
          );
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}

/**
 * Custom hook for managing localStorage arrays with CRUD operations
 *
 * @param key - The localStorage key
 * @param initialValue - The initial array value
 * @returns Object containing array state and CRUD methods
 *
 * @example
 * ```tsx
 * const {
 *   items,
 *   addItem,
 *   removeItem,
 *   updateItem,
 *   clearItems
 * } = useLocalStorageArray('todos', []);
 * ```
 */
export function useLocalStorageArray<T extends { id: string }>(
  key: string,
  initialValue: T[] = [],
): {
  items: T[];
  addItem: (item: Omit<T, "id">) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<T>) => void;
  clearItems: () => void;
  setItems: (items: T[] | ((prev: T[]) => T[])) => void;
} {
  const [items, setItems] = useLocalStorage<T[]>(key, initialValue);

  /**
   * Adds a new item to the array
   *
   * @param item - The item to add (without id)
   */
  const addItem = useCallback(
    (item: Omit<T, "id">) => {
      const newItem = {
        ...item,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      } as T;

      setItems((prev: T[]) => [...prev, newItem]);
    },
    [setItems],
  );

  /**
   * Removes an item from the array by id
   *
   * @param id - The id of the item to remove
   */
  const removeItem = useCallback(
    (id: string) => {
      setItems((prev: T[]) => prev.filter((item: T) => item.id !== id));
    },
    [setItems],
  );

  /**
   * Updates an existing item in the array
   *
   * @param id - The id of the item to update
   * @param updates - The updates to apply to the item
   */
  const updateItem = useCallback(
    (id: string, updates: Partial<T>) => {
      setItems((prev: T[]) =>
        prev.map((item: T) =>
          item.id === id ? { ...item, ...updates } : item,
        ),
      );
    },
    [setItems],
  );

  /**
   * Clears all items from the array
   */
  const clearItems = useCallback(() => {
    setItems([]);
  }, [setItems]);

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    clearItems,
    setItems,
  };
}

/**
 * Custom hook for managing localStorage objects with nested property updates
 *
 * @param key - The localStorage key
 * @param initialValue - The initial object value
 * @returns Object containing object state and update methods
 *
 * @example
 * ```tsx
 * const {
 *   settings,
 *   updateSetting,
 *   resetSettings
 * } = useLocalStorageObject('app-settings', {
 *   theme: 'light',
 *   notifications: true,
 *   language: 'en'
 * });
 * ```
 */
export function useLocalStorageObject<T extends Record<string, any>>(
  key: string,
  initialValue: T,
): {
  value: T;
  updateValue: (updates: Partial<T>) => void;
  updateNestedValue: (path: string, value: any) => void;
  resetValue: () => void;
  setValue: (value: T | ((prev: T) => T)) => void;
} {
  const [value, setValue] = useLocalStorage<T>(key, initialValue);

  /**
   * Updates the object with partial updates
   *
   * @param updates - Partial updates to apply
   */
  const updateValue = useCallback(
    (updates: Partial<T>) => {
      setValue((prev: T) => ({ ...prev, ...updates }));
    },
    [setValue],
  );

  /**
   * Updates a nested property using dot notation
   *
   * @param path - Dot notation path to the property
   * @param newValue - The new value to set
   */
  const updateNestedValue = useCallback(
    (path: string, newValue: any) => {
      setValue((prev: T) => {
        const keys = path.split(".");
        const newObj = { ...prev };

        let current: any = newObj;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!(keys[i] in current)) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = newValue;
        return newObj;
      });
    },
    [setValue],
  );

  /**
   * Resets the object to its initial value
   */
  const resetValue = useCallback(() => {
    setValue(initialValue);
  }, [setValue, initialValue]);

  return {
    value,
    updateValue,
    updateNestedValue,
    resetValue,
    setValue,
  };
}
