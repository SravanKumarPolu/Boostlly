import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("Building extension...");
execSync("npm run build", { stdio: "inherit" });

// Copy HTML files to dist root
console.log("Copying HTML files...");
const distSrcPath = path.join(__dirname, "dist", "src");
const distPath = path.join(__dirname, "dist");

if (fs.existsSync(path.join(distSrcPath, "popup", "index.html"))) {
  fs.copyFileSync(
    path.join(distSrcPath, "popup", "index.html"),
    path.join(distPath, "popup.html"),
  );
}

if (fs.existsSync(path.join(distSrcPath, "options", "index.html"))) {
  fs.copyFileSync(
    path.join(distSrcPath, "options", "index.html"),
    path.join(distPath, "options.html"),
  );
}

// Fix HTML file paths to use relative paths
console.log("Fixing HTML file paths...");

const fixHtmlPaths = (htmlFile) => {
  let content = fs.readFileSync(htmlFile, "utf8");
  // Remove the ../../ prefix from paths since we're now in the root directory
  content = content.replace(/src="\.\.\/\.\.\//g, 'src="');
  content = content.replace(/href="\.\.\/\.\.\//g, 'href="');
  // Also fix any absolute paths
  content = content.replace(/src="\//g, 'src="');
  content = content.replace(/href="\//g, 'href="');
  fs.writeFileSync(htmlFile, content);
};

fixHtmlPaths(path.join(distPath, "popup.html"));
fixHtmlPaths(path.join(distPath, "options.html"));

// Clean up the nested src directory
console.log("Cleaning up...");
const srcDir = path.join(distPath, "src");
if (fs.existsSync(srcDir)) {
  fs.rmSync(srcDir, { recursive: true, force: true });
}

console.log("Build completed successfully!");
