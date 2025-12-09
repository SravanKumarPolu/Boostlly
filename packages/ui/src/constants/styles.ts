/**
 * Reusable CSS Classes Constants
 * 
 * This file contains all commonly used CSS class combinations
 * to reduce duplication and ensure consistency across the application.
 */

// ==============================================
// TYPOGRAPHY CLASSES - Comprehensive Hierarchy System
// ==============================================
// 
// Design Philosophy:
// - Clear visual hierarchy guides the reader's eye naturally
// - Intentional variations in size, weight, color, and spacing
// - Responsive scaling ensures readability across all devices
// - WCAG AA+ compliant contrast ratios for accessibility
//
// Hierarchy Levels:
// 1. Display/Headline (H1) - Largest, boldest, most prominent
// 2. Page Title (H2) - Major section headers
// 3. Section Title (H3) - Subsection headers
// 4. Subsection (H4-H6) - Nested content headers
// 5. Body Text - Primary reading content
// 6. Supporting Text - Labels, metadata, captions
//
export const TYPOGRAPHY = {
  // ==========================================
  // HEADINGS - Primary Hierarchy
  // ==========================================
  // H1: Display/Headline - Hero sections, main page titles
  // Large, bold, tight tracking for impact
  H1: 'text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight',
  
  // H2: Page Title - Major section headers
  // Large, bold, clear hierarchy below H1
  H2: 'text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight',
  
  // H3: Section Title - Subsection headers
  // Medium-large, semibold, clear distinction
  H3: 'text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight leading-snug',
  
  // H4: Subsection - Nested content headers
  // Medium, semibold, readable hierarchy
  H4: 'text-lg md:text-xl lg:text-2xl font-semibold leading-snug',
  
  // H5: Minor Heading - Small section headers
  // Base to large, medium weight
  H5: 'text-base md:text-lg lg:text-xl font-medium leading-normal',
  
  // H6: Smallest Heading - Fine-grained hierarchy
  // Small to base, medium weight
  H6: 'text-sm md:text-base lg:text-lg font-medium leading-normal',
  
  // ==========================================
  // SECTION HEADERS - Common Patterns
  // ==========================================
  // Section header with consistent spacing
  SECTION_HEADER: 'text-xl md:text-2xl font-semibold mb-4 md:mb-6 tracking-tight',
  
  // Page header - Hero-style headers
  PAGE_HEADER: 'text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4 md:mb-6',
  
  // Card header - For card titles
  CARD_HEADER: 'text-lg md:text-xl font-semibold leading-snug mb-2',
  
  // ==========================================
  // BODY TEXT - Primary Content
  // ==========================================
  // Body - Standard reading text
  // Relaxed line-height for comfortable reading
  BODY: 'text-base md:text-base leading-relaxed',
  
  // Body Large - Emphasized body text
  // Slightly larger for important content
  BODY_LARGE: 'text-lg md:text-xl leading-relaxed',
  
  // Body Small - Secondary body text
  // Smaller for less important content
  BODY_SMALL: 'text-sm md:text-base leading-relaxed',
  
  // Body Extra Small - Fine print
  BODY_XS: 'text-xs md:text-sm leading-normal',
  
  // ==========================================
  // QUOTE TEXT - Specialized Typography
  // ==========================================
  // Quote Display - Large inspirational quotes
  // Light weight, italic, generous spacing
  QUOTE_DISPLAY: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light italic leading-[1.35] sm:leading-[1.3] md:leading-[1.25] tracking-tight',
  
  // Quote Author - Attribution text
  // Medium weight, clear but secondary
  QUOTE_AUTHOR: 'text-sm sm:text-base md:text-lg font-medium leading-normal tracking-wide',
  
  // Quote Small - Compact quote display
  QUOTE_SMALL: 'text-base sm:text-lg md:text-xl font-light italic leading-relaxed',
  
  // ==========================================
  // SUPPORTING TEXT - Labels, Metadata, Captions
  // ==========================================
  // Label - Form labels, field names
  // Small, medium weight, clear
  LABEL: 'text-sm font-medium leading-normal text-foreground',
  
  // Label Small - Smaller labels
  LABEL_SMALL: 'text-xs font-medium leading-normal text-foreground',
  
  // Caption - Image captions, figure labels
  // Small, muted, secondary information
  CAPTION: 'text-xs md:text-sm text-muted-foreground leading-normal',
  
  // Caption Small - Fine captions
  CAPTION_SMALL: 'text-xs text-muted-foreground leading-normal',
  
  // Metadata - Timestamps, counts, stats
  // Small, muted, informational
  METADATA: 'text-xs md:text-sm text-muted-foreground leading-normal font-medium',
  
  // Metadata Small - Compact metadata
  METADATA_SMALL: 'text-xs text-muted-foreground leading-normal',
  
  // Badge Text - Small badge labels
  BADGE_TEXT: 'text-xs font-medium leading-tight tracking-wide',
  
  // ==========================================
  // MUTED TEXT - Secondary Information
  // ==========================================
  // Muted - Secondary text with reduced emphasis
  MUTED: 'text-muted-foreground',
  
  // Muted Small - Smaller muted text
  MUTED_SMALL: 'text-sm text-muted-foreground',
  
  // Muted Extra Small - Fine muted text
  MUTED_XS: 'text-xs text-muted-foreground',
  
  // ==========================================
  // UTILITY CLASSES - Spacing & Alignment
  // ==========================================
  // Typography spacing utilities
  SPACING_TIGHT: 'mb-2 md:mb-3',
  SPACING_NORMAL: 'mb-4 md:mb-6',
  SPACING_LOOSE: 'mb-6 md:mb-8',
  
  // Text alignment
  ALIGN_LEFT: 'text-left',
  ALIGN_CENTER: 'text-center',
  ALIGN_RIGHT: 'text-right',
  
  // Text transform
  UPPERCASE: 'uppercase tracking-wider',
  LOWERCASE: 'lowercase',
  CAPITALIZE: 'capitalize',
} as const;

// ==============================================
// LAYOUT CLASSES
// ==============================================
export const LAYOUT = {
  // Containers
  CONTAINER: 'container mx-auto px-4',
  CONTAINER_SM: 'container mx-auto px-4 max-w-sm',
  CONTAINER_MD: 'container mx-auto px-4 max-w-md',
  CONTAINER_LG: 'container mx-auto px-4 max-w-lg',
  CONTAINER_XL: 'container mx-auto px-4 max-w-xl',
  
  // Flexbox utilities
  FLEX_CENTER: 'flex items-center justify-center',
  FLEX_BETWEEN: 'flex items-center justify-between',
  FLEX_START: 'flex items-center justify-start',
  FLEX_END: 'flex items-center justify-end',
  
  // Grid utilities
  GRID_2: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  GRID_3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  GRID_4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
} as const;

// ==============================================
// BUTTON CLASSES
// ==============================================
export const BUTTONS = {
  // Base button classes
  BASE: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  
  // Button variants
  PRIMARY: 'bg-primary text-primary-foreground hover:bg-primary/90',
  SECONDARY: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  DESTRUCTIVE: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  OUTLINE: 'border border-input hover:bg-accent hover:text-accent-foreground',
  GHOST: 'hover:bg-accent hover:text-accent-foreground',
  LINK: 'underline-offset-4 hover:underline text-primary',
  
  // Button sizes
  SM: 'h-9 px-3 rounded-md',
  DEFAULT: 'h-10 py-2 px-4',
  LG: 'h-11 px-8 rounded-md',
  ICON: 'h-10 w-10',
  
  // Navigation button (commonly used pattern)
  NAV_BASE: 'flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors',
  NAV_ACTIVE: 'bg-primary text-primary-foreground',
  NAV_INACTIVE: 'text-muted-foreground hover:text-foreground hover:bg-accent',
  NAV_DISABLED: 'opacity-50 cursor-not-allowed',
} as const;

// ==============================================
// CARD CLASSES
// ==============================================
export const CARDS = {
  BASE: 'rounded-lg border bg-card text-card-foreground shadow-sm',
  HEADER: 'flex flex-col space-y-1.5 p-6',
  TITLE: 'text-2xl font-semibold leading-none tracking-tight',
  DESCRIPTION: 'text-sm text-muted-foreground',
  CONTENT: 'p-6 pt-0',
  FOOTER: 'flex items-center p-6 pt-0',
} as const;

// ==============================================
// FORM CLASSES
// ==============================================
export const FORMS = {
  // Input base
  INPUT_BASE: 'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  
  // Label
  LABEL: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  
  // Error states
  ERROR: 'text-sm font-medium text-destructive',
} as const;

// ==============================================
// ANIMATION CLASSES
// ==============================================
export const ANIMATIONS = {
  FADE_IN: 'animate-in fade-in duration-300',
  SLIDE_IN: 'animate-in slide-in-from-bottom-4 duration-300',
  SCALE_IN: 'animate-in zoom-in-95 duration-300',
  BOUNCE: 'animate-bounce',
  PULSE: 'animate-pulse',
} as const;

// ==============================================
// SPACING CLASSES
// ==============================================
export const SPACING = {
  // Padding
  P_SM: 'p-2',
  P_MD: 'p-4',
  P_LG: 'p-6',
  P_XL: 'p-8',
  
  // Margin
  M_SM: 'm-2',
  M_MD: 'm-4',
  M_LG: 'm-6',
  M_XL: 'm-8',
  
  // Gap
  GAP_SM: 'gap-2',
  GAP_MD: 'gap-4',
  GAP_LG: 'gap-6',
  GAP_XL: 'gap-8',
} as const;

// ==============================================
// COMMON COMBINATIONS
// ==============================================
export const COMMON = {
  // Section with header and content
  SECTION: 'p-4',
  SECTION_HEADER: `${TYPOGRAPHY.SECTION_HEADER}`,
  SECTION_CONTENT: `${TYPOGRAPHY.MUTED}`,
  
  // Card with header
  CARD_SECTION: `${CARDS.BASE} ${SPACING.P_MD}`,
  CARD_HEADER: `${TYPOGRAPHY.SECTION_HEADER}`,
  CARD_DESCRIPTION: `${TYPOGRAPHY.MUTED}`,
  
  // Button with icon
  BUTTON_WITH_ICON: `${BUTTONS.BASE} ${BUTTONS.DEFAULT} ${BUTTONS.PRIMARY}`,
  
  // Navigation item
  NAV_ITEM: `${BUTTONS.NAV_BASE}`,
  NAV_ITEM_ACTIVE: `${BUTTONS.NAV_BASE} ${BUTTONS.NAV_ACTIVE}`,
  NAV_ITEM_INACTIVE: `${BUTTONS.NAV_BASE} ${BUTTONS.NAV_INACTIVE}`,
  NAV_ITEM_DISABLED: `${BUTTONS.NAV_BASE} ${BUTTONS.NAV_DISABLED}`,
} as const;
