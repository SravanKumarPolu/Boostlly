#!/usr/bin/env node

/**
 * Clean Build Script
 * Ensures a fresh build by cleaning all output directories and build caches
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function cleanDirectory(dirPath, dirName) {
  if (fs.existsSync(dirPath)) {
    log(`🗑️  Cleaning ${dirName}...`, 'yellow');
    fs.rmSync(dirPath, { recursive: true, force: true });
    log(`✅ ${dirName} cleaned`, 'green');
    return true;
  }
  return false;
}

function main() {
  log('\n🧹 Starting clean build process...', 'blue');
  
  // Clean web app outputs
  log('\n📦 Cleaning web app...', 'blue');
  cleanDirectory(path.join(rootDir, 'apps/web/.next'), '.next cache');
  cleanDirectory(path.join(rootDir, 'apps/web/out'), 'out folder');
  cleanDirectory(path.join(rootDir, 'apps/web/dist'), 'dist folder');
  
  // Clean extension outputs
  log('\n🔌 Cleaning extension...', 'blue');
  cleanDirectory(path.join(rootDir, 'apps/extension/dist'), 'extension dist');
  
  // Clean package builds (optional, uncomment if needed)
  log('\n📚 Cleaning package builds...', 'blue');
  const packages = ['core', 'features', 'platform', 'platform-web', 'platform-extension', 'ui'];
  packages.forEach(pkg => {
    cleanDirectory(path.join(rootDir, `packages/${pkg}/dist`), `${pkg} dist`);
  });
  
  // Clean TypeScript build info
  log('\n🔨 Cleaning TypeScript build info...', 'blue');
  const tsbuildinfoPaths = [
    'apps/web/tsconfig.tsbuildinfo',
    'apps/extension/tsconfig.tsbuildinfo',
    ...packages.map(pkg => `packages/${pkg}/dist/tsconfig.tsbuildinfo`)
  ];
  
  tsbuildinfoPaths.forEach(tsbPath => {
    const fullPath = path.join(rootDir, tsbPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      log(`  Removed ${tsbPath}`, 'green');
    }
  });
  
  log('\n✅ Clean completed successfully!', 'green');
  log('📝 Ready for fresh build\n', 'blue');
}

main();

