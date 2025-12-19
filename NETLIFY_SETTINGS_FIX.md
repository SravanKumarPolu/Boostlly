# Netlify Settings Fix - Exact Configuration

## Current Settings (from your screenshot)

- ❌ **Base directory:** Empty (should be `.`)
- ✅ **Package directory:** `apps/web` (can keep or remove)
- ✅ **Build command:** `bash netlify-build.sh`
- ✅ **Publish directory:** `apps/web/out`
- ✅ **Functions directory:** `netlify/functions`

## Required Changes

### Change 1: Set Base Directory

**Current:** Base directory is empty  
**Change to:** `.` (dot, which means root/repository root)

**Why:** The `netlify-build.sh` script is in the root and needs to run from there to access the pnpm workspace.

### Change 2: Package Directory (Optional)

**Current:** `apps/web`  
**Options:**
- **Option A:** Keep it as `apps/web` (if Netlify needs it for monorepo detection)
- **Option B:** Remove it (since `netlify.toml` is in root and handles everything)

**Recommendation:** Try keeping it first. If builds still fail, try removing it.

## Correct Configuration

### Recommended Settings:

```
✅ Base directory: . (dot/root)
✅ Package directory: apps/web (or leave empty)
✅ Build command: bash netlify-build.sh
✅ Publish directory: apps/web/out
✅ Functions directory: netlify/functions
```

## Step-by-Step Instructions

1. **In Netlify UI:**
   - Go to Site settings → Build & deploy → Build settings
   - Click "Edit settings"

2. **Set Base directory:**
   - Find "Base directory" field
   - Enter: `.` (just a dot)
   - This tells Netlify to use the repository root

3. **Verify other settings:**
   - Package directory: `apps/web` (keep as is)
   - Build command: `bash netlify-build.sh` ✅
   - Publish directory: `apps/web/out` ✅
   - Functions directory: `netlify/functions` ✅

4. **Save and deploy:**
   - Click "Save"
   - Go to "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"

## Why This Matters

- **Base directory = `.`**: Netlify runs commands from root, where `netlify-build.sh` is located
- **Build script location**: `netlify-build.sh` is in root and expects to run from root
- **pnpm workspace**: The workspace root is at `.`, so pnpm commands need to run from root
- **Package directory**: Helps Netlify understand this is a monorepo with the web app in `apps/web`

## Alternative: If Package Directory Causes Issues

If setting Base directory to `.` and keeping Package directory as `apps/web` still fails:

1. **Try removing Package directory:**
   - Set Base directory: `.`
   - Clear/remove Package directory field (leave empty)
   - Keep other settings the same

2. **The `netlify.toml` will handle everything:**
   - `base = "."` in netlify.toml
   - `command = "bash netlify-build.sh"`
   - `publish = "apps/web/out"`

## Verification

After making changes, check:
- ✅ Base directory is `.` (not empty)
- ✅ Build command is `bash netlify-build.sh`
- ✅ Publish directory is `apps/web/out`
- ✅ Build script exists at root: `netlify-build.sh`
- ✅ netlify.toml exists at root

## Expected Result

After fixing Base directory:
1. Netlify will run from repository root
2. Build script will execute correctly
3. `@boostlly/platform` will build first (we fixed the build order)
4. All packages will build in correct order
5. Web app will build successfully
6. Output will be in `apps/web/out` ✅

