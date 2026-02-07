# Prototype Factory

A reference library for building prototypes based on the Kaluza brand system. This folder contains reusable brand guidelines, component patterns, and styling systems extracted from the monet-supplier-ui project (aka "Kaluza Control Room").
Intent (for now) is for users to be able to reference and contribute to this repository to build apps locally, rather than to have them be deployed as production apps. The latter can be considered as the community matures.
All files mostly generated through prompts via AWS Kiro.

## 📚 Documentation

### Core Guides
- **[brand-guide.md](./brand-guide.md)** - Complete brand identity including color palettes, typography, and design principles
- **[component-patterns.md](./component-patterns.md)** - Reusable component patterns and implementation guidelines
- **[style-system.md](./style-system.md)** - CSS/SCSS styling system including grid, animations, and utilities

### Quick References
- **[QUICK-REFERENCE.md](./QUICK-REFERENCE.md)** - Fast lookup for common values and patterns
- **[COLOR-PALETTE.md](./COLOR-PALETTE.md)** - Visual color palette reference with accessibility guidelines
- **[PROTOTYPE-CHECKLIST.md](./PROTOTYPE-CHECKLIST.md)** - Complete checklist for starting new prototypes

### Theme Configuration
- **theme-config/** - Ready-to-use theme configuration files
  - `colors.ts` - Complete color system
  - `typography.ts` - Font definitions and scales
  - `layout.ts` - Spacing, breakpoints, and layout utilities
  - `theme.ts` - Combined theme configuration
  - `utilities.scss` - Ready-to-use CSS utility classes
  - `index.ts` - Main export file

### Examples
- **examples/** - Sample implementations and usage examples
  - `basic-setup.md` - Setup guides for React, SCSS, Styled Components, and Tailwind
  - `component-examples.tsx` - Ready-to-use component implementations
- **example-app/** - 🎨 **Complete mobile-friendly showcase app**
  - Full React app demonstrating all components
  - 10 interactive pages with live examples
  - Mobile-responsive design
  - Ready to run with `npm install && npm start`
  - See [example-app/INSTALLATION.md](./example-app/INSTALLATION.md) for setup

## 🚀 Quick Start

### Try the Live Example App

The fastest way to see all components in action:

```bash
cd prototype-factory/example-app
npm install
npm start
```

Opens at `http://localhost:3000` with a complete mobile-friendly showcase of all components.

See [example-app/INSTALLATION.md](./example-app/INSTALLATION.md) for detailed setup instructions.

### For New Projects

1. **Copy the theme files** to your project:
   ```bash
   cp -r prototype-factory/theme-config your-project/src/theme
   ```

2. **Choose your setup approach**:
   - React + Material-UI → See [examples/basic-setup.md](./examples/basic-setup.md#react--material-ui-setup)
   - Plain CSS/SCSS → See [examples/basic-setup.md](./examples/basic-setup.md#plain-cssscss-setup)
   - Styled Components → See [examples/basic-setup.md](./examples/basic-setup.md#styled-components-setup)
   - Tailwind CSS → See [examples/basic-setup.md](./examples/basic-setup.md#tailwind-css-setup)

3. **Review the checklist**: Follow [PROTOTYPE-CHECKLIST.md](./PROTOTYPE-CHECKLIST.md) for a complete setup guide

4. **Start building**: Use [component-patterns.md](./component-patterns.md) and [component-examples.tsx](./examples/component-examples.tsx) as references

### For Quick Prototyping

1. Open [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) for fast value lookups
2. Check [COLOR-PALETTE.md](./COLOR-PALETTE.md) for color combinations
3. Copy components from [component-examples.tsx](./examples/component-examples.tsx)
4. Use utility classes from `theme-config/utilities.scss`

## 🎨 Brand Overview

**Kaluza** uses a nature-inspired color palette with four main color families:
- **Spindle** (Blues) - Primary brand color (#598BD8)
- **Envy** (Greens) - Primary UI color (#5A7554)
- **Merino** (Browns/Tans) - Neutral tones (#AA8365)
- **Wafer** (Pinks/Roses) - Secondary accents (#BE8A75)

**Typography**: Aspekta (ExtraLight 200, Light 300, Regular 400, Medium 500, SemiBold 600, Bold 700) with system font fallbacks

**Design System**: Material-UI based with custom Kaluza theme extensions

**Spacing**: 8px base unit (8, 16, 24, 32, 40...)

**Breakpoints**: 480px (mobile), 768px (tablet), 1280px (desktop), 1920px (large)

## 📖 How to Use This Library

### Learning the System
1. Start with [brand-guide.md](./brand-guide.md) to understand the design principles
2. Review [COLOR-PALETTE.md](./COLOR-PALETTE.md) for color usage and accessibility
3. Study [component-patterns.md](./component-patterns.md) for common UI patterns
4. Check [style-system.md](./style-system.md) for layout and utilities

### Building a Prototype
1. Follow [PROTOTYPE-CHECKLIST.md](./PROTOTYPE-CHECKLIST.md) step by step
2. Copy theme files from `theme-config/` to your project
3. Use [component-examples.tsx](./examples/component-examples.tsx) as starting points
4. Reference [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) while coding

### Maintaining Consistency
- Always use theme values instead of hardcoded colors
- Follow the 8px spacing scale
- Use semantic color roles (primary, error, success)
- Test accessibility with WCAG AA standards
- Keep components responsive with mobile-first approach

## 🛠️ What's Included

### Theme System
- Complete color palette (4 families × 11 shades each)
- Typography scale (11 sizes, 4 weights)
- Spacing system (8px base unit)
- Responsive breakpoints
- Border radius, shadows, transitions
- Z-index scale

### Components
- Buttons (contained, outlined, text)
- Forms (inputs, selects, checkboxes, radios)
- Cards and panels
- Navigation (header, sidebar, breadcrumbs)
- Feedback (alerts, spinners, skeletons)
- Data display (tables, lists, avatars)
- Layout (grid, flex utilities)

### Utilities
- Spacing classes (margin, padding)
- Display utilities (flex, grid, block)
- Text utilities (alignment, transform, weight)
- Color utilities (text, background)
- Border and shadow utilities
- Responsive visibility classes

## 💡 Tips for Success

1. **Start Simple**: Begin with basic components and build up
2. **Stay Consistent**: Use the design system values consistently
3. **Mobile First**: Design for mobile, then enhance for desktop
4. **Accessibility First**: Build accessibility in from the start
5. **Iterate Quickly**: Prototype fast, gather feedback, improve

## 📝 Contributing

When adding new patterns or components to this library:
1. Follow existing naming conventions
2. Document all props and usage examples
3. Ensure accessibility compliance
4. Test on multiple screen sizes
5. Update relevant documentation files

## 🔗 Related Resources

- Original project: `monet-supplier-ui-main/`
- Material-UI docs: https://material-ui.com/
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- CSS Grid Guide: https://css-tricks.com/snippets/css/complete-guide-grid/
# prototype-factory
