#!/bin/bash

# Boostlly Web App Deployment Script
# This script builds and deploys the web application to production

set -e

echo "🚀 Starting Boostlly Web App Deployment..."
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

print_status "Building web application..."

# Navigate to project root
cd "$PROJECT_ROOT"

# Clean and build
print_status "Cleaning previous builds..."
pnpm --filter @boostlly/web run clean

print_status "Building shared packages..."
pnpm --filter @boostlly/core run build
pnpm --filter @boostlly/features run build
pnpm --filter @boostlly/ui run build
pnpm --filter @boostlly/platform-web run build

print_status "Building web application..."
NODE_ENV=production pnpm --filter @boostlly/web run build

print_status "Running post-build fixes..."
node scripts/fix-emojis.js

# Verify build output
WEB_OUT_DIR="$PROJECT_ROOT/apps/web/out"
if [ -d "$WEB_OUT_DIR" ] && [ "$(ls -A "$WEB_OUT_DIR")" ]; then
    print_success "Web app built successfully!"
    echo "📁 Build output: $WEB_OUT_DIR"
    echo "📊 Build size: $(du -sh "$WEB_OUT_DIR" | cut -f1)"
else
    print_error "Build failed - output directory is empty or missing"
    exit 1
fi

# Deployment options
echo ""
echo "🎯 Deployment Options:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. 🎨 Netlify (Recommended for static sites)"
echo "   - Visit: https://app.netlify.com/drop"
echo "   - Drag folder: $WEB_OUT_DIR"
echo ""
echo "2. 📦 Vercel (Alternative)"
echo "   - Run: npx vercel --prod --dir=$WEB_OUT_DIR"
echo ""
echo "3. 🌐 Any static hosting"
echo "   - Upload contents of: $WEB_OUT_DIR"
echo ""
echo "4. 🔧 Local preview"
echo "   - Run: cd apps/web && pnpm start"
echo ""

# Check if Netlify CLI is available
if command -v netlify &> /dev/null; then
    echo "🚀 Netlify CLI detected!"
    read -p "Deploy to Netlify now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deploying to Netlify..."
        cd "$PROJECT_ROOT/apps/web"
        netlify deploy --prod --dir=out
        print_success "Deployed to Netlify successfully!"
    fi
else
    print_warning "Netlify CLI not found. Install with: npm install -g netlify-cli"
fi

echo ""
print_success "Deployment script completed!"
echo "🌐 Your web app is ready for deployment"
