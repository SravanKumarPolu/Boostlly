#!/bin/bash
# Netlify Build Script for Boostlly Web App (Root Version)
# This script builds the web app from the repository root
# Use this if building from root instead of apps/web directory

# Don't use set -e, we'll handle errors explicitly
# set -e  # Exit on any error

echo "🚀 Starting Netlify build from repository root..."
echo "📁 Current directory: $(pwd)"

# Verify we're in the project root
if [ ! -f "pnpm-workspace.yaml" ]; then
  echo "❌ Error: pnpm-workspace.yaml not found. Are we in the project root?"
  echo "   Current directory: $(pwd)"
  exit 1
fi

PROJECT_ROOT="$(pwd)"
WEB_DIR="$PROJECT_ROOT/apps/web"

echo "📁 Project root: $PROJECT_ROOT"
echo "📁 Web directory: $WEB_DIR"

# Enable Corepack (Node.js 18+ includes pnpm via Corepack)
if command -v corepack &> /dev/null; then
  echo "📦 Enabling Corepack for pnpm..."
  corepack enable || {
    echo "⚠️  Warning: Failed to enable Corepack, trying npm install"
  }
  corepack prepare pnpm@10.14.0 --activate || {
    echo "⚠️  Warning: Failed to prepare pnpm via Corepack"
  }
fi

# Verify pnpm is available, install if not
if ! command -v pnpm &> /dev/null; then
  echo "📦 pnpm not found, installing..."
  if command -v npm &> /dev/null; then
    npm install -g pnpm@10.14.0 || {
      echo "❌ Failed to install pnpm via npm"
      exit 1
    }
  else
    echo "❌ Error: Neither pnpm nor npm is available"
    exit 1
  fi
fi

# Verify pnpm version
PNPM_ACTUAL_VERSION=$(pnpm --version || echo "unknown")
echo "📦 Using pnpm version: $PNPM_ACTUAL_VERSION"

echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile || {
  echo "❌ Failed to install dependencies"
  exit 1
}

echo "🔨 Building shared packages..."
BUILD_FAILED=0

# CRITICAL: Build order matters! Build dependencies first
# 1. @boostlly/platform - Base platform interfaces (no dependencies)
echo "  → Building @boostlly/platform..."
if ! pnpm --filter @boostlly/platform run build; then
  echo "❌ Failed to build @boostlly/platform"
  BUILD_FAILED=1
fi

# 2. @boostlly/core - Depends on platform
echo "  → Building @boostlly/core..."
if ! pnpm --filter @boostlly/core run build; then
  echo "❌ Failed to build @boostlly/core"
  BUILD_FAILED=1
fi

# 3. @boostlly/platform-web - Depends on platform
echo "  → Building @boostlly/platform-web..."
if ! pnpm --filter @boostlly/platform-web run build; then
  echo "❌ Failed to build @boostlly/platform-web"
  BUILD_FAILED=1
fi

# 4. @boostlly/features - Depends on core
echo "  → Building @boostlly/features..."
if ! pnpm --filter @boostlly/features run build; then
  echo "❌ Failed to build @boostlly/features"
  BUILD_FAILED=1
fi

# 5. @boostlly/ui - May depend on core/features
echo "  → Building @boostlly/ui..."
if ! pnpm --filter @boostlly/ui run build; then
  echo "❌ Failed to build @boostlly/ui"
  BUILD_FAILED=1
fi

if [ $BUILD_FAILED -eq 1 ]; then
  echo "❌ One or more shared packages failed to build"
  exit 2
fi

echo "🌐 Building web application..."
cd "$WEB_DIR"
if ! NODE_ENV=production pnpm run build; then
  echo "❌ Failed to build web application"
  echo "   Check the build logs above for details"
  exit 2
fi

# Verify build output exists
if [ ! -d "$WEB_DIR/out" ] || [ -z "$(ls -A "$WEB_DIR/out")" ]; then
  echo "❌ Error: Build output directory is empty or missing"
  echo "   Expected: $WEB_DIR/out"
  exit 2
fi

echo "✅ Build complete!"
echo "📁 Build output: $WEB_DIR/out"

