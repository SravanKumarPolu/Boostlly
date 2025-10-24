#!/usr/bin/env node

/**
 * Boostlly Project Cleanup Script
 * 
 * This script performs a comprehensive cleanup of the Boostlly project:
 * - Removes duplicate files and assets
 * - Consolidates build outputs
 * - Cleans up documentation
 * - Simplifies project structure
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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function removeFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    log(`🗑️  Removed ${description}`, 'yellow');
    return true;
  }
  return false;
}

function removeDirectory(dirPath, description) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    log(`🗑️  Removed ${description}`, 'yellow');
    return true;
  }
  return false;
}

function consolidateAssets() {
  log('\n📦 Consolidating Assets...', 'blue');
  
  // Create shared assets directory
  const sharedAssetsDir = path.join(rootDir, 'shared', 'assets');
  if (!fs.existsSync(sharedAssetsDir)) {
    fs.mkdirSync(sharedAssetsDir, { recursive: true });
  }
  
  // Move logo to shared location
  const logoSource = path.join(rootDir, 'apps/web/public/boostlly-logo.png');
  const logoDest = path.join(sharedAssetsDir, 'boostlly-logo.png');
  if (fs.existsSync(logoSource) && !fs.existsSync(logoDest)) {
    fs.copyFileSync(logoSource, logoDest);
    log('✅ Consolidated logo to shared assets', 'green');
  }
  
  // Move icons to shared location
  const iconsSource = path.join(rootDir, 'apps/web/public/icons');
  const iconsDest = path.join(sharedAssetsDir, 'icons');
  if (fs.existsSync(iconsSource) && !fs.existsSync(iconsDest)) {
    fs.cpSync(iconsSource, iconsDest, { recursive: true });
    log('✅ Consolidated icons to shared assets', 'green');
  }
}

function cleanBuildArtifacts() {
  log('\n🧹 Cleaning Build Artifacts...', 'blue');
  
  // Remove old build outputs
  const buildDirs = [
    'apps/web/.next',
    'apps/web/out',
    'apps/web/dist',
    'apps/extension/dist',
    'packages/core/dist',
    'packages/features/dist',
    'packages/platform/dist',
    'packages/platform-web/dist',
    'packages/platform-extension/dist',
    'packages/ui/dist'
  ];
  
  buildDirs.forEach(dir => {
    removeDirectory(path.join(rootDir, dir), `${dir} directory`);
  });
  
  // Remove TypeScript build info
  const tsbuildinfoFiles = [
    'apps/web/tsconfig.tsbuildinfo',
    'apps/extension/tsconfig.tsbuildinfo'
  ];
  
  tsbuildinfoFiles.forEach(file => {
    removeFile(path.join(rootDir, file), `TypeScript build info: ${file}`);
  });
}

function cleanDocumentation() {
  log('\n📚 Cleaning Documentation...', 'blue');
  
  // Remove redundant documentation files
  const redundantDocs = [
    'DEPLOY_NOW.md',
    'FRESH-DEPLOYMENT.md',
    'DEPLOYMENT_API_FIX.md',
    'NETLIFY_CACHE_CLEAR_GUIDE.md',
    'IMPROVEMENT_SUMMARY.md'
  ];
  
  redundantDocs.forEach(doc => {
    removeFile(path.join(rootDir, doc), `redundant documentation: ${doc}`);
  });
  
  // Remove old deployment scripts
  const oldDeployScripts = [
    'deploy-fresh-build.sh',
    'deploy-now.sh',
    'deploy-quote-fix.sh',
    'deploy-updated.sh'
  ];
  
  oldDeployScripts.forEach(script => {
    removeFile(path.join(rootDir, script), `old deployment script: ${script}`);
  });
}

function cleanScripts() {
  log('\n🔧 Cleaning Scripts...', 'blue');
  
  // Remove redundant scripts
  const redundantScripts = [
    'scripts/clear-cache.js',
    'scripts/force-cache-clear.js',
    'scripts/fix-logger-calls.js',
    'scripts/replace-console-logs.js',
    'scripts/pin-dependencies.js',
    'scripts/performance-budget.js',
    'scripts/design-check.js',
    'scripts/generate-sounds.js',
    'scripts/build-monitor.js',
    'scripts/update-sw-version.js',
    'scripts/web-vitals-monitor.js'
  ];
  
  redundantScripts.forEach(script => {
    removeFile(path.join(rootDir, script), `redundant script: ${script}`);
  });
  
  // Remove web-vitals directory if empty
  const webVitalsDir = path.join(rootDir, 'scripts/web-vitals');
  if (fs.existsSync(webVitalsDir)) {
    const files = fs.readdirSync(webVitalsDir);
    if (files.length === 0) {
      removeDirectory(webVitalsDir, 'empty web-vitals directory');
    }
  }
}

function cleanRootFiles() {
  log('\n🗂️  Cleaning Root Files...', 'blue');
  
  // Remove old zip files
  const zipFiles = fs.readdirSync(rootDir).filter(file => file.endsWith('.zip'));
  zipFiles.forEach(zip => {
    removeFile(path.join(rootDir, zip), `old zip file: ${zip}`);
  });
  
  // Remove test files
  removeFile(path.join(rootDir, 'apps/extension/test.html'), 'test file');
}

function createSimplifiedStructure() {
  log('\n🏗️  Creating Simplified Structure...', 'blue');
  
  // Create simplified scripts directory structure
  const scriptsDir = path.join(rootDir, 'scripts');
  const buildDir = path.join(scriptsDir, 'build');
  const deployDir = path.join(scriptsDir, 'deploy');
  
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
  }
  
  log('✅ Created organized scripts structure', 'green');
}

function updatePackageJson() {
  log('\n📦 Updating Package.json...', 'blue');
  
  const packageJsonPath = path.join(rootDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Simplify scripts
  const simplifiedScripts = {
    "dev": "pnpm --parallel run dev",
    "web": "pnpm --filter @boostlly/web dev",
    "extension": "pnpm --filter @boostlly/extension dev",
    "build": "pnpm --recursive run build",
    "build:web": "pnpm --filter @boostlly/web build",
    "build:ext": "pnpm --filter @boostlly/extension build",
    "test": "pnpm --recursive run test",
    "type-check": "pnpm --recursive run type-check",
    "lint": "pnpm --recursive run lint",
    "clean": "pnpm --recursive run clean",
    "cleanup": "node scripts/project-cleanup.js"
  };
  
  packageJson.scripts = simplifiedScripts;
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  log('✅ Simplified package.json scripts', 'green');
}

function main() {
  log('\n🚀 Starting Boostlly Project Cleanup...', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  try {
    cleanBuildArtifacts();
    cleanDocumentation();
    cleanScripts();
    cleanRootFiles();
    consolidateAssets();
    createSimplifiedStructure();
    updatePackageJson();
    
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('✅ Project cleanup completed successfully!', 'green');
    log('🎉 Your project is now much cleaner and more organized', 'green');
    log('\n📋 Next steps:', 'blue');
    log('  1. Run "pnpm install" to ensure dependencies are up to date', 'yellow');
    log('  2. Run "pnpm build" to test the simplified build process', 'yellow');
    log('  3. Review the cleaned up structure and remove any remaining unused files', 'yellow');
    
  } catch (error) {
    log(`❌ Cleanup failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
