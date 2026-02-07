# Basic Setup Examples

Quick start guides for integrating the Kaluza theme into your project.

## React + Material-UI Setup

### 1. Install Dependencies

```bash
npm install @material-ui/core @material-ui/styles
# or
yarn add @material-ui/core @material-ui/styles
```

### 2. Copy Theme Files

Copy the `theme-config` folder into your project:
```
src/
  theme/
    colors.ts
    typography.ts
    layout.ts
    theme.ts
```

### 3. Create Theme Provider

```tsx
// src/theme/ThemeProvider.tsx
import React from 'react';
import { ThemeProvider as MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { muiThemeOptions } from './theme';

const theme = createMuiTheme(muiThemeOptions);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
```

### 4. Wrap Your App

```tsx
// src/App.tsx
import React from 'react';
import { ThemeProvider } from './theme/ThemeProvider';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}

export default App;
```

### 5. Use Theme in Components

```tsx
// src/components/MyComponent.tsx
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius
  },
  title: {
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(2)
  }
}));

export const MyComponent: React.FC = () => {
  const classes = useStyles();
  
  return (
    <div className={classes.container}>
      <Typography variant="h4" className={classes.title}>
        Welcome to Kaluza
      </Typography>
      <Button variant="contained" color="primary">
        Get Started
      </Button>
    </div>
  );
};
```

## Plain CSS/SCSS Setup

### 1. Copy SCSS Variables

Create a variables file:

```scss
// src/styles/_variables.scss

// Colors
$white: #FFFFFF;
$black: #10100F;

// Spindle (Blues)
$spindle-500: #598BD8;

// Envy (Greens)
$envy-50: #F4F6F3;
$envy-100: #E5EAE1;
$envy-500: #5A7554;

// Wafer (Pinks)
$wafer-500: #BE8A75;

// Legacy
$cherry: #FF4E4E;
$avocado: #4FD061;
$lemon: #FFEA4F;

// Spacing
$spacing-unit: 8px;

// Breakpoints
$breakpoint-sm: 480px;
$breakpoint-md: 768px;
$breakpoint-lg: 1280px;
$breakpoint-xl: 1920px;
```

### 2. Create Base Styles

```scss
// src/styles/base.scss
@import 'variables';

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'azo-sans-web', 'Montserrat', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: $black;
  background-color: $white;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1 { font-size: 2rem; }
h2 { font-size: 1.8125rem; }
h3 { font-size: 1.5625rem; }
h4 { font-size: 1.375rem; }
h5 { font-size: 1.25rem; }
h6 { font-size: 1.125rem; }
```

### 3. Import in Your App

```scss
// src/styles/main.scss
@import 'variables';
@import 'base';
@import 'components/button';
@import 'components/card';
```

## Styled Components Setup

### 1. Install Dependencies

```bash
npm install styled-components
npm install --save-dev @types/styled-components
```

### 2. Create Theme Provider

```tsx
// src/theme/StyledThemeProvider.tsx
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { kaluzaTheme } from './theme';

export const StyledThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ThemeProvider theme={kaluzaTheme}>{children}</ThemeProvider>;
};
```

### 3. Create Styled Components

```tsx
// src/components/Button.tsx
import styled from 'styled-components';

export const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: ${props => props.theme.spacing.fn(1)}px ${props => props.theme.spacing.fn(2)}px;
  font-family: ${props => props.theme.typography.fontFamily};
  font-size: ${props => props.theme.typography.sizes.x05};
  font-weight: ${props => props.theme.typography.weights.Regular};
  border-radius: ${props => props.theme.borderRadius.pill};
  border: none;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.09rem;
  transition: all ${props => props.theme.transitions.duration.base};
  
  background-color: ${props => 
    props.variant === 'secondary' 
      ? props.theme.colors.waferColors[500]
      : props.theme.colors.envyColors[500]
  };
  
  color: ${props => props.theme.colors.additionalColors.white};
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;
```

## Tailwind CSS Setup

### 1. Install Tailwind

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Configure Tailwind

```js
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Spindle (Blues)
        spindle: {
          50: '#F2F6FC',
          500: '#598BD8',
          950: '#212A4A',
        },
        // Envy (Greens)
        envy: {
          50: '#F4F6F3',
          100: '#E5EAE1',
          500: '#5A7554',
          950: '#141B13',
        },
        // Wafer (Pinks)
        wafer: {
          50: '#FBF7F5',
          500: '#BE8A75',
          950: '#34221B',
        },
        // Utility colors
        cherry: '#FF4E4E',
        avocado: '#4FD061',
        lemon: '#FFEA4F',
      },
      fontFamily: {
        sans: ['azo-sans-web', 'Montserrat', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'x01': '0.625rem',
        'x02': '0.6875rem',
        'x03': '0.75rem',
        'x04': '0.875rem',
        'x05': '1rem',
        'x06': '1.125rem',
        'x07': '1.25rem',
        'x08': '1.375rem',
        'x09': '1.5625rem',
        'x10': '1.8125rem',
        'x11': '2rem',
      },
      spacing: {
        '1': '8px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
      },
      screens: {
        'sm': '480px',
        'md': '768px',
        'lg': '1280px',
        'xl': '1920px',
      },
    },
  },
  plugins: [],
}
```

### 3. Use in Components

```tsx
export const MyComponent = () => {
  return (
    <div className="p-3 bg-envy-50 rounded-lg">
      <h1 className="text-x10 font-medium text-black mb-2">
        Welcome to Kaluza
      </h1>
      <button className="px-2 py-1 bg-envy-500 text-white rounded-full uppercase">
        Get Started
      </button>
    </div>
  );
};
```

## Next Steps

1. Review the [Component Patterns](../component-patterns.md) for common UI patterns
2. Check the [Style System](../style-system.md) for layout utilities
3. Explore the [Brand Guide](../brand-guide.md) for design principles
4. See [Component Examples](./component-examples.md) for ready-to-use components
