# Kaluza Component Showcase

A mobile-friendly web app that demonstrates all Kaluza design system components.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

The app will open at `http://localhost:3000`

## Features

- 📱 Mobile-first responsive design
- 🎨 All Kaluza components showcased
- 🎯 Interactive examples
- 📊 Live component demos
- 🌈 Color palette viewer
- 📝 Typography samples
- 🔧 Form controls
- 📋 Data display components
- 🔔 Feedback components
- 🧭 Navigation examples

## Structure

```
example-app/
├── public/
│   └── index.html
├── src/
│   ├── theme/              # Kaluza theme configuration
│   ├── components/         # Showcase components
│   ├── pages/             # Page components
│   ├── App.tsx            # Main app component
│   └── index.tsx          # Entry point
├── package.json
└── README.md
```

## Pages

1. **Home** - Overview and introduction
2. **Colors** - Complete color palette with accessibility info
3. **Typography** - Font samples and hierarchy
4. **Buttons** - All button variants and states
5. **Forms** - Input fields, selects, checkboxes, etc.
6. **Cards** - Card layouts and variations
7. **Tables** - Data tables with sorting and pagination
8. **Feedback** - Alerts, spinners, progress indicators
9. **Navigation** - Headers, sidebars, breadcrumbs
10. **Layout** - Grid system and spacing examples

## Mobile Testing

The app is optimized for:
- Mobile phones (320px - 480px)
- Tablets (768px - 1024px)
- Desktop (1280px+)

Test on different devices or use browser DevTools device emulation.

## Customization

To customize the theme, edit files in `src/theme/`:
- `colors.ts` - Color palette
- `typography.ts` - Font settings
- `layout.ts` - Spacing and breakpoints
- `theme.ts` - Combined theme

## Deployment

Build the app for production:

```bash
npm run build
```

The optimized files will be in the `build/` directory.

Deploy to:
- Netlify: Drag and drop the `build` folder
- Vercel: Connect your Git repository
- GitHub Pages: Use `gh-pages` package
- Any static hosting service

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)
