/**
 * Unified App Component for React Native
 * 
 * Main entry point for the Android app with tab navigation
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AndroidStorageService } from '@boostlly/platform-android';
import { QuoteService } from '@boostlly/core';
import { Home, Search, FolderOpen, Settings, BarChart3, Plus } from 'lucide-react-native';

import { TodayTab } from './tabs/TodayTab';
import { SearchTab } from './tabs/SearchTab';
import { CollectionsTab } from './tabs/CollectionsTab';
import { SettingsTab } from './tabs/SettingsTab';
import { StatisticsTab } from './tabs/StatisticsTab';
import { CreateQuoteTab } from './tabs/CreateQuoteTab';

const Tab = createBottomTabNavigator();

export function UnifiedApp() {
  const [storageService, setStorageService] = useState<AndroidStorageService | null>(null);
  const [quoteService, setQuoteService] = useState<QuoteService | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const storage = new AndroidStorageService();
        const quotes = new QuoteService(storage);
        setStorageService(storage);
        setQuoteService(quotes);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };
    init();
  }, []);

  if (!storageService || !quoteService) {
    return null; // Loading handled by individual tabs
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#7C3AED',
            tabBarInactiveTintColor: '#9CA3AF',
            tabBarStyle: {
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#E5E7EB',
              paddingBottom: 8,
              paddingTop: 8,
              height: 60,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
            },
          }}
        >
          <Tab.Screen
            name="Today"
            options={{
              tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
            }}
          >
            {() => <TodayTab storageService={storageService} quoteService={quoteService} />}
          </Tab.Screen>
          
          <Tab.Screen
            name="Search"
            options={{
              tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
            }}
          >
            {() => <SearchTab storageService={storageService} quoteService={quoteService} />}
          </Tab.Screen>
          
          <Tab.Screen
            name="Collections"
            options={{
              tabBarIcon: ({ color, size }) => <FolderOpen size={size} color={color} />,
            }}
          >
            {() => <CollectionsTab storageService={storageService} />}
          </Tab.Screen>
          
          <Tab.Screen
            name="Create"
            options={{
              tabBarIcon: ({ color, size }) => <Plus size={size} color={color} />,
            }}
          >
            {() => <CreateQuoteTab storageService={storageService} />}
          </Tab.Screen>
          
          <Tab.Screen
            name="Statistics"
            options={{
              tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
            }}
          >
            {() => <StatisticsTab storageService={storageService} />}
          </Tab.Screen>
          
          <Tab.Screen
            name="Settings"
            options={{
              tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
            }}
          >
            {() => <SettingsTab storageService={storageService} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
