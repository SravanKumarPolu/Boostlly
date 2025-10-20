#!/usr/bin/env node

/**
 * Force Cache Clear Script for Boostlly
 * 
 * This script aggressively clears all cache layers to ensure
 * deployed version matches localhost exactly.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔥 AGGRESSIVE Cache Clearing Script');
console.log('===================================');

// 1. Update service worker with new version
const swPath = path.join(__dirname, '../apps/web/public/sw.js');
if (fs.existsSync(swPath)) {
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const version = `2.4.0-${timestamp}`;
  
  let swContent = fs.readFileSync(swPath, 'utf8');
  swContent = swContent
    .replace(/const VERSION = "[^"]+";/, `const VERSION = "${version}";`)
    .replace(/const BUILD_TIME = "[^"]+";/, `const BUILD_TIME = "${timestamp}";`);
  
  fs.writeFileSync(swPath, swContent);
  console.log(`✅ Service Worker updated to version ${version}`);
}

// 2. Update version.json with aggressive cache buster
const versionPath = path.join(__dirname, '../apps/web/public/version.json');
const versionData = {
  version: `2.4.0-${Date.now()}`,
  buildTime: new Date().toISOString(),
  timestamp: Date.now(),
  cacheBuster: Math.random().toString(36).substring(7),
  forceRefresh: true,
  deployment: "aggressive-cache-clear"
};

fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2));
console.log('✅ Version file updated with aggressive cache buster');

// 3. Add cache-busting meta tags to all HTML files
const outDir = path.join(__dirname, '../apps/web/out');
if (fs.existsSync(outDir)) {
  const htmlFiles = ['index.html', '404.html'];
  
  htmlFiles.forEach(file => {
    const filePath = path.join(outDir, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Add cache-busting meta tags
      const cacheBusterMeta = `
  <!-- AGGRESSIVE CACHE BUSTER - ${Date.now()} -->
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <meta name="cache-buster" content="${Date.now()}">
  <meta name="deployment-version" content="2.4.0-${Date.now()}">`;
      
      if (!content.includes('AGGRESSIVE CACHE BUSTER')) {
        content = content.replace('<head>', `<head>${cacheBusterMeta}`);
        fs.writeFileSync(filePath, content);
        console.log(`✅ Added cache-busting meta tags to ${file}`);
      }
    }
  });
}

// 4. Create a cache-busting script for the deployed site
const cacheBusterScript = `
// Force cache clear for deployed site
(function() {
  console.log('🔥 Force clearing all caches...');
  
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('🗑️ Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      console.log('✅ All caches cleared');
      // Force reload
      window.location.reload(true);
    });
  } else {
    // Fallback: force reload
    window.location.reload(true);
  }
})();
`;

const scriptPath = path.join(__dirname, '../apps/web/out/force-cache-clear.js');
fs.writeFileSync(scriptPath, cacheBusterScript);
console.log('✅ Created force-cache-clear.js script');

// 5. Update Next.js config to be more aggressive with cache headers
const nextConfigPath = path.join(__dirname, '../apps/web/next.config.js');
if (fs.existsSync(nextConfigPath)) {
  let config = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Add more aggressive cache headers
  const aggressiveHeaders = `
      // AGGRESSIVE CACHE BUSTING - Force refresh all JS files
      headers.push({
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate, max-age=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
          {
            key: "ETag",
            value: \`"\${Date.now()}"\`,
          },
        ],
      });`;
  
  if (!config.includes('AGGRESSIVE CACHE BUSTING')) {
    config = config.replace(
      '// JavaScript files with no cache to force refresh',
      aggressiveHeaders
    );
    fs.writeFileSync(nextConfigPath, config);
    console.log('✅ Updated Next.js config with aggressive cache headers');
  }
}

console.log('');
console.log('🎯 AGGRESSIVE CACHE CLEARING COMPLETE!');
console.log('=====================================');
console.log('📤 Deploy these changes to see immediate results:');
console.log('   1. Service Worker version updated');
console.log('   2. Version file with cache buster');
console.log('   3. HTML files with cache-busting meta tags');
console.log('   4. Force cache clear script created');
console.log('   5. Next.js config updated');
console.log('');
console.log('💡 After deployment:');
console.log('   • Users will get fresh JavaScript files');
console.log('   • All caches will be cleared automatically');
console.log('   • Quotes should match localhost exactly');
