# Android App Setup Guide

This guide will help you set up the Android app for Boostlly and prepare it for Google Play Store submission.

## Quick Answer: Do You Need a Separate Project?

**No, you don't need a separate project!** 

The Android app is integrated into your existing monorepo structure:
- ✅ Same codebase and shared packages
- ✅ Same business logic (`@boostlly/core`)
- ✅ Same UI components (`@boostlly/ui`, `@boostlly/features`)
- ✅ Platform-specific code in `packages/platform-android`
- ✅ Easy to maintain and update

## Architecture Overview

```
Your Monorepo
├── apps/
│   ├── web/              ← Web app (Next.js)
│   ├── extension/        ← Browser extension
│   └── android/          ← Android app (React Native/Expo) ✨ NEW
├── packages/
│   ├── core/             ← Shared business logic
│   ├── features/         ← Shared React components
│   ├── ui/               ← Shared UI components
│   └── platform-android/ ← Android-specific implementations ✨ NEW
```

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# From project root
pnpm install
```

### 2. Install Required Tools

#### For Android Development:
```bash
# Install Expo CLI (if not already installed)
npm install -g expo-cli eas-cli

# Or use npx (no global install needed)
npx expo --version
```

#### Android Studio Setup:
1. Download [Android Studio](https://developer.android.com/studio)
2. Install Android SDK (API level 23+)
3. Set up Android Virtual Device (AVD) for emulator testing
4. Or connect a physical Android device via USB

### 3. Configure Expo

```bash
# Login to Expo (create account at expo.dev if needed)
npx expo login

# Navigate to Android app
cd apps/android

# Initialize EAS (Expo Application Services)
eas build:configure
```

This will create/update `eas.json` with build configurations.

### 4. Update App Configuration

Edit `apps/android/app.json`:
- Update `package` name (e.g., `app.boostlly`)
- Add your Expo project ID (or run `eas init` to generate one)
- Update app name, version, etc.

### 5. Add App Icons and Assets

Create these files in `apps/android/assets/`:
- `icon.png` (1024x1024) - App icon
- `splash.png` (1242x2436) - Splash screen
- `adaptive-icon.png` (1024x1024) - Android adaptive icon
- `favicon.png` (48x48) - Web favicon

### 6. Test Locally

```bash
# From project root
pnpm android

# Or from apps/android
cd apps/android
pnpm start

# Then:
# - Press 'a' to open on Android emulator/device
# - Scan QR code with Expo Go app on your phone
```

## Building for Production

### Option 1: EAS Build (Recommended - Cloud Build)

EAS Build handles all the complexity of building Android apps in the cloud.

```bash
cd apps/android

# Build APK for testing
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

**Benefits:**
- ✅ No local Android SDK setup required
- ✅ Consistent builds
- ✅ Handles signing automatically
- ✅ Free tier available

### Option 2: Local Build

If you prefer building locally:

```bash
cd apps/android

# Generate native Android project
npx expo prebuild

# Build APK
cd android
./gradlew assembleRelease

# Build AAB
./gradlew bundleRelease
```

Outputs:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

## Publishing to Google Play Store

### Step 1: Create Play Store Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app
3. Fill in required information:
   - App name: "Boostlly"
   - Default language
   - App or game: App
   - Free or paid: Free
   - Declarations (content rating, etc.)

### Step 2: Prepare Store Assets

You'll need:
- **App icon**: 512x512 PNG
- **Feature graphic**: 1024x500 PNG
- **Screenshots**: At least 2 (phone, tablet)
- **Short description**: 80 characters max
- **Full description**: 4000 characters max
- **Privacy policy URL**: Required

### Step 3: Build Production AAB

```bash
cd apps/android
pnpm build:aab
# Or
eas build --platform android --profile production
```

### Step 4: Upload to Play Store

#### Using EAS Submit (Easiest):
```bash
cd apps/android
eas submit --platform android
```

#### Manual Upload:
1. Download the AAB from EAS build dashboard
2. Go to Play Console → Production → Create new release
3. Upload the AAB file
4. Add release notes
5. Review and roll out

### Step 5: Complete Store Listing

Fill in all required sections:
- Store listing (description, screenshots, etc.)
- Content rating questionnaire
- Privacy policy
- Target audience
- Data safety form

### Step 6: Submit for Review

1. Complete all required sections (green checkmarks)
2. Review the app
3. Click "Start rollout to Production"
4. Wait for Google's review (usually 1-3 days)

## Code Sharing Strategy

### What's Shared:
- ✅ **Business Logic**: All services in `@boostlly/core`
- ✅ **UI Components**: React components from `@boostlly/ui` and `@boostlly/features`
- ✅ **Types**: TypeScript types and interfaces
- ✅ **Utilities**: Helper functions and utilities

### What's Platform-Specific:
- 🔧 **Storage**: 
  - Web: `localStorage`
  - Extension: `chrome.storage`
  - Android: `Expo SecureStore` + `AsyncStorage`
- 🔧 **Notifications**:
  - Web: Web Notifications API
  - Extension: Chrome Notifications API
  - Android: Expo Notifications
- 🔧 **Alarms**:
  - Web: `setInterval` / Web Workers
  - Extension: `chrome.alarms`
  - Android: Expo Scheduled Notifications

## Development Workflow

### Daily Development:
```bash
# Start Android app
pnpm android

# Make changes to shared packages
# Changes automatically reflect in Android app (with hot reload)
```

### Testing:
```bash
# Run on Android emulator
pnpm android
# Press 'a'

# Run on physical device
# Connect via USB, enable USB debugging
pnpm android
# Press 'a'
```

### Building:
```bash
# Test build (APK)
pnpm build:apk

# Production build (AAB)
pnpm build:aab
```

## Troubleshooting

### Metro Bundler Issues
```bash
cd apps/android
pnpm start --reset-cache
```

### Build Failures
```bash
# Clean everything
cd apps/android
rm -rf node_modules .expo android ios
pnpm install
npx expo prebuild --clean
```

### Android Studio Issues
- Ensure Android SDK is installed
- Check `JAVA_HOME` environment variable
- Verify Gradle version compatibility

### Expo/EAS Issues
- Check Expo account is logged in: `npx expo whoami`
- Verify EAS project is configured: `eas project:info`
- Check build status: `eas build:list`

## Next Steps

1. ✅ Set up Android development environment
2. ✅ Test app locally on emulator/device
3. ✅ Customize app.json with your app details
4. ✅ Add app icons and splash screens
5. ✅ Build APK for testing
6. ✅ Create Google Play Console account
7. ✅ Build AAB for production
8. ✅ Upload to Play Store
9. ✅ Complete store listing
10. ✅ Submit for review

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [EAS Build Guide](https://docs.expo.dev/build/introduction/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Android App Bundle Guide](https://developer.android.com/guide/app-bundle)

## Support

If you encounter issues:
1. Check the [Android app README](apps/android/README.md)
2. Review Expo documentation
3. Check React Native troubleshooting guides
4. Open an issue on GitHub

---

**Remember**: You're using the same codebase for web, extension, and Android. Changes to shared packages automatically benefit all platforms! 🚀

