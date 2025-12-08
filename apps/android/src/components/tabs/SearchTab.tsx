/**
 * Search Tab - React Native
 * 
 * Search and browse quotes
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { AndroidStorageService } from '@boostlly/platform-android';
import { QuoteService, Quote } from '@boostlly/core';
import { Search as SearchIcon, Heart, Volume2, Share2, Copy, FolderOpen } from 'lucide-react-native';
import { speakQuote, copyQuote, shareQuote } from '../../utils/quoteActions';

interface SearchTabProps {
  storageService: AndroidStorageService;
  quoteService: QuoteService;
}

export function SearchTab({ storageService, quoteService }: SearchTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Quote[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const searchResults = await quoteService.searchQuotes({
        query: searchQuery,
        limit: 20,
      });
      setResults(searchResults.quotes || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, quoteService]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <SearchIcon size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search quotes..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : (
        <ScrollView style={styles.resultsContainer}>
          {results.length === 0 && searchQuery ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No quotes found</Text>
            </View>
          ) : results.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Search for quotes above</Text>
            </View>
          ) : (
            results.map((quote) => (
              <View key={quote.id} style={styles.quoteCard}>
                <Text style={styles.quoteText}>"{quote.text}"</Text>
                <Text style={styles.authorText}>— {quote.author}</Text>
                {quote.category && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{quote.category}</Text>
                  </View>
                )}
                <View style={styles.quoteActions}>
                  <TouchableOpacity
                    style={styles.quoteActionButton}
                    onPress={() => speakQuote(quote, storageService)}
                  >
                    <Volume2 size={18} color="#7C3AED" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quoteActionButton}
                    onPress={() => copyQuote(quote)}
                  >
                    <Copy size={18} color="#7C3AED" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quoteActionButton}
                    onPress={() => shareQuote(quote)}
                  >
                    <Share2 size={18} color="#7C3AED" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quoteActionButton}
                    onPress={async () => {
                      const saved = await storageService.get('savedQuotes');
                      const savedQuotes = saved ? JSON.parse(saved) : [];
                      savedQuotes.push(quote);
                      await storageService.set('savedQuotes', JSON.stringify(savedQuotes));
                    }}
                  >
                    <Heart size={18} color="#7C3AED" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#111827',
  },
  searchButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  quoteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quoteText: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 8,
    lineHeight: 24,
  },
  authorText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '600',
  },
  quoteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  quoteActionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
});
