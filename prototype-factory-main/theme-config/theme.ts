/**
 * Complete Kaluza Theme Configuration
 * 
 * This file combines all theme elements into a single exportable theme object
 * that can be used with Material-UI or other styling systems.
 */

import { kaluzaColors } from './colors';
import { 
  SizeVariation, 
  FontWeight, 
  fontFamily,
  typographyHierarchy,
  lineHeight,
  letterSpacing
} from './typography';
import { 
  Breakpoint, 
  spacing,
  defaultSpacingPx,
  borderRadius,
  boxShadow,
  transitionDuration,
  transitionTiming,
  zIndex,
  layout
} from './layout';

// Complete theme object
export const kaluzaTheme = {
  // Colors
  colors: kaluzaColors,
  
  // Typography
  typography: {
    fontFamily,
    sizes: SizeVariation,
    weights: FontWeight,
    hierarchy: typographyHierarchy,
    lineHeight,
    letterSpacing
  },
  
  // Layout
  spacing: {
    unit: defaultSpacingPx,
    fn: spacing
  },
  breakpoints: Breakpoint,
  borderRadius,
  boxShadow,
  zIndex,
  layout,
  
  // Transitions
  transitions: {
    duration: transitionDuration,
    timing: transitionTiming
  }
};

// Material-UI theme configuration
export const muiThemeOptions = {
  palette: {
    primary: {
      light: kaluzaColors.envyColors[100],
      main: kaluzaColors.envyColors[500],
      dark: kaluzaColors.envyColors[800]
    },
    secondary: {
      light: kaluzaColors.waferColors[100],
      main: kaluzaColors.waferColors[500],
      dark: kaluzaColors.waferColors[800]
    },
    error: {
      light: kaluzaColors.waferColors[200],
      main: kaluzaColors.legacyColors.cherry
    },
    success: {
      main: kaluzaColors.legacyColors.avocado
    },
    warning: {
      main: kaluzaColors.legacyColors.lemon
    },
    info: {
      main: kaluzaColors.legacyColors.aqua
    },
    grey: {
      200: kaluzaColors.legacyColors.lightGrey,
      500: kaluzaColors.legacyColors.steel
    },
    text: {
      primary: kaluzaColors.additionalColors.black,
      secondary: kaluzaColors.waferColors[500]
    },
    background: {
      default: kaluzaColors.additionalColors.white,
      paper: kaluzaColors.envyColors[50]
    }
  },
  typography: {
    fontFamily,
    h1: {
      fontSize: SizeVariation.x11,
      fontWeight: FontWeight.Medium
    },
    h2: {
      fontSize: SizeVariation.x10,
      fontWeight: FontWeight.Medium
    },
    h3: {
      fontSize: SizeVariation.x09,
      fontWeight: FontWeight.Medium
    },
    h4: {
      fontSize: SizeVariation.x08,
      fontWeight: FontWeight.Regular
    },
    h5: {
      fontSize: SizeVariation.x07,
      fontWeight: FontWeight.Regular
    },
    h6: {
      fontSize: SizeVariation.x06,
      fontWeight: FontWeight.Regular
    },
    body1: {
      fontSize: SizeVariation.x05
    },
    body2: {
      fontSize: SizeVariation.x05
    },
    subtitle1: {
      fontSize: SizeVariation.x04
    },
    subtitle2: {
      fontSize: SizeVariation.x03
    },
    fontWeightLight: FontWeight.Light,
    fontWeightRegular: FontWeight.Regular,
    fontWeightMedium: FontWeight.Medium,
    fontWeightBold: FontWeight.Bold
  },
  spacing: defaultSpacingPx,
  breakpoints: {
    values: {
      xs: 0,
      sm: Breakpoint.Small,
      md: Breakpoint.Medium,
      lg: Breakpoint.Large,
      xl: Breakpoint.XLarge
    }
  },
  shape: {
    borderRadius: 4
  }
};

// Export individual modules for granular imports
export * from './colors';
export * from './typography';
export * from './layout';
