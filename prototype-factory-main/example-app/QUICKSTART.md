# Quick Start Guide

Get the Kaluza Component Showcase running in 3 minutes.

## ⚡ Super Quick Start

**IMPORTANT: Run these commands IN ORDER:**

```bash
# 1. Navigate to the app
cd prototype-factory/example-app

# 2. Install dependencies (THIS MUST BE FIRST!)
npm install

# 3. Start the app (ONLY AFTER npm install completes)
npm start
```

**Common mistake**: Running `npm start` before `npm install` will fail!

That's it! The app will open at `http://localhost:3000` 🎉

## ⚠️ Troubleshooting

If you get errors, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**Most common issues:**
- Running `npm start` before `npm install` ❌
- Using Node v25+ (use v16 or v18 instead) ⚠️
- Not being in the example-app directory ❌

## 📱 View on Mobile

### Option 1: Browser DevTools
1. Press `F12` (or `Cmd+Option+I` on Mac)
2. Click the device icon (or `Cmd+Shift+M`)
3. Select a mobile device from the dropdown

### Option 2: Real Device
1. Find your computer's IP address:
   ```bash
   # Mac/Linux
   ifconfig | grep inet
   
   # Windows
   ipconfig
   ```

2. On your mobile device, open:
   ```
   http://YOUR_IP:3000
   ```
   Example: `http://192.168.1.100:3000`

## 🎯 What to Explore

### Start Here
1. **Home Page** - Overview and introduction
2. **Colors Page** - See the complete color palette
3. **Buttons Page** - Interactive button examples

### Then Check Out
4. **Forms Page** - All form controls
5. **Cards Page** - Card layouts
6. **Typography Page** - Font samples

### Advanced
7. **Tables Page** - Data tables
8. **Feedback Page** - Alerts and progress
9. **Navigation Page** - Navigation patterns
10. **Layout Page** - Grid and spacing

## 🎨 Key Features to Try

### Interactive Elements
- ✅ Click all the buttons
- ✅ Fill out the form
- ✅ Toggle switches and checkboxes
- ✅ Adjust sliders
- ✅ Open the drawer menu
- ✅ Try the snackbar notification

### Responsive Design
- ✅ Resize your browser window
- ✅ Test on mobile device
- ✅ Check tablet view
- ✅ View on large screen

### Accessibility
- ✅ Navigate with keyboard (Tab key)
- ✅ Check color contrast
- ✅ Test with screen reader

## 🛠️ Common Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Install new package
npm install package-name
```

## 🚨 Troubleshooting

### Port Already in Use?
```bash
# Use a different port
PORT=3001 npm start
```

### Module Errors?
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Cache Issues?
```bash
# Clear cache
npm start -- --reset-cache
```

## 📖 Next Steps

1. **Explore All Pages** - Click through each menu item
2. **Read the Code** - Check `src/pages/` for examples
3. **Customize Theme** - Edit colors in `src/App.tsx`
4. **Add Your Page** - Create a new page component
5. **Build Something** - Use the patterns in your project

## 📚 Documentation

- [INSTALLATION.md](./INSTALLATION.md) - Detailed setup guide
- [FEATURES.md](./FEATURES.md) - Complete feature list
- [README.md](./README.md) - Project overview
- [../README.md](../README.md) - Design system docs

## 💡 Pro Tips

1. **Keep it Running**: Leave the dev server running while you explore
2. **Open DevTools**: See console logs and inspect elements
3. **Test Mobile First**: Always check mobile view
4. **Copy Code**: Use the examples in your own projects
5. **Customize**: Change colors and styles to match your brand

## 🎓 Learning Path

### Beginner
1. Browse all pages
2. Interact with components
3. View on different screen sizes

### Intermediate
1. Read the component code
2. Understand the theme structure
3. Modify colors and styles

### Advanced
1. Add new components
2. Create custom pages
3. Integrate with backend
4. Deploy to production

## 🚀 Deploy Your Version

### Netlify (Easiest)
```bash
npm run build
# Drag 'build' folder to netlify.com
```

### Vercel
```bash
npm install -g vercel
vercel
```

### GitHub Pages
```bash
npm install --save-dev gh-pages
npm run deploy
```

## 🎯 Goals

After exploring this showcase, you should be able to:
- ✅ Understand the Kaluza design system
- ✅ Use Material-UI components
- ✅ Build responsive layouts
- ✅ Implement accessible components
- ✅ Create consistent UIs
- ✅ Follow best practices

## 🌟 Enjoy!

This showcase demonstrates 50+ components across 10 pages. Take your time exploring, and use these patterns in your own projects!

Questions? Check the documentation or open an issue on GitHub.

Happy coding! 🎨✨
