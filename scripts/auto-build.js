#!/usr/bin/env node

/**
 * Auto Build Script for Boostlly
 * 
 * This script automatically rebuilds the web app (out folder) and extension (dist folder)
 * whenever source files change. It ensures that all updates are immediately reflected
 * in the production builds.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const WEB_SRC = path.join(PROJECT_ROOT, 'apps/web/src');
const EXT_SRC = path.join(PROJECT_ROOT, 'apps/extension/src');
const PACKAGES_SRC = path.join(PROJECT_ROOT, 'packages');

console.log('🚀 Boostlly Auto-Build Script Starting...');
console.log(`📁 Watching: ${WEB_SRC}`);
console.log(`📁 Watching: ${EXT_SRC}`);
console.log(`📁 Watching: ${PACKAGES_SRC}`);

let buildInProgress = false;
let buildTimeout = null;

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    build: '🔨'
  };
  console.log(`${emoji[type]} [${timestamp}] ${message}`);
}

function runBuild() {
  if (buildInProgress) {
    log('Build already in progress, skipping...', 'warning');
    return;
  }

  buildInProgress = true;
  log('Starting build process...', 'build');

  try {
    // Clean first
    log('Cleaning old builds...', 'build');
    execSync('pnpm clean', { cwd: PROJECT_ROOT, stdio: 'inherit' });

    // Build everything
    log('Building all packages and apps...', 'build');
    execSync('pnpm build', { cwd: PROJECT_ROOT, stdio: 'inherit' });

    log('✅ Build completed successfully!', 'success');
    log('📦 Web app: apps/web/out/', 'success');
    log('📦 Extension: apps/extension/dist/', 'success');
    
  } catch (error) {
    log(`Build failed: ${error.message}`, 'error');
  } finally {
    buildInProgress = false;
  }
}

function debounceBuild() {
  if (buildTimeout) {
    clearTimeout(buildTimeout);
  }
  
  buildTimeout = setTimeout(() => {
    runBuild();
  }, 1000); // Wait 1 second after last change
}

// Watch for file changes
const watcher = chokidar.watch([
  `${WEB_SRC}/**/*.{ts,tsx,js,jsx,css}`,
  `${EXT_SRC}/**/*.{ts,tsx,js,jsx,css}`,
  `${PACKAGES_SRC}/**/*.{ts,tsx,js,jsx,css}`,
], {
  ignored: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.next/**',
    '**/out/**',
    '**/*.d.ts'
  ],
  persistent: true,
  ignoreInitial: true
});

watcher
  .on('add', (filePath) => {
    log(`File added: ${path.relative(PROJECT_ROOT, filePath)}`);
    debounceBuild();
  })
  .on('change', (filePath) => {
    log(`File changed: ${path.relative(PROJECT_ROOT, filePath)}`);
    debounceBuild();
  })
  .on('unlink', (filePath) => {
    log(`File removed: ${path.relative(PROJECT_ROOT, filePath)}`);
    debounceBuild();
  })
  .on('error', (error) => {
    log(`Watcher error: ${error}`, 'error');
  });

// Initial build
log('Running initial build...', 'build');
runBuild();

// Graceful shutdown
process.on('SIGINT', () => {
  log('Shutting down auto-build...', 'warning');
  watcher.close();
  if (buildTimeout) {
    clearTimeout(buildTimeout);
  }
  process.exit(0);
});

log('Auto-build script is running. Press Ctrl+C to stop.', 'info');
