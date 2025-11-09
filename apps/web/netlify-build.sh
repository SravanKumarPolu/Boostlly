#!/bin/bash
# Netlify Build Script for Boostlly Web App
# This script ensures all dependencies are built before the web app
# Runs from apps/web directory (Netlify base directory)

set -e  # Exit on any error

echo "🚀 Starting Netlify build..."
echo "📁 Current directory: $(pwd)"

# Get the project root (two levels up from apps/web)
# Netlify sets base directory to apps/web, so we go up two levels
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WEB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📁 Project root: $PROJECT_ROOT"
echo "📁 Web directory: $WEB_DIR"

cd "$PROJECT_ROOT"

echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile || {
  echo "❌ Failed to install dependencies"
  exit 1
}

echo "🔨 Building shared packages..."
echo "  → Building @boostlly/core..."
pnpm --filter @boostlly/core run build || {
  echo "❌ Failed to build @boostlly/core"
  exit 1
}

echo "  → Building @boostlly/features..."
pnpm --filter @boostlly/features run build || {
  echo "❌ Failed to build @boostlly/features"
  exit 1
}

echo "  → Building @boostlly/ui..."
pnpm --filter @boostlly/ui run build || {
  echo "❌ Failed to build @boostlly/ui"
  exit 1
}

echo "  → Building @boostlly/platform-web..."
pnpm --filter @boostlly/platform-web run build || {
  echo "❌ Failed to build @boostlly/platform-web"
  exit 1
}

echo "🌐 Building web application..."
cd "$WEB_DIR"
pnpm run build || {
  echo "❌ Failed to build web application"
  exit 1
}

echo "✅ Build complete!"
echo "📁 Build output: $WEB_DIR/out"

