#!/usr/bin/env node

/**
 * Update Version Script
 * Automatically updates version numbers in sw.js and version.json during build
 * This ensures proper cache invalidation and forces browsers to fetch new content
 */

const fs = require('fs');
const path = require('path');

// Get current timestamp
const now = new Date();
const buildTime = now.toISOString();
const timestamp = now.getTime();
const buildTimeFormatted = now.toISOString().replace(/[-:T]/g, '').split('.')[0]; // Format: YYYYMMDDHHmmss
const cacheBuster = Math.random().toString(36).substring(2, 9);

// Read package.json to get current version
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version || '0.1.0';

console.log(`🔄 Updating versions...`);
console.log(`   Version: ${version}`);
console.log(`   Build Time: ${buildTime}`);
console.log(`   Cache Buster: ${cacheBuster}`);

// Update version.json
const versionJsonPath = path.join(__dirname, '..', 'public', 'version.json');
const versionData = {
  version,
  buildTime,
  timestamp,
  cacheBuster,
  date: now.toISOString().split('T')[0],
};

fs.writeFileSync(versionJsonPath, JSON.stringify(versionData, null, 2) + '\n');
console.log(`✅ Updated ${versionJsonPath}`);

// Update sw.js
const swJsPath = path.join(__dirname, '..', 'public', 'sw.js');
let swContent = fs.readFileSync(swJsPath, 'utf8');

// Remove old comment lines with timestamps (clean up multiple auto-updated comments)
swContent = swContent.replace(
  /\/\/ Auto-updated: [^\n]+\n/g,
  ''
);

// Update VERSION constant - handle various formats
// Match: const VERSION = "x.x.x"; // Updated: ... or // Auto-updated: ...
swContent = swContent.replace(
  /const VERSION = "[^"]+";(\s*\/\/[^\n]*)?/,
  `const VERSION = "${version}"; // Updated: ${buildTime}`
);

// Update BUILD_TIME constant
swContent = swContent.replace(
  /const BUILD_TIME = "[^"]+";(\s*\/\/[^\n]*)?/,
  `const BUILD_TIME = "${buildTimeFormatted}"; // Format: YYYYMMDDHHmmss`
);

fs.writeFileSync(swJsPath, swContent);
console.log(`✅ Updated ${swJsPath}`);

// Also update the out directory if it exists (for post-build updates)
const outVersionJsonPath = path.join(__dirname, '..', 'out', 'version.json');
const outSwJsPath = path.join(__dirname, '..', 'out', 'sw.js');

if (fs.existsSync(outVersionJsonPath)) {
  fs.writeFileSync(outVersionJsonPath, JSON.stringify(versionData, null, 2) + '\n');
  console.log(`✅ Updated ${outVersionJsonPath}`);
}

if (fs.existsSync(outSwJsPath)) {
  fs.writeFileSync(outSwJsPath, swContent);
  console.log(`✅ Updated ${outSwJsPath}`);
}

console.log(`\n✨ Version update complete!`);
console.log(`   All caches will be invalidated on next deployment.`);

