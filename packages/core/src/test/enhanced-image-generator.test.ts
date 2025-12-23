/**
 * Tests for Enhanced Image Generator
 * 
 * Note: These tests verify validation and error handling.
 * Full image generation is tested in E2E tests.
 */

import { describe, it, expect } from 'vitest';
import {
  generateEnhancedQuoteImage,
} from '../utils/enhanced-image-generator';

describe('Enhanced Image Generator', () => {
  // Note: Image generation tests require browser environment (jsdom)
  // These tests verify error handling and validation
  
  it('should validate quote text and author', async () => {
    await expect(
      generateEnhancedQuoteImage('', 'Author')
    ).rejects.toThrow('Quote text and author are required');
  });

  it('should validate author is provided', async () => {
    await expect(
      generateEnhancedQuoteImage('Quote', '')
    ).rejects.toThrow('Quote text and author are required');
  });

  // Note: Full image generation tests are covered in E2E tests
  // Unit tests focus on validation and error handling
});

