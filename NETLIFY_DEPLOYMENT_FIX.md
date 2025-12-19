# Netlify Deployment Fix - Project Selection Issue

## Problem
Netlify deployment is failing because the wrong project is selected in the deployment settings.

## Issue Identified
In the Netlify deployment configuration screen:
- ❌ **Project to deploy**: `apps/android` (WRONG - This is a React Native app, not a web app)
- ✅ **Publish directory**: `apps/web/out` (CORRECT)
- ✅ **Build command**: `bash netlify-build.sh` (CORRECT)

## Root Cause
Netlify detected multiple projects in the monorepo and defaulted to `apps/android`, but:
1. The Android app is a React Native app that doesn't build web output
2. The publish directory points to `apps/web/out` which is the web app output
3. This mismatch causes the deployment to fail

## Solution

### Option 1: Fix in Netlify UI (Recommended)
1. Go to Netlify dashboard → Site settings → Build & deploy
2. Under "Build settings", change:
   - **Base directory**: Keep as `.` (root) or change to `apps/web`
   - **Build command**: `bash netlify-build.sh` (if base is root) OR `pnpm run build` (if base is apps/web)
   - **Publish directory**: `apps/web/out`
3. **IMPORTANT**: Make sure "Project to deploy" is set to the **root** (`.`) or `apps/web`, NOT `apps/android`

### Option 2: Use netlify.toml (Already configured)
The `netlify.toml` file is already correctly configured:
- Base: `.` (root)
- Command: `bash netlify-build.sh`
- Publish: `apps/web/out`

If Netlify is still selecting the wrong project, you may need to:
1. Clear the build settings in Netlify UI
2. Let Netlify read from `netlify.toml` automatically
3. Or manually override in UI to match `netlify.toml`

## Correct Configuration

### For Root-Based Build (Current setup):
```
Base directory: .
Build command: bash netlify-build.sh
Publish directory: apps/web/out
```

### For Web-Only Build (Alternative):
```
Base directory: apps/web
Build command: pnpm run build
Publish directory: out
```

## Verification Steps

1. ✅ Check `netlify.toml` exists in root
2. ✅ Verify `netlify-build.sh` exists and is executable
3. ✅ Ensure `apps/web/out` directory exists after build
4. ✅ Confirm build command works locally: `bash netlify-build.sh`

## Files to Check

- ✅ `netlify.toml` - Netlify configuration (correct)
- ✅ `netlify-build.sh` - Build script (exists and correct)
- ✅ `apps/web/out` - Build output (should exist after build)

## Next Steps

1. **Update Netlify UI settings** to use root (`.`) as base, not `apps/android`
2. **Or** set base to `apps/web` and update build command accordingly
3. **Test deployment** after fixing the project selection
4. **Monitor build logs** to ensure it's building the web app, not Android app

## Quick Fix Command

If you have Netlify CLI:
```bash
netlify link  # Link to your site
netlify build  # Test build locally
netlify deploy --prod  # Deploy after fixing settings
```

