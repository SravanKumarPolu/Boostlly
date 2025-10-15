#!/usr/bin/env node

/**
 * Update Service Worker Version Script
 * 
 * This script automatically updates the service worker version and build time
 * before each deployment to ensure mobile users get fresh content.
 * 
 * Usage: node scripts/update-sw-version.js [version]
 * Example: node scripts/update-sw-version.js 2.0.2
 */

const fs = require('fs');
const path = require('path');

// Get version from command line or use fixed version for mobile fix
const newVersion = process.argv[2] || "2.1.0";
const buildTime = generateBuildTime();

// Path to service worker
const swPath = path.join(__dirname, '../apps/web/public/sw.js');

console.log('🔄 Updating Service Worker...');
console.log(`   Version: ${newVersion}`);
console.log(`   Build Time: ${buildTime}`);

try {
  // Read the service worker file
  let swContent = fs.readFileSync(swPath, 'utf8');

  // Update VERSION
  swContent = swContent.replace(
    /const VERSION = "[\d.]+";.*$/m,
    `const VERSION = "${newVersion}"; // Updated: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  );

  // Update BUILD_TIME
  swContent = swContent.replace(
    /const BUILD_TIME = "\d+-\d+";.*$/m,
    `const BUILD_TIME = "${buildTime}"; // Format: YYYYMMDD-HHMMSS`
  );

  // Write back to file
  fs.writeFileSync(swPath, swContent, 'utf8');

  // Create version.json for the app to check against
  const versionJsonPath = path.join(__dirname, '../apps/web/public/version.json');
  const versionData = {
    version: newVersion,
    buildTime: buildTime,
    timestamp: Date.now(),
    date: new Date().toISOString()
  };
  fs.writeFileSync(versionJsonPath, JSON.stringify(versionData, null, 2), 'utf8');

  console.log('✅ Service Worker updated successfully!');
  console.log('✅ Version manifest created at /version.json');
  console.log('📱 Mobile users will now receive fresh content after deployment.');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Build the project: pnpm build');
  console.log('  2. Deploy to production');
  console.log('  3. Users will auto-update on next visit');
  console.log('');
} catch (error) {
  console.error('❌ Error updating service worker:', error.message);
  process.exit(1);
}

/**
 * Generate a version number based on current date
 * Format: MAJOR.MINOR.PATCH where PATCH is days since start of year
 */
function generateVersion() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Format: 2.MONTH.DAY
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `2.${month}${day}.${dayOfYear}`;
}

/**
 * Generate build time in YYYYMMDD-HHMMSS format
 */
function generateBuildTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}
