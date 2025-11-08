# Boostlly Android App

React Native Android application for Boostlly using Expo.

## Prerequisites

1. **Node.js** >= 18.0.0
2. **pnpm** >= 8.0.0
3. **Expo CLI**: `npm install -g expo-cli` or `npm install -g eas-cli`
4. **Android Studio** (for Android development)
5. **Java Development Kit (JDK)** 17 or higher

## Setup

### 1. Install Dependencies

From the project root:
```bash
pnpm install
```

### 2. Configure Expo

1. Create an Expo account at [expo.dev](https://expo.dev)
2. Login: `npx expo login`
3. Update `app.json` with your Expo project ID (or run `eas init`)

### 3. Development

#### Start Development Server
```bash
# From project root
pnpm android

# Or from apps/android directory
cd apps/android
pnpm start
```

#### Run on Android Device/Emulator
```bash
# Make sure you have an Android emulator running or device connected
pnpm android
# Then press 'a' to open on Android
```

#### Run on iOS (if needed)
```bash
pnpm ios
# Then press 'i' to open on iOS simulator
```

## Building for Production

### Using EAS Build (Recommended)

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure EAS** (if not already done):
   ```bash
   eas build:configure
   ```

4. **Build APK (for testing)**:
   ```bash
   pnpm build:apk
   # Or
   eas build --platform android --profile preview
   ```

5. **Build AAB (for Play Store)**:
   ```bash
   pnpm build:aab
   # Or
   eas build --platform android --profile production
   ```

### Manual Build (Alternative)

If you prefer to build locally:

```bash
cd apps/android
npx expo prebuild
cd android
./gradlew assembleRelease  # For APK
./gradlew bundleRelease    # For AAB
```

## Publishing to Google Play Store

### 1. Prepare Your App

1. Update `app.json`:
   - Set proper `package` name (e.g., `app.boostlly`)
   - Update version number
   - Add app icon and splash screen
   - Configure permissions

2. Build Production AAB:
   ```bash
   pnpm build:aab
   ```

### 2. Create Play Store Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app
3. Fill in store listing details:
   - App name, description, screenshots
   - Privacy policy URL
   - Content rating

### 3. Upload and Submit

#### Using EAS Submit (Recommended):
```bash
eas submit --platform android
```

#### Manual Upload:
1. Download the AAB from EAS build
2. Go to Play Console → Production → Create new release
3. Upload the AAB file
4. Fill in release notes
5. Submit for review

## Project Structure

```
apps/android/
├── App.tsx              # Main app component
├── app.json             # Expo configuration
├── eas.json             # EAS build configuration
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── babel.config.js      # Babel config
└── assets/             # Images, icons, etc.
```

## Shared Code

The Android app uses shared packages from the monorepo:
- `@boostlly/core` - Business logic and services
- `@boostlly/features` - React components
- `@boostlly/ui` - UI components
- `@boostlly/platform-android` - Android-specific platform implementations

## Platform-Specific Code

Android-specific implementations are in `packages/platform-android`:
- `AndroidStorageService` - Uses Expo SecureStore and AsyncStorage
- `AndroidNotificationService` - Uses Expo Notifications
- `AndroidAlarmService` - Uses Expo Notifications for scheduling

## Troubleshooting

### Metro Bundler Issues
```bash
cd apps/android
pnpm start --reset-cache
```

### Build Issues
```bash
# Clean build
cd apps/android
rm -rf node_modules .expo android ios
pnpm install
npx expo prebuild --clean
```

### Android Studio Issues
- Make sure Android SDK is properly installed
- Check that JAVA_HOME is set correctly
- Verify Gradle version compatibility

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Google Play Console](https://play.google.com/console)

