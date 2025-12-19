/**
 * Create Quote Tab - React Native
 * 
 * Create and manage custom quotes
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { AndroidStorageService } from '@boostlly/platform-android';
import { Quote } from '@boostlly/core';
import { Plus, X, Volume2, Share2, Copy, Heart } from 'lucide-react-native';
import { speakQuote, copyQuote, shareQuote } from '../../utils/quoteActions';

interface CreateQuoteTabProps {
  storageService: AndroidStorageService;
}

export function CreateQuoteTab({ storageService }: CreateQuoteTabProps) {
  const [customQuotes, setCustomQuotes] = useState<Quote[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [quoteText, setQuoteText] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('');
  const [quoteCategory, setQuoteCategory] = useState('Custom');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadCustomQuotes = useCallback(async () => {
    try {
      const saved = await storageService.get('savedQuotes');
      const savedQuotes = saved ? JSON.parse(saved) : [];
      const custom = savedQuotes.filter(
        (q: Quote) =>
          q.category === 'Custom' ||
          q.source === 'custom' ||
          !q.source
      );
      setCustomQuotes(custom);
    } catch (error) {
      console.error('Failed to load custom quotes:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [storageService]);

  useEffect(() => {
    loadCustomQuotes();
  }, [loadCustomQuotes]);

  const handleCreateQuote = async () => {
    if (!quoteText.trim() || !quoteAuthor.trim()) {
      Alert.alert('Error', 'Please fill in both quote text and author');
      return;
    }

    try {
      const newQuote: Quote = {
        id: `custom-${Date.now()}`,
        text: quoteText.trim(),
        author: quoteAuthor.trim(),
        category: quoteCategory || 'Custom',
        source: 'custom',
        createdAt: new Date(),
      };

      const saved = await storageService.get('savedQuotes');
      const savedQuotes = saved ? JSON.parse(saved) : [];
      savedQuotes.push(newQuote);
      await storageService.set('savedQuotes', JSON.stringify(savedQuotes));

      setCustomQuotes([newQuote, ...customQuotes]);
      setQuoteText('');
      setQuoteAuthor('');
      setQuoteCategory('Custom');
      setShowCreateModal(false);
      Alert.alert('Success', 'Quote created successfully!');
    } catch (error) {
      console.error('Failed to create quote:', error);
      Alert.alert('Error', 'Failed to create quote');
    }
  };

  const handleRemoveQuote = async (quoteId: string) => {
    Alert.alert(
      'Delete Quote',
      'Are you sure you want to delete this quote?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const saved = await storageService.get('savedQuotes');
              const savedQuotes = saved ? JSON.parse(saved) : [];
              const filtered = savedQuotes.filter((q: Quote) => q.id !== quoteId);
              await storageService.set('savedQuotes', JSON.stringify(filtered));
              setCustomQuotes(customQuotes.filter(q => q.id !== quoteId));
            } catch (error) {
              console.error('Failed to remove quote:', error);
              Alert.alert('Error', 'Failed to delete quote');
            }
          },
        },
      ]
    );
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadCustomQuotes();
  }, [loadCustomQuotes]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Quotes</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {customQuotes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Plus size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyText}>No custom quotes yet</Text>
            <Text style={styles.emptySubtext}>
              Create your own personalized quotes and they'll appear here and in your daily rotation.
            </Text>
            <TouchableOpacity
              style={styles.emptyCreateButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.emptyCreateButtonText}>Create Your First Quote</Text>
            </TouchableOpacity>
          </View>
        ) : (
          customQuotes.map((quote) => (
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
                  onPress={() => handleRemoveQuote(quote.id)}
                >
                  <X size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Your Quote</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCreateModal(false);
                  setQuoteText('');
                  setQuoteAuthor('');
                  setQuoteCategory('Custom');
                }}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Quote Text *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter your inspiring quote..."
              placeholderTextColor="#9CA3AF"
              value={quoteText}
              onChangeText={setQuoteText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.inputLabel}>Author *</Text>
            <TextInput
              style={styles.input}
              placeholder="Author name"
              placeholderTextColor="#9CA3AF"
              value={quoteAuthor}
              onChangeText={setQuoteAuthor}
            />

            <Text style={styles.inputLabel}>Category</Text>
            <TextInput
              style={styles.input}
              placeholder="Category (e.g., Motivation, Success)"
              placeholderTextColor="#9CA3AF"
              value={quoteCategory}
              onChangeText={setQuoteCategory}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowCreateModal(false);
                  setQuoteText('');
                  setQuoteAuthor('');
                  setQuoteCategory('Custom');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCreate]}
                onPress={handleCreateQuote}
              >
                <Text style={styles.modalButtonTextCreate}>Create Quote</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
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
    fontSize: 16,
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
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  emptyCreateButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyCreateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    fontStyle: 'italic',
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
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
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
