# Prototype Checklist

Use this checklist when starting a new prototype project with the Kaluza design system.

## Initial Setup

### 1. Project Foundation
- [ ] Create new project (React, Next.js, etc.)
- [ ] Install dependencies (Material-UI, styled-components, or Tailwind)
- [ ] Copy `theme-config/` folder to your project
- [ ] Set up theme provider in your app root
- [ ] Add font imports (Azo Sans Web, Montserrat)

### 2. File Structure
```
src/
  ├── theme/
  │   ├── colors.ts
  │   ├── typography.ts
  │   ├── layout.ts
  │   └── theme.ts
  ├── components/
  │   ├── Button/
  │   ├── Card/
  │   └── ...
  ├── pages/
  │   └── Dashboard/
  └── styles/
      ├── _variables.scss
      └── base.scss
```

### 3. Base Styles
- [ ] Import theme in root component
- [ ] Set up global styles (normalize, fonts, base)
- [ ] Configure responsive breakpoints
- [ ] Add CSS reset/normalize

## Design System Integration

### Colors
- [ ] Import color palette from theme
- [ ] Use semantic color roles (primary, error, success, etc.)
- [ ] Test color contrast for accessibility (WCAG AA)
- [ ] Avoid hardcoded color values

### Typography
- [ ] Set up font loading (Azo Sans Web)
- [ ] Configure fallback fonts (Montserrat, Arial)
- [ ] Use typography scale (x01-x11)
- [ ] Apply proper heading hierarchy (h1-h6)
- [ ] Set line heights and letter spacing

### Spacing
- [ ] Use 8px spacing unit consistently
- [ ] Apply spacing function for margins/padding
- [ ] Maintain consistent gaps in layouts
- [ ] Use spacing scale (1x, 2x, 3x, 4x, 5x)

### Layout
- [ ] Set up grid system (12-column or custom)
- [ ] Configure responsive breakpoints
- [ ] Test mobile, tablet, and desktop views
- [ ] Implement mobile-first approach

## Component Development

### Core Components
- [ ] Button (contained, outlined variants)
- [ ] Card (with header, content, actions)
- [ ] Form inputs (text, select, checkbox, radio)
- [ ] Typography components (PageTitle, Subtitle, BodyText)
- [ ] Alert/notification components

### Layout Components
- [ ] Header/AppBar
- [ ] Sidebar/Drawer
- [ ] Container/Wrapper
- [ ] Grid/Flex layouts
- [ ] Footer

### Navigation
- [ ] Navigation menu
- [ ] Breadcrumbs
- [ ] Tabs
- [ ] Links

### Feedback
- [ ] Loading spinner
- [ ] Skeleton loaders
- [ ] Progress indicators
- [ ] Toast notifications
- [ ] Error states

## Responsive Design

### Breakpoints
- [ ] Small (480px) - Mobile landscape
- [ ] Medium (768px) - Tablet
- [ ] Large (1280px) - Desktop
- [ ] XLarge (1920px) - Large desktop

### Testing
- [ ] Test on mobile devices (320px-480px)
- [ ] Test on tablets (768px-1024px)
- [ ] Test on desktop (1280px+)
- [ ] Test on large screens (1920px+)
- [ ] Verify touch targets (44x44px minimum)

## Accessibility

### WCAG Compliance
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] All interactive elements are keyboard accessible
- [ ] Focus states are visible
- [ ] ARIA labels on interactive elements
- [ ] Alt text on images
- [ ] Semantic HTML structure

### Testing
- [ ] Test with keyboard navigation only
- [ ] Test with screen reader
- [ ] Verify focus order is logical
- [ ] Check color blindness compatibility
- [ ] Test with reduced motion preference

## Performance

### Optimization
- [ ] Lazy load components where appropriate
- [ ] Optimize images (WebP, proper sizing)
- [ ] Minimize bundle size
- [ ] Use React.memo for expensive components
- [ ] Implement code splitting

### Loading States
- [ ] Show loading indicators
- [ ] Implement skeleton screens
- [ ] Handle error states gracefully
- [ ] Provide empty states

## Documentation

### Code Documentation
- [ ] Add JSDoc comments to components
- [ ] Document prop types with TypeScript
- [ ] Include usage examples
- [ ] Document any custom hooks

### Project Documentation
- [ ] README with setup instructions
- [ ] Component library documentation
- [ ] Design system guidelines
- [ ] Deployment instructions

## Quality Assurance

### Code Quality
- [ ] ESLint configured and passing
- [ ] Prettier for code formatting
- [ ] TypeScript strict mode enabled
- [ ] No console errors or warnings

### Testing
- [ ] Unit tests for utilities
- [ ] Component tests for key components
- [ ] Integration tests for critical flows
- [ ] Visual regression tests (optional)

### Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Pre-Launch

### Final Checks
- [ ] All pages are responsive
- [ ] All links work correctly
- [ ] Forms validate properly
- [ ] Error handling is in place
- [ ] Loading states are implemented
- [ ] Accessibility audit passed
- [ ] Performance metrics are acceptable
- [ ] Cross-browser testing completed

### Deployment
- [ ] Environment variables configured
- [ ] Build process tested
- [ ] Deployment pipeline set up
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics configured (optional)

## Post-Launch

### Monitoring
- [ ] Monitor error rates
- [ ] Track performance metrics
- [ ] Gather user feedback
- [ ] Plan iterations based on feedback

### Maintenance
- [ ] Keep dependencies updated
- [ ] Address security vulnerabilities
- [ ] Refactor based on learnings
- [ ] Document known issues

## Quick Start Commands

```bash
# Create new React app
npx create-react-app my-prototype --template typescript

# Install Material-UI
npm install @material-ui/core @material-ui/icons

# Install styled-components
npm install styled-components

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Resources

- [Brand Guide](./brand-guide.md) - Colors, typography, design principles
- [Component Patterns](./component-patterns.md) - Reusable component patterns
- [Style System](./style-system.md) - Grid, animations, utilities
- [Quick Reference](./QUICK-REFERENCE.md) - Fast lookup for common values
- [Basic Setup](./examples/basic-setup.md) - Setup guides for different frameworks
- [Component Examples](./examples/component-examples.tsx) - Ready-to-use components

## Tips for Success

1. **Start Simple**: Begin with basic components and build up
2. **Stay Consistent**: Use the design system values consistently
3. **Mobile First**: Design for mobile, then enhance for desktop
4. **Accessibility First**: Build accessibility in from the start
5. **Iterate Quickly**: Prototype fast, gather feedback, improve
6. **Document as You Go**: Keep documentation up to date
7. **Test Early**: Test on real devices early and often
8. **Ask for Feedback**: Get design and UX feedback regularly

## Common Pitfalls to Avoid

- ❌ Hardcoding colors instead of using theme values
- ❌ Inconsistent spacing (not using 8px multiples)
- ❌ Skipping mobile testing until the end
- ❌ Forgetting accessibility considerations
- ❌ Not handling loading and error states
- ❌ Overcomplicating the initial prototype
- ❌ Not documenting component usage
- ❌ Ignoring performance from the start
