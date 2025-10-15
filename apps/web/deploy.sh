#!/bin/bash

# Quick Deploy Script for Boostlly Web App
# Usage: ./deploy.sh

set -e

echo "🚀 Deploying Boostlly to Production..."
echo ""

# Ensure we're in the correct directory
cd "$(dirname "$0")"

echo "📦 Building production bundle..."
cd ../..
pnpm --filter @boostlly/web build

echo ""
echo "✅ Build complete!"
echo ""
echo "📤 Deploying to Netlify..."
echo ""
echo "Option 1: Drag & Drop (Recommended)"
echo "  1. Visit: https://app.netlify.com/drop"
echo "  2. Drag: $(pwd)/apps/web/out"
echo ""
echo "Option 2: CLI Deploy"
echo "  Run: cd apps/web && npx netlify-cli deploy --prod --dir=out"
echo ""
