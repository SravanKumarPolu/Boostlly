# Netlify Build Troubleshooting Guide

## Common Build Failures

### 1. Build Step Fails (Exit Code 2)

**Symptoms:**
- Build step shows "Failed" in Netlify UI
- Exit code 2 in logs

**Possible Causes:**

#### A. Package Build Failure
One of the shared packages failed to build:
- `@boostlly/core`
- `@boostlly/features`
- `@boostlly/ui`
- `@boostlly/platform-web`

**Solution:**
1. Check the build logs to see which package failed
2. Look for TypeScript errors or missing dependencies
3. Verify the package has a `build` script in its `package.json`

#### B. Web App Build Failure
The web application build failed.

**Solution:**
1. Check Next.js build errors
2. Verify all dependencies are installed
3. Check for missing environment variables

#### C. Build Output Missing
The build completed but output directory is empty.

**Solution:**
1. Verify `apps/web/out` directory exists
2. Check Next.js config has `output: 'export'`
3. Ensure build script completed successfully

### 2. Wrong Project Selected

**Symptoms:**
- Build tries to build Android app instead of web app
- Publish directory mismatch errors

**Solution:**
1. Go to Netlify Dashboard → Site settings → Build & deploy
2. Change "Project to deploy" from `apps/android` to `.` (root)
3. Verify:
   - Base directory: `.`
   - Build command: `bash netlify-build.sh`
   - Publish directory: `apps/web/out`

### 3. pnpm Installation Issues

**Symptoms:**
- "pnpm not found" errors
- Version mismatch errors

**Solution:**
1. Netlify should use Corepack (Node.js 18+)
2. Verify `NODE_VERSION = "18"` in `netlify.toml`
3. Check `PNPM_VERSION = "10.14.0"` matches

### 4. Dependency Installation Failure

**Symptoms:**
- "Failed to install dependencies" error
- Lock file issues

**Solution:**
1. Ensure `pnpm-lock.yaml` is committed
2. Try `pnpm install --frozen-lockfile` locally
3. Check for workspace configuration issues

## Debugging Steps

### 1. Check Build Logs
In Netlify UI, expand the "Building" step to see detailed logs:
- Look for error messages
- Check which step failed
- Note exit codes

### 2. Test Build Locally
```bash
# Test the build script locally
bash netlify-build.sh

# Or test individual steps
pnpm install --frozen-lockfile
pnpm --filter @boostlly/core run build
pnpm --filter @boostlly/features run build
pnpm --filter @boostlly/ui run build
pnpm --filter @boostlly/platform-web run build
cd apps/web && pnpm run build
```

### 3. Verify Configuration
```bash
# Check netlify.toml
cat netlify.toml

# Verify build script exists and is executable
ls -la netlify-build.sh
chmod +x netlify-build.sh
```

### 4. Check Environment Variables
Ensure required environment variables are set in Netlify:
- Go to Site settings → Environment variables
- Add any required API keys or config

## Quick Fixes

### Fix 1: Clear Build Cache
1. Netlify Dashboard → Deploys → Trigger deploy
2. Check "Clear cache and deploy site"

### Fix 2: Update Build Settings
1. Site settings → Build & deploy → Build settings
2. Click "Edit settings"
3. Verify all settings match `netlify.toml`
4. Save and redeploy

### Fix 3: Check Node.js Version
Ensure Netlify is using Node.js 18:
1. Site settings → Build & deploy → Environment
2. Set Node.js version to 18
3. Or add `.nvmrc` file with `18`

## Getting Help

If build still fails:
1. Copy the full build log from Netlify
2. Check which specific step failed
3. Look for error messages in the logs
4. Verify the error occurs locally too

## Prevention

1. ✅ Always test builds locally before pushing
2. ✅ Keep `netlify.toml` in sync with actual build process
3. ✅ Commit `pnpm-lock.yaml` to ensure consistent dependencies
4. ✅ Use consistent Node.js and pnpm versions
5. ✅ Monitor build logs for warnings

