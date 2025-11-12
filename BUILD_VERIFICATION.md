# Build Verification System

This document describes the build verification system that ensures all platforms (Web, Extension, Android) can build successfully before committing changes.

## Overview

The build verification system was created to:
- ✅ Ensure all platforms build successfully before committing
- ✅ Catch build errors early in the development process
- ✅ Provide clear feedback on which platforms pass/fail
- ✅ Automate the build → verify → commit → push workflow

## Components

### 1. Build Verification Script (`scripts/verify-build.js`)

This script verifies all platforms can build:

```bash
pnpm verify:build
```

**What it checks:**
1. Type-check all packages (TypeScript compilation)
2. Build web app (Next.js production build)
3. Build extension (Vite build)
4. Type-check Android app
5. Attempt Android build (non-blocking if it fails)

**Exit codes:**
- `0` - All critical builds passed (web, extension, type-check)
- `1` - Critical build failed

### 2. Build and Commit Script (`scripts/build-and-commit.sh`)

Automated workflow that:
1. Runs build verification
2. Stages all changes
3. Commits with message
4. Pushes to remote

```bash
# Use default commit message
pnpm build:commit

# Or with custom message
./scripts/build-and-commit.sh "Your custom commit message"
```

### 3. Metro Config for Android (`apps/android/metro.config.js`)

Fixed Android build issues by configuring Metro bundler to:
- Resolve modules from both local and workspace node_modules
- Watch all files in the monorepo
- Properly handle pnpm workspace structure

## Usage

### Before Committing

Always verify builds before committing:

```bash
# Quick verification
pnpm verify:build

# Or build with verification
pnpm build:verify
```

### Automated Build and Commit

For a complete workflow:

```bash
# Automated build, verify, commit, and push
pnpm build:commit
```

### Manual Workflow

If you prefer manual control:

```bash
# 1. Verify builds
pnpm verify:build

# 2. Build all platforms
pnpm build

# 3. Commit manually
git add -A
git commit -m "Your message"
git push
```

## Platform-Specific Notes

### Web App
- ✅ Must build successfully (critical)
- Builds to `apps/web/out/`
- Updates service worker and version files automatically

### Extension
- ✅ Must build successfully (critical)
- Builds to `apps/extension/dist/`
- May show warnings but should complete

### Android
- ⚠️ Type-check must pass (critical)
- Build may fail due to Metro bundler (acceptable if type-check passes)
- For production builds, use EAS: `pnpm build:aab` or `pnpm build:apk`

## Troubleshooting

### Android Build Fails

If Android build fails with Metro bundler errors:

1. **Check Metro config exists:**
   ```bash
   ls apps/android/metro.config.js
   ```

2. **Clear Metro cache:**
   ```bash
   cd apps/android
   pnpm start --reset-cache
   ```

3. **Reinstall dependencies:**
   ```bash
   pnpm install
   ```

4. **Type-check should still pass:**
   ```bash
   pnpm --filter @boostlly/android run type-check
   ```

### Extension Build Warnings

Extension build may show warnings but should complete. If build fails:

1. Check for TypeScript errors:
   ```bash
   pnpm --filter @boostlly/extension run type-check
   ```

2. Clean and rebuild:
   ```bash
   cd apps/extension
   pnpm clean
   pnpm build
   ```

### Web Build Issues

If web build fails:

1. Check Next.js configuration
2. Verify all dependencies are installed
3. Check for TypeScript errors:
   ```bash
   pnpm --filter @boostlly/web run type-check
   ```

## CI/CD Integration

The build verification can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions step
- name: Verify Builds
  run: pnpm verify:build
```

## Best Practices

1. **Always run verification before committing:**
   ```bash
   pnpm verify:build
   ```

2. **Use automated script for routine commits:**
   ```bash
   pnpm build:commit
   ```

3. **Fix Android build issues if possible**, but don't block on them if type-check passes

4. **Check build artifacts** are generated correctly after builds

5. **Test locally** before pushing to ensure everything works

## Scripts Reference

| Command | Description |
|---------|-------------|
| `pnpm verify:build` | Verify all platforms can build |
| `pnpm build:verify` | Build with verification |
| `pnpm build:commit` | Build, verify, commit, and push |
| `pnpm build:web` | Build web app only |
| `pnpm build:ext` | Build extension only |
| `pnpm build:android` | Build Android (EAS) |
| `pnpm type-check` | Type-check all packages |

## Summary

The build verification system ensures:
- ✅ All critical platforms (web, extension) build successfully
- ✅ Type-checking passes for all packages including Android
- ✅ Automated workflow for build → commit → push
- ✅ Clear feedback on build status
- ✅ Non-blocking Android build (acceptable if type-check passes)

This prevents broken builds from being committed and ensures deployment readiness.

