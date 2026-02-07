# Installation Guide

Complete guide to set up and run the Kaluza Component Showcase.

## Prerequisites

- Node.js 14+ (recommended: 16 or 18)
- npm or yarn package manager

Check your versions:
```bash
node --version
npm --version
```

## Step-by-Step Installation

### 1. Navigate to the Example App Directory

```bash
cd prototype-factory/example-app
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

This will install:
- React 17
- Material-UI 4.12
- TypeScript support
- All required dependencies

### 3. Start the Development Server

Using npm:
```bash
npm start
```

Or using yarn:
```bash
yarn start
```

The app will automatically open in your browser at `http://localhost:3000`

If it doesn't open automatically, manually navigate to:
```
http://localhost:3000
```

### 4. Build for Production (Optional)

To create an optimized production build:

Using npm:
```bash
npm run build
```

Or using yarn:
```bash
yarn build
```

The build files will be in the `build/` directory.

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, you'll be prompted to use a different port. Type `Y` to accept.

Or manually specify a port:
```bash
PORT=3001 npm start
```

### Module Not Found Errors

If you see module errors, try:

1. Delete node_modules and package-lock.json:
```bash
rm -rf node_modules package-lock.json
```

2. Reinstall:
```bash
npm install
```

### TypeScript Errors

If you see TypeScript errors, ensure you have the latest version:
```bash
npm install --save-dev typescript@latest
```

### Clear Cache

If you're experiencing issues, try clearing the cache:
```bash
npm start -- --reset-cache
```

## Mobile Testing

### Using Browser DevTools

1. Open Chrome DevTools (F12 or Cmd+Option+I on Mac)
2. Click the device toolbar icon (or Cmd+Shift+M)
3. Select a device from the dropdown or set custom dimensions

### Using Real Devices

1. Find your computer's local IP address:
   - Mac/Linux: `ifconfig | grep inet`
   - Windows: `ipconfig`

2. Start the dev server:
```bash
npm start
```

3. On your mobile device, navigate to:
```
http://YOUR_IP_ADDRESS:3000
```

Example: `http://192.168.1.100:3000`

## Project Structure

```
example-app/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── pages/              # Page components
│   │   ├── HomePage.tsx
│   │   ├── ColorsPage.tsx
│   │   ├── TypographyPage.tsx
│   │   ├── ButtonsPage.tsx
│   │   ├── FormsPage.tsx
│   │   ├── CardsPage.tsx
│   │   ├── TablesPage.tsx
│   │   ├── FeedbackPage.tsx
│   │   ├── NavigationPage.tsx
│   │   └── LayoutPage.tsx
│   ├── App.tsx             # Main app component
│   └── index.tsx           # Entry point
├── package.json
└── README.md
```

## Available Scripts

### `npm start`
Runs the app in development mode with hot reloading.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.

### `npm run eject`
**Note: this is a one-way operation!**
Ejects from Create React App for full configuration control.

## Browser Support

The app supports:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips

1. **Production Build**: Always use `npm run build` for production
2. **Code Splitting**: The app uses React lazy loading where appropriate
3. **Image Optimization**: Optimize images before adding them
4. **Bundle Analysis**: Run `npm run build` and check the bundle size

## Deployment

### Netlify

1. Build the app:
```bash
npm run build
```

2. Drag and drop the `build` folder to Netlify

Or connect your Git repository for automatic deployments.

### Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

### GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to package.json:
```json
"homepage": "https://yourusername.github.io/repo-name",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

3. Deploy:
```bash
npm run deploy
```

## Customization

### Changing the Theme

Edit the theme configuration in `src/App.tsx`:

```typescript
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#5A7554', // Change this
    },
    // ... other colors
  }
});
```

### Adding New Pages

1. Create a new file in `src/pages/`:
```typescript
// src/pages/MyNewPage.tsx
import React from 'react';
import { Typography } from '@material-ui/core';

const MyNewPage: React.FC = () => {
  return (
    <div>
      <Typography variant="h4">My New Page</Typography>
    </div>
  );
};

export default MyNewPage;
```

2. Add to the menu in `src/App.tsx`:
```typescript
const menuItems = [
  // ... existing items
  { id: 'mynewpage', label: 'My New Page', component: MyNewPage }
];
```

## Getting Help

- Check the main [README.md](./README.md) for features
- Review the [prototype-factory documentation](../)
- Open an issue on GitHub
- Check Material-UI docs: https://material-ui.com/

## Next Steps

1. Explore all the component pages
2. Try the interactive examples
3. Copy code snippets for your project
4. Customize the theme to match your brand
5. Build your own components using the patterns shown

Happy coding! 🚀
