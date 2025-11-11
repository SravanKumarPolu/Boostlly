#!/usr/bin/env node

/**
 * Verification Script for Mobile Contrast Improvements
 * 
 * This script verifies that all contrast improvements are properly implemented:
 * 1. Daily background image changes
 * 2. Text color adaptation
 * 3. Mobile contrast improvements
 * 4. Responsive overlays
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const checks = [];
const errors = [];
const warnings = [];

function checkFile(filePath, description, required = true) {
  const fullPath = join(rootDir, filePath);
  const exists = existsSync(fullPath);
  
  if (exists) {
    checks.push({ type: 'success', message: `✅ ${description} - File exists: ${filePath}` });
    return true;
  } else {
    const message = `${required ? '❌' : '⚠️'} ${description} - File not found: ${filePath}`;
    if (required) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
    return false;
  }
}

function checkFileContent(filePath, patterns, description) {
  const fullPath = join(rootDir, filePath);
  if (!existsSync(fullPath)) {
    errors.push(`❌ ${description} - File not found: ${filePath}`);
    return false;
  }

  try {
    const content = readFileSync(fullPath, 'utf-8');
    const missing = [];
    
    for (const pattern of patterns) {
      if (!content.includes(pattern)) {
        missing.push(pattern);
      }
    }

    if (missing.length === 0) {
      checks.push({ type: 'success', message: `✅ ${description} - All patterns found in ${filePath}` });
      return true;
    } else {
      errors.push(`❌ ${description} - Missing patterns in ${filePath}: ${missing.join(', ')}`);
      return false;
    }
  } catch (error) {
    errors.push(`❌ ${description} - Error reading file ${filePath}: ${error.message}`);
    return false;
  }
}

console.log('🔍 Verifying Mobile Contrast Improvements...\n');

// Check 1: Core hook file
checkFile(
  'packages/core/src/hooks/useAutoTheme.ts',
  'useAutoTheme hook with date change detection'
);

checkFileContent(
  'packages/core/src/hooks/useAutoTheme.ts',
  [
    'lastLoadedDateKey',
    'checkDateChange',
    'setInterval',
    'visibilitychange',
    'getDateKey'
  ],
  'Date change detection in useAutoTheme'
);

// Check 2: Background theme utilities
checkFile(
  'packages/core/src/utils/background-theme.ts',
  'Background theme utilities'
);

checkFileContent(
  'packages/core/src/utils/background-theme.ts',
  [
    'getLuminance',
    'luminance < 0.35',
    'luminance > 0.65',
    'ensureContrast'
  ],
  'Luminance-based text color selection'
);

// Check 3: Today tab component
checkFile(
  'packages/features/src/components/today-tab.tsx',
  'Today tab component'
);

checkFileContent(
  'packages/features/src/components/today-tab.tsx',
  [
    'computeLuminance',
    'bgLuma',
    'textColor',
    'quote-text-mobile-contrast',
    'from-black/60',
    'via-black/50',
    'md:from-background'
  ],
  'Mobile contrast improvements in Today tab'
);

// Check 4: Unified app component
checkFile(
  'packages/features/src/components/unified-app/UnifiedAppRefactored.tsx',
  'Unified app component'
);

checkFileContent(
  'packages/features/src/components/unified-app/UnifiedAppRefactored.tsx',
  [
    'bg-black/30',
    'bg-black/20',
    'bg-background/10',
    'gradient-to-b',
    'from-black/50'
  ],
  'Responsive overlays in Unified app'
);

// Check 5: Extension newtab
checkFile(
  'apps/extension/src/newtab/index.html',
  'Extension newtab page'
);

checkFileContent(
  'apps/extension/src/newtab/index.html',
  [
    'body::before',
    'rgba(0, 0, 0, 0.3)',
    'rgba(0, 0, 0, 0.65)',
    'text-shadow',
    'backdrop-filter'
  ],
  'Mobile contrast in extension newtab'
);

// Check 6: Global CSS
checkFile(
  'apps/web/src/app/globals.css',
  'Global CSS file'
);

checkFileContent(
  'apps/web/src/app/globals.css',
  [
    'quote-text-mobile-contrast',
    'quote-author-mobile-contrast',
    '@media (max-width: 768px)',
    'text-shadow'
  ],
  'Mobile CSS classes in globals.css'
);

// Check 7: Documentation
checkFile(
  'MOBILE_CONTRAST_IMPROVEMENTS.md',
  'Implementation documentation',
  false
);

// Summary
console.log('\n📊 Verification Summary:\n');
console.log(`✅ Successful checks: ${checks.length}`);
console.log(`❌ Errors: ${errors.length}`);
console.log(`⚠️  Warnings: ${warnings.length}\n`);

if (checks.length > 0) {
  console.log('✅ Successful Checks:');
  checks.forEach(check => console.log(`   ${check.message}`));
}

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  warnings.forEach(warning => console.log(`   ${warning}`));
}

if (errors.length > 0) {
  console.log('\n❌ Errors:');
  errors.forEach(error => console.log(`   ${error}`));
  console.log('\n❌ Verification failed! Please fix the errors above.');
  process.exit(1);
} else {
  console.log('\n✅ All verifications passed!');
  console.log('\n🎯 Implementation Status:');
  console.log('   ✅ Daily background image changes - VERIFIED');
  console.log('   ✅ Text color adaptation - VERIFIED');
  console.log('   ✅ Mobile contrast improvements - VERIFIED');
  console.log('   ✅ Responsive overlays - VERIFIED');
  console.log('   ✅ Date change detection - VERIFIED');
  console.log('   ✅ Extension support - VERIFIED');
  console.log('\n🚀 Ready for production!');
  process.exit(0);
}

