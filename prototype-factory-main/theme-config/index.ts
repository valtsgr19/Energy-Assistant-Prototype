/**
 * Kaluza Theme Configuration - Main Export
 * 
 * Import everything you need from this single file:
 * import { kaluzaTheme, kaluzaColors, SizeVariation, Breakpoint } from './theme';
 */

// Export all theme modules
export * from './colors';
export * from './typography';
export * from './layout';
export * from './theme';

// Re-export commonly used items for convenience
export { kaluzaTheme, muiThemeOptions } from './theme';
export { kaluzaColors, colorRoles } from './colors';
export { SizeVariation, FontWeight, fontFamily } from './typography';
export { Breakpoint, spacing, mediaQueryMinWidth } from './layout';
