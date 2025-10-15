const { spawnSync } = require("node:child_process");
const pathToRg = require("ripgrep-bin");

const isStrict = process.argv.includes("--strict");

const args = [
  isStrict ? "-q" : "-n",
  "--glob",
  "!**/node_modules/**",
  "--glob",
  "!**/dist/**",
  "(text-gray-9[1-9]|bg-gray-9[1-9]|border-gray-9[1-9])",
  "packages",
  "apps",
];

const result = spawnSync(pathToRg, args, {
  stdio: isStrict ? "ignore" : "inherit",
  shell: false,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

if (isStrict) {
  // ripgrep -q exits 0 if it FOUND matches. We want to FAIL when matches exist.
  if (result.status === 0) {
    console.error("Design check failed: legacy colors detected.");
    process.exit(1);
  }
  // ripgrep -q exits 1 when NO matches were found
  process.exit(0);
} else {
  process.exit(0);
}
