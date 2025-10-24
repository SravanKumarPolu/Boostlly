/**
 * Reusable CSS Classes Constants
 * 
 * This file contains all commonly used CSS class combinations
 * to reduce duplication and ensure consistency across the application.
 */

// ==============================================
// TYPOGRAPHY CLASSES
// ==============================================
export const TYPOGRAPHY = {
  // Headings
  H1: 'text-4xl font-bold tracking-tight',
  H2: 'text-3xl font-semibold tracking-tight',
  H3: 'text-2xl font-semibold tracking-tight',
  H4: 'text-xl font-semibold',
  H5: 'text-lg font-semibold',
  H6: 'text-base font-semibold',
  
  // Section headers (commonly used pattern)
  SECTION_HEADER: 'text-xl font-semibold mb-4',
  
  // Body text
  BODY: 'text-base',
  BODY_LARGE: 'text-lg',
  BODY_SMALL: 'text-sm',
  
  // Muted text
  MUTED: 'text-muted-foreground',
  MUTED_SMALL: 'text-sm text-muted-foreground',
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
