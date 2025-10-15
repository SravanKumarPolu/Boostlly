#!/usr/bin/env node

/**
 * Emoji Fix Script for Boostlly
 * 
 * This script ensures emojis are properly included in production builds
 * by adding emoji font support and fixing emoji rendering issues.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const WEB_OUT = path.join(PROJECT_ROOT, 'apps/web/out');
const WEB_PUBLIC = path.join(PROJECT_ROOT, 'apps/web/public');

console.log('🎨 Fixing emoji rendering in production builds...');

// 1. Add emoji font CSS to the web app
function addEmojiFontSupport() {
  const emojiCSS = `
/* Emoji Font Support for Production Builds */
@import url('https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&family=Apple+Color+Emoji&display=swap');

/* Ensure emojis render properly */
.emoji {
  font-family: 'Apple Color Emoji', 'Noto Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
  font-variant-emoji: emoji;
  font-feature-settings: 'liga' 1;
}

/* Fallback for systems without emoji fonts */
.emoji-fallback {
  display: inline-block;
  width: 1.2em;
  height: 1.2em;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

/* Specific emoji fallbacks */
.emoji-trophy { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FFD700"><path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5V7C21 7.55 20.55 8 20 8H19V10C19 12.76 16.76 15 14 15H13V19H16C16.55 19 17 19.45 17 20V21C17 21.55 16.55 22 16 22H8C7.45 22 7 21.55 7 21V20C7 19.45 7.45 19 8 19H11V15H10C7.24 15 5 12.76 5 10V8H4C3.45 8 3 7.55 3 7V5C3 4.45 3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6H5V7H7V6ZM17 6V7H19V6H17ZM7 8V10C7 11.66 8.34 13 10 13H14C15.66 13 17 11.66 17 10V8H7Z"/></svg>'); }
.emoji-chart { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234A90E2"><path d="M5 9.2H7V19H5V9.2ZM10.6 5H12.4V19H10.6V5ZM16.2 13H18V19H16.2V13ZM22 3H2V21H22V3ZM20 19H4V5H20V19Z"/></svg>'); }
.emoji-refresh { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z"/></svg>'); }
.emoji-success { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234CAF50"><path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"/></svg>'); }
`;

  const cssPath = path.join(WEB_OUT, 'emoji-support.css');
  fs.writeFileSync(cssPath, emojiCSS);
  console.log('✅ Added emoji font CSS to production build');
}

// 2. Update HTML files to include emoji support
function updateHTMLFiles() {
  const htmlFiles = [
    path.join(WEB_OUT, 'index.html'),
    path.join(WEB_OUT, '404.html')
  ];

  const emojiLinkTag = '<link rel="stylesheet" href="/emoji-support.css">';

  htmlFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Add emoji CSS link before closing </head>
      if (!content.includes('emoji-support.css')) {
        content = content.replace('</head>', `  ${emojiLinkTag}\n</head>`);
        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated ${path.relative(PROJECT_ROOT, filePath)} with emoji support`);
      }
    }
  });
}

// 3. Add emoji support to extension manifest
function updateExtensionManifest() {
  const manifestPath = path.join(PROJECT_ROOT, 'apps/extension/dist/manifest.json');
  
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Add emoji font to web accessible resources if not present
    if (!manifest.web_accessible_resources) {
      manifest.web_accessible_resources = [];
    }
    
    // Add content security policy for emoji fonts
    if (!manifest.content_security_policy) {
      manifest.content_security_policy = {
        extension_pages: "script-src 'self'; object-src 'self'; font-src 'self' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;"
      };
    }
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✅ Updated extension manifest with emoji support');
  }
}

// 4. Create emoji fallback component
function createEmojiFallbackComponent() {
  const componentCode = `
// Emoji fallback component for better cross-platform support
export const Emoji = ({ emoji, fallback, className = "" }) => {
  const [showFallback, setShowFallback] = useState(false);
  
  useEffect(() => {
    // Test if emoji renders properly
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = '16px Arial';
    const width = ctx.measureText(emoji).width;
    
    // If width is very small, emoji might not be supported
    if (width < 10) {
      setShowFallback(true);
    }
  }, [emoji]);
  
  if (showFallback && fallback) {
    return <span className={\`emoji-fallback emoji-\${fallback} \${className}\`} />;
  }
  
  return <span className={\`emoji \${className}\`}>{emoji}</span>;
};
`;

  const componentPath = path.join(PROJECT_ROOT, 'packages/ui/src/components/emoji.tsx');
  fs.writeFileSync(componentPath, componentCode);
  console.log('✅ Created emoji fallback component');
}

// Run all fixes
try {
  addEmojiFontSupport();
  updateHTMLFiles();
  updateExtensionManifest();
  createEmojiFallbackComponent();
  
  console.log('🎉 All emoji fixes applied successfully!');
  console.log('📝 Emojis should now render properly in production builds');
} catch (error) {
  console.error('❌ Error applying emoji fixes:', error.message);
  process.exit(1);
}
