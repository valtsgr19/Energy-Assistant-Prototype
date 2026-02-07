/**
 * Kaluza Typography System
 * 
 * Font: Aspekta (primary) with system fallbacks
 * Scale: 11 size variations from 10px to 32px
 * Weights: ExtraLight (200), Light (300), Regular (400), Medium (500), SemiBold (600), Bold (700)
 */

// Font face definitions for Aspekta
export const aspekta = {
  extraLight: {
    fontFamily: 'Aspekta',
    fontStyle: 'normal',
    fontWeight: 200,
    fontDisplay: 'swap',
    src: `url("https://cdn.prod.website-files.com/68ad7ea636513871784163e4/68ad7ea636513871784164c1_Aspekta-200.woff2") format("woff2")`
  },
  light: {
    fontFamily: 'Aspekta',
    fontStyle: 'normal',
    fontWeight: 300,
    fontDisplay: 'swap',
    src: `url("https://cdn.prod.website-files.com/68ad7ea636513871784163e4/68ad7ea636513871784164be_Aspekta-300.woff2") format("woff2")`
  },
  regular: {
    fontFamily: 'Aspekta',
    fontStyle: 'normal',
    fontWeight: 400,
    fontDisplay: 'swap',
    src: `url("https://cdn.prod.website-files.com/68ad7ea636513871784163e4/68ad7ea636513871784164c2_Aspekta-400.woff2") format("woff2")`
  },
  medium: {
    fontFamily: 'Aspekta',
    fontStyle: 'normal',
    fontWeight: 500,
    fontDisplay: 'swap',
    src: `url("https://cdn.prod.website-files.com/68ad7ea636513871784163e4/68ad7ea636513871784164c3_Aspekta-500.woff2") format("woff2")`
  },
  semiBold: {
    fontFamily: 'Aspekta',
    fontStyle: 'normal',
    fontWeight: 600,
    fontDisplay: 'swap',
    src: `url("https://cdn.prod.website-files.com/68ad7ea636513871784163e4/68ad7ea636513871784164c0_Aspekta-600.woff2") format("woff2")`
  },
  bold: {
    fontFamily: 'Aspekta',
    fontStyle: 'normal',
    fontWeight: 700,
    fontDisplay: 'swap',
    src: `url("https://cdn.prod.website-files.com/68ad7ea636513871784163e4/68ad7ea636513871784164bf_Aspekta-700.woff2") format("woff2")`
  }
};

// Font size scale (modular scale)
export enum SizeVariation {
  x01 = '0.625rem',    // 10px
  x02 = '0.6875rem',   // 11px
  x03 = '0.75rem',     // 12px
  x04 = '0.875rem',    // 14px
  x05 = '1rem',        // 16px - Base size
  x06 = '1.125rem',    // 18px
  x07 = '1.25rem',     // 20px
  x08 = '1.375rem',    // 22px
  x09 = '1.5625rem',   // 25px
  x10 = '1.8125rem',   // 29px
  x11 = '2rem'         // 32px
}

// Font weight scale
export enum FontWeight {
  ExtraLight = 200,
  Light = 300,
  Regular = 400,
  Medium = 500,
  SemiBold = 600,
  Bold = 700
}

// Font family stack
export const fontFamily = [
  'Aspekta',
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
  'Roboto',
  'Helvetica Neue',
  'Arial',
  'sans-serif'
].join(',');

// Typography hierarchy mappings
export const typographyHierarchy = {
  h1: SizeVariation.x11,
  h2: SizeVariation.x10,
  h3: SizeVariation.x09,
  h4: SizeVariation.x08,
  h5: SizeVariation.x07,
  h6: SizeVariation.x06,
  body: SizeVariation.x05,
  small: SizeVariation.x04
};

// Line height scale
export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2
};

// Letter spacing
export const letterSpacing = {
  tight: '-0.02em',
  normal: '0',
  wide: '0.05em',
  wider: '0.09em'
};
