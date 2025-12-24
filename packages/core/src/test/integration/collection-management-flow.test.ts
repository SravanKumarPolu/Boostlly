/**
 * Integration Tests for Collection Management Flow
 * 
 * Tests the complete flow from creating collections to managing quotes
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CollectionService } from '../../services/collection-service';
import { QuoteService } from '../../services/quote-service';
import { MockStorageService } from '../mocks/storage-mock';
import type { Quote, QuoteCollection } from '../../types';

describe('Collection Management Flow Integration', () => {
  let collectionService: CollectionService;
  let quoteService: QuoteService;
  let storage: MockStorageService;

  beforeEach(() => {
    storage = new MockStorageService();
    collectionService = new CollectionService(storage);
    quoteService = new QuoteService(storage);
  });

  describe('Create Collection Flow', () => {
    it('should create a new collection and persist it', async () => {
      const collection = await collectionService.createCollection(
        'Test Collection',
        'A test collection',
        {
          color: '#7C3AED',
          icon: 'folder',
          category: 'motivation',
        }
      );

      expect(collection).toBeTruthy();
      expect(collection.name).toBe('Test Collection');
      expect(collection.description).toBe('A test collection');

      // Verify collection is persisted
      const collections = await collectionService.getAllCollections();
      expect(collections).toHaveLength(1);
      expect(collections[0].id).toBe(collection.id);
    });

    it('should create collection with tags', async () => {
      const collection = await collectionService.createCollection(
        'Tagged Collection',
        'Collection with tags',
        {
          color: '#7C3AED',
          icon: 'folder',
          category: 'motivation',
        }
      );

      // Update collection to add tags
      const updated = await collectionService.updateCollection(collection.id, {
        tags: ['motivation', 'inspiration'],
      });

      expect(updated?.tags).toContain('motivation');
      expect(updated?.tags).toContain('inspiration');
    });
  });

  describe('Add Quotes to Collection Flow', () => {
    let collection: QuoteCollection;
    let quotes: Quote[];

    beforeEach(async () => {
      collection = await collectionService.createCollection(
        'Test Collection',
        'Test description',
        { color: '#7C3AED', icon: 'folder' }
      );

      // Get some quotes
      const dailyQuote = await quoteService.getDailyQuote();
      quotes = [dailyQuote];
    });

    it('should add quotes to collection', async () => {
      for (const quote of quotes) {
        await collectionService.addQuoteToCollection(collection.id, quote.id);
      }

      const updatedCollection = await collectionService.getCollection(collection.id);
      expect(updatedCollection).toBeTruthy();
      expect(updatedCollection!.quoteIds).toHaveLength(quotes.length);
      expect(updatedCollection!.quoteIds).toContain(quotes[0].id);
    });

    it('should not add duplicate quotes', async () => {
      await collectionService.addQuoteToCollection(collection.id, quotes[0].id);
      await collectionService.addQuoteToCollection(collection.id, quotes[0].id);

      const updatedCollection = await collectionService.getCollection(collection.id);
      expect(updatedCollection!.quoteIds).toHaveLength(1);
    });

    it('should get quotes in collection', async () => {
      await collectionService.addQuoteToCollection(collection.id, quotes[0].id);

      const quotesInCollection = await collectionService.getQuotesInCollection(
        collection.id,
        quotes
      );

      expect(quotesInCollection).toHaveLength(1);
      expect(quotesInCollection[0].id).toBe(quotes[0].id);
    });
  });

  describe('Search Collections Flow', () => {
    beforeEach(async () => {
      await collectionService.createCollection('Motivation Quotes', 'Motivational quotes', {
        color: '#7C3AED',
        icon: 'folder',
        category: 'motivation',
      });
      await collectionService.createCollection('Success Stories', 'Success quotes', {
        color: '#10B981',
        icon: 'star',
        category: 'success',
      });
    });

    it('should search collections by name', async () => {
      const results = await collectionService.searchCollections({
        search: 'Motivation',
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toContain('Motivation');
    });

    it('should filter collections by category', async () => {
      const results = await collectionService.searchCollections({
        category: 'motivation',
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results.every(c => c.category === 'motivation')).toBe(true);
    });

    it('should filter collections by has quotes', async () => {
      const collection = await collectionService.createCollection(
        'Empty Collection',
        'Empty',
        { color: '#7C3AED', icon: 'folder' }
      );

      const withQuotes = await collectionService.searchCollections({
        hasQuotes: true,
      });

      const withoutQuotes = await collectionService.searchCollections({
        hasQuotes: false,
      });

      expect(withoutQuotes.some(c => c.id === collection.id)).toBe(true);
    });
  });

  describe('Update Collection Flow', () => {
    let collection: QuoteCollection;

    beforeEach(async () => {
      collection = await collectionService.createCollection(
        'Original Name',
        'Original description',
        { color: '#7C3AED', icon: 'folder' }
      );
    });

    it('should update collection name', async () => {
      const updated = await collectionService.updateCollection(collection.id, {
        name: 'Updated Name',
      });

      expect(updated).toBeTruthy();
      expect(updated!.name).toBe('Updated Name');
      expect(updated!.description).toBe('Original description');
    });

    it('should update collection description', async () => {
      const updated = await collectionService.updateCollection(collection.id, {
        description: 'Updated description',
      });

      expect(updated!.description).toBe('Updated description');
    });

    it('should update collection color', async () => {
      const updated = await collectionService.updateCollection(collection.id, {
        color: '#10B981',
      });

      expect(updated!.color).toBe('#10B981');
    });
  });

  describe('Delete Collection Flow', () => {
    let collection: QuoteCollection;

    beforeEach(async () => {
      collection = await collectionService.createCollection(
        'To Delete',
        'Will be deleted',
        { color: '#7C3AED', icon: 'folder' }
      );
    });

    it('should delete collection', async () => {
      const deleted = await collectionService.deleteCollection(collection.id);
      expect(deleted).toBe(true);

      const collections = await collectionService.getAllCollections();
      expect(collections.find((c: any) => c.id === collection.id)).toBeUndefined();
    });

    it('should return false for non-existent collection', async () => {
      const deleted = await collectionService.deleteCollection('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('Collection Analytics Flow', () => {
    beforeEach(async () => {
      const collection1 = await collectionService.createCollection(
        'Collection 1',
        'First collection',
        { color: '#7C3AED', icon: 'folder' }
      );
      const collection2 = await collectionService.createCollection(
        'Collection 2',
        'Second collection',
        { color: '#10B981', icon: 'star' }
      );

      // Add quotes to first collection
      const quote = await quoteService.getDailyQuote();
      await collectionService.addQuoteToCollection(collection1.id, quote.id);
    });

    it('should get collection analytics', async () => {
      const analytics = await collectionService.getCollectionAnalytics();

      expect(analytics.totalCollections).toBe(2);
      expect(analytics.totalQuotes).toBe(1);
      expect(analytics.averageQuotesPerCollection).toBe(0.5);
    });
  });

  describe('Complete Collection Workflow', () => {
    it('should complete full collection lifecycle', async () => {
      // 1. Create collection
      const collection = await collectionService.createCollection(
        'Lifecycle Test',
        'Testing full lifecycle',
        { color: '#7C3AED', icon: 'folder' }
      );
      expect(collection).toBeTruthy();

      // 2. Add quotes
      const quote1 = await quoteService.getDailyQuote();
      await collectionService.addQuoteToCollection(collection.id, quote1.id);

      // 3. Update collection
      const updated = await collectionService.updateCollection(collection.id, {
        name: 'Updated Lifecycle Test',
      });
      expect(updated!.name).toBe('Updated Lifecycle Test');

      // 4. Get quotes in collection
      const quotes = await collectionService.getQuotesInCollection(
        collection.id,
        [quote1]
      );
      expect(quotes).toHaveLength(1);

      // 5. Remove quote from collection
      await collectionService.removeQuoteFromCollection(collection.id, quote1.id);
      const quotesAfterRemoval = await collectionService.getQuotesInCollection(
        collection.id,
        [quote1]
      );
      expect(quotesAfterRemoval).toHaveLength(0);

      // 6. Delete collection
      const deleted = await collectionService.deleteCollection(collection.id);
      expect(deleted).toBe(true);
    });
  });
});

