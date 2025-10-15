# 🚀 Boostlly Deployment Guide

This guide provides comprehensive instructions for deploying both the web application and browser extension.

## 📋 Prerequisites

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **Git**: Latest version
- **Build Tools**: All dependencies installed (`pnpm install`)

## 🌐 Web Application Deployment

### Option 1: Automated Deployment (GitHub Actions)

The project includes GitHub Actions workflows for automatic deployment:

1. **Push to main branch**: Automatic deployment to Netlify
2. **Manual trigger**: Use the "Actions" tab in GitHub

**Required Secrets** (set in GitHub repository settings):
```
NETLIFY_AUTH_TOKEN=your_netlify_auth_token
NETLIFY_SITE_ID=your_netlify_site_id
```

### Option 2: Manual Deployment

#### Quick Deploy Script
```bash
# Run the automated deployment script
./scripts/deploy-web.sh
```

#### Manual Steps
```bash
# 1. Build the application
pnpm build:web

# 2. Deploy to your preferred platform
```

#### Deployment Targets

**Netlify (Recommended)**
- Visit: [app.netlify.com/drop](https://app.netlify.com/drop)
- Drag the `apps/web/out` folder
- Or use CLI: `netlify deploy --prod --dir=apps/web/out`

**Vercel**
```bash
cd apps/web
npx vercel --prod --dir=out
```

**Any Static Host**
- Upload contents of `apps/web/out` folder
- Ensure `index.html` is in the root directory

### Build Output
- **Location**: `apps/web/out/`
- **Size**: ~6.8MB
- **Pages**: 28 static pages
- **Features**: PWA, offline support, emoji rendering

## 🔌 Browser Extension Deployment

### Option 1: Automated Packaging (GitHub Actions)

1. **Push to main branch**: Automatic packaging and release creation
2. **Download**: Extension zip from GitHub releases

### Option 2: Manual Deployment

#### Quick Deploy Script
```bash
# Run the automated deployment script
./scripts/deploy-extension.sh
```

#### Manual Steps
```bash
# 1. Build the extension
pnpm build:ext

# 2. Package for distribution
cd apps/extension/dist
zip -r boostlly-extension.zip .
```

### Installation Instructions

#### For Development/Testing

**Chrome/Edge**
1. Open `chrome://extensions/` or `edge://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `apps/extension/dist` folder

**Firefox**
1. Open `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select `apps/extension/dist/manifest.json`

#### For Distribution

**Chrome Web Store**
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Create new item
3. Upload the zip file created by deployment script
4. Fill in store listing details
5. Submit for review

**Firefox Add-ons**
1. Go to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
2. Create new submission
3. Upload the zip file
4. Fill in listing details
5. Submit for review

**Edge Add-ons**
1. Go to [Microsoft Partner Center](https://partner.microsoft.com/dashboard)
2. Create new Edge extension submission
3. Upload the zip file
4. Complete store listing
5. Submit for certification

### Extension Details
- **Manifest Version**: 3 (MV3)
- **Size**: ~1.8MB (compressed)
- **Permissions**: storage, alarms, notifications, activeTab
- **Features**: New tab override, popup, options page, content script

## 🔧 Troubleshooting

### Common Issues

**Build Failures**
```bash
# Clean and rebuild
pnpm clean:all
pnpm build:fresh
```

**TypeScript Errors**
```bash
# Check types
pnpm type-check
```

**Missing Dependencies**
```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Extension Not Loading**
- Check browser console for errors
- Verify manifest.json is valid
- Ensure all required files are present
- Check file permissions

### Build Verification

**Web App**
- Verify `apps/web/out/index.html` exists
- Check for static assets in `_next/static/`
- Test offline functionality

**Extension**
- Verify `apps/extension/dist/manifest.json` exists
- Check all required scripts are present
- Test in browser developer mode

## 📊 Performance Metrics

### Web App
- **First Load JS**: ~377kB
- **Bundle Size**: Optimized with code splitting
- **Performance**: Lighthouse score 90+
- **SEO**: Static generation for all pages

### Extension
- **Total Size**: ~1.8MB (compressed)
- **Load Time**: < 2 seconds
- **Memory Usage**: < 50MB
- **Compatibility**: Chrome 88+, Firefox 109+, Edge 88+

## 🔄 Continuous Integration

The project includes GitHub Actions workflows:

- **`.github/workflows/deploy-web.yml`**: Web app deployment
- **`.github/workflows/deploy-extension.yml`**: Extension packaging

### Workflow Triggers
- Push to `main` branch
- Manual workflow dispatch
- Path-specific triggers (only when relevant files change)

### Workflow Features
- Dependency caching
- Parallel builds
- Artifact uploads
- Release creation
- Deployment notifications

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] All tests pass
- [ ] TypeScript compilation successful
- [ ] No linting errors
- [ ] Version numbers updated
- [ ] Changelog updated

### Web Deployment
- [ ] Build successful (`pnpm build:web`)
- [ ] Static files generated in `apps/web/out/`
- [ ] PWA manifest valid
- [ ] Service worker functional
- [ ] Offline support working

### Extension Deployment
- [ ] Build successful (`pnpm build:ext`)
- [ ] All required files present in `apps/extension/dist/`
- [ ] Manifest v3 compliant
- [ ] Icons and assets included
- [ ] Package size acceptable

### Post-Deployment
- [ ] Test in target browsers
- [ ] Verify functionality
- [ ] Check performance metrics
- [ ] Monitor error logs
- [ ] Update documentation

## 🆘 Support

If you encounter issues during deployment:

1. Check the troubleshooting section above
2. Review build logs for specific errors
3. Verify all prerequisites are met
4. Test in a clean environment
5. Create an issue in the GitHub repository

---

**Happy Deploying! 🎉**
