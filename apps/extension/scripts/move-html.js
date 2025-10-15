import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, "../dist");

// Move HTML files from subdirectories to root
const htmlFiles = [
  { from: "src/popup/index.html", to: "popup.html" },
  { from: "src/options/index.html", to: "options.html" },
  { from: "src/newtab/index.html", to: "index.html" },
];

htmlFiles.forEach(({ from, to }) => {
  const fromPath = path.join(distDir, from);
  const toPath = path.join(distDir, to);

  if (fs.existsSync(fromPath)) {
    // Read the HTML content
    let content = fs.readFileSync(fromPath, "utf8");

    // Update script src paths to point to the correct JS files
    if (to === "popup.html") {
      content = content.replace(
        /src="\.\.\/\.\.\/popup\.js"/g,
        'src="./popup.js"',
      );
      content = content.replace(
        /href="\.\.\/\.\.\/styles\.js"/g,
        'href="./styles.js"',
      );
      content = content.replace(
        /href="\.\.\/\.\.\/styles\.css"/g,
        'href="./styles.css"',
      );
      // Fix module preload paths
      content = content.replace(
        /href="\.\.\/\.\.\/vendor\.js"/g,
        'href="./vendor.js"',
      );
      content = content.replace(/href="\.\.\/\.\.\/ui\.js"/g, 'href="./ui.js"');
      content = content.replace(
        /href="\.\.\/\.\.\/core\.js"/g,
        'href="./core.js"',
      );
      content = content.replace(
        /href="\.\.\/\.\.\/features\.js"/g,
        'href="./features.js"',
      );
      content = content.replace(
        /href="\.\.\/\.\.\/features\.css"/g,
        'href="./features.css"',
      );
    } else if (to === "options.html") {
      content = content.replace(
        /src="\.\.\/\.\.\/options\.js"/g,
        'src="./options.js"',
      );
      content = content.replace(
        /href="\.\.\/\.\.\/styles\.js"/g,
        'href="./styles.js"',
      );
      content = content.replace(
        /href="\.\.\/\.\.\/styles\.css"/g,
        'href="./styles.css"',
      );
      // Fix module preload paths
      content = content.replace(
        /href="\.\.\/\.\.\/vendor\.js"/g,
        'href="./vendor.js"',
      );
      content = content.replace(/href="\.\.\/\.\.\/ui\.js"/g, 'href="./ui.js"');
      content = content.replace(
        /href="\.\.\/\.\.\/core\.js"/g,
        'href="./core.js"',
      );
      content = content.replace(
        /href="\.\.\/\.\.\/features\.js"/g,
        'href="./features.js"',
      );
      content = content.replace(
        /href="\.\.\/\.\.\/features\.css"/g,
        'href="./features.css"',
      );
    } else if (to === "index.html") {
      // Fix paths for new tab page
      content = content.replace(
        /src="\.\.\/\.\.\/index\.js"/g,
        'src="./index.js"',
      );
      content = content.replace(
        /href="\.\.\/\.\.\/styles\.js"/g,
        'href="./styles.js"',
      );
      content = content.replace(
        /href="\.\.\/\.\.\/styles\.css"/g,
        'href="./styles.css"',
      );
      // Fix module preload paths
      content = content.replace(
        /href="\.\.\/\.\.\/vendor\.js"/g,
        'href="./vendor.js"',
      );
      content = content.replace(/href="\.\.\/\.\.\/ui\.js"/g, 'href="./ui.js"');
      content = content.replace(
        /href="\.\.\/\.\.\/core\.js"/g,
        'href="./core.js"',
      );
      content = content.replace(
        /href="\.\.\/\.\.\/features\.js"/g,
        'href="./features.js"',
      );
      content = content.replace(
        /href="\.\.\/\.\.\/features\.css"/g,
        'href="./features.css"',
      );
    }

    // Write to the new location
    fs.writeFileSync(toPath, content);
    console.log(`Moved ${from} to ${to}`);
  } else {
    console.warn(`File not found: ${fromPath}`);
  }
});

// Clean up the src directory
const srcDir = path.join(distDir, "src");
if (fs.existsSync(srcDir)) {
  fs.rmSync(srcDir, { recursive: true, force: true });
  console.log("Cleaned up src directory");
}
