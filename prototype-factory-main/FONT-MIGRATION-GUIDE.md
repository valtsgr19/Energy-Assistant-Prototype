# Font Migration Guide: Azo Sans Web → Aspekta

Quick reference guide for migrating from the old font system to the new Aspekta font.

## Side-by-Side Comparison

| Aspect | Before (Azo Sans Web) | After (Aspekta) |
|--------|----------------------|-----------------|
| **Font Family** | azo-sans-web | Aspekta |
| **Weights Available** | 3 (300, 400, 500) | 6 (200, 300, 400, 500, 600, 700) |
| **Fallback Fonts** | Montserrat, Arial | System fonts (-apple-system, etc.) |
| **Font Source** | Adobe Typekit | Kaluza CDN |
| **Loading Method** | External service | Direct @font-face |

## Code Changes

### 1. Font Family Declaration

**Before:**
```typescript
fontFamily: ['azo-sans-web', 'Montserrat', 'Arial', 'sans-serif'].join(',')
```

**After:**
```typescript
fontFamily: ['Aspekta', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'].join(',')
```

### 2. Font Loading

**Before:**
```html
<!-- External Typekit service -->
<link rel="stylesheet" href="https://use.typekit.net/..." />
```

**After:**
```html
<!-- Direct @font-face declarations -->
<style>
  @font-face {
    font-family: 'Aspekta';
    src: url('https://cdn.prod.website-files.com/68ad7ea636513871784163e4/68ad7ea636513871784164c2_Aspekta-400.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
  /* Repeat for other weights */
</style>
```

### 3. Font Weight Enum

**Before:**
```typescript
export enum FontWeight {
  Light = 300,
  Regular = 400,
  Medium = 500,
  Bold = 700
}
```

**After:**
```typescript
export enum FontWeight {
  ExtraLight = 200,
  Light = 300,
  Regular = 400,
  Medium = 500,
  SemiBold = 600,
  Bold = 700
}
```

### 4. Material-UI Theme

**Before:**
```typescript
const theme = createMuiTheme({
  typography: {
    fontFamily: ['azo-sans-web', 'Montserrat', 'Arial', 'sans-serif'].join(','),
    h1: { fontSize: '2rem', fontWeight: 500 },
    h2: { fontSize: '1.8125rem', fontWeight: 500 },
    // ...
  }
});
```

**After:**
```typescript
const theme = createMuiTheme({
  typography: {
    fontFamily: ['Aspekta', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'].join(','),
    h1: { fontSize: '2rem', fontWeight: 600 },
    h2: { fontSize: '1.8125rem', fontWeight: 600 },
    // ...
  }
});
```

## Font Weight Mapping

If you were using specific weights, here's how they map:

| Old Weight | Old Name | New Weight | New Name | Notes |
|------------|----------|------------|----------|-------|
| 300 | Light | 300 | Light | ✅ Same |
| 400 | Regular | 400 | Regular | ✅ Same |
| 500 | Medium | 500 | Medium | ✅ Same |
| 700 | Bold | 700 | Bold | ✅ Same |
| - | - | 200 | ExtraLight | 🆕 New |
| - | - | 600 | SemiBold | 🆕 New |

## Complete @font-face Declarations

Copy this into your HTML `<head>` or CSS file:

```css
/* Aspekta ExtraLight */
@font-face {
  font-family: 'Aspekta';
  src: url('https://cdn.prod.website-files.com/68ad7ea636513871784163e4/68ad7ea636513871784164c1_Aspekta-200.woff2') format('woff2');
  font-weight: 200;
  font-style: normal;
  font-display: swap;
}

/* Aspekta Light */
@font-face {
  font-family: 'Aspekta';
  src: url('https://cdn.prod.website-files.com/68ad7ea636513871784163e4/68ad7ea636513871784164be_Aspekta-300.woff2') format('woff2');
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}

/* Aspekta Regular */
@font-face {
  font-family: 'Aspekta';
  src: url('https://cdn.prod.website-files.com/68ad7ea636513871784163e4/68ad7ea636513871784164c2_Aspekta-400.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

/* Aspekta Medium */
@font-face {
  font-family: 'Aspekta';
  src: url('https://cdn.prod.website-files.com/68ad7ea636513871784163e4/68ad7ea636513871784164c3_Aspekta-500.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

/* Aspekta SemiBold */
@font-face {
  font-family: 'Aspekta';
  src: url('https://cdn.prod.website-files.com/68ad7ea636513871784163e4/68ad7ea636513871784164c0_Aspekta-600.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

/* Aspekta Bold */
@font-face {
  font-family: 'Aspekta';
  src: url('https://cdn.prod.website-files.com/68ad7ea636513871784163e4/68ad7ea636513871784164bf_Aspekta-700.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

## Migration Checklist

- [ ] Update font-family declarations in theme configuration
- [ ] Add Aspekta @font-face declarations to HTML or CSS
- [ ] Update font-weight values if using new weights (200, 600)
- [ ] Remove old Typekit/Adobe Fonts references
- [ ] Test typography rendering on all pages
- [ ] Verify font loading in browser DevTools
- [ ] Test on mobile devices
- [ ] Check accessibility (contrast, readability)
- [ ] Update documentation if needed
- [ ] Deploy and verify in production

## Common Issues & Solutions

### Issue: Fonts not loading
**Solution:** Check browser DevTools Network tab to verify font files are loading from CDN. Ensure @font-face declarations are in `<head>` or loaded CSS.

### Issue: Wrong font weight displaying
**Solution:** Verify you're using the correct weight value (200-700). Check that the specific weight's @font-face is declared.

### Issue: Fallback font showing
**Solution:** Font files may be blocked by CORS or ad blockers. Check console for errors. Ensure font-display: swap is set.

### Issue: Typography looks different
**Solution:** Aspekta has different metrics than Azo Sans Web. You may need to adjust line-heights or letter-spacing slightly.

## Testing Your Migration

### Visual Check
1. Open your app in browser
2. Use DevTools to inspect text elements
3. Verify "Aspekta" appears in computed font-family
4. Check all font weights render correctly

### Network Check
1. Open DevTools Network tab
2. Filter by "font" or "woff2"
3. Verify 6 Aspekta font files load successfully
4. Check file sizes are reasonable (~20-40KB each)

### Cross-Browser Check
Test in:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (macOS/iOS)
- ✅ Mobile browsers

### Accessibility Check
- ✅ Text remains readable at all sizes
- ✅ Contrast ratios maintained (WCAG AA)
- ✅ Font renders clearly on different displays
- ✅ No layout shifts during font loading

## Performance Considerations

### Before (Azo Sans Web)
- External service dependency
- 3 font weights
- Typekit JavaScript overhead
- Potential FOUT (Flash of Unstyled Text)

### After (Aspekta)
- Direct CDN loading
- 6 font weights (but only load what you need)
- No JavaScript overhead
- font-display: swap for better UX

### Optimization Tips
1. **Only load weights you use** - Remove unused @font-face declarations
2. **Preload critical fonts** - Add `<link rel="preload">` for main weight
3. **Use font-display: swap** - Already set in declarations
4. **Consider subsetting** - If you only need Latin characters

## Need Help?

- 📖 See `brand-guide.md` for typography guidelines
- 🎨 Check `example-app/` for live examples
- 📝 Read `BRAND-UPDATE-SUMMARY.md` for overview
- 🔍 Review `QUICK-REFERENCE.md` for quick lookups

## Example Migration

Here's a complete before/after example:

### Before: Old Setup
```typescript
// theme.ts
import { createMuiTheme } from '@material-ui/core/styles';

export const theme = createMuiTheme({
  typography: {
    fontFamily: ['azo-sans-web', 'Montserrat', 'Arial', 'sans-serif'].join(','),
    h1: { fontWeight: 500 },
    body1: { fontWeight: 400 }
  }
});
```

```html
<!-- index.html -->
<head>
  <link rel="stylesheet" href="https://use.typekit.net/..." />
</head>
```

### After: New Setup
```typescript
// theme.ts
import { createMuiTheme } from '@material-ui/core/styles';

export const theme = createMuiTheme({
  typography: {
    fontFamily: ['Aspekta', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'].join(','),
    h1: { fontWeight: 600 },
    body1: { fontWeight: 400 }
  }
});
```

```html
<!-- index.html -->
<head>
  <style>
    @font-face {
      font-family: 'Aspekta';
      src: url('https://cdn.prod.website-files.com/68ad7ea636513871784163e4/68ad7ea636513871784164c2_Aspekta-400.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Aspekta';
      src: url('https://cdn.prod.website-files.com/68ad7ea636513871784163e4/68ad7ea636513871784164c0_Aspekta-600.woff2') format('woff2');
      font-weight: 600;
      font-style: normal;
      font-display: swap;
    }
  </style>
</head>
```

---

**Migration Time:** ~15-30 minutes
**Difficulty:** Easy
**Breaking Changes:** None (if using same weights)
**Recommended:** Yes - aligns with official Kaluza branding
