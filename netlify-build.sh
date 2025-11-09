#!/bin/bash
# Netlify Build Script for Boostlly Web App (Root Version)
# This script builds the web app from the repository root
# Use this if building from root instead of apps/web directory

set -e  # Exit on any error

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
echo "  → Building @boostlly/core..."
pnpm --filter @boostlly/core run build || {
  echo "❌ Failed to build @boostlly/core"
  exit 2
}

echo "  → Building @boostlly/features..."
pnpm --filter @boostlly/features run build || {
  echo "❌ Failed to build @boostlly/features"
  exit 2
}

echo "  → Building @boostlly/ui..."
pnpm --filter @boostlly/ui run build || {
  echo "❌ Failed to build @boostlly/ui"
  exit 2
}

echo "  → Building @boostlly/platform-web..."
pnpm --filter @boostlly/platform-web run build || {
  echo "❌ Failed to build @boostlly/platform-web"
  exit 2
}

echo "🌐 Building web application..."
cd "$WEB_DIR"
NODE_ENV=production pnpm run build || {
  echo "❌ Failed to build web application"
  exit 2
}

# Verify build output exists
if [ ! -d "$WEB_DIR/out" ] || [ -z "$(ls -A "$WEB_DIR/out")" ]; then
  echo "❌ Error: Build output directory is empty or missing"
  echo "   Expected: $WEB_DIR/out"
  exit 2
fi

echo "✅ Build complete!"
echo "📁 Build output: $WEB_DIR/out"

