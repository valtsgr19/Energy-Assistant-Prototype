# Style System

CSS/SCSS styling system for consistent layouts, animations, and utilities.

## Grid System

A flexible CSS Grid-based layout system (based on rsms.me/raster).

### Basic Usage

```html
<div class="grid" data-columns="12">
  <div class="c" data-span="6">Half width</div>
  <div class="c" data-span="6">Half width</div>
</div>
```

### Grid Attributes

#### data-columns
Defines the number of columns in the grid (1-12):
```html
<div class="grid" data-columns="12">...</div>
<div class="grid" data-columns="6">...</div>
<div class="grid" data-columns="3">...</div>
```

#### data-span
Defines how many columns a cell spans:
```html
<!-- Span 4 columns -->
<div class="c" data-span="4">...</div>

<!-- Start at column 2, span 4 columns -->
<div class="c" data-span="2+4">...</div>

<!-- Start at column 1, end at column 6 -->
<div class="c" data-span="1-6">...</div>

<!-- Full row -->
<div class="c" data-span="row">...</div>
```

### Responsive Grid

#### Small screens (≤850px)
Use `data-columns-s` and `data-span-s`:
```html
<div class="grid" data-columns="12" data-columns-s="6">
  <div class="c" data-span="3" data-span-s="6">
    <!-- 3 columns on desktop, 6 on mobile -->
  </div>
</div>
```

#### Large screens (≥1600px)
Use `data-columns-l` and `data-span-l`:
```html
<div class="grid" data-columns="12" data-columns-l="16">
  <div class="c" data-span="6" data-span-l="8">
    <!-- 6 columns normally, 8 on large screens -->
  </div>
</div>
```

### Grid Examples

#### Two Column Layout
```html
<div class="grid" data-columns="2">
  <div class="c" data-span="1">Left</div>
  <div class="c" data-span="1">Right</div>
</div>
```

#### Sidebar Layout
```html
<div class="grid" data-columns="12">
  <aside class="c" data-span="3">Sidebar</aside>
  <main class="c" data-span="9">Main content</main>
</div>
```

#### Responsive Card Grid
```html
<div class="grid" data-columns="12" data-columns-s="6">
  <div class="c" data-span="4" data-span-s="6">Card 1</div>
  <div class="c" data-span="4" data-span-s="6">Card 2</div>
  <div class="c" data-span="4" data-span-s="6">Card 3</div>
</div>
```

#### Dashboard Layout
```html
<div class="grid" data-columns="12" data-columns-s="6">
  <!-- Header spans full width -->
  <header class="c" data-span="row">Header</header>
  
  <!-- Main content area -->
  <main class="c" data-span="9" data-span-s="row">
    Main Dashboard
  </main>
  
  <!-- Sidebar -->
  <aside class="c" data-span="3" data-span-s="row">
    Sidebar
  </aside>
  
  <!-- Footer spans full width -->
  <footer class="c" data-span="row">Footer</footer>
</div>
```

## Responsive Utilities

### Visibility Classes

```css
.mobile {
  display: none; /* Hidden by default */
}

.desktop {
  display: block; /* Visible by default */
}

/* 501px - 850px: mobile visible */
@media (min-width: 501px) and (max-width: 850px) {
  .mobile { display: block; }
}

/* ≤500px: mobile hidden */
@media (max-width: 500px) {
  .mobile { display: none; }
}
```

**Usage**:
```html
<div class="desktop">Desktop only content</div>
<div class="mobile">Mobile only content (501-850px)</div>
```

## Animations

### Fade In
```scss
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}
```

### Spinner/Loading
```scss
@keyframes lds-dual-ring {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner {
  animation: lds-dual-ring 1.2s linear infinite;
}
```

### Custom Animation Examples

#### Slide In
```scss
@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.slide-in {
  animation: slideIn 0.4s ease-out;
}
```

#### Pulse
```scss
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse {
  animation: pulse 2s ease-in-out infinite;
}
```

## SCSS Variables

### Colors

```scss
// Base colors
$white: #fff;
$black: #10100f;

// Legacy colors
$main-color: rgba(17, 45, 77, 1);
$secondary-color: rgb(88, 213, 248);
$dark: rgba(6, 27, 50, 1);
$action-blue: #58d5f8;
$background: #061b32;
$cherry: #ff4e4e;
$grey: #6d7278;
$lemon: #ffea4f;
$dusk: #112d4d;
$morning: #29425f;

// Spindle (Blues)
$spindle-50: #F2F6FC;
$spindle-500: #598BD8;
$spindle-950: #212A4A;

// Envy (Greens)
$envy-50: #F4F6F3;
$envy-100: #E5EAE1;
$envy-300: #A5B69F;
$envy-500: #5A7554;
$envy-950: #141B13;

// Merino (Browns)
$merino-50: #F9F6F3;
$merino-500: #AA8365;
$merino-950: #2E211C;

// Wafer (Pinks)
$wafer-50: #FBF7F5;
$wafer-500: #BE8A75;
$wafer-950: #34221B;
```

### Usage in SCSS
```scss
.my-component {
  background-color: $envy-50;
  color: $black;
  border: 1px solid $envy-300;
  
  &:hover {
    background-color: $envy-100;
  }
  
  &.error {
    border-color: $cherry;
  }
}
```

## Utility Classes

### Spacing Utilities

```scss
// Margin utilities
.m-0 { margin: 0; }
.m-1 { margin: 8px; }
.m-2 { margin: 16px; }
.m-3 { margin: 24px; }
.m-4 { margin: 32px; }

.mt-1 { margin-top: 8px; }
.mr-1 { margin-right: 8px; }
.mb-1 { margin-bottom: 8px; }
.ml-1 { margin-left: 8px; }

// Padding utilities
.p-0 { padding: 0; }
.p-1 { padding: 8px; }
.p-2 { padding: 16px; }
.p-3 { padding: 24px; }
.p-4 { padding: 32px; }

.pt-1 { padding-top: 8px; }
.pr-1 { padding-right: 8px; }
.pb-1 { padding-bottom: 8px; }
.pl-1 { padding-left: 8px; }
```

### Text Utilities

```scss
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }

.text-uppercase { text-transform: uppercase; }
.text-lowercase { text-transform: lowercase; }
.text-capitalize { text-transform: capitalize; }

.font-light { font-weight: 300; }
.font-regular { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 700; }
```

### Display Utilities

```scss
.d-none { display: none; }
.d-block { display: block; }
.d-inline { display: inline; }
.d-inline-block { display: inline-block; }
.d-flex { display: flex; }
.d-grid { display: grid; }
```

### Flexbox Utilities

```scss
.flex-row { flex-direction: row; }
.flex-column { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }

.justify-start { justify-content: flex-start; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }

.align-start { align-items: flex-start; }
.align-center { align-items: center; }
.align-end { align-items: flex-end; }
.align-stretch { align-items: stretch; }

.flex-1 { flex: 1; }
.flex-auto { flex: auto; }
.flex-none { flex: none; }
```

## Layout Patterns

### Container
```scss
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
  
  @media (min-width: 768px) {
    padding: 0 24px;
  }
  
  @media (min-width: 1280px) {
    padding: 0 32px;
  }
}
```

### Card
```scss
.card {
  background: $white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  
  &-header {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid $envy-100;
  }
  
  &-content {
    margin-bottom: 16px;
  }
  
  &-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
}
```

### Panel
```scss
.panel {
  background: $envy-50;
  border-radius: 4px;
  overflow: hidden;
  
  &-header {
    background: $envy-100;
    padding: 16px 24px;
    border-bottom: 1px solid $envy-200;
  }
  
  &-body {
    padding: 24px;
  }
  
  &-footer {
    background: $envy-100;
    padding: 16px 24px;
    border-top: 1px solid $envy-200;
  }
}
```

### Stack
```scss
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  &-horizontal {
    flex-direction: row;
  }
  
  &-sm { gap: 8px; }
  &-md { gap: 16px; }
  &-lg { gap: 24px; }
  &-xl { gap: 32px; }
}
```

## Media Query Mixins

```scss
// Breakpoints
$breakpoint-sm: 480px;
$breakpoint-md: 768px;
$breakpoint-lg: 1280px;
$breakpoint-xl: 1920px;

// Mixins
@mixin respond-to($breakpoint) {
  @if $breakpoint == 'sm' {
    @media (min-width: $breakpoint-sm) { @content; }
  }
  @else if $breakpoint == 'md' {
    @media (min-width: $breakpoint-md) { @content; }
  }
  @else if $breakpoint == 'lg' {
    @media (min-width: $breakpoint-lg) { @content; }
  }
  @else if $breakpoint == 'xl' {
    @media (min-width: $breakpoint-xl) { @content; }
  }
}

// Usage
.my-component {
  padding: 16px;
  
  @include respond-to('md') {
    padding: 24px;
  }
  
  @include respond-to('lg') {
    padding: 32px;
  }
}
```

## Best Practices

1. **Use the Grid System**: Leverage the grid for all layouts instead of custom CSS
2. **Mobile First**: Design for mobile, then enhance for larger screens
3. **Consistent Spacing**: Use the 8px spacing scale (8, 16, 24, 32, etc.)
4. **SCSS Variables**: Always use variables for colors, never hardcode
5. **Utility Classes**: Use utility classes for simple styling needs
6. **Component Styles**: Create component-specific styles for complex components
7. **Performance**: Minimize animations on mobile devices
8. **Accessibility**: Respect prefers-reduced-motion for animations

```scss
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
