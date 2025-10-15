#!/bin/bash

# Boostlly Extension Deployment Script
# This script builds and packages the browser extension for distribution

set -e

echo "🚀 Starting Boostlly Extension Deployment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}▶️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

print_status "Building browser extension..."

# Navigate to project root
cd "$PROJECT_ROOT"

# Clean and build
print_status "Cleaning previous builds..."
pnpm --filter @boostlly/extension run clean

print_status "Building shared packages..."
pnpm --filter @boostlly/core run build
pnpm --filter @boostlly/features run build
pnpm --filter @boostlly/ui run build
pnpm --filter @boostlly/platform-extension run build

print_status "Building extension..."
pnpm --filter @boostlly/extension run build

print_status "Running post-build fixes..."
node scripts/fix-emojis.js

# Verify build output
EXT_DIST_DIR="$PROJECT_ROOT/apps/extension/dist"
if [ -d "$EXT_DIST_DIR" ] && [ "$(ls -A "$EXT_DIST_DIR")" ]; then
    print_success "Extension built successfully!"
    echo "📁 Build output: $EXT_DIST_DIR"
    echo "📊 Build size: $(du -sh "$EXT_DIST_DIR" | cut -f1)"
    
    # Check for required files
    REQUIRED_FILES=("manifest.json" "background.js" "content.js" "popup.html" "options.html")
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "$EXT_DIST_DIR/$file" ]; then
            print_success "✓ $file found"
        else
            print_error "✗ $file missing"
        fi
    done
else
    print_error "Build failed - output directory is empty or missing"
    exit 1
fi

# Create distribution package
echo ""
print_status "Creating distribution package..."

PACKAGE_NAME="boostlly-extension-$(date +%Y%m%d-%H%M%S).zip"
PACKAGE_PATH="$PROJECT_ROOT/$PACKAGE_NAME"

cd "$EXT_DIST_DIR"
zip -r "$PACKAGE_PATH" . -x "*.DS_Store" "*.git*"

if [ -f "$PACKAGE_PATH" ]; then
    print_success "Package created: $PACKAGE_NAME"
    echo "📦 Package size: $(du -sh "$PACKAGE_PATH" | cut -f1)"
    echo "📍 Package location: $PACKAGE_PATH"
else
    print_error "Failed to create package"
    exit 1
fi

# Installation instructions
echo ""
echo "🎯 Installation Instructions:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 For Chrome/Edge:"
echo "   1. Open chrome://extensions/ or edge://extensions/"
echo "   2. Enable 'Developer mode'"
echo "   3. Click 'Load unpacked'"
echo "   4. Select folder: $EXT_DIST_DIR"
echo ""
echo "📦 For Firefox:"
echo "   1. Open about:debugging"
echo "   2. Click 'This Firefox'"
echo "   3. Click 'Load Temporary Add-on'"
echo "   4. Select manifest.json from: $EXT_DIST_DIR"
echo ""
echo "📦 For Distribution:"
echo "   1. Use the zip file: $PACKAGE_PATH"
echo "   2. Submit to Chrome Web Store / Firefox Add-ons"
echo ""

# Validation
echo "🔍 Extension Validation:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check manifest version
MANIFEST_VERSION=$(grep -o '"version": "[^"]*"' "$EXT_DIST_DIR/manifest.json" | cut -d'"' -f4)
echo "📋 Manifest version: $MANIFEST_VERSION"

# Check file permissions
echo "🔒 File permissions:"
ls -la "$EXT_DIST_DIR" | head -10

echo ""
print_success "Extension deployment completed!"
echo "🎉 Your extension is ready for installation and distribution"
