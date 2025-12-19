/**
 * Collections Tab - React Native (Enhanced)
 * 
 * View and manage saved quotes, liked quotes, and collections
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { AndroidStorageService } from '@boostlly/platform-android';
import { Quote, CollectionService } from '@boostlly/core';
import { Heart, FolderOpen, Plus, X, Volume2, Share2, Copy } from 'lucide-react-native';
import { speakQuote, copyQuote, shareQuote } from '../../utils/quoteActions';

interface CollectionsTabProps {
  storageService: AndroidStorageService;
}

interface Collection {
  id: string;
  name: string;
  color: string;
  quotes: Quote[];
  createdAt: number;
}

export function CollectionsTab({ storageService }: CollectionsTabProps) {
  const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);
  const [likedQuotes, setLikedQuotes] = useState<Quote[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeTab, setActiveTab] = useState<'saved' | 'liked' | 'collections'>('saved');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    try {
      const saved = await storageService.get('savedQuotes');
      const liked = await storageService.get('likedQuotes');
      const collectionsData = await storageService.get('collections');
      
      setSavedQuotes(saved ? JSON.parse(saved) : []);
      setLikedQuotes(liked ? JSON.parse(liked) : []);
      setCollections(collectionsData ? JSON.parse(collectionsData) : []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [storageService]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData();
  }, [loadData]);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      Alert.alert('Error', 'Please enter a collection name');
      return;
    }

    try {
      const newCollection: Collection = {
        id: Date.now().toString(),
        name: newCollectionName,
        color: '#7C3AED',
        quotes: [],
        createdAt: Date.now(),
      };

      const updated = [...collections, newCollection];
      await storageService.set('collections', JSON.stringify(updated));
      setCollections(updated);
      setNewCollectionName('');
      setShowCreateCollection(false);
    } catch (error) {
      console.error('Failed to create collection:', error);
      Alert.alert('Error', 'Failed to create collection');
    }
  };

  const handleRemoveQuote = async (quoteId: string, type: 'saved' | 'liked') => {
    try {
      if (type === 'saved') {
        const filtered = savedQuotes.filter(q => q.id !== quoteId);
        await storageService.set('savedQuotes', JSON.stringify(filtered));
        setSavedQuotes(filtered);
      } else {
        const filtered = likedQuotes.filter(q => q.id !== quoteId);
        await storageService.set('likedQuotes', JSON.stringify(filtered));
        setLikedQuotes(filtered);
      }
    } catch (error) {
      console.error('Failed to remove quote:', error);
    }
  };

  const filteredQuotes = (activeTab === 'saved' ? savedQuotes : likedQuotes).filter(quote => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      quote.text.toLowerCase().includes(query) ||
      (quote.author && quote.author.toLowerCase().includes(query)) ||
      (quote.category && quote.category.toLowerCase().includes(query))
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
          onPress={() => setActiveTab('saved')}
        >
          <Heart size={18} color={activeTab === 'saved' ? '#7C3AED' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
            Saved ({savedQuotes.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'liked' && styles.tabActive]}
          onPress={() => setActiveTab('liked')}
        >
          <Text style={[styles.tabText, activeTab === 'liked' && styles.tabTextActive]}>
            👍 Liked ({likedQuotes.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'collections' && styles.tabActive]}
          onPress={() => setActiveTab('collections')}
        >
          <FolderOpen size={18} color={activeTab === 'collections' ? '#7C3AED' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'collections' && styles.tabTextActive]}>
            Collections ({collections.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab !== 'collections' && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search quotes..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}

      {activeTab === 'collections' && (
        <View style={styles.collectionsHeader}>
          <Text style={styles.collectionsTitle}>Your Collections</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateCollection(true)}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.createButtonText}>New</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {activeTab === 'collections' ? (
          collections.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FolderOpen size={64} color="#9CA3AF" />
              <Text style={styles.emptyText}>No collections yet</Text>
              <Text style={styles.emptySubtext}>
                Create collections to organize your favorite quotes
              </Text>
            </View>
          ) : (
            collections.map((collection) => (
              <View key={collection.id} style={styles.collectionCard}>
                <View style={[styles.collectionColor, { backgroundColor: collection.color }]} />
                <View style={styles.collectionContent}>
                  <Text style={styles.collectionName}>{collection.name}</Text>
                  <Text style={styles.collectionCount}>
                    {collection.quotes.length} quote{collection.quotes.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            ))
          )
        ) : filteredQuotes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No {activeTab === 'saved' ? 'saved' : 'liked'} quotes yet
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'saved'
                ? 'Save quotes from the Today tab to see them here'
                : 'Like quotes from the Today tab to see them here'}
            </Text>
          </View>
        ) : (
          filteredQuotes.map((quote) => (
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
                  onPress={() => handleRemoveQuote(quote.id, activeTab)}
                >
                  <X size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showCreateCollection}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateCollection(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Collection</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Collection name"
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowCreateCollection(false);
                  setNewCollectionName('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCreate]}
                onPress={handleCreateCollection}
              >
                <Text style={styles.modalButtonTextCreate}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#7C3AED',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  collectionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  collectionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
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
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '600',
  },
  quoteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  quoteActionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  collectionCard: {
    flexDirection: 'row',
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
  collectionColor: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  collectionContent: {
    flex: 1,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  collectionCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
  },
  modalButtonCreate: {
    backgroundColor: '#7C3AED',
  },
  modalButtonTextCancel: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextCreate: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
