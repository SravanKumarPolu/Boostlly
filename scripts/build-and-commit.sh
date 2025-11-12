#!/bin/bash

# Build and Commit Script
# This script verifies all builds before committing and pushing

set -e  # Exit on error

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "🚀 Starting Build and Commit Process..."
echo ""

# Step 1: Run build verification
echo "📋 Step 1: Running build verification..."
if ! pnpm verify:build; then
  echo ""
  echo "❌ Build verification failed! Please fix errors before committing."
  exit 1
fi

echo ""
echo "✅ Build verification passed!"
echo ""

# Step 2: Check for changes
if [ -z "$(git status --porcelain)" ]; then
  echo "ℹ️  No changes to commit."
  exit 0
fi

# Step 3: Show what will be committed
echo "📝 Changes to be committed:"
git status --short
echo ""

# Step 4: Ask for commit message (or use default)
if [ -z "$1" ]; then
  COMMIT_MSG="Build: Update build artifacts and verify all platforms"
else
  COMMIT_MSG="$1"
fi

# Step 5: Stage all changes
echo "📦 Staging changes..."
git add -A

# Step 6: Commit
echo "💾 Committing changes..."
git commit -m "$COMMIT_MSG"

# Step 7: Push
echo "📤 Pushing to remote..."
if git push origin main; then
  echo ""
  echo "✅ Successfully built, committed, and pushed!"
else
  echo ""
  echo "❌ Push failed. Please check your git remote configuration."
  exit 1
fi

