# Boostlly - Daily Motivation

> Tiny words. Big impact. Boostlly delivers a fresh motivational quote every day to keep you inspired.

[![Build Status](https://github.com/yourusername/boostlly/workflows/CI/badge.svg)](https://github.com/yourusername/boostlly/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- **Daily Motivation**: Get a fresh inspirational quote every day
- **Cross-Platform**: Available as a web app and browser extension
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

## 🛠️ Development

### Prerequisites

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **Git**: Latest version

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/boostlly.git
cd boostlly

# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Or start specific apps
pnpm web      # Web app only
pnpm extension # Extension only
```

### Project Structure

```
boostlly/
├── apps/
│   ├── web/              # Next.js web application
│   └── extension/        # Browser extension (Vite + React)
├── packages/
│   ├── core/            # Core business logic
│   ├── features/        # Feature components
│   ├── ui/              # Shared UI components
│   ├── platform/        # Platform abstractions
│   ├── platform-web/    # Web-specific platform code
│   └── platform-extension/ # Extension-specific platform code
├── scripts/             # Build and deployment scripts
└── assets/              # Static assets (images, sounds, etc.)
```

### Available Scripts

```bash
# Development
pnpm dev                 # Start all apps in development mode
pnpm web                 # Start web app only
pnpm extension           # Start extension only

# Building
pnpm build               # Build everything
pnpm build:web           # Build web app only
pnpm build:ext           # Build extension only
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

## 📱 Browser Support

### Web App
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

### Extension
- **Chrome**: 88+ (Manifest V3)
- **Edge**: 88+ (Manifest V3)
- **Firefox**: 109+ (Manifest V3 support)

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

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/boostlly/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/boostlly/discussions)
- **Email**: support@boostlly.app

---

Made with ❤️ by the Boostlly team
