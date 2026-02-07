/**
 * Kaluza Layout System
 * 
 * Spacing: 8px base unit
 * Breakpoints: Mobile-first responsive design
 * Grid: 12-column flexible grid system
 */

// Spacing function (8px base unit)
export const defaultSpacingPx = 8;

export const spacing = (multiplier: number): number => {
  return defaultSpacingPx * multiplier;
};

// Responsive breakpoints
export enum Breakpoint {
  Small = 480,    // Mobile landscape
  Medium = 768,   // Tablet
  Large = 1280,   // Desktop
  XLarge = 1920   // Large desktop
}

// Media query helpers
export const mediaQueryMinWidth = (breakpoint: Breakpoint): string =>
  `@media (min-width: ${breakpoint}px)`;

export const mediaQueryMaxWidth = (breakpoint: Breakpoint): string =>
  `@media (max-width: ${breakpoint - 1}px)`;

export const mediaQueryBetween = (
  minBreakpoint: Breakpoint,
  maxBreakpoint: Breakpoint
): string =>
  `@media (min-width: ${minBreakpoint}px) and (max-width: ${maxBreakpoint - 1}px)`;

// Container max widths
export const containerMaxWidth = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536
};

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070
};

// Border radius scale
export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px
  base: '0.25rem',   // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',    // Pill shape
  pill: '2rem'       // Button pill shape
};

// Shadow scale
export const boxShadow = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
};

// Transition durations
export const transitionDuration = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms'
};

// Transition timing functions
export const transitionTiming = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out'
};

// Common layout values
export const layout = {
  headerHeight: 64,
  sidebarWidth: 280,
  sidebarCollapsedWidth: 64,
  footerHeight: 80,
  maxContentWidth: 1280
};
