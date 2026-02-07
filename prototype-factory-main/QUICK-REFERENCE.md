# Quick Reference Guide

Fast lookup for common values and patterns when building prototypes.

## Colors (Most Used)

```
Primary:    #5A7554  (Envy 500)
Secondary:  #BE8A75  (Wafer 500)
Background: #FFFFFF  (White)
Alt BG:     #F4F6F3  (Envy 50)
Text:       #10100F  (Black)
Error:      #FF4E4E  (Cherry)
Success:    #4FD061  (Avocado)
Warning:    #FFEA4F  (Lemon)
```

## Typography

```
Font: 'Aspekta', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif

Sizes:
H1: 2rem (32px)
H2: 1.8125rem (29px)
H3: 1.5625rem (25px)
H4: 1.375rem (22px)
Body: 1rem (16px)
Small: 0.875rem (14px)

Weights:
ExtraLight: 200
Light: 300
Regular: 400
Medium: 500
SemiBold: 600
Bold: 700
```

## Spacing

```
Base unit: 8px

1x = 8px
2x = 16px
3x = 24px
4x = 32px
5x = 40px
```

## Breakpoints

```
Small:  480px   (Mobile landscape)
Medium: 768px   (Tablet)
Large:  1280px  (Desktop)
XLarge: 1920px  (Large desktop)
```

## Common Patterns

### Button
```tsx
<Button variant="contained">Primary Action</Button>
<Button variant="outlined">Secondary Action</Button>
```

### Card
```tsx
<Card title="Card Title">
  Content goes here
</Card>
```

### Form Input
```tsx
<TextField
  label="Label"
  variant="filled"
  value={value}
  onChange={handleChange}
/>
```

### Grid Layout
```html
<div class="grid" data-columns="12">
  <div class="c" data-span="6">Half width</div>
  <div class="c" data-span="6">Half width</div>
</div>
```

### Responsive Grid
```html
<div class="grid" data-columns="12" data-columns-s="6">
  <div class="c" data-span="4" data-span-s="6">
    Desktop: 4 cols, Mobile: 6 cols
  </div>
</div>
```

## CSS Classes

### Spacing
```css
.m-1  { margin: 8px; }
.m-2  { margin: 16px; }
.p-1  { padding: 8px; }
.p-2  { padding: 16px; }
```

### Display
```css
.d-flex    { display: flex; }
.d-grid    { display: grid; }
.d-none    { display: none; }
```

### Flexbox
```css
.justify-center  { justify-content: center; }
.align-center    { align-items: center; }
.flex-column     { flex-direction: column; }
```

### Text
```css
.text-center     { text-align: center; }
.text-uppercase  { text-transform: uppercase; }
.font-medium     { font-weight: 500; }
```

## SCSS Variables

```scss
// Colors
$envy-500: #5A7554;
$wafer-500: #BE8A75;
$white: #FFFFFF;
$black: #10100F;
$cherry: #FF4E4E;

// Spacing
$spacing-unit: 8px;

// Breakpoints
$breakpoint-md: 768px;
$breakpoint-lg: 1280px;
```

## Material-UI Theme Access

```tsx
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    // Colors
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.default,
    
    // Spacing
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    
    // Breakpoints
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(4)
    }
  }
}));
```

## Common Component Props

### Button
```tsx
variant: 'contained' | 'outlined' | 'text'
color: 'primary' | 'secondary'
disabled: boolean
onClick: () => void
```

### TextField
```tsx
variant: 'filled' | 'outlined' | 'standard'
label: string
value: string
onChange: (e) => void
error: boolean
helperText: string
```

### Typography
```tsx
variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2'
component: 'h1' | 'h2' | 'p' | 'span' | 'div'
```

## Animation Keyframes

```scss
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

## Border Radius

```
Small:  4px
Medium: 8px
Large:  16px
Pill:   2rem (32px)
Full:   9999px
```

## Box Shadow

```
Small:  0 1px 2px rgba(0,0,0,0.05)
Base:   0 1px 3px rgba(0,0,0,0.1)
Medium: 0 4px 6px rgba(0,0,0,0.1)
Large:  0 10px 15px rgba(0,0,0,0.1)
```

## Z-Index Scale

```
Base:     0
Dropdown: 1000
Sticky:   1020
Modal:    1050
Tooltip:  1070
```

## Accessibility

```
Minimum contrast: 4.5:1 (normal text)
Minimum contrast: 3:1 (large text)
Touch target: 44x44px minimum
Focus visible: Always provide focus styles
```

## File Structure

```
src/
  theme/
    colors.ts
    typography.ts
    layout.ts
    theme.ts
  components/
    Button/
    Card/
    Form/
  pages/
    Dashboard/
  styles/
    _variables.scss
    base.scss
```

## Import Patterns

```tsx
// Theme
import { kaluzaTheme } from './theme/theme';
import { kaluzaColors } from './theme/colors';
import { SizeVariation, FontWeight } from './theme/typography';
import { Breakpoint, spacing } from './theme/layout';

// Components
import { Button, Card, Form } from './components';

// Material-UI
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Container, Grid } from '@material-ui/core';
```

## Common Mistakes to Avoid

❌ Don't use pure black (#000000) - use brand black (#10100F)
❌ Don't hardcode colors - use theme values
❌ Don't use arbitrary spacing - use 8px multiples
❌ Don't skip responsive design - mobile-first approach
❌ Don't forget accessibility - contrast, focus, labels

✅ Do use semantic color roles
✅ Do use the spacing function
✅ Do test on multiple screen sizes
✅ Do provide proper ARIA labels
✅ Do follow the component patterns
