/**
 * Today Tab - React Native (Enhanced)
 * 
 * Displays today's quote with background images, text-to-speech, and actions
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AndroidStorageService } from '@boostlly/platform-android';
import { QuoteService, Quote, buildPicsumUrl, getDateKey } from '@boostlly/core';
import { Heart, Share2, Copy, Volume2, RefreshCw } from 'lucide-react-native';
import { speakQuote, copyQuote, shareQuote, stopSpeaking } from '../../utils/quoteActions';

interface TodayTabProps {
  storageService: AndroidStorageService;
  quoteService: QuoteService;
}

export function TodayTab({ storageService, quoteService }: TodayTabProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);

  // Load background image based on date
  useEffect(() => {
    const dateKey = getDateKey();
    const seed = dateKey.split('-').join('');
    const imageUrl = buildPicsumUrl(800, 1200, parseInt(seed) % 1000);
    setBackgroundImageUrl(imageUrl);
  }, []);

  const loadTodayQuote = useCallback(async () => {
    try {
      setIsLoading(true);
      // Try getQuoteByDay first (API-based), fallback to getDailyQuote (local)
      const todayQuote = await (quoteService as any).getQuoteByDay?.() || 
                         await (quoteService as any).getDailyQuoteAsync?.() ||
                         quoteService.getDailyQuote();
      setQuote(todayQuote);
      
      // Log API status for debugging
      const apiSources = ['Quotable', 'ZenQuotes', 'FavQs', 'TheySaidSo', 'QuoteGarden', 'StoicQuotes', 'ProgrammingQuotes'];
      const isFromAPI = apiSources.includes(todayQuote.source || '');
      console.log(`[TodayTab] Quote loaded - Source: ${todayQuote.source || 'unknown'}, From API: ${isFromAPI ? '✅' : '⚠️ (fallback)'}`);
      
      // Check if saved/liked
      const saved = await storageService.get('savedQuotes');
      const liked = await storageService.get('likedQuotes');
      const savedQuotes = saved ? JSON.parse(saved) : [];
      const likedQuotes = liked ? JSON.parse(liked) : [];
      
      setIsSaved(savedQuotes.some((q: Quote) => q.id === todayQuote.id));
      setIsLiked(likedQuotes.some((q: Quote) => q.id === todayQuote.id));
    } catch (error) {
      console.error('[TodayTab] Failed to load quote:', error);
      // Check API health status
      try {
        const healthStatus = quoteService.getHealthStatus();
        console.log('[TodayTab] API Health Status:', healthStatus);
      } catch (healthError) {
        console.error('[TodayTab] Could not get health status:', healthError);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [quoteService, storageService]);

  useEffect(() => {
    loadTodayQuote();
  }, [loadTodayQuote]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadTodayQuote();
  }, [loadTodayQuote]);

  const handleSave = async () => {
    if (!quote) return;
    try {
      const saved = await storageService.get('savedQuotes');
      const savedQuotes = saved ? JSON.parse(saved) : [];
      if (!isSaved) {
        savedQuotes.push(quote);
        await storageService.set('savedQuotes', JSON.stringify(savedQuotes));
        setIsSaved(true);
      } else {
        const filtered = savedQuotes.filter((q: Quote) => q.id !== quote.id);
        await storageService.set('savedQuotes', JSON.stringify(filtered));
        setIsSaved(false);
      }
    } catch (error) {
      console.error('Failed to save quote:', error);
    }
  };

  const handleLike = async () => {
    if (!quote) return;
    try {
      const liked = await storageService.get('likedQuotes');
      const likedQuotes = liked ? JSON.parse(liked) : [];
      if (!isLiked) {
        likedQuotes.push(quote);
        await storageService.set('likedQuotes', JSON.stringify(likedQuotes));
        setIsLiked(true);
      } else {
        const filtered = likedQuotes.filter((q: Quote) => q.id !== quote.id);
        await storageService.set('likedQuotes', JSON.stringify(filtered));
        setIsLiked(false);
      }
    } catch (error) {
      console.error('Failed to like quote:', error);
    }
  };

  const handleSpeak = async () => {
    if (!quote) return;
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      await speakQuote(quote, storageService);
      setIsSpeaking(false);
    }
  };

  const handleCopy = async () => {
    if (!quote) return;
    await copyQuote(quote);
  };

  const handleShare = async () => {
    if (!quote) return;
    await shareQuote(quote);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading your daily inspiration...</Text>
      </View>
    );
  }

  if (!quote) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load quote</Text>
        <TouchableOpacity onPress={loadTodayQuote} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.cardContainer}>
        {backgroundImageUrl ? (
          <ImageBackground
            source={{ uri: backgroundImageUrl }}
            style={styles.backgroundImage}
            imageStyle={styles.backgroundImageStyle}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.6)']}
              style={styles.overlay}
            >
              <View style={styles.quoteContainer}>
                <Text style={styles.quoteText}>"{quote.text}"</Text>
                <Text style={styles.authorText}>— {quote.author}</Text>
                <View style={styles.badgesContainer}>
                  {quote.category && (
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{quote.category}</Text>
                    </View>
                  )}
                  {quote.source && (
                    <View style={[
                      styles.sourceBadge,
                      ['Quotable', 'ZenQuotes', 'FavQs', 'TheySaidSo', 'QuoteGarden', 'StoicQuotes', 'ProgrammingQuotes'].includes(quote.source)
                        ? styles.sourceBadgeAPI
                        : styles.sourceBadgeFallback
                    ]}>
                      <Text style={styles.sourceText}>
                        {['Quotable', 'ZenQuotes', 'FavQs', 'TheySaidSo', 'QuoteGarden', 'StoicQuotes', 'ProgrammingQuotes'].includes(quote.source)
                          ? '🌐 API'
                          : '📦 Local'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        ) : (
          <LinearGradient
            colors={['#7C3AED', '#A78BFA', '#C4B5FD']}
            style={styles.gradient}
          >
            <View style={styles.quoteContainer}>
              <Text style={styles.quoteText}>"{quote.text}"</Text>
              <Text style={styles.authorText}>— {quote.author}</Text>
              <View style={styles.badgesContainer}>
                {quote.category && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{quote.category}</Text>
                  </View>
                )}
                {quote.source && (
                  <View style={[
                    styles.sourceBadge,
                    ['Quotable', 'ZenQuotes', 'FavQs', 'TheySaidSo', 'QuoteGarden', 'StoicQuotes', 'ProgrammingQuotes'].includes(quote.source)
                      ? styles.sourceBadgeAPI
                      : styles.sourceBadgeFallback
                  ]}>
                    <Text style={styles.sourceText}>
                      {['Quotable', 'ZenQuotes', 'FavQs', 'TheySaidSo', 'QuoteGarden', 'StoicQuotes', 'ProgrammingQuotes'].includes(quote.source)
                        ? '🌐 API'
                        : '📦 Local'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, isSaved && styles.actionButtonActive]}
            onPress={handleSave}
          >
            <Heart size={24} color={isSaved ? '#EF4444' : '#6B7280'} fill={isSaved ? '#EF4444' : 'none'} />
            <Text style={[styles.actionButtonText, isSaved && styles.actionButtonTextActive]}>
              {isSaved ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, isLiked && styles.actionButtonActive]}
            onPress={handleLike}
          >
            <Text style={[styles.likeEmoji, isLiked && styles.likeEmojiActive]}>👍</Text>
            <Text style={[styles.actionButtonText, isLiked && styles.actionButtonTextActive]}>
              {isLiked ? 'Liked' : 'Like'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, isSpeaking && styles.actionButtonActive]}
            onPress={handleSpeak}
          >
            <Volume2 size={24} color={isSpeaking ? '#7C3AED' : '#6B7280'} />
            <Text style={[styles.actionButtonText, isSpeaking && styles.actionButtonTextActive]}>
              {isSpeaking ? 'Speaking' : 'Speak'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
            <Copy size={24} color="#6B7280" />
            <Text style={styles.actionButtonText}>Copy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Share2 size={24} color="#6B7280" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backgroundImage: {
    width: '100%',
    minHeight: 400,
    justifyContent: 'center',
  },
  backgroundImageStyle: {
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  gradient: {
    minHeight: 400,
    padding: 24,
    justifyContent: 'center',
  },
  quoteContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  quoteText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 36,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  authorText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.95,
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sourceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  sourceBadgeAPI: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  sourceBadgeFallback: {
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
  sourceText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    minWidth: 70,
  },
  actionButtonActive: {
    backgroundColor: '#EDE9FE',
  },
  actionButtonText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  actionButtonTextActive: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  likeEmoji: {
    fontSize: 24,
  },
  likeEmojiActive: {
    transform: [{ scale: 1.1 }],
  },
});
