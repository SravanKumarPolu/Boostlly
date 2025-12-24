/**
 * QuickOnboarding Component - 20-Second Onboarding Flow
 * 
 * Provides a fast, focused onboarding experience that:
 * 1. Welcomes the user
 * 2. Optionally lets them choose favorite categories
 * 3. Optionally enables reminder with time + tone selection
 * 
 * Designed to complete in ~20 seconds for maximum retention.
 */

import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@boostlly/ui';
import { Sparkles, Check, Clock, Music, Palette, Sun, Moon, Monitor } from 'lucide-react';

export type ReminderTone = 'gentle' | 'energetic' | 'calm' | 'motivational' | 'peaceful';

export interface OnboardingData {
  theme?: 'light' | 'dark' | 'auto';
  categories: string[];
  reminderEnabled: boolean;
  reminderTime: string; // HH:MM format
  reminderTone: ReminderTone;
}

interface QuickOnboardingProps {
  storage: any;
  onComplete: (data: OnboardingData) => void;
  onSkip?: () => void;
}

const TONE_OPTIONS: Array<{ value: ReminderTone; label: string; emoji: string; description: string }> = [
  { value: 'gentle', label: 'Gentle', emoji: '🌱', description: 'Soft and soothing' },
  { value: 'energetic', label: 'Energetic', emoji: '⚡', description: 'High energy boost' },
  { value: 'calm', label: 'Calm', emoji: '🧘', description: 'Peaceful and serene' },
  { value: 'motivational', label: 'Motivational', emoji: '💪', description: 'Powerful and inspiring' },
  { value: 'peaceful', label: 'Peaceful', emoji: '🌸', description: 'Tranquil and mindful' },
];

// Popular categories for quick selection
const POPULAR_CATEGORIES = [
  'motivation',
  'success',
  'happiness',
  'wisdom',
  'inspiration',
  'productivity',
  'growth',
  'mindfulness',
] as const;

export function QuickOnboarding({ storage, onComplete, onSkip }: QuickOnboardingProps) {
  const [step, setStep] = useState<'welcome' | 'theme' | 'categories' | 'reminder' | 'complete'>('welcome');
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderTone, setReminderTone] = useState<ReminderTone>('gentle');
  const [startTime] = useState(Date.now());
  const [projectTime, setProjectTime] = useState<string>('');

  // Load project build time from version.json
  useEffect(() => {
    const loadProjectTime = async () => {
      try {
        const response = await fetch('/version.json');
        if (response.ok) {
          const data = await response.json();
          if (data.buildTime) {
            const buildDate = new Date(data.buildTime);
            const formattedDate = buildDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            setProjectTime(formattedDate);
          }
        }
      } catch (error) {
        console.error('Failed to load version info:', error);
      }
    };
    loadProjectTime();
  }, []);

  // Auto-advance welcome after 3 seconds if user doesn't interact
  useEffect(() => {
    if (step === 'welcome') {
      const timer = setTimeout(() => {
        setStep('theme');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Apply theme immediately when selected
  useEffect(() => {
    if (step === 'theme' && typeof document !== 'undefined') {
      const root = document.documentElement;
      if (selectedTheme === 'dark') {
        root.classList.add('dark');
      } else if (selectedTheme === 'light') {
        root.classList.remove('dark');
      } else {
        // Auto - follow system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    }
  }, [selectedTheme, step]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleNext = () => {
    if (step === 'welcome') {
      setStep('theme');
    } else if (step === 'theme') {
      setStep('categories');
    } else if (step === 'categories') {
      setStep('reminder');
    } else if (step === 'reminder') {
      handleComplete();
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    const data: OnboardingData = {
      theme: selectedTheme,
      categories: selectedCategories.length > 0 ? selectedCategories : POPULAR_CATEGORIES.slice(0, 3),
      reminderEnabled,
      reminderTime,
      reminderTone,
    };

    // Save onboarding completion - ensure it's saved properly
    try {
      if (storage) {
        await storage.set('onboardingCompleted', true);
        await storage.set('onboardingData', data);
        await storage.set('onboardingCompletedAt', Date.now());
        
        // Also set sync version if available for immediate check
        if (storage.setSync) {
          storage.setSync('onboardingCompleted', true);
          storage.setSync('onboardingCompletedAt', Date.now());
        }
      }
      
      // Save user preferences
      const existingPrefs = await storage?.get('userPreferences') || {};
      await storage?.set('userPreferences', {
        ...existingPrefs,
        theme: data.theme,
        categories: data.categories,
        dailyReminder: data.reminderEnabled,
        reminderTime: data.reminderTime,
        reminderTone: data.reminderTone,
      });

      // Save notification settings
      const existingSettings = await storage?.get('settings') || {};
      await storage?.set('settings', {
        ...existingSettings,
        theme: data.theme || 'auto',
        notifications: {
          enabled: data.reminderEnabled,
          type: 'daily',
          time: data.reminderTime,
          tone: data.reminderTone,
          sound: true,
          vibration: false,
        },
      });
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
    }

    onComplete(data);
  };

  const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-2xl border-2">
        <CardHeader className="text-center pb-4">
          {step === 'welcome' && (
            <>
              {/* Logo */}
              <div className="mx-auto mb-4 flex items-center justify-center relative">
                <img 
                  src="/boostlly-logo.png" 
                  alt="Boostlly Logo" 
                  className="w-24 h-24 object-contain"
                  onError={(e) => {
                    // Fallback to icon if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center';
                      const icon = document.createElement('div');
                      icon.innerHTML = '<svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>';
                      fallback.appendChild(icon);
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
              <CardTitle className="text-2xl font-bold">Welcome to Boostlly!</CardTitle>
              <p className="text-muted-foreground mt-2">
                Your daily dose of motivation in seconds
              </p>
              {projectTime && (
                <p className="text-xs text-muted-foreground mt-1">
                  Updated: {projectTime}
                </p>
              )}
            </>
          )}
          {step === 'theme' && (
            <>
              <CardTitle className="text-xl font-bold">Choose Your Theme</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Select your preferred appearance
              </p>
            </>
          )}
          {step === 'categories' && (
            <>
              <CardTitle className="text-xl font-bold">Choose Your Categories</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Select your favorite quote categories (optional)
              </p>
            </>
          )}
          {step === 'reminder' && (
            <>
              <CardTitle className="text-xl font-bold">Set Daily Reminder</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Get notified with your daily quote (optional)
              </p>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Welcome Step */}
          {step === 'welcome' && (
            <div className="text-center space-y-4">
              <p className="text-lg text-foreground">
                Let's personalize your experience in just 20 seconds!
              </p>
              <div className="flex justify-center gap-2 pt-4">
                <Button onClick={handleNext} size="lg" className="min-w-[120px]">
                  Get Started
                </Button>
                <Button onClick={handleSkip} variant="outline" size="lg" className="min-w-[120px]">
                  Skip
                </Button>
              </div>
            </div>
          )}

          {/* Theme Step */}
          {step === 'theme' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedTheme('light')}
                  className={`
                    p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                    ${selectedTheme === 'light'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <Sun className={`w-6 h-6 ${selectedTheme === 'light' ? 'text-primary' : ''}`} />
                  <span className="font-medium text-sm">Light</span>
                </button>
                <button
                  onClick={() => setSelectedTheme('dark')}
                  className={`
                    p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                    ${selectedTheme === 'dark'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <Moon className={`w-6 h-6 ${selectedTheme === 'dark' ? 'text-primary' : ''}`} />
                  <span className="font-medium text-sm">Dark</span>
                </button>
                <button
                  onClick={() => setSelectedTheme('auto')}
                  className={`
                    p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                    ${selectedTheme === 'auto'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <Monitor className={`w-6 h-6 ${selectedTheme === 'auto' ? 'text-primary' : ''}`} />
                  <span className="font-medium text-sm">System</span>
                </button>
              </div>
              <div className="flex justify-between gap-2 pt-2">
                <Button onClick={() => setStep('welcome')} variant="outline" size="sm">
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button onClick={handleSkip} variant="ghost" size="sm">
                    Skip
                  </Button>
                  <Button onClick={handleNext} size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Categories Step */}
          {step === 'categories' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                {POPULAR_CATEGORIES.map(category => {
                  const isSelected = selectedCategories.includes(category);
                  return (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={`
                        p-3 rounded-lg border-2 transition-all text-left
                        ${isSelected
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border hover:border-primary/50 hover:bg-accent/50'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="capitalize text-sm">{category}</span>
                        {isSelected && <Check className="w-4 h-4" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {selectedCategories.length === 0
                  ? 'No categories selected - we\'ll show you a variety'
                  : `${selectedCategories.length} selected`
                }
              </p>
              <div className="flex justify-between gap-2 pt-2">
                <Button onClick={() => setStep('theme')} variant="outline" size="sm">
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button onClick={handleSkip} variant="ghost" size="sm">
                    Skip
                  </Button>
                  <Button onClick={handleNext} size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Reminder Step */}
          {step === 'reminder' && (
            <div className="space-y-6">
              {/* Enable Reminder Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-accent/30">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Daily Reminder</p>
                    <p className="text-xs text-muted-foreground">
                      Get your daily quote at a time that works for you
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReminderEnabled(!reminderEnabled)}
                  className={`
                    relative w-12 h-6 rounded-full transition-colors
                    ${reminderEnabled ? 'bg-primary' : 'bg-muted'}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform
                      ${reminderEnabled ? 'translate-x-6' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>

              {/* Time Selection */}
              {reminderEnabled && (
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Reminder Time
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full p-3 rounded-lg border bg-background text-foreground"
                  />
                </div>
              )}

              {/* Tone Selection */}
              {reminderEnabled && (
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Reminder Tone
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TONE_OPTIONS.map(tone => (
                      <button
                        key={tone.value}
                        onClick={() => setReminderTone(tone.value)}
                        className={`
                          p-3 rounded-lg border-2 transition-all text-left
                          ${reminderTone === tone.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{tone.emoji}</span>
                          <span className="font-medium text-sm">{tone.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{tone.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between gap-2 pt-2">
                <Button onClick={() => setStep('categories')} variant="outline" size="sm">
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button onClick={handleSkip} variant="ghost" size="sm">
                    Skip
                  </Button>
                  <Button onClick={handleComplete} size="sm" className="min-w-[100px]">
                    Complete
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Step {step === 'welcome' ? 1 : step === 'theme' ? 2 : step === 'categories' ? 3 : 4} of 4</span>
              <span>~{elapsedTime}s</span>
            </div>
            <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: `${step === 'welcome' ? 25 : step === 'theme' ? 50 : step === 'categories' ? 75 : 100}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

