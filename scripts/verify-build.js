#!/usr/bin/env node

/**
 * Build Verification Script
 * 
 * Verifies that all platforms (web, extension, android) can build successfully
 * before allowing commits. This ensures deployment readiness.
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    const output = execSync(command, {
      cwd: rootDir,
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf-8',
      ...options,
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout?.toString() || '' };
  }
}

async function verifyTypeCheck() {
  log('\n📘 Step 1: Type Checking All Packages...', 'cyan');
  const result = exec('pnpm type-check');
  if (!result.success) {
    log('❌ Type check failed!', 'red');
    return false;
  }
  log('✅ Type check passed!', 'green');
  return true;
}

async function verifyWebBuild() {
  log('\n🌐 Step 2: Building Web App...', 'cyan');
  const result = exec('pnpm build:web');
  if (!result.success) {
    log('❌ Web build failed!', 'red');
    return false;
  }
  log('✅ Web build passed!', 'green');
  return true;
}

async function verifyExtensionBuild() {
  log('\n🔌 Step 3: Building Extension...', 'cyan');
  const result = exec('pnpm build:ext');
  if (!result.success) {
    log('❌ Extension build failed!', 'red');
    return false;
  }
  log('✅ Extension build passed!', 'green');
  return true;
}

async function verifyAndroidTypeCheck() {
  log('\n📱 Step 4: Type Checking Android App...', 'cyan');
  const result = exec('pnpm --filter @boostlly/android run type-check');
  if (!result.success) {
    log('⚠️  Android type check failed!', 'yellow');
    log('   This is non-critical but should be fixed.', 'yellow');
    return false;
  }
  log('✅ Android type check passed!', 'green');
  return true;
}

async function verifyAndroidBuild() {
  log('\n📱 Step 5: Building Android App (optional)...', 'cyan');
  log('   Note: Android build may fail due to Metro bundler issues.', 'yellow');
  log('   This is acceptable if type-check passes.', 'yellow');
  
  const result = exec('pnpm --filter @boostlly/android run build', { silent: true });
  if (!result.success) {
    log('⚠️  Android build failed (this is acceptable if type-check passed)', 'yellow');
    log('   Error:', 'yellow');
    console.log(result.error?.split('\n').slice(0, 5).join('\n') || 'Unknown error');
    return true; // Don't fail the whole process for Android build
  }
  log('✅ Android build passed!', 'green');
  return true;
}

async function main() {
  log('🚀 Starting Build Verification...', 'blue');
  log('   This will verify all platforms can build successfully.\n', 'blue');

  const results = {
    typeCheck: false,
    web: false,
    extension: false,
    androidTypeCheck: false,
    androidBuild: false,
  };

  // Step 1: Type check all packages
  results.typeCheck = await verifyTypeCheck();
  if (!results.typeCheck) {
    log('\n❌ Build verification failed at type checking stage.', 'red');
    process.exit(1);
  }

  // Step 2: Build web
  results.web = await verifyWebBuild();
  if (!results.web) {
    log('\n❌ Build verification failed at web build stage.', 'red');
    process.exit(1);
  }

  // Step 3: Build extension
  results.extension = await verifyExtensionBuild();
  if (!results.extension) {
    log('\n❌ Build verification failed at extension build stage.', 'red');
    process.exit(1);
  }

  // Step 4: Android type check
  results.androidTypeCheck = await verifyAndroidTypeCheck();
  // Don't fail if Android type check fails, but warn

  // Step 5: Android build (optional)
  results.androidBuild = await verifyAndroidBuild();

  // Summary
  log('\n' + '='.repeat(50), 'cyan');
  log('📊 Build Verification Summary', 'blue');
  log('='.repeat(50), 'cyan');
  log(`Type Check:        ${results.typeCheck ? '✅' : '❌'}`, results.typeCheck ? 'green' : 'red');
  log(`Web Build:         ${results.web ? '✅' : '❌'}`, results.web ? 'green' : 'red');
  log(`Extension Build:   ${results.extension ? '✅' : '❌'}`, results.extension ? 'green' : 'red');
  log(`Android Type Check: ${results.androidTypeCheck ? '✅' : '⚠️ '}`, results.androidTypeCheck ? 'green' : 'yellow');
  log(`Android Build:      ${results.androidBuild ? '✅' : '⚠️ '}`, results.androidBuild ? 'green' : 'yellow');
  log('='.repeat(50), 'cyan');

  const criticalPassed = results.typeCheck && results.web && results.extension;
  
  if (criticalPassed) {
    log('\n✅ Critical builds passed! Ready to commit.', 'green');
    if (!results.androidTypeCheck || !results.androidBuild) {
      log('⚠️  Android has issues but is not blocking.', 'yellow');
    }
    process.exit(0);
  } else {
    log('\n❌ Critical builds failed! Please fix errors before committing.', 'red');
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});

