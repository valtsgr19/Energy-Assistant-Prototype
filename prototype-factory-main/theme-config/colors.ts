/**
 * Kaluza Color System
 * 
 * A nature-inspired color palette with four main families:
 * - Spindle (Blues): Trust and technology
 * - Envy (Greens): Growth and sustainability
 * - Merino (Browns): Warmth and earthiness
 * - Wafer (Pinks): Highlights and emphasis
 */

export const additionalColors = {
  white: '#FFFFFF',
  black: '#10100f'
};

// Kaluza Color Palette - Spindle (Blues)
export const spindleColors = {
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

// Kaluza Color Palette - Envy (Greens)
export const envyColors = {
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

// Kaluza Color Palette - Merino (Browns/Tans)
export const merinoColors = {
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

// Kaluza Color Palette - Wafer (Pinks/Roses)
export const waferColors = {
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

// Legacy utility colors
export const legacyColors = {
  aqua: '#58D5F8',
  avocado: '#4FD061',
  lemon: '#FFEA4F',
  orange: '#FB842C',
  cherry: '#FF4E4E',
  fig: '#B86FB9',
  white: '#DDDDDD',
  dawn: '#1C597B',
  dusk: '#112D4D',
  morning: '#29425F',
  night: '#061B32',
  nightAlt: '#09233E',
  steel: '#8FA1BD',
  lightGrey: '#F1F6F8',
  silver: '#B0B0B0'
};

// Semantic color roles for consistent UI implementation
export const colorRoles = {
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

// Export all colors as a single object
export const kaluzaColors = {
  legacyColors,
  additionalColors,
  envyColors,
  spindleColors,
  merinoColors,
  waferColors,
  colorRoles
};
