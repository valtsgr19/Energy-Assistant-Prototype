import { createTheme } from '@mui/material/styles';

// Kaluza color palette
export const kaluzaColors = {
  // Spindle (Primary Blue)
  spindleColors: {
    50: '#E8F4F8',
    100: '#C5E4ED',
    200: '#9FD2E2',
    300: '#78C0D7',
    400: '#5BB3CF',
    500: '#3EA5C7',
    600: '#389DC1',
    700: '#3093BA',
    800: '#2889B3',
    900: '#1B77A6'
  },
  // Envy (Secondary Green)
  envyColors: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20'
  },
  // Merino (Neutral Beige)
  merinoColors: {
    50: '#FAF9F7',
    100: '#F5F3EF',
    200: '#EFEEE9',
    300: '#E9E7E1',
    400: '#E4E2DB',
    500: '#DFDDD5',
    600: '#DBD9D1',
    700: '#D7D4CB',
    800: '#D2D0C5',
    900: '#CAC7BA'
  },
  // Wafer (Accent Peach)
  waferColors: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF9800',
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100'
  },
  // Additional colors
  additionalColors: {
    white: '#FFFFFF',
    black: '#000000',
    error: '#D32F2F',
    success: '#388E3C',
    warning: '#F57C00',
    info: '#1976D2'
  },
  // Color roles
  colorRoles: {
    textPrimary: '#1B1B1B',
    textSecondary: '#666666',
    textDisabled: '#9E9E9E',
    background: '#FFFFFF',
    backgroundSecondary: '#FAF9F7',
    border: '#E0E0E0'
  }
};

// Typography scale
export const SizeVariation = {
  x01: '0.625rem',   // 10px
  x02: '0.6875rem',  // 11px
  x03: '0.75rem',    // 12px
  x04: '0.875rem',   // 14px
  x05: '1rem',       // 16px
  x06: '1.125rem',   // 18px
  x07: '1.25rem',    // 20px
  x08: '1.5rem',     // 24px
  x09: '1.75rem',    // 28px
  x10: '2rem',       // 32px
  x11: '2.5rem',     // 40px
  x12: '3rem'        // 48px
};

// Spacing function
export const spacing = (multiplier: number) => `${multiplier * 8}px`;

// Create Material-UI theme
export const theme = createTheme({
  palette: {
    primary: {
      main: kaluzaColors.spindleColors[500],
      light: kaluzaColors.spindleColors[300],
      dark: kaluzaColors.spindleColors[700],
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: kaluzaColors.envyColors[500],
      light: kaluzaColors.envyColors[300],
      dark: kaluzaColors.envyColors[700],
      contrastText: '#FFFFFF'
    },
    error: {
      main: kaluzaColors.additionalColors.error
    },
    success: {
      main: kaluzaColors.additionalColors.success
    },
    warning: {
      main: kaluzaColors.additionalColors.warning
    },
    info: {
      main: kaluzaColors.additionalColors.info
    },
    background: {
      default: kaluzaColors.colorRoles.background,
      paper: kaluzaColors.colorRoles.backgroundSecondary
    },
    text: {
      primary: kaluzaColors.colorRoles.textPrimary,
      secondary: kaluzaColors.colorRoles.textSecondary,
      disabled: kaluzaColors.colorRoles.textDisabled
    }
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: SizeVariation.x12,
      fontWeight: 700,
      lineHeight: 1.2
    },
    h2: {
      fontSize: SizeVariation.x11,
      fontWeight: 600,
      lineHeight: 1.3
    },
    h3: {
      fontSize: SizeVariation.x10,
      fontWeight: 600,
      lineHeight: 1.3
    },
    h4: {
      fontSize: SizeVariation.x09,
      fontWeight: 600,
      lineHeight: 1.4
    },
    h5: {
      fontSize: SizeVariation.x08,
      fontWeight: 500,
      lineHeight: 1.4
    },
    h6: {
      fontSize: SizeVariation.x07,
      fontWeight: 500,
      lineHeight: 1.4
    },
    body1: {
      fontSize: SizeVariation.x05,
      lineHeight: 1.5
    },
    body2: {
      fontSize: SizeVariation.x04,
      lineHeight: 1.5
    },
    button: {
      fontSize: SizeVariation.x05,
      fontWeight: 500,
      textTransform: 'none'
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '2rem',
          padding: '12px 24px',
          fontSize: SizeVariation.x05,
          fontWeight: 500
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.5rem'
          }
        }
      }
    }
  }
});
