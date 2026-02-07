# Kaluza Brand Guide

## Color Palette

The Kaluza brand uses a nature-inspired color system with four primary color families, each with 11 shades (50-950).

### Spindle (Blues)
Primary brand color representing trust and technology.

```
50:  #F2F6FC  (Lightest)
100: #E1EBF8
200: #C9DDF4
300: #B1CFEF
400: #78A9E2
500: #598BD8  ← Primary
600: #4471CC
700: #3B5EBA
800: #354D98
900: #2F4379
950: #212A4A  (Darkest)
```

### Envy (Greens)
Primary UI color representing growth and sustainability.

```
50:  #F4F6F3  (Lightest)
100: #E5EAE1
200: #CAD4C6
300: #A5B69F
400: #889E82
500: #5A7554  ← Primary
600: #445C3F
700: #364933
800: #2C3B2A
900: #253123
950: #141B13  (Darkest)
```

### Merino (Browns/Tans)
Neutral tones for warmth and earthiness.

```
50:  #F9F6F3  (Lightest)
100: #EEE8DF
200: #E1D6C7
300: #CDBAA4
400: #B99B7E
500: #AA8365  ← Primary
600: #9D7259
700: #835D4B
800: #6B4D41
900: #574037
950: #2E211C  (Darkest)
```

### Wafer (Pinks/Roses)
Secondary accents for highlights and emphasis.

```
50:  #FBF7F5  (Lightest)
100: #F6EDEA
200: #EFDFD9
300: #E2C7BC
400: #D1A898
500: #BE8A75  ← Primary
600: #A8715A
700: #8C5C49
800: #754F3F
900: #634539
950: #34221B  (Darkest)
```

### Legacy Colors
Additional utility colors for specific use cases.

```
aqua:      #58D5F8  (Info/Accent)
avocado:   #4FD061  (Success)
lemon:     #FFEA4F  (Warning)
orange:    #FB842C  (Alert)
cherry:    #FF4E4E  (Error)
fig:       #B86FB9  (Purple accent)
white:     #DDDDDD  (Light grey)
dawn:      #1C597B  (Dark blue)
dusk:      #112D4D  (Darker blue)
morning:   #29425F  (Medium blue)
night:     #061B32  (Darkest blue)
steel:     #8FA1BD  (Grey blue)
lightGrey: #F1F6F8  (Background)
silver:    #B0B0B0  (Medium grey)
```

### Additional Colors

```
white: #FFFFFF
black: #10100F
```

## Color Roles

Semantic color assignments for consistent UI implementation:

```
primary:              Spindle 500 (#598BD8)
pageBackground:       White (#FFFFFF)
pageBackgroundAlt:    Envy 50 (#F4F6F3)
surface:              Envy 300 (#A5B69F)
formControlBackground: Envy 100 (#E5EAE1)
error:                Cherry (#FF4E4E)
success:              Avocado (#4FD061)
warning:              Lemon (#FFEA4F)
textPrimary:          Black (#10100F)
textSecondary:        Wafer 500 (#BE8A75)
textDark:             Black (#10100F)
```

## Typography

### Font Families

**Primary**: Aspekta
- ExtraLight: 200
- Light: 300
- Regular: 400
- Medium: 500
- SemiBold: 600
- Bold: 700

**Fallback**: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif)

### Font Sizes

The system uses a modular scale with 11 size variations:

```
x01: 0.625rem   (10px)
x02: 0.6875rem  (11px)
x03: 0.75rem    (12px)
x04: 0.875rem   (14px)
x05: 1rem       (16px)   ← Base size
x06: 1.125rem   (18px)
x07: 1.25rem    (20px)
x08: 1.375rem   (22px)
x09: 1.5625rem  (25px)
x10: 1.8125rem  (29px)
x11: 2rem       (32px)
```

### Font Weights

```
ExtraLight: 200
Light:      300
Regular:    400
Medium:     500
SemiBold:   600
Bold:       700
```

### Typography Hierarchy

```
H1: Size x11 (2rem)      - Page titles
H2: Size x10 (1.8125rem) - Section titles
H3: Size x09 (1.5625rem) - Subsection titles
H4: Size x08 (1.375rem)  - Card titles
H5: Size x07 (1.25rem)   - Small headings
H6: Size x06 (1.125rem)  - Labels
Body: Size x05 (1rem)    - Body text
Small: Size x04 (0.875rem) - Secondary text
```

## Spacing System

Based on an 8px grid system:

```
spacing(1) = 8px
spacing(2) = 16px
spacing(3) = 24px
spacing(4) = 32px
spacing(5) = 40px
...and so on
```

## Breakpoints

Responsive design breakpoints:

```
Small:  480px   (Mobile landscape)
Medium: 768px   (Tablet)
Large:  1280px  (Desktop)
XLarge: 1920px  (Large desktop)
```

## Design Principles

1. **Nature-Inspired**: Colors reflect natural elements (sky, earth, plants)
2. **Accessible**: Maintain WCAG AA contrast ratios
3. **Consistent**: Use semantic color roles for predictable UI
4. **Responsive**: Design mobile-first with progressive enhancement
5. **Modular**: Build with reusable components and patterns

## Usage Guidelines

### Do's
- Use semantic color roles (primary, error, success) instead of direct color values
- Maintain consistent spacing using the 8px grid
- Follow the typography hierarchy for content structure
- Use the appropriate color shade for context (lighter for backgrounds, darker for text)

### Don'ts
- Don't mix color families arbitrarily
- Don't use font sizes outside the defined scale
- Don't create custom spacing values
- Don't use pure black (#000000) - use the brand black (#10100F)

## Accessibility

- Ensure text contrast meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- Use color roles that have been tested for accessibility
- Don't rely on color alone to convey information
- Provide sufficient touch targets (minimum 44x44px)
