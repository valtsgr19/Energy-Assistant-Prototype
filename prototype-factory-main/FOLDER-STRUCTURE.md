# Prototype Factory - Folder Structure

Complete overview of all files and their purposes.

```
prototype-factory/
│
├── README.md                      # Main documentation and quick start guide
├── QUICK-REFERENCE.md             # Fast lookup for common values
├── COLOR-PALETTE.md               # Visual color reference with accessibility
├── PROTOTYPE-CHECKLIST.md         # Complete setup checklist
├── FOLDER-STRUCTURE.md            # This file
│
├── 📘 Core Documentation
│   ├── brand-guide.md             # Brand identity, colors, typography
│   ├── component-patterns.md      # Reusable component patterns
│   └── style-system.md            # Grid, animations, utilities
│
├── 🎨 theme-config/               # Ready-to-use theme files
│   ├── index.ts                   # Main export (import from here)
│   ├── colors.ts                  # Complete color system
│   ├── typography.ts              # Font definitions and scales
│   ├── layout.ts                  # Spacing, breakpoints, layout
│   ├── theme.ts                   # Combined theme configuration
│   └── utilities.scss             # CSS utility classes
│
└── 📦 examples/                   # Sample implementations
    ├── basic-setup.md             # Setup guides for different frameworks
    └── component-examples.tsx     # Ready-to-use React components
```

## File Purposes

### Documentation Files

#### README.md
- Main entry point for the library
- Quick start instructions
- Overview of all resources
- Links to all documentation

#### QUICK-REFERENCE.md
- Fast lookup for developers
- Common colors, sizes, patterns
- CSS classes and utilities
- Import patterns
- Common mistakes to avoid

#### COLOR-PALETTE.md
- Visual representation of all colors
- Color families with all shades
- Accessibility guidelines
- Color combinations
- Usage recommendations
- Quick copy snippets

#### PROTOTYPE-CHECKLIST.md
- Step-by-step setup guide
- Component checklist
- Accessibility checklist
- Testing checklist
- Pre-launch checklist
- Common pitfalls

#### FOLDER-STRUCTURE.md (this file)
- Complete folder overview
- File purposes
- Usage workflows

### Core Guides

#### brand-guide.md
**What it contains:**
- Complete color palette (4 families × 11 shades)
- Typography system (fonts, sizes, weights)
- Spacing system (8px base unit)
- Breakpoints (mobile, tablet, desktop)
- Design principles
- Usage guidelines
- Accessibility standards

**When to use:**
- Starting a new project
- Understanding the brand
- Making design decisions
- Ensuring consistency

#### component-patterns.md
**What it contains:**
- Component architecture
- Core components (Button, Card, Form, etc.)
- Layout components (Header, Sidebar, etc.)
- Data display components (Table, List, etc.)
- Component composition patterns
- Styling patterns
- Best practices

**When to use:**
- Building new components
- Understanding component structure
- Looking for implementation patterns
- Ensuring consistency

#### style-system.md
**What it contains:**
- Grid system (12-column flexible grid)
- Responsive utilities
- Animations and keyframes
- SCSS variables
- Utility classes
- Layout patterns
- Media query mixins
- Best practices

**When to use:**
- Creating layouts
- Adding animations
- Using utility classes
- Building responsive designs

### Theme Configuration

#### theme-config/index.ts
**Purpose:** Main export file for all theme modules
**Usage:**
```typescript
import { kaluzaTheme, kaluzaColors, SizeVariation } from './theme';
```

#### theme-config/colors.ts
**Purpose:** Complete color system
**Contains:**
- Spindle colors (Blues)
- Envy colors (Greens)
- Merino colors (Browns)
- Wafer colors (Pinks)
- Legacy utility colors
- Semantic color roles

#### theme-config/typography.ts
**Purpose:** Font system
**Contains:**
- Font face definitions (Azo Sans Web)
- Font size scale (x01-x11)
- Font weights (Light, Regular, Medium, Bold)
- Typography hierarchy
- Line heights and letter spacing

#### theme-config/layout.ts
**Purpose:** Layout system
**Contains:**
- Spacing function (8px base)
- Breakpoints (480, 768, 1280, 1920)
- Media query helpers
- Container max widths
- Z-index scale
- Border radius scale
- Box shadow scale
- Transition utilities

#### theme-config/theme.ts
**Purpose:** Combined theme configuration
**Contains:**
- Complete theme object
- Material-UI theme options
- All theme modules combined
- Ready for theme provider

#### theme-config/utilities.scss
**Purpose:** CSS utility classes
**Contains:**
- Spacing utilities (margin, padding)
- Display utilities (flex, grid, block)
- Flexbox utilities
- Text utilities
- Color utilities
- Border utilities
- Shadow utilities
- Position utilities
- Sizing utilities
- Responsive utilities
- Animation utilities
- Accessibility utilities

### Examples

#### examples/basic-setup.md
**Purpose:** Framework-specific setup guides
**Contains:**
- React + Material-UI setup
- Plain CSS/SCSS setup
- Styled Components setup
- Tailwind CSS setup
- Step-by-step instructions
- Code examples

#### examples/component-examples.tsx
**Purpose:** Ready-to-use React components
**Contains:**
- Button component
- Card component
- Form component
- Header component
- Sidebar component
- Dashboard layout
- Stat card component
- Alert component
- Complete example app

## Usage Workflows

### Starting a New Project

1. Read `README.md` for overview
2. Follow `PROTOTYPE-CHECKLIST.md` step by step
3. Copy `theme-config/` to your project
4. Choose setup from `examples/basic-setup.md`
5. Reference `brand-guide.md` for design decisions
6. Use `component-patterns.md` for building components
7. Keep `QUICK-REFERENCE.md` open while coding

### Building Components

1. Check `component-patterns.md` for similar patterns
2. Look at `examples/component-examples.tsx` for examples
3. Use theme values from `theme-config/`
4. Apply utilities from `utilities.scss`
5. Reference `QUICK-REFERENCE.md` for values

### Styling and Layout

1. Use grid system from `style-system.md`
2. Apply utility classes from `utilities.scss`
3. Reference `QUICK-REFERENCE.md` for spacing
4. Check `COLOR-PALETTE.md` for colors
5. Use responsive breakpoints from `layout.ts`

### Ensuring Quality

1. Follow `PROTOTYPE-CHECKLIST.md` for completeness
2. Check `COLOR-PALETTE.md` for accessibility
3. Test responsive design per `style-system.md`
4. Verify consistency with `brand-guide.md`
5. Review best practices in `component-patterns.md`

## Import Patterns

### TypeScript/JavaScript
```typescript
// Import entire theme
import { kaluzaTheme } from './theme-config';

// Import specific modules
import { kaluzaColors } from './theme-config/colors';
import { SizeVariation, FontWeight } from './theme-config/typography';
import { Breakpoint, spacing } from './theme-config/layout';

// Import from index (recommended)
import { 
  kaluzaTheme, 
  kaluzaColors, 
  SizeVariation, 
  Breakpoint 
} from './theme-config';
```

### SCSS
```scss
// Import utilities
@import './theme-config/utilities';

// Use in your styles
.my-component {
  @extend .p-2;
  @extend .mb-3;
  @extend .d-flex;
}
```

## File Sizes

Approximate file sizes for reference:

```
Documentation:
- README.md                 ~4 KB
- brand-guide.md           ~8 KB
- component-patterns.md    ~12 KB
- style-system.md          ~10 KB
- QUICK-REFERENCE.md       ~6 KB
- COLOR-PALETTE.md         ~8 KB
- PROTOTYPE-CHECKLIST.md   ~8 KB

Theme Config:
- colors.ts                ~3 KB
- typography.ts            ~4 KB
- layout.ts                ~2 KB
- theme.ts                 ~3 KB
- utilities.scss           ~8 KB
- index.ts                 ~1 KB

Examples:
- basic-setup.md           ~8 KB
- component-examples.tsx   ~10 KB

Total: ~95 KB (text files only)
```

## Maintenance

### Adding New Components
1. Add pattern to `component-patterns.md`
2. Add example to `examples/component-examples.tsx`
3. Update `QUICK-REFERENCE.md` if needed
4. Document in relevant guide

### Adding New Colors
1. Add to `theme-config/colors.ts`
2. Document in `brand-guide.md`
3. Add to `COLOR-PALETTE.md`
4. Update `QUICK-REFERENCE.md`

### Adding New Utilities
1. Add to `theme-config/utilities.scss`
2. Document in `style-system.md`
3. Add example to `QUICK-REFERENCE.md`

### Updating Documentation
1. Keep all guides in sync
2. Update examples when patterns change
3. Maintain consistency across files
4. Test all code examples

## Tips

- **Bookmark** `QUICK-REFERENCE.md` for fast lookups
- **Print** `COLOR-PALETTE.md` for design reference
- **Follow** `PROTOTYPE-CHECKLIST.md` for every project
- **Copy** from `component-examples.tsx` to save time
- **Reference** `brand-guide.md` for design decisions
