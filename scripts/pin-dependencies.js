#!/usr/bin/env node

/**
 * Dependency Version Pinning Script
 * Pins all dependencies to exact versions for reproducible builds
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Get latest versions for major dependencies
function getLatestVersions() {
  const packages = [
    "@playwright/test",
    "@types/node",
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
    "eslint-plugin-react-hooks",
    "eslint-plugin-react-refresh",
    "husky",
    "prettier",
    "sharp",
    "turbo",
    "typescript",
    "class-variance-authority",
    "clsx",
    "lucide-react",
    "next",
    "react",
    "react-dom",
    "tailwind-merge",
    "@next/bundle-analyzer",
    "@types/react",
    "@types/react-dom",
    "autoprefixer",
    "eslint",
    "eslint-config-next",
    "postcss",
    "tailwindcss",
    "tailwindcss-animate",
    "@types/chrome",
    "@vitejs/plugin-react",
    "vite",
    "vite-plugin-web-extension",
    "fuse.js",
    "html2canvas",
    "zustand",
    "date-fns",
    "fast-average-color",
    "howler",
    "@types/howler",
    "@vitest/coverage-v8",
    "jsdom",
    "vitest",
    "@testing-library/react",
    "@testing-library/jest-dom",
  ];

  console.log("🔍 Fetching latest versions...");
  const versions = {};

  for (const pkg of packages) {
    try {
      const result = execSync(`npm view ${pkg} version`, { encoding: "utf8" });
      versions[pkg] = result.trim();
      console.log(`✅ ${pkg}: ${versions[pkg]}`);
    } catch (error) {
      console.warn(`⚠️  Could not fetch version for ${pkg}`);
    }
  }

  return versions;
}

// Update package.json with exact versions
function updatePackageJson(filePath, versions) {
  if (!fs.existsSync(filePath)) return;

  const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let updated = false;

  // Update dependencies
  if (content.dependencies) {
    for (const [pkg, version] of Object.entries(content.dependencies)) {
      if (versions[pkg] && version.startsWith("^")) {
        content.dependencies[pkg] = versions[pkg];
        updated = true;
        console.log(`📌 Pinned ${pkg}: ${version} → ${versions[pkg]}`);
      }
    }
  }

  // Update devDependencies
  if (content.devDependencies) {
    for (const [pkg, version] of Object.entries(content.devDependencies)) {
      if (versions[pkg] && version.startsWith("^")) {
        content.devDependencies[pkg] = versions[pkg];
        updated = true;
        console.log(`📌 Pinned ${pkg}: ${version} → ${versions[pkg]}`);
      }
    }
  }

  if (updated) {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + "\n");
    console.log(`✅ Updated ${filePath}`);
  }
}

// Main execution
async function main() {
  console.log("🚀 Starting dependency version pinning...\n");

  const versions = getLatestVersions();

  const packageFiles = [
    "package.json",
    "apps/web/package.json",
    "apps/extension/package.json",
    "packages/core/package.json",
    "packages/features/package.json",
    "packages/ui/package.json",
    "packages/platform/package.json",
    "packages/platform-web/package.json",
    "packages/platform-extension/package.json",
  ];

  for (const file of packageFiles) {
    updatePackageJson(file, versions);
  }

  console.log("\n🎉 Dependency pinning complete!");
  console.log("\n📋 Next steps:");
  console.log("1. Run: pnpm install");
  console.log("2. Run: pnpm build");
  console.log("3. Test your application");
  console.log("4. Commit the changes");
}

main().catch(console.error);
