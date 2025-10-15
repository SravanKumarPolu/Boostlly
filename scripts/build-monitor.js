#!/usr/bin/env node

/**
 * Build Performance Monitor
 * Tracks build times, bundle sizes, and performance metrics
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class BuildMonitor {
  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      buildTime: 0,
      bundleSizes: {},
      fileCounts: {},
      dependencies: {},
      performance: {},
    };
  }

  // Track build start
  startBuild() {
    this.startTime = Date.now();
    console.log("🚀 Starting build performance monitoring...");
  }

  // Track build end
  endBuild() {
    this.metrics.buildTime = Date.now() - this.startTime;
    console.log(`⏱️  Total build time: ${this.metrics.buildTime}ms`);
    return this.metrics.buildTime;
  }

  // Analyze bundle sizes
  analyzeBundleSizes() {
    console.log("📦 Analyzing bundle sizes...");

    const paths = [
      "apps/web/.next/static",
      "apps/extension/dist",
      "packages/core/dist",
      "packages/ui/dist",
      "packages/features/dist",
    ];

    paths.forEach((dirPath) => {
      if (fs.existsSync(dirPath)) {
        const stats = this.getDirectoryStats(dirPath);
        this.metrics.bundleSizes[dirPath] = stats;
        console.log(
          `📁 ${dirPath}: ${stats.totalSize} bytes (${stats.fileCount} files)`,
        );
      }
    });
  }

  // Get directory statistics
  getDirectoryStats(dirPath) {
    let totalSize = 0;
    let fileCount = 0;

    const walkDir = (currentPath) => {
      const items = fs.readdirSync(currentPath);

      items.forEach((item) => {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else {
          totalSize += stat.size;
          fileCount++;
        }
      });
    };

    walkDir(dirPath);

    return {
      totalSize,
      fileCount,
      averageSize: fileCount > 0 ? Math.round(totalSize / fileCount) : 0,
    };
  }

  // Analyze dependencies
  analyzeDependencies() {
    console.log("🔍 Analyzing dependencies...");

    const packageFiles = [
      "package.json",
      "apps/web/package.json",
      "apps/extension/package.json",
      "packages/core/package.json",
      "packages/ui/package.json",
      "packages/features/package.json",
    ];

    packageFiles.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        const pkg = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const deps = {
          dependencies: Object.keys(pkg.dependencies || {}).length,
          devDependencies: Object.keys(pkg.devDependencies || {}).length,
          total:
            Object.keys(pkg.dependencies || {}).length +
            Object.keys(pkg.devDependencies || {}).length,
        };

        this.metrics.dependencies[filePath] = deps;
        console.log(`📄 ${filePath}: ${deps.total} dependencies`);
      }
    });
  }

  // Check for large files
  findLargeFiles() {
    console.log("🔍 Checking for large files...");

    const largeFiles = [];
    const threshold = 1024 * 1024; // 1MB

    const walkDir = (dirPath) => {
      if (!fs.existsSync(dirPath)) return;

      const items = fs.readdirSync(dirPath);

      items.forEach((item) => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (
          stat.isDirectory() &&
          !item.startsWith(".") &&
          item !== "node_modules"
        ) {
          walkDir(fullPath);
        } else if (stat.isFile() && stat.size > threshold) {
          largeFiles.push({
            path: fullPath,
            size: stat.size,
            sizeFormatted: this.formatBytes(stat.size),
          });
        }
      });
    };

    // Check common build directories
    const dirs = ["apps/web/.next", "apps/extension/dist", "packages/*/dist"];
    dirs.forEach((dir) => {
      if (dir.includes("*")) {
        const matches = fs.readdirSync("packages").filter((item) => {
          const fullPath = path.join("packages", item);
          return fs.statSync(fullPath).isDirectory();
        });
        matches.forEach((match) => {
          const distPath = path.join("packages", match, "dist");
          walkDir(distPath);
        });
      } else {
        walkDir(dir);
      }
    });

    if (largeFiles.length > 0) {
      console.log("⚠️  Large files found:");
      largeFiles.forEach((file) => {
        console.log(`   ${file.path}: ${file.sizeFormatted}`);
      });
    } else {
      console.log("✅ No large files found");
    }

    this.metrics.largeFiles = largeFiles;
  }

  // Format bytes to human readable
  formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Generate performance report
  generateReport() {
    console.log("\n📊 Build Performance Report");
    console.log("============================");

    // Build time
    console.log(
      `⏱️  Build Time: ${this.metrics.buildTime}ms (${(this.metrics.buildTime / 1000).toFixed(2)}s)`,
    );

    // Bundle sizes
    console.log("\n📦 Bundle Sizes:");
    Object.entries(this.metrics.bundleSizes).forEach(([path, stats]) => {
      console.log(
        `   ${path}: ${this.formatBytes(stats.totalSize)} (${stats.fileCount} files)`,
      );
    });

    // Dependencies
    console.log("\n🔍 Dependencies:");
    Object.entries(this.metrics.dependencies).forEach(([path, deps]) => {
      console.log(
        `   ${path}: ${deps.total} total (${deps.dependencies} prod, ${deps.devDependencies} dev)`,
      );
    });

    // Performance score
    const score = this.calculatePerformanceScore();
    console.log(`\n🏆 Performance Score: ${score}/100`);

    if (score >= 90) {
      console.log("🌟 EXCELLENT - Optimal build performance!");
    } else if (score >= 80) {
      console.log("✅ GOOD - Minor optimizations possible");
    } else if (score >= 70) {
      console.log("⚠️  FAIR - Several optimizations needed");
    } else {
      console.log("❌ NEEDS WORK - Significant performance issues");
    }

    // Save report
    this.saveReport();
  }

  // Calculate performance score
  calculatePerformanceScore() {
    let score = 100;

    // Build time penalty
    if (this.metrics.buildTime > 60000)
      score -= 20; // > 1 minute
    else if (this.metrics.buildTime > 30000) score -= 10; // > 30 seconds

    // Bundle size penalties
    Object.entries(this.metrics.bundleSizes).forEach(([path, stats]) => {
      if (stats.totalSize > 10 * 1024 * 1024)
        score -= 15; // > 10MB
      else if (stats.totalSize > 5 * 1024 * 1024) score -= 10; // > 5MB
    });

    // Large files penalty
    if (this.metrics.largeFiles && this.metrics.largeFiles.length > 0) {
      score -= this.metrics.largeFiles.length * 5;
    }

    return Math.max(0, score);
  }

  // Save report to file
  saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      performanceScore: this.calculatePerformanceScore(),
    };

    const reportPath = "build-performance-report.json";
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);
  }

  // Run full analysis
  async runAnalysis() {
    this.startBuild();

    try {
      this.analyzeBundleSizes();
      this.analyzeDependencies();
      this.findLargeFiles();

      this.endBuild();
      this.generateReport();
    } catch (error) {
      console.error("❌ Analysis failed:", error.message);
      process.exit(1);
    }
  }
}

// CLI usage
if (require.main === module) {
  const monitor = new BuildMonitor();

  const command = process.argv[2];

  if (command === "analyze") {
    monitor.runAnalysis();
  } else if (command === "start") {
    monitor.startBuild();
  } else if (command === "end") {
    monitor.endBuild();
    monitor.generateReport();
  } else {
    console.log("Usage: node build-monitor.js [analyze|start|end]");
    process.exit(1);
  }
}

module.exports = BuildMonitor;
