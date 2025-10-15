#!/usr/bin/env node
/**
 * Script to replace console.log/error/warn statements with logger utility
 * Usage: node scripts/replace-console-logs.js
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const config = {
  dryRun: false, // Set to true to see changes without writing
  targetDirs: ["packages/core/src", "packages/features/src"],
  excludePatterns: [
    "/node_modules/",
    "/dist/",
    "/build/",
    "/.next/",
    "/test/",
    "/__tests__/",
    ".test.",
    ".spec.",
    "logger.ts", // Don't modify the logger itself
  ],
};

// Statistics
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  console: {
    log: 0,
    error: 0,
    warn: 0,
    info: 0,
  },
};

/**
 * Check if file should be excluded
 */
function shouldExclude(filePath) {
  return config.excludePatterns.some((pattern) => filePath.includes(pattern));
}

/**
 * Check if file needs logger import
 */
function needsLoggerImport(content) {
  return (
    !content.includes('from "@boostlly/core"') ||
    !content.includes("logger") ||
    !content.includes("logError") ||
    !content.includes("logDebug")
  );
}

/**
 * Add logger import to file
 */
function addLoggerImport(content, filePath) {
  const ext = path.extname(filePath);

  if (ext === ".ts" || ext === ".tsx") {
    // Check if there's already an import from @boostlly/core
    if (content.includes('from "@boostlly/core"')) {
      // Add logger to existing import
      content = content.replace(
        /import\s*{([^}]+)}\s*from\s*["']@boostlly\/core["']/,
        (match, imports) => {
          const importList = imports.split(",").map((i) => i.trim());
          if (!importList.includes("logError")) {
            importList.push("logError");
          }
          if (!importList.includes("logDebug")) {
            importList.push("logDebug");
          }
          if (!importList.includes("logWarning")) {
            importList.push("logWarning");
          }
          return `import { ${importList.join(", ")} } from "@boostlly/core"`;
        },
      );
    } else {
      // Add new import at the top
      const imports =
        'import { logError, logDebug, logWarning } from "@boostlly/core";\n';
      // Find the first import or the start of the file
      const firstImportMatch = content.match(/^import\s/m);
      if (firstImportMatch) {
        content = content.replace(/^import\s/m, imports + "import ");
      } else {
        content = imports + content;
      }
    }
  }

  return content;
}

/**
 * Replace console statements in content
 */
function replaceConsoleLogs(content) {
  let modified = false;
  let newContent = content;

  // Replace console.log with logDebug
  const logMatches = newContent.match(/console\.log\([^)]*\)/g);
  if (logMatches) {
    stats.console.log += logMatches.length;
    newContent = newContent.replace(
      /console\.log\(([^)]+)\)/g,
      (match, args) => {
        modified = true;
        // Clean up the arguments
        const cleanArgs = args.trim();
        // If it's a simple string, wrap in quotes if needed
        if (
          cleanArgs.startsWith('"') ||
          cleanArgs.startsWith("'") ||
          cleanArgs.startsWith("`")
        ) {
          return `logDebug(${cleanArgs})`;
        }
        return `logDebug(${cleanArgs})`;
      },
    );
  }

  // Replace console.error with logError
  const errorMatches = newContent.match(/console\.error\([^)]*\)/g);
  if (errorMatches) {
    stats.console.error += errorMatches.length;
    newContent = newContent.replace(
      /console\.error\(([^)]+)\)/g,
      (match, args) => {
        modified = true;
        const cleanArgs = args.trim();
        return `logError(${cleanArgs})`;
      },
    );
  }

  // Replace console.warn with logWarning
  const warnMatches = newContent.match(/console\.warn\([^)]*\)/g);
  if (warnMatches) {
    stats.console.warn += warnMatches.length;
    newContent = newContent.replace(
      /console\.warn\(([^)]+)\)/g,
      (match, args) => {
        modified = true;
        const cleanArgs = args.trim();
        return `logWarning(${cleanArgs})`;
      },
    );
  }

  // Replace console.info with logDebug (since info logs are rarely needed)
  const infoMatches = newContent.match(/console\.info\([^)]*\)/g);
  if (infoMatches) {
    stats.console.info += infoMatches.length;
    newContent = newContent.replace(
      /console\.info\(([^)]+)\)/g,
      (match, args) => {
        modified = true;
        const cleanArgs = args.trim();
        return `logDebug(${cleanArgs})`;
      },
    );
  }

  return { newContent, modified };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  stats.filesProcessed++;

  try {
    const content = fs.readFileSync(filePath, "utf8");

    // Skip if no console statements
    if (!content.includes("console.")) {
      return;
    }

    // Replace console statements
    const { newContent, modified } = replaceConsoleLogs(content);

    if (!modified) {
      return;
    }

    // Add logger import if needed
    let finalContent = newContent;
    if (needsLoggerImport(newContent)) {
      finalContent = addLoggerImport(newContent, filePath);
    }

    if (config.dryRun) {
      console.log(`Would modify: ${filePath}`);
    } else {
      fs.writeFileSync(filePath, finalContent, "utf8");
      console.log(`✓ Modified: ${filePath}`);
      stats.filesModified++;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

/**
 * Recursively process directory
 */
function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (shouldExclude(fullPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      processFile(fullPath);
    }
  }
}

/**
 * Main function
 */
function main() {
  console.log("🔍 Console Log Replacement Script");
  console.log("================================\n");

  if (config.dryRun) {
    console.log("⚠️  DRY RUN MODE - No files will be modified\n");
  }

  const startTime = Date.now();

  // Process each target directory
  for (const dir of config.targetDirs) {
    const fullPath = path.resolve(__dirname, "..", dir);
    console.log(`\nProcessing: ${dir}`);
    console.log("-".repeat(50));

    if (fs.existsSync(fullPath)) {
      processDirectory(fullPath);
    } else {
      console.warn(`Directory not found: ${fullPath}`);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log("\n\n📊 Summary");
  console.log("================================");
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files modified: ${stats.filesModified}`);
  console.log(`\nReplacements:`);
  console.log(`  console.log   → logDebug:   ${stats.console.log}`);
  console.log(`  console.error → logError:   ${stats.console.error}`);
  console.log(`  console.warn  → logWarning: ${stats.console.warn}`);
  console.log(`  console.info  → logDebug:   ${stats.console.info}`);
  console.log(
    `\nTotal console statements replaced: ${
      stats.console.log +
      stats.console.error +
      stats.console.warn +
      stats.console.info
    }`,
  );
  console.log(`\nTime taken: ${duration}s`);

  console.log("\n✅ Done!");
  console.log("\nNext steps:");
  console.log("1. Review the changes: git diff");
  console.log("2. Run type-check: pnpm type-check");
  console.log("3. Test the application");
  console.log("4. Commit the changes");
}

// Run the script
main();
