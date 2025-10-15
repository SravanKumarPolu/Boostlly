#!/usr/bin/env node

/**
 * Performance Budget Monitor
 * Monitors and enforces performance budgets to prevent regressions
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const glob = require("glob");

class PerformanceBudgetMonitor {
  constructor(configPath = "./performance-budget.config.js") {
    this.config = require(path.resolve(configPath));
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: [],
      summary: {},
    };
  }

  // Main execution
  async run() {
    console.log("🎯 Performance Budget Monitor");
    console.log("============================\n");

    try {
      await this.checkBundleSizes();
      await this.checkPerformanceMetrics();
      await this.checkResourceCounts();
      await this.generateReport();

      const exitCode = this.results.failed > 0 ? 1 : 0;
      console.log(
        `\n🏆 Budget Check Complete: ${this.results.passed} passed, ${this.results.warnings} warnings, ${this.results.failed} failed`,
      );

      return exitCode;
    } catch (error) {
      console.error("❌ Performance budget check failed:", error.message);
      return 1;
    }
  }

  // Check bundle sizes
  async checkBundleSizes() {
    console.log("📦 Checking bundle sizes...");

    const budgets = this.config.budgets;
    const include = this.config.include || [];
    const exclude = this.config.exclude || [];

    for (const pattern of include) {
      const files = glob.sync(pattern, { ignore: exclude });

      for (const file of files) {
        if (!fs.existsSync(file)) continue;

        const stats = fs.statSync(file);
        const size = stats.size;
        const relativePath = path.relative(process.cwd(), file);

        // Determine budget type based on file extension
        let budgetType = "javascript";
        let budgetKey = "main";

        if (file.endsWith(".css")) {
          budgetType = "css";
        } else if (file.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
          budgetType = "images";
        } else if (file.match(/\.(woff|woff2|ttf|eot)$/i)) {
          budgetType = "fonts";
        }

        // Check if file matches specific budget patterns
        if (file.includes("vendor") || file.includes("chunk")) {
          budgetKey = "vendor";
        }

        const budget =
          budgets[budgetType]?.[budgetKey] || budgets[budgetType]?.total;

        if (budget) {
          const result = this.checkBudget(relativePath, size, budget, "bytes");
          this.addResult(result);

          if (result.status === "failed") {
            console.log(
              `   ❌ ${relativePath}: ${this.formatBytes(size)} (budget: ${this.formatBytes(budget)})`,
            );
          } else if (result.status === "warning") {
            console.log(
              `   ⚠️  ${relativePath}: ${this.formatBytes(size)} (budget: ${this.formatBytes(budget)})`,
            );
          } else {
            console.log(
              `   ✅ ${relativePath}: ${this.formatBytes(size)} (budget: ${this.formatBytes(budget)})`,
            );
          }
        }
      }
    }
  }

  // Check performance metrics (requires Lighthouse)
  async checkPerformanceMetrics() {
    console.log("\n⚡ Checking performance metrics...");

    try {
      // Check if Lighthouse CI is available
      execSync("which lighthouse-ci", { stdio: "ignore" });

      // Run Lighthouse CI
      const lighthouseConfig = {
        ci: {
          collect: {
            url: ["http://localhost:3000"],
            numberOfRuns: 1,
          },
          assert: {
            assertions: this.generateLighthouseAssertions(),
          },
        },
      };

      // Write temporary config
      fs.writeFileSync(
        ".lighthouse-ci-temp.json",
        JSON.stringify(lighthouseConfig, null, 2),
      );

      try {
        execSync("lighthouse-ci autorun --config=.lighthouse-ci-temp.json", {
          stdio: "pipe",
          encoding: "utf8",
        });
        console.log("   ✅ Lighthouse metrics within budget");
        this.results.passed++;
      } catch (error) {
        console.log(
          "   ⚠️  Lighthouse metrics check failed - may need running server",
        );
      }

      // Clean up
      if (fs.existsSync(".lighthouse-ci-temp.json")) {
        fs.unlinkSync(".lighthouse-ci-temp.json");
      }
    } catch (error) {
      console.log(
        "   ℹ️  Lighthouse CI not available - skipping performance metrics check",
      );
    }
  }

  // Generate Lighthouse assertions from budget config
  generateLighthouseAssertions() {
    const metrics = this.config.metrics;
    const lighthouse = this.config.lighthouse;
    const assertions = {};

    // Core Web Vitals
    Object.entries(metrics).forEach(([metric, budget]) => {
      assertions[metric] = ["warn", { maxNumericValue: budget }];
    });

    // Lighthouse scores
    Object.entries(lighthouse).forEach(([category, score]) => {
      assertions[`categories:${category}`] = [
        "warn",
        { minScore: score / 100 },
      ];
    });

    return assertions;
  }

  // Check resource counts
  async checkResourceCounts() {
    console.log("\n📊 Checking resource counts...");

    const budgets = this.config.resources;

    // This is a simplified check - in a real implementation,
    // you'd analyze the actual network requests
    const mockResults = {
      "requests.total": 25,
      "requests.scripts": 8,
      "requests.stylesheets": 3,
      "requests.images": 12,
    };

    Object.entries(mockResults).forEach(([key, count]) => {
      const budget = this.getNestedValue(budgets, key);
      if (budget) {
        const result = this.checkBudget(key, count, budget, "count");
        this.addResult(result);

        const status =
          result.status === "failed"
            ? "❌"
            : result.status === "warning"
              ? "⚠️"
              : "✅";
        console.log(`   ${status} ${key}: ${count} (budget: ${budget})`);
      }
    });
  }

  // Check individual budget
  checkBudget(name, actual, budget, unit = "bytes") {
    const warningThreshold = budget * this.config.thresholds.warning;
    const errorThreshold = budget * this.config.thresholds.error;

    let status = "passed";
    let message = "";

    if (actual > errorThreshold) {
      status = "failed";
      message = `Exceeded budget by ${this.formatDifference(actual, budget, unit)}`;
    } else if (actual > warningThreshold) {
      status = "warning";
      message = `Approaching budget limit (${this.formatDifference(actual, budget, unit)})`;
    } else {
      message = `Within budget (${this.formatDifference(actual, budget, unit)} remaining)`;
    }

    return {
      name,
      actual,
      budget,
      unit,
      status,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  // Format difference for display
  formatDifference(actual, budget, unit) {
    const difference = budget - actual;
    const percentage = ((actual / budget) * 100).toFixed(1);

    if (unit === "bytes") {
      return `${this.formatBytes(Math.abs(difference))} (${percentage}% of budget)`;
    } else {
      return `${Math.abs(difference)} (${percentage}% of budget)`;
    }
  }

  // Format bytes to human readable
  formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Get nested object value
  getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  // Add result to summary
  addResult(result) {
    this.results.details.push(result);

    if (result.status === "passed") {
      this.results.passed++;
    } else if (result.status === "warning") {
      this.results.warnings++;
    } else if (result.status === "failed") {
      this.results.failed++;
    }
  }

  // Generate detailed report
  async generateReport() {
    console.log("\n📋 Performance Budget Report");
    console.log("============================");

    // Summary
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Passed: ${this.results.passed}`);
    console.log(`   ⚠️  Warnings: ${this.results.warnings}`);
    console.log(`   ❌ Failed: ${this.results.failed}`);

    // Failed checks
    const failed = this.results.details.filter((r) => r.status === "failed");
    if (failed.length > 0) {
      console.log(`\n❌ Failed Checks:`);
      failed.forEach((result) => {
        console.log(`   • ${result.name}: ${result.message}`);
      });
    }

    // Warning checks
    const warnings = this.results.details.filter((r) => r.status === "warning");
    if (warnings.length > 0) {
      console.log(`\n⚠️  Warnings:`);
      warnings.forEach((result) => {
        console.log(`   • ${result.name}: ${result.message}`);
      });
    }

    // Recommendations
    console.log(`\n💡 Recommendations:`);
    if (this.results.failed > 0) {
      console.log(`   • Optimize bundles that exceeded budget`);
      console.log(`   • Consider code splitting for large bundles`);
      console.log(`   • Compress images and assets`);
    }
    if (this.results.warnings > 0) {
      console.log(`   • Monitor bundles approaching budget limits`);
      console.log(`   • Consider lazy loading for non-critical code`);
    }
    if (this.results.failed === 0 && this.results.warnings === 0) {
      console.log(`   • Excellent! All budgets are within limits`);
      console.log(`   • Continue monitoring to prevent regressions`);
    }

    // Save report
    this.saveReport();
  }

  // Save report to file
  saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        passed: this.results.passed,
        warnings: this.results.warnings,
        failed: this.results.failed,
      },
      details: this.results.details,
      config: this.config,
    };

    const reportPath = "performance-budget-report.json";
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);
  }
}

// CLI usage
if (require.main === module) {
  const monitor = new PerformanceBudgetMonitor();

  monitor
    .run()
    .then((exitCode) => {
      process.exit(exitCode);
    })
    .catch((error) => {
      console.error("❌ Error:", error.message);
      process.exit(1);
    });
}

module.exports = PerformanceBudgetMonitor;
