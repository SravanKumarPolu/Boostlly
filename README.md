# Boostlly - Daily Motivation

> Tiny words. Big impact. Boostlly delivers a fresh motivational quote every day to keep you inspired.

[![Build Status](https://github.com/yourusername/boostlly/workflows/CI/badge.svg)](https://github.com/yourusername/boostlly/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- **Daily Motivation**: Get a fresh inspirational quote every day
- **Cross-Platform**: Available as a web app, browser extension, and Android app
- **Smart Widget**: Motivational widget on any webpage
- **Beautiful UI**: Modern, responsive design with dark/light themes
- **Offline Support**: Works without internet connection
- **Performance Optimized**: Fast loading with code splitting and lazy loading

## 📦 Available Versions

### 🌐 Web App (PWA)
- **URL**: [https://boostlly.app](https://boostlly.app) *(coming soon)*
- **Features**: Full-featured web application with offline support
- **Installation**: Add to home screen on mobile devices

### 🔌 Browser Extension
- **Chrome**: [Chrome Web Store](https://chrome.google.com/webstore) *(coming soon)*
- **Firefox**: [Firefox Add-ons](https://addons.mozilla.org) *(coming soon)*
- **Edge**: [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons) *(coming soon)*

### 📱 Android App
- **Google Play Store**: [Play Store](https://play.google.com/store) *(coming soon)*
- **Features**: Native Android app with push notifications and offline support
- **Installation**: Download from Google Play Store

## 🛠️ Development

### Prerequisites

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **Git**: Latest version
- **Android Development** (for Android app):
  - Android Studio
  - Java Development Kit (JDK) 17+
  - Expo CLI: `npm install -g expo-cli` or `npm install -g eas-cli`

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/boostlly.git
cd boostlly

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

### Building for Production

#### Verify All Builds Before Committing

Before committing changes, verify that all platforms build successfully:

```bash
# Verify all builds (web, extension, android type-check)
pnpm verify:build

# Or build with verification
pnpm build:verify
```

#### Build and Commit Workflow

For a complete build, verify, commit, and push workflow:

```bash
# Option 1: Use the automated script
pnpm build:commit

# Option 2: Use the script with custom commit message
./scripts/build-and-commit.sh "Your custom commit message"
```

This script will:
1. ✅ Run type-check on all packages
2. ✅ Build web app
3. ✅ Build extension
4. ✅ Type-check Android app
5. ✅ Attempt Android build (non-blocking)
6. ✅ Stage all changes
7. ✅ Commit with message
8. ✅ Push to remote

If any critical build fails, the script will exit without committing.

#### Individual Platform Builds

```bash
# Build specific platforms
pnpm build:web      # Web app only
pnpm build:ext      # Extension only
pnpm build:android  # Android (EAS build)
pnpm build:apk      # Android APK for testing
pnpm build:aab      # Android AAB for Play Store

# Build all platforms
pnpm build
```

**Note**: The main `pnpm build` command builds all platforms. Android build may fail due to Metro bundler configuration, but this is acceptable if type-check passes.

### Project Structure

```
boostlly/
├── apps/
│   ├── web/              # Next.js web application
│   ├── extension/        # Browser extension (Vite + React)
│   └── android/          # React Native Android app (Expo)
├── packages/
│   ├── core/            # Core business logic
│   ├── features/        # Feature components
│   ├── ui/              # Shared UI components
│   ├── platform/        # Platform abstractions
│   ├── platform-web/    # Web-specific platform code
│   ├── platform-extension/ # Extension-specific platform code
│   └── platform-android/  # Android-specific platform code
├── scripts/             # Build and deployment scripts
└── assets/              # Static assets (images, sounds, etc.)
```

### Available Scripts

```bash
# Development
pnpm dev                 # Start all apps in development mode
pnpm web                 # Start web app only
pnpm extension           # Start extension only
pnpm android             # Start Android app only

# Building
pnpm build               # Build everything
pnpm build:web           # Build web app only
pnpm build:ext           # Build extension only
pnpm build:android       # Build Android app (EAS)
pnpm build:apk          # Build Android APK for testing
pnpm build:aab          # Build Android AAB for Play Store
pnpm build:fresh         # Clean build with verification

# Testing & Quality
pnpm test                # Run all tests
pnpm type-check          # TypeScript type checking
pnpm lint                # Lint all code

# Utilities
pnpm clean               # Clean build artifacts
pnpm fix-emojis          # Fix emoji rendering issues
```

## 🚀 Deployment

### Web App Deployment

#### Option 1: Automated (GitHub Actions)
```bash
# Push to main branch - automatic deployment via GitHub Actions
git push origin main
```

#### Option 2: Manual Deployment
```bash
# Build and deploy
./scripts/deploy-web.sh

# Or use the existing script
cd apps/web && ./deploy.sh
```

#### Deployment Targets
- **Netlify**: [app.netlify.com/drop](https://app.netlify.com/drop) - Drag `apps/web/out` folder
- **Vercel**: `npx vercel --prod --dir=apps/web/out`
- **Any Static Host**: Upload contents of `apps/web/out`

### Android App Deployment

#### Prerequisites
1. Create an Expo account at [expo.dev](https://expo.dev)
2. Install EAS CLI: `npm install -g eas-cli`
3. Login: `eas login`
4. Configure: `eas build:configure`

#### Build for Play Store
```bash
# Build AAB (Android App Bundle) for Play Store
pnpm build:aab

# Or build APK for testing
pnpm build:apk
```

#### Submit to Play Store
```bash
# Using EAS Submit (recommended)
cd apps/android
eas submit --platform android

# Or manually upload the AAB from EAS build dashboard
```

#### Play Store Setup
1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app
3. Fill in store listing (name, description, screenshots, etc.)
4. Upload the AAB file
5. Submit for review

For detailed Android setup instructions, see [apps/android/README.md](apps/android/README.md)

### Extension Deployment

#### Option 1: Automated (GitHub Actions)
```bash
# Push to main branch - automatic packaging via GitHub Actions
git push origin main
```

#### Option 2: Manual Deployment
```bash
# Build and package
./scripts/deploy-extension.sh
```

#### Manual Installation
1. **Chrome/Edge**: 
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `apps/extension/dist` folder

2. **Firefox**:
   - Open `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select `apps/extension/dist/manifest.json`

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.quotable.io
NEXT_PUBLIC_FALLBACK_API=https://zenquotes.io

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
```

### Extension Permissions

The extension requires these permissions:
- `storage`: Save user preferences and quotes
- `alarms`: Schedule daily notifications
- `notifications`: Show daily motivation alerts
- `activeTab`: Inject motivation widget on web pages

## 🏗️ Architecture

### Web App (Next.js)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **State Management**: React Context + Custom Hooks
- **Build Output**: Static export for optimal hosting
- **Performance**: Code splitting, lazy loading, bundle optimization

### Browser Extension
- **Build Tool**: Vite
- **Framework**: React 18
- **Manifest**: Version 3 (Chrome, Edge, Firefox compatible)
- **Features**: Service Worker, Content Scripts, Popup, Options Page

### Shared Packages
- **@boostlly/core**: Business logic, quote services, storage
- **@boostlly/features**: React components and hooks
- **@boostlly/ui**: Design system and reusable components
- **@boostlly/platform-***: Platform-specific implementations
  - `platform-web`: Web-specific (localStorage, Web Notifications)
  - `platform-extension`: Extension-specific (chrome.storage, chrome.alarms)
  - `platform-android`: Android-specific (Expo SecureStore, Expo Notifications)

## 📱 Browser Support

### Web App
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

### Extension
- **Chrome**: 88+ (Manifest V3)
- **Edge**: 88+ (Manifest V3)
- **Firefox**: 109+ (Manifest V3 support)

### Android App
- **Android**: 6.0+ (API level 23+)
- **React Native**: 0.74.0
- **Expo SDK**: 51

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Ensure responsive design
- Optimize for performance
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Quote APIs: [Quotable](https://quotable.io), [ZenQuotes](https://zenquotes.io)
- Icons: [Lucide React](https://lucide.dev)
- UI Components: Custom design system
- Sounds: Custom generated audio files

## 📚 Documentation

### API Documentation

- **[API Overview](docs/api/README.md)** - Complete API reference
- **[Core API](docs/api/core.md)** - Core package APIs (services, types, utilities)
- **[Services API](docs/api/services.md)** - Service classes (QuoteService, CollectionService, etc.)
- **[Hooks API](docs/api/hooks.md)** - React hooks (useAutoTheme, useSoundSettings)
- **[Utilities API](docs/api/utilities.md)** - Utility functions and helpers

### Component Documentation

- **[Components Overview](docs/components/README.md)** - Component documentation index
- **[Feature Components](docs/components/features.md)** - Feature components (UnifiedApp, TodayTab, etc.)
- **[UI Components](docs/components/ui.md)** - Design system components (Button, Card, Input, etc.)

### Guides

- **[Android Setup](ANDROID_SETUP.md)** - Android app setup guide
- **[Android Summary](ANDROID_SUMMARY.md)** - Android implementation summary

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/boostlly/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/boostlly/discussions)
- **Email**: support@boostlly.app

---

Made with ❤️ by the Boostlly team
