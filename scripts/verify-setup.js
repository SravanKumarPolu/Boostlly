#!/usr/bin/env node

/**
 * Verification script for Boostlly project setup
 * Checks if all platforms are properly configured
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

function check(name, condition, isWarning = false) {
  if (condition) {
    console.log(`✅ ${name}`);
    checks.passed++;
  } else {
    const prefix = isWarning ? '⚠️' : '❌';
    console.log(`${prefix} ${name}`);
    if (isWarning) {
      checks.warnings++;
    } else {
      checks.failed++;
    }
  }
}

function checkFile(path, description) {
  const fullPath = join(rootDir, path);
  return existsSync(fullPath);
}

function checkPackageJson(name, description) {
  const path = join(rootDir, name, 'package.json');
  if (!existsSync(path)) return false;
  
  try {
    const pkg = JSON.parse(readFileSync(path, 'utf-8'));
    return pkg.name === `@boostlly/${name.split('/').pop()}`;
  } catch {
    return false;
  }
}

console.log('\n🔍 Boostlly Project Verification\n');
console.log('=' .repeat(50));

// Project structure
console.log('\n📁 Project Structure:');
check('Root package.json exists', checkFile('package.json'));
check('pnpm-workspace.yaml exists', checkFile('pnpm-workspace.yaml'));
check('TypeScript base config exists', checkFile('tsconfig.base.json'));

// Apps
console.log('\n📱 Applications:');
check('Web app exists', checkFile('apps/web'));
check('Web app package.json', checkPackageJson('apps/web', 'Web app'));
check('Extension app exists', checkFile('apps/extension'));
check('Extension app package.json', checkPackageJson('apps/extension', 'Extension'));
check('Android app exists', checkFile('apps/android'));
check('Android app package.json', checkPackageJson('apps/android', 'Android'));

// Packages
console.log('\n📦 Shared Packages:');
check('Core package exists', checkFile('packages/core'));
check('Features package exists', checkFile('packages/features'));
check('UI package exists', checkFile('packages/ui'));
check('Platform package exists', checkFile('packages/platform'));
check('Platform-web package exists', checkFile('packages/platform-web'));
check('Platform-extension package exists', checkFile('packages/platform-extension'));
check('Platform-android package exists', checkFile('packages/platform-android'));

// Android specific
console.log('\n🤖 Android Configuration:');
check('Android app.json exists', checkFile('apps/android/app.json'));
check('Android eas.json exists', checkFile('apps/android/eas.json'));
check('Android App.tsx exists', checkFile('apps/android/App.tsx'));

// Android assets (warnings)
console.log('\n🎨 Android Assets (Warnings if missing):');
check('Android assets folder exists', checkFile('apps/android/assets'), true);
check('Android icon.png', checkFile('apps/android/assets/icon.png'), true);
check('Android splash.png', checkFile('apps/android/assets/splash.png'), true);
check('Android adaptive-icon.png', checkFile('apps/android/assets/adaptive-icon.png'), true);

// Configuration files
console.log('\n⚙️  Configuration:');
check('Android setup guide exists', checkFile('ANDROID_SETUP.md'));
check('Verification guide exists', checkFile('VERIFICATION_AND_ACTION_PLAN.md'));

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Summary:');
console.log(`✅ Passed: ${checks.passed}`);
console.log(`⚠️  Warnings: ${checks.warnings}`);
console.log(`❌ Failed: ${checks.failed}`);

if (checks.failed === 0 && checks.warnings === 0) {
  console.log('\n🎉 All checks passed! Your project is ready to go.');
  process.exit(0);
} else if (checks.failed === 0) {
  console.log('\n✅ Core setup is complete! Some optional items need attention (warnings).');
  console.log('   Check VERIFICATION_AND_ACTION_PLAN.md for next steps.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some required items are missing. Please fix the failed checks.');
  process.exit(1);
}

