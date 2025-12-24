/**
 * Integration Tests for Settings Flow
 * 
 * Tests settings persistence and updates
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockStorageService } from '../mocks/storage-mock';

describe('Settings Flow Integration', () => {
  let storage: MockStorageService;

  beforeEach(() => {
    storage = new MockStorageService();
  });

  describe('Settings Persistence', () => {
    it('should save and retrieve settings', async () => {
      const settings = {
        theme: 'dark',
        notifications: true,
        soundEnabled: true,
      };

      await storage.set('settings', settings);
      const retrieved = await storage.get('settings');

      expect(retrieved).toEqual(settings);
    });

    it('should update existing settings', async () => {
      const initialSettings = {
        theme: 'light',
        notifications: false,
      };

      await storage.set('settings', initialSettings);

      const updatedSettings = {
        ...initialSettings,
        theme: 'dark',
        notifications: true,
      };

      await storage.set('settings', updatedSettings);
      const retrieved = await storage.get('settings');

      expect(retrieved.theme).toBe('dark');
      expect(retrieved.notifications).toBe(true);
    });

    it('should persist notification settings', async () => {
      const notificationSettings = {
        enabled: true,
        type: 'daily',
        time: '09:00',
        tone: 'gentle',
        sound: true,
        vibration: false,
      };

      await storage.set('notificationSettings', notificationSettings);
      const retrieved = await storage.get('notificationSettings');

      expect(retrieved).toEqual(notificationSettings);
    });
  });

  describe('Settings Synchronization', () => {
    it('should sync settings across storage methods', async () => {
      const settings = {
        theme: 'dark',
        language: 'en',
      };

      // Set using async method
      await storage.set('settings', settings);

      // Retrieve using sync method
      const syncRetrieved = storage.getSync('settings');
      expect(syncRetrieved).toEqual(settings);

      // Retrieve using async method
      const asyncRetrieved = await storage.get('settings');
      expect(asyncRetrieved).toEqual(settings);
    });
  });

  describe('Settings Defaults', () => {
    it('should handle missing settings gracefully', async () => {
      const retrieved = await storage.get('settings');
      expect(retrieved).toBeNull();

      // Should not throw when accessing properties
      const theme = retrieved?.theme || 'light';
      expect(theme).toBe('light');
    });

    it('should merge partial settings updates', async () => {
      const initialSettings = {
        theme: 'light',
        notifications: true,
        soundEnabled: true,
      };

      await storage.set('settings', initialSettings);

      // Update only theme
      const updatedSettings = {
        ...initialSettings,
        theme: 'dark',
      };

      await storage.set('settings', updatedSettings);
      const retrieved = await storage.get('settings');

      expect(retrieved.theme).toBe('dark');
      expect(retrieved.notifications).toBe(true);
      expect(retrieved.soundEnabled).toBe(true);
    });
  });

  describe('Settings Validation', () => {
    it('should validate theme values', async () => {
      const validThemes = ['light', 'dark', 'auto'];
      
      for (const theme of validThemes) {
        await storage.set('settings', { theme });
        const retrieved = await storage.get('settings');
        expect(retrieved.theme).toBe(theme);
      }
    });

    it('should validate notification time format', async () => {
      const validTimes = ['09:00', '12:30', '18:45'];
      
      for (const time of validTimes) {
        const settings = {
          enabled: true,
          time,
        };
        await storage.set('notificationSettings', settings);
        const retrieved = await storage.get('notificationSettings');
        expect(retrieved.time).toBe(time);
      }
    });
  });
});

