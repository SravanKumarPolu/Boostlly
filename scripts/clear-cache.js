#!/usr/bin/env node

/**
 * Cache Clearing Script for Boostlly
 * 
 * This script helps clear various cache layers to ensure
 * new deployments show updated content immediately.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 Boostlly Cache Clearing Script');
console.log('================================');

// Update service worker version
const swPath = path.join(__dirname, '../apps/web/public/sw.js');
if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, 'utf8');
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  
  const updatedContent = swContent
    .replace(/const VERSION = "[^"]+";/, `const VERSION = "2.3.1"; // Auto-updated: ${new Date().toISOString()}`)
    .replace(/const BUILD_TIME = "[^"]+";/, `const BUILD_TIME = "${timestamp}";`);
  
  fs.writeFileSync(swPath, updatedContent);
  console.log('✅ Service Worker version updated');
}

// Update version.json
const versionPath = path.join(__dirname, '../apps/web/public/version.json');
const versionData = {
  version: "2.3.1",
  buildTime: new Date().toISOString(),
  timestamp: Date.now(),
  cacheBuster: Math.random().toString(36).substring(7)
};

fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2));
console.log('✅ Version file updated');

// Create cache-busting meta tag
const metaTag = `<!-- Cache Buster: ${Date.now()} -->`;
const indexPath = path.join(__dirname, '../apps/web/out/index.html');
if (fs.existsSync(indexPath)) {
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  if (!indexContent.includes('Cache Buster:')) {
    indexContent = indexContent.replace('<head>', `<head>\n  ${metaTag}`);
    fs.writeFileSync(indexPath, indexContent);
    console.log('✅ Cache-busting meta tag added to index.html');
  }
}

console.log('🎯 Cache clearing complete!');
console.log('📤 Deploy the updated files to see changes immediately.');
