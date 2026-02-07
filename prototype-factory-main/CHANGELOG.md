# Changelog

## [2026-01-28] - Brand Update: Aspekta Font Integration

### Changed
- **Typography System**: Replaced Azo Sans Web with Aspekta as the primary brand font
  - Added 6 font weights: ExtraLight (200), Light (300), Regular (400), Medium (500), SemiBold (600), Bold (700)
  - Updated font stack to use system fonts as fallbacks: `-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif`
  - Font files hosted on Kaluza CDN: `https://cdn.prod.website-files.com/68ad7ea636513871784163e4/`

### Updated Files

#### Theme Configuration
- `theme-config/typography.ts` - Updated font definitions with Aspekta font-face declarations
- `theme-config/index.ts` - Exports updated typography system

#### Documentation
- `brand-guide.md` - Updated typography section with Aspekta font information
- `README.md` - Updated brand overview with new font details
- `QUICK-REFERENCE.md` - Updated typography quick reference
- `example-app/FEATURES.md` - Updated font weight descriptions

#### Example App
- `example-app/public/index.html` - Added Aspekta @font-face declarations for all 6 weights
- `example-app/src/App.tsx` - Updated theme configuration to use Aspekta font family

### Font URLs
All Aspekta font files are loaded from Kaluza's CDN:
- **200 (ExtraLight)**: `68ad7ea636513871784164c1_Aspekta-200.woff2`
- **300 (Light)**: `68ad7ea636513871784164be_Aspekta-300.woff2`
- **400 (Regular)**: `68ad7ea636513871784164c2_Aspekta-400.woff2`
- **500 (Medium)**: `68ad7ea636513871784164c3_Aspekta-500.woff2`
- **600 (SemiBold)**: `68ad7ea636513871784164c0_Aspekta-600.woff2`
- **700 (Bold)**: `68ad7ea636513871784164bf_Aspekta-700.woff2`

### Source
Font information extracted from Kaluza website stylesheets:
- `theme-config/kaluza-website-1.css` - Contains Aspekta font-face declarations
- `theme-config/kaluza-website-3.css` - Webflow utility CSS

### Migration Notes
For existing projects using the old Azo Sans Web font:
1. Update font-family declarations from `'azo-sans-web'` to `'Aspekta'`
2. Add Aspekta @font-face declarations to your HTML or CSS
3. Update font-weight values if using the new ExtraLight (200) or SemiBold (600) weights
4. Test typography rendering across all components

### Backward Compatibility
- Font size scale remains unchanged (11 sizes from 10px to 32px)
- Typography hierarchy unchanged (H1-H6, body, small)
- Spacing and layout systems unaffected
- Color system unchanged

### Testing
- ✅ Example app compiles successfully
- ✅ All font weights load correctly
- ✅ Typography displays properly on all pages
- ✅ Mobile responsiveness maintained
- ✅ Documentation updated consistently

---

## Previous Updates

### [2026-01-23] - Initial Setup
- Created prototype factory reference library
- Extracted brand guidelines from monet-supplier-ui
- Set up theme configuration files
- Created example app with 10 interactive pages
- Added comprehensive documentation
