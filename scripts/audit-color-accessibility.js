#!/usr/bin/env node

/**
 * Color Accessibility Audit Script
 * Audits the entire project for WCAG 2.2 AA/AAA color contrast compliance
 * 
 * This script:
 * 1. Scans CSS files for color definitions
 * 2. Scans component files for inline colors
 * 3. Checks all foreground/background combinations
 * 4. Generates a comprehensive report
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// WCAG 2.2 Contrast Standards
const WCAG_STANDARDS = {
  AA: {
    normal: 4.5,
    large: 3.0,
  },
  AAA: {
    normal: 7.0,
    large: 4.5,
  },
};

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h, s, l) {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Parse CSS color value (hex, rgb, rgba, hsl, hsla, or named color)
 */
function parseColor(colorStr) {
  if (!colorStr) return null;

  // Remove whitespace
  colorStr = colorStr.trim();

  // Hex color
  if (colorStr.startsWith('#')) {
    return hexToRgb(colorStr);
  }

  // RGB/RGBA
  const rgbMatch = colorStr.match(/rgba?\(([^)]+)\)/);
  if (rgbMatch) {
    const values = rgbMatch[1].split(',').map(v => parseFloat(v.trim()));
    return { r: values[0], g: values[1], b: values[2] };
  }

  // HSL/HSLA - parse from CSS variable format like "245 58% 48%"
  const hslMatch = colorStr.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/);
  if (hslMatch) {
    const h = parseFloat(hslMatch[1]);
    const s = parseFloat(hslMatch[2]);
    const l = parseFloat(hslMatch[3]);
    return hslToRgb(h, s, l);
  }

  // Named colors (basic set)
  const namedColors = {
    black: { r: 0, g: 0, b: 0 },
    white: { r: 255, g: 255, b: 255 },
    red: { r: 255, g: 0, b: 0 },
    green: { r: 0, g: 128, b: 0 },
    blue: { r: 0, g: 0, b: 255 },
    yellow: { r: 255, g: 255, b: 0 },
    cyan: { r: 0, g: 255, b: 255 },
    magenta: { r: 255, g: 0, b: 255 },
    gray: { r: 128, g: 128, b: 128 },
    grey: { r: 128, g: 128, b: 128 },
  };

  if (namedColors[colorStr.toLowerCase()]) {
    return namedColors[colorStr.toLowerCase()];
  }

  return null;
}

/**
 * Calculate relative luminance (WCAG formula)
 */
function getLuminance(rgb) {
  if (!rgb) return 0;

  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  if (darkest === 0) return 21.0;

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if contrast meets WCAG standard
 */
function meetsWCAG(contrast, level, isLargeText = false) {
  const standard = WCAG_STANDARDS[level];
  const threshold = isLargeText ? standard.large : standard.normal;
  return contrast >= threshold;
}

/**
 * Extract colors from CSS file
 */
function extractColorsFromCSS(content, filePath) {
  const colors = [];
  const lines = content.split('\n');

  // Extract CSS variables
  const cssVarRegex = /--([\w-]+):\s*([^;]+);/g;
  let match;
  while ((match = cssVarRegex.exec(content)) !== null) {
    const [, varName, value] = match;
    const rgb = parseColor(value);
    if (rgb) {
      colors.push({
        name: `--${varName}`,
        value: value.trim(),
        rgb,
        type: 'css-variable',
        file: filePath,
        line: content.substring(0, match.index).split('\n').length,
      });
    }
  }

  // Extract color properties
  const colorPropertyRegex = /(?:color|background(?:-color)?|border(?:-color)?):\s*([^;]+);/gi;
  while ((match = colorPropertyRegex.exec(content)) !== null) {
    const value = match[1].trim();
    const rgb = parseColor(value);
    if (rgb) {
      colors.push({
        name: 'inline-color',
        value,
        rgb,
        type: 'property',
        file: filePath,
        line: content.substring(0, match.index).split('\n').length,
      });
    }
  }

  return colors;
}

/**
 * Extract colors from component files (TSX/JSX)
 */
function extractColorsFromComponent(content, filePath) {
  const colors = [];

  // Extract hex colors
  const hexRegex = /#([a-f\d]{3}|[a-f\d]{6})\b/gi;
  let match;
  while ((match = hexRegex.exec(content)) !== null) {
    const hex = match[0];
    const rgb = hexToRgb(hex);
    if (rgb) {
      colors.push({
        name: 'hex-color',
        value: hex,
        rgb,
        type: 'inline',
        file: filePath,
        line: content.substring(0, match.index).split('\n').length,
      });
    }
  }

  // Extract rgb/rgba colors
  const rgbRegex = /rgba?\([^)]+\)/gi;
  while ((match = rgbRegex.exec(content)) !== null) {
    const rgb = parseColor(match[0]);
    if (rgb) {
      colors.push({
        name: 'rgb-color',
        value: match[0],
        rgb,
        type: 'inline',
        file: filePath,
        line: content.substring(0, match.index).split('\n').length,
      });
    }
  }

  return colors;
}

/**
 * Find all color pairs (foreground/background) from CSS variables
 */
function findColorPairs(cssColors) {
  const pairs = [];
  const foregroundVars = cssColors.filter(c => 
    c.name.includes('foreground') || 
    c.name.includes('text') ||
    c.name.includes('color')
  );
  const backgroundVars = cssColors.filter(c => 
    c.name.includes('background') || 
    c.name.includes('bg') ||
    (!c.name.includes('foreground') && !c.name.includes('text') && !c.name.includes('color'))
  );

  // Pair foreground with background
  foregroundVars.forEach(fg => {
    backgroundVars.forEach(bg => {
      pairs.push({
        foreground: fg,
        background: bg,
      });
    });
  });

  // Also check common pairs from globals.css
  const commonPairs = [
    { fg: '--foreground', bg: '--background' },
    { fg: '--primary-foreground', bg: '--primary' },
    { fg: '--secondary-foreground', bg: '--secondary' },
    { fg: '--card-foreground', bg: '--card' },
    { fg: '--muted-foreground', bg: '--muted' },
    { fg: '--text-primary', bg: '--background' },
    { fg: '--text-secondary', bg: '--background' },
  ];

  commonPairs.forEach(pair => {
    const fg = cssColors.find(c => c.name === pair.fg);
    const bg = cssColors.find(c => c.name === pair.bg);
    if (fg && bg) {
      pairs.push({ foreground: fg, background: bg });
    }
  });

  return pairs;
}

/**
 * Main audit function
 */
async function auditColors() {
  console.log('🎨 Starting Color Accessibility Audit...\n');

  const issues = [];
  const passed = [];
  let totalChecks = 0;

  // Find all CSS files
  const cssFiles = await glob('**/*.css', {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
  });

  // Find all component files
  const componentFiles = await glob('**/*.{tsx,jsx}', {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.test.*', '**/*.spec.*'],
  });

  console.log(`Found ${cssFiles.length} CSS files and ${componentFiles.length} component files\n`);

  // Extract colors from CSS files
  const allCssColors = [];
  for (const file of cssFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const colors = extractColorsFromCSS(content, file);
      allCssColors.push(...colors);
    } catch (error) {
      console.warn(`Warning: Could not read ${file}: ${error.message}`);
    }
  }

  // Extract colors from component files
  const allComponentColors = [];
  for (const file of componentFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const colors = extractColorsFromComponent(content, file);
      allComponentColors.push(...colors);
    } catch (error) {
      console.warn(`Warning: Could not read ${file}: ${error.message}`);
    }
  }

  console.log(`Extracted ${allCssColors.length} colors from CSS and ${allComponentColors.length} from components\n`);

  // Check CSS variable pairs
  const colorPairs = findColorPairs(allCssColors);
  console.log(`Checking ${colorPairs.length} color pairs...\n`);

  for (const pair of colorPairs) {
    totalChecks++;
    const contrast = getContrastRatio(pair.foreground.rgb, pair.background.rgb);
    const meetsAA = meetsWCAG(contrast, 'AA', false);
    const meetsAALarge = meetsWCAG(contrast, 'AA', true);
    const meetsAAA = meetsWCAG(contrast, 'AAA', false);
    const meetsAAALarge = meetsWCAG(contrast, 'AAA', true);

    const check = {
      foreground: pair.foreground.name,
      background: pair.background.name,
      contrast: contrast.toFixed(2),
      meetsAA,
      meetsAALarge,
      meetsAAA,
      meetsAAALarge,
      file: pair.foreground.file,
      line: pair.foreground.line,
    };

    if (!meetsAA) {
      issues.push({
        ...check,
        severity: 'error',
        message: `Contrast ratio ${contrast.toFixed(2)}:1 does not meet WCAG 2.2 AA (requires 4.5:1 for normal text)`,
      });
    } else if (!meetsAAA) {
      issues.push({
        ...check,
        severity: 'warning',
        message: `Contrast ratio ${contrast.toFixed(2)}:1 meets AA but not AAA (requires 7.0:1 for normal text)`,
      });
      passed.push(check);
    } else {
      passed.push(check);
    }
  }

  // Generate report
  console.log('\n' + '='.repeat(80));
  console.log('COLOR ACCESSIBILITY AUDIT REPORT');
  console.log('='.repeat(80) + '\n');

  console.log(`Total Checks: ${totalChecks}`);
  console.log(`✅ Passed (AA): ${passed.length}`);
  console.log(`⚠️  Warnings (AA but not AAA): ${issues.filter(i => i.severity === 'warning').length}`);
  console.log(`❌ Failed (Below AA): ${issues.filter(i => i.severity === 'error').length}\n`);

  if (issues.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('ISSUES FOUND');
    console.log('='.repeat(80) + '\n');

    const errors = issues.filter(i => i.severity === 'error');
    const warnings = issues.filter(i => i.severity === 'warning');

    if (errors.length > 0) {
      console.log('❌ CRITICAL ISSUES (Below WCAG 2.2 AA):\n');
      errors.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.message}`);
        console.log(`   Foreground: ${issue.foreground}`);
        console.log(`   Background: ${issue.background}`);
        console.log(`   Contrast: ${issue.contrast}:1`);
        console.log(`   File: ${issue.file}:${issue.line}`);
        console.log('');
      });
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS (AA but not AAA):\n');
      warnings.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.message}`);
        console.log(`   Foreground: ${issue.foreground}`);
        console.log(`   Background: ${issue.background}`);
        console.log(`   Contrast: ${issue.contrast}:1`);
        console.log(`   File: ${issue.file}:${issue.line}`);
        console.log('');
      });
    }
  } else {
    console.log('✅ All color combinations meet WCAG 2.2 AA standards!\n');
  }

  // Save report to file
  const report = {
    timestamp: new Date().toISOString(),
    totalChecks,
    passed: passed.length,
    warnings: issues.filter(i => i.severity === 'warning').length,
    errors: issues.filter(i => i.severity === 'error').length,
    issues,
    passedChecks: passed,
  };

  const reportPath = path.join(process.cwd(), 'COLOR_ACCESSIBILITY_AUDIT_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Full report saved to: ${reportPath}`);

  // Return exit code
  return issues.filter(i => i.severity === 'error').length > 0 ? 1 : 0;
}

// Run audit
auditColors()
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('Error running audit:', error);
    process.exit(1);
  });

export { auditColors };

