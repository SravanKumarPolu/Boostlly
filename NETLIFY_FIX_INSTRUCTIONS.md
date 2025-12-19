# Netlify Deployment Fix - Step by Step Instructions

## 🔴 Problem Identified

Your Netlify deployment is failing because:
- **Project to deploy**: Currently set to `apps/android` ❌
- **Publish directory**: Set to `apps/web/out` ✅
- **Build command**: Set to `bash netlify-build.sh` ✅

**The Android app doesn't produce web output, so the build fails!**

## ✅ Solution: Change Project Selection

### Step 1: Change "Project to deploy"

In the Netlify UI, you need to change the project selection:

1. **Current (WRONG):**
   - Selected: `apps/android` ❌
   - Or: `@boostlly/android apps/android` ❌

2. **Change to (CORRECT):**
   - Select: `@boostlly/web` ✅
   - Path: `apps/web`

### Step 2: Verify All Settings

After changing the project, verify these settings match:

```
✅ Project to deploy: @boostlly/web (apps/web)
✅ Base directory: . (root) or apps/web
✅ Build command: bash netlify-build.sh
✅ Publish directory: apps/web/out
✅ Functions directory: netlify/functions
```

## 📋 Exact Steps in Netlify UI

1. **Go to Netlify Dashboard**
   - Navigate to your site
   - Click "Site settings"
   - Click "Build & deploy"

2. **Find "Build settings" section**
   - Look for "Project to deploy" dropdown

3. **Change Project Selection**
   - Click the dropdown
   - **Select: `@boostlly/web`** (NOT `apps/android`)
   - The path should show `apps/web`

4. **Verify Build Settings**
   - Build command: `bash netlify-build.sh` ✅
   - Publish directory: `apps/web/out` ✅
   - Base directory: Should be `.` (root) or `apps/web`

5. **Save Settings**
   - Click "Save" or "Deploy site"

6. **Trigger New Deploy**
   - Go to "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"
   - Or push a new commit to trigger automatic deploy

## 🎯 Why This Fixes It

- **Before**: Building Android app → No web output → Build fails
- **After**: Building web app → Produces `apps/web/out` → Build succeeds ✅

## ✅ What's Already Correct

These settings are already correct and don't need to change:
- ✅ Build command: `bash netlify-build.sh`
- ✅ Publish directory: `apps/web/out`
- ✅ Functions directory: `netlify/functions`

## 🔍 Quick Checklist

- [ ] Changed "Project to deploy" from `apps/android` to `@boostlly/web`
- [ ] Verified build command is `bash netlify-build.sh`
- [ ] Verified publish directory is `apps/web/out`
- [ ] Saved settings
- [ ] Triggered new deploy

## 🚀 After Fixing

Once you change the project to `@boostlly/web`:
1. The build will use the correct project
2. It will build the web app (not Android)
3. Output will be in `apps/web/out` ✅
4. Deployment will succeed! 🎉

## 📝 Alternative: Use Root Project

If `@boostlly/web` doesn't work, you can also:
- Set base directory to `.` (root)
- Keep build command: `bash netlify-build.sh`
- Keep publish directory: `apps/web/out`

The `netlify.toml` file is already configured correctly for root-based builds.

