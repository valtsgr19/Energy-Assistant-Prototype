// Kaluza Theme Configuration
// Copied from theme-config for frontend use

// Colors
const additionalColors = {
  white: '#FFFFFF',
  black: '#10100f'
};

const spindleColors = {
  50: '#F2F6FC',
  100: '#E1EBF8',
  200: '#C9DDF4',
  300: '#B1CFEF',
  400: '#78A9E2',
  500: '#598BD8',
  600: '#4471CC',
  700: '#3B5EBA',
  800: '#354D98',
  900: '#2F4379',
  950: '#212A4A'
};

const envyColors = {
  50: '#F4F6F3',
  100: '#E5EAE1',
  200: '#CAD4C6',
  300: '#A5B69F',
  400: '#889E82',
  500: '#5A7554',
  600: '#445C3F',
  700: '#364933',
  800: '#2C3B2A',
  900: '#253123',
  950: '#141B13'
};

const merinoColors = {
  50: '#F9F6F3',
  100: '#EEE8DF',
  200: '#E1D6C7',
  300: '#CDBAA4',
  400: '#B99B7E',
  500: '#AA8365',
  600: '#9D7259',
  700: '#835D4B',
  800: '#6B4D41',
  900: '#574037',
  950: '#2E211C'
};

const waferColors = {
  50: '#FBF7F5',
  100: '#F6EDEA',
  200: '#EFDFD9',
  300: '#E2C7BC',
  400: '#D1A898',
  500: '#BE8A75',
  600: '#A8715A',
  700: '#8C5C49',
  800: '#754F3F',
  900: '#634539',
  950: '#34221B'
};

const legacyColors = {
  aqua: '#58D5F8',
  avocado: '#4FD061',
  lemon: '#FFEA4F',
  orange: '#FB842C',
  cherry: '#FF4E4E',
  fig: '#B86FB9'
};

const colorRoles = {
  primary: spindleColors[500],
  pageBackground: additionalColors.white,
  pageBackgroundAlt: envyColors[50],
  surface: envyColors[300],
  formControlBackground: envyColors[100],
  error: legacyColors.cherry,
  success: legacyColors.avocado,
  warning: legacyColors.lemon,
  textPrimary: additionalColors.black,
  textSecondary: waferColors[500],
  textDark: additionalColors.black
};

export const kaluzaColors = {
  legacyColors,
  additionalColors,
  envyColors,
  spindleColors,
  merinoColors,
  waferColors,
  colorRoles
};

// Typography
export const SizeVariation = {
  x01: '0.625rem',    // 10px
  x02: '0.6875rem',   // 11px
  x03: '0.75rem',     // 12px
  x04: '0.875rem',    // 14px
  x05: '1rem',        // 16px - Base size
  x06: '1.125rem',    // 18px
  x07: '1.25rem',     // 20px
  x08: '1.375rem',    // 22px
  x09: '1.5625rem',   // 25px
  x10: '1.8125rem',   // 29px
  x11: '2rem'         // 32px
};

// Spacing (8px base unit)
export const spacing = (multiplier: number): string => {
  return `${8 * multiplier}px`;
};

// MUI theme configuration with Kaluza branding
export const muiTheme = {
  palette: {
    primary: {
      main: kaluzaColors.envyColors[500],
      light: kaluzaColors.envyColors[300],
      dark: kaluzaColors.envyColors[700]
    },
    secondary: {
      main: kaluzaColors.spindleColors[500],
      light: kaluzaColors.spindleColors[300],
      dark: kaluzaColors.spindleColors[700]
    },
    background: {
      default: kaluzaColors.additionalColors.white,
      paper: kaluzaColors.envyColors[50]
    },
    text: {
      primary: kaluzaColors.colorRoles.textPrimary,
      secondary: kaluzaColors.colorRoles.textSecondary
    }
  },
  typography: {
    fontFamily: 'Aspekta, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: SizeVariation.x11,
      fontWeight: 600
    },
    h2: {
      fontSize: SizeVariation.x10,
      fontWeight: 600
    },
    h3: {
      fontSize: SizeVariation.x09,
      fontWeight: 500
    },
    h4: {
      fontSize: SizeVariation.x08,
      fontWeight: 500
    },
    h5: {
      fontSize: SizeVariation.x07,
      fontWeight: 500
    },
    h6: {
      fontSize: SizeVariation.x06,
      fontWeight: 500
    },
    body1: {
      fontSize: SizeVariation.x05
    },
    body2: {
      fontSize: SizeVariation.x04
    }
  }
};

