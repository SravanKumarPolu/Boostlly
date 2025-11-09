# Deployment Cache Fix - Automatic Version Updates

## Problem
When deploying updates to the web app, changes were not showing automatically due to:
1. Service worker caching old versions
2. Browser caching HTML and static assets
3. No automatic version bumping during builds
4. Service worker version not updating with deployments

## Solution

### 1. Automatic Version Update Script
- **File**: `apps/web/scripts/update-version.js`
- **Purpose**: Automatically updates version numbers during build
- **What it does**:
  - Reads version from `package.json`
  - Updates `version.json` with new build time and cache buster
  - Updates `sw.js` with new version and build time
  - Runs automatically before and after build via npm scripts

### 2. Build Process Integration
- **Updated**: `apps/web/package.json`
- **Changes**:
  - Added `prebuild` script to update versions before build
  - Added `postbuild` script to update versions after build (in `out` directory)
  - Version updates happen automatically on every build

### 3. Service Worker Improvements
- **Updated**: `apps/web/public/sw.js`
- **Improvements**:
  - More aggressive cache cleanup (deletes all old boostlly caches)
  - Better version detection and notification
  - Automatic cache invalidation on new version
  - Forces reload when new version detected

### 4. Cache Headers Configuration
- **Files**: 
  - `apps/web/public/_headers` (Netlify headers)
  - `apps/web/netlify.toml` (Netlify configuration)
  - `apps/web/next.config.js` (Next.js headers - for non-static exports)

- **Key Changes**:
  - HTML files: `Cache-Control: no-cache, no-store, must-revalidate`
  - Service worker: Never cached
  - Version file: Never cached
  - Static assets: Long cache with contenthash (immutable)

### 5. Service Worker Registration
- **Updated**: `apps/web/src/components/service-worker-manager.tsx`
- **Improvements**:
  - Uses cache buster from `version.json` for service worker registration
  - `updateViaCache: "none"` to prevent cached service workers
  - Better update detection and notification

## How It Works

1. **During Build**:
   - `prebuild` script runs and updates version in `sw.js` and `version.json`
   - Next.js builds the app
   - `postbuild` script updates version in `out` directory

2. **On Deployment**:
   - New `version.json` with updated `buildTime` and `cacheBuster`
   - New `sw.js` with updated `VERSION` and `BUILD_TIME`
   - Cache headers prevent HTML caching
   - Service worker cache gets invalidated

3. **On User Visit**:
   - Browser fetches `version.json` (never cached)
   - Version checker compares build times
   - If new version detected, service worker updates
   - Old caches are cleared automatically
   - User gets fresh content

## Files Modified

1. `apps/web/scripts/update-version.js` - New version update script
2. `apps/web/package.json` - Added prebuild/postbuild hooks
3. `apps/web/public/sw.js` - Improved cache invalidation
4. `apps/web/public/_headers` - Netlify cache headers
5. `apps/web/netlify.toml` - Netlify configuration
6. `apps/web/next.config.js` - Updated cache headers for HTML
7. `apps/web/src/components/service-worker-manager.tsx` - Improved SW registration
8. `scripts/deploy-web.sh` - Added version verification

## Testing

To test the fix:

1. **Build the app**:
   ```bash
   cd apps/web
   pnpm build
   ```

2. **Check version files**:
   ```bash
   cat public/version.json
   cat out/version.json
   cat public/sw.js | grep VERSION
   ```

3. **Deploy and verify**:
   - Deploy to Netlify/Vercel
   - Visit the site
   - Check browser console for version check logs
   - Verify new version loads automatically

## Manual Cache Clear (if needed)

If users still see old content:

1. **Clear browser cache**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. **Clear service worker**: 
   - Open DevTools > Application > Service Workers
   - Click "Unregister"
   - Reload page
3. **Hard reload**: Cmd+Shift+R / Ctrl+Shift+R

## Notes

- Version updates happen automatically on every build
- No manual version bumping required
- Cache invalidation is automatic
- Works with Netlify, Vercel, and other static hosts
- Service worker updates are detected within 60 seconds
- HTML files are never cached to ensure latest version

## Future Improvements

- Add version bumping to package.json version
- Add deployment notifications
- Add version history tracking
- Add automatic rollback on errors

