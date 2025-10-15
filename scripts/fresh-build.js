#!/usr/bin/env node

/**
 * Fresh Build Script
 * Performs a complete clean build of both web and extension apps
 * with proper cache busting and output verification
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
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`\n▶️  ${description}...`, 'blue');
    execSync(command, { 
      cwd: rootDir, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    log(`✅ ${description} completed`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    console.error(error.message);
    return false;
  }
}

function verifyOutput(dirPath, dirName) {
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    if (files.length > 0) {
      log(`✅ ${dirName} generated successfully (${files.length} items)`, 'green');
      return true;
    }
  }
  log(`❌ ${dirName} is empty or missing`, 'red');
  return false;
}

function getLastModifiedTime(dirPath) {
  if (!fs.existsSync(dirPath)) return null;
  const stats = fs.statSync(dirPath);
  return stats.mtime.toLocaleString();
}

function main() {
  const startTime = Date.now();
  
  log('\n🚀 Starting fresh build process...', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  // Step 1: Clean everything
  log('\n📋 Step 1: Cleaning previous builds', 'blue');
  runCommand('node scripts/clean-build.js', 'Clean build artifacts');
  
  // Step 2: Build packages first
  log('\n📋 Step 2: Building shared packages', 'blue');
  const packages = ['core', 'features', 'platform', 'platform-web', 'platform-extension', 'ui'];
  for (const pkg of packages) {
    runCommand(
      `pnpm --filter @boostlly/${pkg} run build`,
      `Building @boostlly/${pkg}`
    );
  }
  
  // Step 3: Build web app
  log('\n📋 Step 3: Building web application', 'blue');
  const webBuildSuccess = runCommand(
    'NODE_ENV=production pnpm --filter @boostlly/web run build',
    'Building web app'
  );
  
  // Step 4: Build extension
  log('\n📋 Step 4: Building extension', 'blue');
  const extBuildSuccess = runCommand(
    'pnpm --filter @boostlly/extension run build',
    'Building extension'
  );
  
  // Step 5: Run emoji fix script
  log('\n📋 Step 5: Post-build fixes', 'blue');
  runCommand('node scripts/fix-emojis.js', 'Fixing emojis');
  
  // Step 6: Verify outputs
  log('\n📋 Step 6: Verifying outputs', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  const webOutPath = path.join(rootDir, 'apps/web/out');
  const extDistPath = path.join(rootDir, 'apps/extension/dist');
  
  const webSuccess = verifyOutput(webOutPath, 'Web app (out folder)');
  const extSuccess = verifyOutput(extDistPath, 'Extension (dist folder)');
  
  // Display build times
  log('\n📊 Build Information:', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  if (webSuccess) {
    const webTime = getLastModifiedTime(webOutPath);
    log(`  Web app output: ${webOutPath}`, 'blue');
    log(`  Last modified: ${webTime}`, 'yellow');
  }
  
  if (extSuccess) {
    const extTime = getLastModifiedTime(extDistPath);
    log(`  Extension output: ${extDistPath}`, 'blue');
    log(`  Last modified: ${extTime}`, 'yellow');
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  if (webSuccess && extSuccess) {
    log(`✅ Fresh build completed successfully in ${duration}s!`, 'green');
    log('🎉 All outputs verified and ready to deploy', 'green');
    process.exit(0);
  } else {
    log(`⚠️  Build completed with issues in ${duration}s`, 'yellow');
    process.exit(1);
  }
}

main();

