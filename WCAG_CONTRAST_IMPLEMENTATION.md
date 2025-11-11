# WCAG 2.1 AA/AAA Color Contrast Implementation

## Overview

This document describes the comprehensive WCAG 2.1 AA/AAA color contrast implementation for the Boostlly app. The system ensures that all text remains legible regardless of the daily background image, meeting accessibility standards for users with visual impairments.

## Features

### 1. Enhanced Contrast Calculation
- **WCAG 2.1 Compliant**: Implements proper relative luminance calculation per WCAG 2.1 guidelines
- **Contrast Ratios**:
  - Normal text: 4.5:1 (WCAG AA) or 7:1 (WCAG AAA)
  - Large text (18pt+ or 14pt+ bold): 3:1 (WCAG AA) or 4.5:1 (WCAG AAA)
  - UI components: 3:1 minimum (WCAG AA)

### 2. Dynamic Color Adjustment
- **Automatic Adjustment**: Text colors automatically adjust to meet contrast requirements
- **Iterative Algorithm**: Uses iterative adjustment to guarantee compliance
- **Smart Fallbacks**: Falls back to optimal colors (pure white/black) when needed

### 3. Text Size Detection
- **Large Text Detection**: Automatically detects if text is "large" (18pt+ or 14pt+ bold)
- **Adaptive Requirements**: Applies appropriate contrast ratios based on text size
- **Font Weight Awareness**: Considers font weight when determining text size category

### 4. High Contrast Mode Support
- **User Preferences**: Respects `prefers-contrast: high` media query
- **Maximum Contrast**: Forces maximum contrast (WCAG AAA) in high contrast mode
- **CSS Variables**: Provides high contrast color variables for all UI elements

### 5. Background Image Adaptation
- **Daily Backgrounds**: Adapts to daily changing background images
- **Color Extraction**: Extracts dominant colors from images using FastAverageColor
- **Contrast Verification**: Verifies contrast against extracted colors
- **Real-time Updates**: Updates colors when background changes

## Implementation Details

### Core Functions

#### `getContrastRatio(color1, color2)`
Calculates the WCAG 2.1 contrast ratio between two colors.
- Returns: Contrast ratio (1.0 to 21.0)
- Uses: Relative luminance calculation per WCAG 2.1

#### `ensureContrast(fg, bg, minContrast, preferAdjustFg)`
Ensures text meets minimum contrast requirements.
- Parameters:
  - `fg`: Foreground color (text)
  - `bg`: Background color
  - `minContrast`: Minimum contrast ratio (default: 4.5 for WCAG AA)
  - `preferAdjustFg`: Whether to adjust foreground (default: true)
- Returns: `{ fg, bg, contrast }` with adjusted colors

#### `meetsWCAGAA(contrast, isLargeText)`
Checks if contrast meets WCAG 2.1 AA standard.
- Parameters:
  - `contrast`: Contrast ratio to check
  - `isLargeText`: Whether text is large (default: false)
- Returns: `true` if meets WCAG AA

#### `meetsWCAGAAA(contrast, isLargeText)`
Checks if contrast meets WCAG 2.1 AAA standard.
- Parameters:
  - `contrast`: Contrast ratio to check
  - `isLargeText`: Whether text is large (default: false)
- Returns: `true` if meets WCAG AAA

#### `isLargeText(fontSize, isBold)`
Determines if text should be considered "large" for WCAG purposes.
- Parameters:
  - `fontSize`: Font size in pixels
  - `isBold`: Whether text is bold (default: false)
- Returns: `true` if text is large (18pt+ or 14pt+ bold)

#### `getRequiredContrast(fontSize, isBold, level)`
Gets the minimum contrast ratio required for text.
- Parameters:
  - `fontSize`: Font size in pixels
  - `isBold`: Whether text is bold (default: false)
  - `level`: WCAG level ('AA' or 'AAA', default: 'AA')
- Returns: Minimum contrast ratio required

### CSS Variables

The system sets the following CSS variables for use in components:

#### Contrast Ratios
- `--contrast-ratio`: Base text contrast ratio
- `--primary-contrast`: Primary button contrast ratio
- `--card-contrast`: Card text contrast ratio
- `--primary-on-bg-contrast`: Primary color on background contrast
- `--focus-ring-contrast`: Focus ring contrast ratio
- `--high-contrast-ratio`: High contrast mode contrast ratio

#### Compliance Indicators
- `--contrast-aa`: Whether base contrast meets WCAG AA (normal text)
- `--contrast-aaa`: Whether base contrast meets WCAG AAA (normal text)
- `--contrast-aa-large`: Whether base contrast meets WCAG AA (large text)
- `--contrast-aaa-large`: Whether base contrast meets WCAG AAA (large text)
- `--primary-contrast-aa`: Whether primary contrast meets WCAG AA
- `--card-contrast-aa`: Whether card contrast meets WCAG AA
- `--high-contrast-aaa`: Whether high contrast mode meets WCAG AAA

#### High Contrast Colors
- `--high-contrast-fg`: High contrast foreground color
- `--high-contrast-bg`: High contrast background color

## Usage Examples

### Basic Usage

```typescript
import { 
  ensureContrast, 
  getContrastRatio, 
  meetsWCAGAA,
  isLargeText 
} from '@boostlly/core';

// Check contrast
const contrast = getContrastRatio('#000000', '#ffffff');
const meetsAA = meetsWCAGAA(contrast, false);

// Ensure contrast
const { fg, bg, contrast } = ensureContrast('#333333', '#cccccc');

// Check if text is large
const isLarge = isLargeText(24, false); // true for 24px normal text
const isLargeBold = isLargeText(18, true); // true for 18px bold text
```

### In Components

```typescript
import { 
  getContrastRatio, 
  ensureContrast,
  ContrastLevel 
} from '@boostlly/core';

function MyComponent({ textColor, backgroundColor }) {
  // Ensure text meets WCAG AA
  const { fg } = ensureContrast(
    textColor, 
    backgroundColor, 
    ContrastLevel.AA_NORMAL
  );
  
  return <p style={{ color: fg, background: backgroundColor }}>Text</p>;
}
```

### With Background Images

The system automatically handles background images through the `useAutoTheme` hook:

```typescript
import { useAutoTheme } from '@boostlly/core';

function App() {
  const { imageUrl, palette } = useAutoTheme();
  
  // palette.fg and palette.bg are automatically adjusted for contrast
  return (
    <div style={{ 
      backgroundImage: `url(${imageUrl})`,
      color: palette?.fg 
    }}>
      Text automatically has proper contrast
    </div>
  );
}
```

## Testing

### Manual Testing

1. **Test with various background images**:
   - Light backgrounds
   - Dark backgrounds
   - Colorful backgrounds
   - Low contrast backgrounds

2. **Test with different text sizes**:
   - Normal text (16px)
   - Large text (24px+)
   - Bold text (14pt+ bold)

3. **Test high contrast mode**:
   - Enable high contrast in system settings
   - Verify all text remains legible
   - Verify buttons and UI elements are visible

4. **Test across devices**:
   - Desktop
   - Tablet
   - Mobile

### Automated Testing

Use the contrast checking functions to verify compliance:

```typescript
import { 
  getContrastRatio, 
  meetsWCAGAA, 
  meetsWCAGAAA 
} from '@boostlly/core';

// Test normal text
const contrast = getContrastRatio(textColor, backgroundColor);
expect(meetsWCAGAA(contrast, false)).toBe(true);

// Test large text
expect(meetsWCAGAA(contrast, true)).toBe(true);
```

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

## Accessibility Standards

This implementation meets:
- **WCAG 2.1 Level AA**: All text meets 4.5:1 contrast (normal) or 3:1 (large)
- **WCAG 2.1 Level AAA**: High contrast mode meets 7:1 contrast (normal) or 4.5:1 (large)
- **Section 508**: Complies with Section 508 accessibility requirements

## Future Enhancements

1. **Real-time contrast checking**: Check contrast against actual rendered pixels
2. **User preferences**: Allow users to adjust contrast preferences
3. **Contrast warnings**: Warn developers when contrast is insufficient
4. **Automated testing**: Add automated contrast testing to CI/CD pipeline

## References

- [WCAG 2.1 Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [WCAG 2.1 Contrast (Enhanced)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Support

For issues or questions about contrast implementation, please contact the development team.

