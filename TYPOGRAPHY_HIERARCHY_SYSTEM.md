# Typography Hierarchy System Documentation

**Date:** January 2025  
**Philosophy:** Every pixel matters. Every interaction counts. Building digital experiences that make a difference.

---

## Overview

This document describes the comprehensive typography hierarchy system implemented across the Boostlly application. The system is designed to create a visually clear and readable typographic hierarchy that guides the reader's eye naturally through content, highlighting the importance of each text element.

---

## Design Philosophy

### Core Principles

1. **Clear Visual Hierarchy** - Typography should guide the reader's eye naturally through content
2. **Intentional Variations** - Strategic use of font size, weight, color, spacing, and typeface
3. **Balanced Spacing** - Consistent spacing and alignment enhance clarity and structure
4. **Responsive Scaling** - Typography adapts seamlessly across all device sizes
5. **Accessibility First** - WCAG AA+ compliant contrast ratios for all text elements

### Typographic Scale

The system uses a **Major Third ratio (1.25)** for consistent scaling:

**Mobile Scale:**
- 12px → 15px → 19px → 24px → 30px → 38px → 48px

**Desktop Scale:**
- 14px → 18px → 22px → 28px → 35px → 44px → 55px

---

## Hierarchy Levels

### 1. Display/Headline (H1)
**Purpose:** Hero sections, main page titles, primary call-to-action headers

**Characteristics:**
- **Size:** `text-3xl md:text-4xl lg:text-5xl xl:text-6xl` (30px → 38px → 48px → 55px)
- **Weight:** Bold (700) for maximum impact
- **Tracking:** Tight (-0.02em) for modern, compact feel
- **Line-height:** Tight (1.1) for single-line headlines
- **Spacing:** Generous bottom margin (1.5rem) for separation
- **Color:** Primary foreground for maximum contrast

**Usage Example:**
```tsx
<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6">
  About Boostlly
</h1>
```

**Design Rationale:**
- Largest size creates immediate visual impact
- Bold weight ensures prominence
- Tight tracking prevents text from feeling too spread out
- Generous spacing separates from content below

---

### 2. Page Title (H2)
**Purpose:** Major section headers, secondary page titles

**Characteristics:**
- **Size:** `text-2xl md:text-3xl lg:text-4xl` (24px → 30px → 38px → 44px)
- **Weight:** Bold (700) for strong hierarchy
- **Tracking:** Tight (-0.01em) for readability
- **Line-height:** Tight (1.2) for clear distinction
- **Spacing:** Moderate bottom margin (1.25rem)
- **Color:** Primary foreground

**Usage Example:**
```tsx
<h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight mb-5">
  Our Core Values
</h2>
```

**Design Rationale:**
- Clear step down from H1 maintains hierarchy
- Bold weight ensures visibility without overwhelming
- Moderate spacing balances separation and flow

---

### 3. Section Title (H3)
**Purpose:** Subsection headers, card titles, feature headers

**Characteristics:**
- **Size:** `text-xl md:text-2xl lg:text-3xl` (20px → 24px → 30px → 35px)
- **Weight:** Semibold (600) for clear hierarchy without overwhelming
- **Tracking:** Normal for readability
- **Line-height:** Snug (1.3) for comfortable reading
- **Spacing:** Standard bottom margin (1rem)
- **Color:** Primary foreground

**Usage Example:**
```tsx
<h3 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-snug mb-4">
  Privacy First
</h3>
```

**Design Rationale:**
- Semibold weight provides distinction without heaviness
- Snug line-height improves readability for multi-line headers
- Standard spacing maintains consistent rhythm

---

### 4. Subsection (H4-H6)
**Purpose:** Nested content headers, minor sections

**H4 Characteristics:**
- **Size:** `text-lg md:text-xl lg:text-2xl` (18px → 20px → 24px → 28px)
- **Weight:** Semibold (600)
- **Line-height:** Snug (1.35)
- **Spacing:** Standard bottom margin (0.875rem)

**H5 Characteristics:**
- **Size:** `text-base md:text-lg lg:text-xl` (16px → 18px → 20px → 22px)
- **Weight:** Medium (500) for subtle emphasis
- **Line-height:** Normal (1.5)
- **Spacing:** Compact bottom margin (0.75rem)

**H6 Characteristics:**
- **Size:** `text-sm md:text-base lg:text-lg` (14px → 16px → 18px → 20px)
- **Weight:** Medium (500)
- **Line-height:** Normal (1.5)
- **Spacing:** Compact bottom margin (0.625rem)

**Design Rationale:**
- Progressive size reduction maintains clear hierarchy
- Medium weight for H5-H6 provides subtle distinction
- Compact spacing prevents excessive whitespace

---

### 5. Body Text
**Purpose:** Primary reading content, paragraphs, descriptions

**Characteristics:**
- **Size:** `text-base` (16px) - optimal for reading
- **Weight:** Normal (400) for comfortable reading
- **Line-height:** Relaxed (1.6) for optimal readability
- **Spacing:** Generous bottom margin (1rem) for paragraph separation
- **Color:** Foreground for maximum contrast

**Usage Example:**
```tsx
<p className="text-base leading-relaxed text-gray-600 mb-4">
  We believe that small moments of inspiration can create big changes in your life.
</p>
```

**Variations:**
- **Body Large:** `text-lg md:text-xl` - For emphasized content
- **Body Small:** `text-sm md:text-base` - For secondary content
- **Body Extra Small:** `text-xs md:text-sm` - For fine print

**Design Rationale:**
- 16px base size is optimal for reading comfort
- Relaxed line-height (1.6) improves readability for long-form content
- Generous spacing between paragraphs improves comprehension

---

### 6. Supporting Text

#### Labels
**Purpose:** Form labels, field names, UI element identifiers

**Characteristics:**
- **Size:** `text-sm` (14px)
- **Weight:** Medium (500) for clarity
- **Line-height:** Normal (1.5)
- **Color:** Primary foreground

**Usage Example:**
```tsx
<label className="text-sm font-medium leading-normal">
  Email Address
</label>
```

#### Captions
**Purpose:** Image captions, figure labels, secondary information

**Characteristics:**
- **Size:** `text-xs md:text-sm` (12px → 14px)
- **Weight:** Normal (400)
- **Line-height:** Normal (1.5)
- **Color:** Muted foreground for secondary emphasis

**Usage Example:**
```tsx
<p className="text-xs md:text-sm text-muted-foreground leading-normal">
  Photo by John Doe
</p>
```

#### Metadata
**Purpose:** Timestamps, counts, statistics, supplementary info

**Characteristics:**
- **Size:** `text-xs md:text-sm` (12px → 14px)
- **Weight:** Medium (500) for visibility
- **Line-height:** Normal (1.5)
- **Color:** Muted foreground

**Usage Example:**
```tsx
<span className="text-xs md:text-sm text-muted-foreground leading-normal font-medium">
  5 min read
</span>
```

**Design Rationale:**
- Smaller sizes create visual hierarchy without competing with primary content
- Muted colors indicate secondary importance
- Medium weight ensures readability at small sizes

---

## Specialized Typography

### Quote Display
**Purpose:** Large inspirational quotes, featured quotes

**Characteristics:**
- **Size:** `text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl`
- **Weight:** Light (300) for elegance
- **Style:** Italic for distinction
- **Tracking:** Tight (-0.02em)
- **Line-height:** Responsive (1.35 → 1.25) for optimal reading
- **Font-family:** Serif (Georgia, Playfair Display) for warmth

**Usage Example:**
```tsx
<blockquote className="quote-text-professional text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light italic leading-[1.35] sm:leading-[1.3] md:leading-[1.25] tracking-tight">
  {quote.text}
</blockquote>
```

**Design Rationale:**
- Large size creates visual impact
- Light weight and italic style convey elegance and inspiration
- Serif font adds warmth and personality
- Responsive line-height adapts to screen size

### Quote Author
**Purpose:** Attribution for quotes

**Characteristics:**
- **Size:** `text-sm sm:text-base md:text-lg`
- **Weight:** Medium (500) for clear attribution
- **Tracking:** Wide (0.02em) for distinction
- **Line-height:** Normal (1.5)

**Usage Example:**
```tsx
<p className="quote-author-professional text-sm sm:text-base md:text-lg font-medium leading-normal tracking-wide">
  — {quote.author}
</p>
```

---

## Color Hierarchy

### Primary Text
- **Color:** `hsl(var(--foreground))` - Maximum contrast
- **Usage:** Headings, primary body text, important content
- **Contrast Ratio:** WCAG AA+ compliant (4.5:1+)

### Secondary Text
- **Color:** `hsl(var(--foreground) / 0.9)` - High contrast
- **Usage:** Supporting content, emphasized text
- **Contrast Ratio:** WCAG AA compliant

### Tertiary Text
- **Color:** `hsl(var(--muted-foreground))` - Medium contrast
- **Usage:** Labels, metadata, captions
- **Contrast Ratio:** WCAG AA compliant (4.5:1+)

### Muted Text
- **Color:** `hsl(var(--muted-foreground) / 0.7-0.9)` - Reduced emphasis
- **Usage:** Secondary information, hints, tips
- **Contrast Ratio:** Meets WCAG AA for large text (3:1+)

---

## Spacing System

### Vertical Spacing Between Typographic Elements

**Tight Spacing (0.5rem):**
- Between related elements (label + input)
- Between metadata items

**Normal Spacing (1rem):**
- Between paragraphs
- Between sections and content
- Standard content flow

**Loose Spacing (1.5rem):**
- After major headings (H1, H2)
- Between major sections
- Before/after hero sections

**Extra Loose Spacing (2rem+):**
- Between major page sections
- Before/after featured content

---

## Responsive Behavior

### Mobile (< 768px)
- Smaller base sizes for readability
- Tighter line-heights for compact screens
- Reduced spacing for efficient use of space
- Larger touch targets (44px minimum)

### Tablet (768px - 1024px)
- Medium sizes for comfortable reading
- Balanced line-heights
- Moderate spacing

### Desktop (> 1024px)
- Larger sizes for impact
- More generous spacing
- Wider line-heights for readability

### Large Desktop (> 1280px)
- Maximum sizes for visual impact
- Generous spacing for breathing room
- Optimal line-heights for long-form reading

---

## Implementation Guidelines

### Using Typography Constants

The typography system is available through constants in `packages/ui/src/constants/styles.ts`:

```typescript
import { TYPOGRAPHY } from '@boostlly/ui';

// Headings
<h1 className={TYPOGRAPHY.H1}>Title</h1>
<h2 className={TYPOGRAPHY.H2}>Section</h2>

// Body text
<p className={TYPOGRAPHY.BODY}>Content</p>
<p className={TYPOGRAPHY.BODY_LARGE}>Emphasized content</p>

// Supporting text
<label className={TYPOGRAPHY.LABEL}>Label</label>
<span className={TYPOGRAPHY.METADATA}>Metadata</span>
```

### Best Practices

1. **Maintain Hierarchy** - Always use appropriate heading levels (H1 → H2 → H3)
2. **Consistent Spacing** - Use the spacing system consistently
3. **Color Contrast** - Ensure all text meets WCAG AA standards
4. **Responsive Design** - Always include responsive size classes
5. **Semantic HTML** - Use proper HTML elements (h1-h6, p, small, etc.)

### Common Patterns

**Page Header:**
```tsx
<div className="text-center mb-12">
  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6">
    Page Title
  </h1>
  <p className="text-lg md:text-xl leading-relaxed text-muted-foreground max-w-3xl mx-auto">
    Page description
  </p>
</div>
```

**Card Header:**
```tsx
<CardHeader>
  <CardTitle className="text-xl md:text-2xl font-semibold leading-snug">
    Card Title
  </CardTitle>
</CardHeader>
```

**Section with Description:**
```tsx
<div>
  <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight mb-2">
    Section Title
  </h2>
  <p className="text-sm text-muted-foreground leading-normal mb-6">
    Section description
  </p>
</div>
```

---

## Accessibility Considerations

### Contrast Ratios
- **Normal Text:** Minimum 4.5:1 (WCAG AA)
- **Large Text (18px+):** Minimum 3:1 (WCAG AA)
- **Headings:** 4.5:1+ for readability

### Font Sizes
- **Minimum:** 12px for captions/metadata
- **Base:** 16px for body text
- **Maximum:** 55px for display headlines

### Line Heights
- **Tight:** 1.1-1.2 for headlines
- **Normal:** 1.5 for body text
- **Relaxed:** 1.6+ for long-form content

### Letter Spacing
- **Tight:** -0.02em to -0.01em for large headings
- **Normal:** 0em for body text
- **Wide:** 0.02em+ for small uppercase text

---

## Testing & Verification

### Visual Testing Checklist
- [ ] Hierarchy is clear and logical
- [ ] Spacing is consistent and balanced
- [ ] Colors meet contrast requirements
- [ ] Responsive scaling works across breakpoints
- [ ] Text is readable at all sizes
- [ ] Line-heights prevent text crowding

### Accessibility Testing
- [ ] All text meets WCAG AA contrast ratios
- [ ] Font sizes are readable (minimum 12px)
- [ ] Line-heights provide comfortable reading
- [ ] Semantic HTML is used correctly
- [ ] Screen readers can navigate hierarchy

---

## Conclusion

This typography hierarchy system creates a visually clear and readable experience that guides users naturally through content. By using intentional variations in size, weight, color, spacing, and typeface, we ensure that every text element contributes to effective hierarchy and readability.

The system is designed to be:
- **Scalable** - Works across all device sizes
- **Accessible** - Meets WCAG AA+ standards
- **Consistent** - Provides predictable patterns
- **Flexible** - Accommodates various content types
- **Beautiful** - Creates visually appealing layouts

Every typographic element has been carefully considered to contribute to the overall user experience, ensuring that "every pixel matters" and "every interaction counts."

