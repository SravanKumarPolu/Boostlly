#!/usr/bin/env node
/**
 * Script to fix logger calls that were incorrectly converted
 * Ensures context parameters are objects
 */

const fs = require("fs");
const path = require("path");

const stats = {
  filesProcessed: 0,
  filesModified: 0,
  callsFixed: 0,
};

function fixLoggerCalls(content) {
  let modified = false;
  let newContent = content;

  // Fix logDebug/logWarning/logError calls where second parameter is not an object
  // Pattern: logDebug("message", someVar) -> logDebug("message", { someVar })

  // Fix logDebug calls
  newContent = newContent.replace(
    /logDebug\(([^,)]+),\s*([^{][^,)]+)\)/g,
    (match, message, param) => {
      const trimmedParam = param.trim();
      // Skip if it's already an object literal or undefined
      if (trimmedParam.startsWith("{") || trimmedParam === "undefined") {
        return match;
      }
      modified = true;
      stats.callsFixed++;
      // Extract variable name (handle cases like 'imageUrl' or complex expressions)
      const varName = trimmedParam.match(/^[\w.]+$/)?.[0] || "value";
      return `logDebug(${message}, { ${varName}: ${trimmedParam} })`;
    },
  );

  // Fix logWarning calls
  newContent = newContent.replace(
    /logWarning\(([^,)]+),\s*([^{][^,)]+)\)/g,
    (match, message, param) => {
      const trimmedParam = param.trim();
      if (trimmedParam.startsWith("{") || trimmedParam === "undefined") {
        return match;
      }
      modified = true;
      stats.callsFixed++;
      return `logWarning(${message}, { error: ${trimmedParam} })`;
    },
  );

  // Fix logError calls where first param isn't Error type
  newContent = newContent.replace(
    /logError\(([^,)]+),\s*([^{][^,)]+)\)/g,
    (match, errorParam, contextParam) => {
      const trimmedContext = contextParam.trim();
      if (trimmedContext.startsWith("{") || trimmedContext === "undefined") {
        return match;
      }
      modified = true;
      stats.callsFixed++;
      return `logError(${errorParam}, { error: ${trimmedContext} })`;
    },
  );

  return { newContent, modified };
}

function processFile(filePath) {
  stats.filesProcessed++;

  try {
    const content = fs.readFileSync(filePath, "utf8");

    if (
      !content.includes("logDebug") &&
      !content.includes("logWarning") &&
      !content.includes("logError")
    ) {
      return;
    }

    const { newContent, modified } = fixLoggerCalls(content);

    if (modified) {
      fs.writeFileSync(filePath, newContent, "utf8");
      console.log(`✓ Fixed: ${filePath}`);
      stats.filesModified++;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (
      fullPath.includes("node_modules") ||
      fullPath.includes("dist") ||
      fullPath.includes("logger.ts")
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      processFile(fullPath);
    }
  }
}

console.log("🔧 Fixing Logger Call Arguments");
console.log("================================\n");

const targetDirs = ["packages/core/src", "packages/features/src"];

for (const dir of targetDirs) {
  const fullPath = path.resolve(__dirname, "..", dir);
  if (fs.existsSync(fullPath)) {
    processDirectory(fullPath);
  }
}

console.log("\n📊 Summary");
console.log("================================");
console.log(`Files processed: ${stats.filesProcessed}`);
console.log(`Files modified: ${stats.filesModified}`);
console.log(`Logger calls fixed: ${stats.callsFixed}`);
console.log("\n✅ Done!");
