/**
 * Settings Tab - React Native (Enhanced)
 * 
 * Comprehensive app settings and preferences
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { AndroidStorageService } from '@boostlly/platform-android';
import { Settings, Bell, Palette, Volume2, Eye, Shield, Download, Upload } from 'lucide-react-native';

interface SettingsTabProps {
  storageService: AndroidStorageService;
}

export function SettingsTab({ storageService }: SettingsTabProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [dailyReminder, setDailyReminder] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState(true);
  const [speechRate, setSpeechRate] = useState(0.8);
  const [highContrast, setHighContrast] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [cacheEnabled, setCacheEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const notifications = await storageService.get('notificationsEnabled');
      const reminder = await storageService.get('dailyReminder');
      const tts = await storageService.get('textToSpeech');
      const rate = await storageService.get('speechRate');
      const contrast = await storageService.get('highContrast');
      const analytics = await storageService.get('analyticsEnabled');
      const sync = await storageService.get('autoSync');
      const cache = await storageService.get('cacheEnabled');

      setNotificationsEnabled(notifications === 'true');
      setDailyReminder(reminder === 'true');
      setTextToSpeech(tts !== 'false');
      setSpeechRate(rate ? parseFloat(rate) : 0.8);
      setHighContrast(contrast === 'true');
      setAnalyticsEnabled(analytics !== 'false');
      setAutoSync(sync !== 'false');
      setCacheEnabled(cache !== 'false');
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    await storageService.set('notificationsEnabled', value.toString());
  };

  const handleReminderToggle = async (value: boolean) => {
    setDailyReminder(value);
    await storageService.set('dailyReminder', value.toString());
  };

  const handleTTSToggle = async (value: boolean) => {
    setTextToSpeech(value);
    await storageService.set('textToSpeech', value.toString());
  };

  const handleContrastToggle = async (value: boolean) => {
    setHighContrast(value);
    await storageService.set('highContrast', value.toString());
  };

  const handleAnalyticsToggle = async (value: boolean) => {
    setAnalyticsEnabled(value);
    await storageService.set('analyticsEnabled', value.toString());
  };

  const handleSyncToggle = async (value: boolean) => {
    setAutoSync(value);
    await storageService.set('autoSync', value.toString());
  };

  const handleCacheToggle = async (value: boolean) => {
    setCacheEnabled(value);
    await storageService.set('cacheEnabled', value.toString());
  };

  const handleExportData = async () => {
    try {
      const saved = await storageService.get('savedQuotes');
      const liked = await storageService.get('likedQuotes');
      const collections = await storageService.get('collections');

      const data = {
        savedQuotes: saved ? JSON.parse(saved) : [],
        likedQuotes: liked ? JSON.parse(liked) : [],
        collections: collections ? JSON.parse(collections) : [],
        exportDate: new Date().toISOString(),
      };

      Alert.alert('Export Data', JSON.stringify(data, null, 2));
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached quotes. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.set('dailyQuote', null);
              await storageService.set('dailyQuoteDate', null);
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Bell size={20} color="#7C3AED" />
          <Text style={styles.sectionTitle}>Notifications</Text>
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Enable Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive notifications for daily quotes
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationsToggle}
            trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
            thumbColor={notificationsEnabled ? '#7C3AED' : '#F3F4F6'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Daily Reminder</Text>
            <Text style={styles.settingDescription}>
              Get a reminder to check your daily quote
            </Text>
          </View>
          <Switch
            value={dailyReminder}
            onValueChange={handleReminderToggle}
            trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
            thumbColor={dailyReminder ? '#7C3AED' : '#F3F4F6'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Volume2 size={20} color="#7C3AED" />
          <Text style={styles.sectionTitle}>Audio & Speech</Text>
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Text-to-Speech</Text>
            <Text style={styles.settingDescription}>
              Enable text-to-speech for quotes
            </Text>
          </View>
          <Switch
            value={textToSpeech}
            onValueChange={handleTTSToggle}
            trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
            thumbColor={textToSpeech ? '#7C3AED' : '#F3F4F6'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Eye size={20} color="#7C3AED" />
          <Text style={styles.sectionTitle}>Accessibility</Text>
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>High Contrast</Text>
            <Text style={styles.settingDescription}>
              Increase contrast for better visibility
            </Text>
          </View>
          <Switch
            value={highContrast}
            onValueChange={handleContrastToggle}
            trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
            thumbColor={highContrast ? '#7C3AED' : '#F3F4F6'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Shield size={20} color="#7C3AED" />
          <Text style={styles.sectionTitle}>Privacy & Data</Text>
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Analytics</Text>
            <Text style={styles.settingDescription}>
              Help improve the app with usage analytics
            </Text>
          </View>
          <Switch
            value={analyticsEnabled}
            onValueChange={handleAnalyticsToggle}
            trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
            thumbColor={analyticsEnabled ? '#7C3AED' : '#F3F4F6'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Settings size={20} color="#7C3AED" />
          <Text style={styles.sectionTitle}>Performance</Text>
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Auto Sync</Text>
            <Text style={styles.settingDescription}>
              Automatically sync your data
            </Text>
          </View>
          <Switch
            value={autoSync}
            onValueChange={handleSyncToggle}
            trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
            thumbColor={autoSync ? '#7C3AED' : '#F3F4F6'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Cache Enabled</Text>
            <Text style={styles.settingDescription}>
              Cache quotes for faster loading
            </Text>
          </View>
          <Switch
            value={cacheEnabled}
            onValueChange={handleCacheToggle}
            trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
            thumbColor={cacheEnabled ? '#7C3AED' : '#F3F4F6'}
          />
        </View>

        <TouchableOpacity style={styles.actionButton} onPress={handleClearCache}>
          <Text style={styles.actionButtonText}>Clear Cache</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Download size={20} color="#7C3AED" />
          <Text style={styles.sectionTitle}>Data Management</Text>
        </View>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
          <Download size={20} color="#7C3AED" />
          <Text style={styles.actionButtonText}>Export Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Version</Text>
          <Text style={styles.settingValue}>0.1.0</Text>
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Privacy Policy</Text>
          <Text style={styles.settingValue}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Terms of Service</Text>
          <Text style={styles.settingValue}>→</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingValue: {
    fontSize: 16,
    color: '#6B7280',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
});
