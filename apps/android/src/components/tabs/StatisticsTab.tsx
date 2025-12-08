/**
 * Statistics Tab - React Native
 * 
 * View app statistics and analytics
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { AndroidStorageService } from '@boostlly/platform-android';
import { BarChart3, TrendingUp, Heart, Eye, Clock } from 'lucide-react-native';

interface StatisticsTabProps {
  storageService: AndroidStorageService;
}

export function StatisticsTab({ storageService }: StatisticsTabProps) {
  const [stats, setStats] = useState({
    totalQuotesRead: 0,
    totalQuotesSaved: 0,
    totalQuotesLiked: 0,
    readingStreak: 0,
    longestStreak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const saved = await storageService.get('savedQuotes');
      const liked = await storageService.get('likedQuotes');
      const streak = await storageService.get('readingStreak');
      const longestStreak = await storageService.get('longestStreak');
      const totalRead = await storageService.get('totalQuotesRead');

      const savedQuotes = saved ? JSON.parse(saved) : [];
      const likedQuotes = liked ? JSON.parse(liked) : [];

      setStats({
        totalQuotesRead: totalRead ? parseInt(totalRead) : 0,
        totalQuotesSaved: savedQuotes.length,
        totalQuotesLiked: likedQuotes.length,
        readingStreak: streak ? parseInt(streak) : 0,
        longestStreak: longestStreak ? parseInt(longestStreak) : 0,
      });
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  const statCards = [
    {
      icon: Eye,
      label: 'Quotes Read',
      value: stats.totalQuotesRead.toString(),
      color: '#7C3AED',
    },
    {
      icon: Heart,
      label: 'Quotes Saved',
      value: stats.totalQuotesSaved.toString(),
      color: '#EF4444',
    },
    {
      icon: TrendingUp,
      label: 'Quotes Liked',
      value: stats.totalQuotesLiked.toString(),
      color: '#10B981',
    },
    {
      icon: Clock,
      label: 'Reading Streak',
      value: `${stats.readingStreak} days`,
      color: '#F59E0B',
    },
    {
      icon: BarChart3,
      label: 'Longest Streak',
      value: `${stats.longestStreak} days`,
      color: '#3B82F6',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Statistics</Text>
        <Text style={styles.subtitle}>Track your progress and engagement</Text>
      </View>

      <View style={styles.statsGrid}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <View key={index} style={styles.statCard}>
              <View style={[styles.iconContainer, { backgroundColor: `${stat.color}15` }]}>
                <Icon size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Summary</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            You've read {stats.totalQuotesRead} quotes and saved {stats.totalQuotesSaved} favorites.
            {stats.readingStreak > 0 && (
              <>
                {'\n'}You're on a {stats.readingStreak}-day reading streak! Keep it up!
              </>
            )}
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryText: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
  },
});
