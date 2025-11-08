import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AndroidStorageService } from '@boostlly/platform-android';
// Note: UnifiedApp uses web components (div, className, etc.)
// For React Native, you'll need to create React Native versions of components
// or use a library like react-native-web for compatibility
// import { UnifiedApp } from '@boostlly/features';

// Initialize platform services
const storageService = new AndroidStorageService();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize storage and any other setup
    const init = async () => {
      try {
        // Test storage
        await storageService.set('test', 'value');
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsReady(true); // Continue anyway
      }
    };
    init();
  }, []);

  if (!isReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading Boostlly...</Text>
        </View>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={styles.title}>Boostlly</Text>
        <Text style={styles.subtitle}>Daily Motivation</Text>
        <Text style={styles.note}>
          React Native UI components need to be created.{'\n'}
          The shared business logic from @boostlly/core is ready to use.
        </Text>
      </View>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  note: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});

