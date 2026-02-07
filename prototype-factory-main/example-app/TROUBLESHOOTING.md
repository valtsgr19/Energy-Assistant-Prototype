# Troubleshooting Guide

Common issues and solutions for the Kaluza Component Showcase.

## ❌ Error: "npm start" fails with exit code 127

**Problem**: You ran `npm start` before installing dependencies.

**Solution**:
```bash
# Make sure you're in the example-app directory
cd prototype-factory/example-app

# Install dependencies first
npm install

# Then start the app
npm start
```

## ❌ Error: "command not found: npm"

**Problem**: npm is not in your PATH or not installed.

**Solution**:
```bash
# Check if Node.js is installed
node --version

# If not installed, install Node.js from nodejs.org
# Or use nvm (recommended):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 16
nvm use 16
```

## ❌ Error: Module not found

**Problem**: Dependencies not installed or corrupted.

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## ❌ Error: Port 3000 already in use

**Problem**: Another app is using port 3000.

**Solution**:
```bash
# Option 1: Use a different port
PORT=3001 npm start

# Option 2: Kill the process using port 3000
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## ❌ Error: TypeScript errors

**Problem**: TypeScript configuration issues.

**Solution**:
```bash
# Install TypeScript
npm install --save-dev typescript @types/react @types/react-dom @types/node

# Or use the included tsconfig.json
# It should work automatically
```

## ❌ Error: React version mismatch

**Problem**: Conflicting React versions.

**Solution**:
```bash
# Check versions
npm list react react-dom

# Reinstall with correct versions
npm install react@17.0.2 react-dom@17.0.2
```

## ❌ Error: Material-UI errors

**Problem**: Material-UI version issues.

**Solution**:
```bash
# Install correct versions
npm install @material-ui/core@4.12.4 @material-ui/icons@4.11.3
```

## ❌ Error: "Cannot find module 'react-scripts'"

**Problem**: react-scripts not installed.

**Solution**:
```bash
npm install react-scripts@5.0.1
```

## ❌ Error: Build fails

**Problem**: Various build issues.

**Solution**:
```bash
# Clear cache
npm cache clean --force

# Remove and reinstall
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

## ❌ Error: App doesn't open in browser

**Problem**: Browser not opening automatically.

**Solution**:
```bash
# Manually open in browser
# Navigate to: http://localhost:3000

# Or set environment variable
BROWSER=chrome npm start
```

## ❌ Error: Slow installation

**Problem**: npm is slow or hanging.

**Solution**:
```bash
# Use yarn instead
npm install -g yarn
yarn install
yarn start

# Or clear npm cache
npm cache clean --force
npm install
```

## ❌ Error: Permission denied

**Problem**: Permission issues on Mac/Linux.

**Solution**:
```bash
# Don't use sudo! Instead, fix npm permissions:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile

# Then try again
npm install
```

## ❌ Error: Node version too old

**Problem**: Node.js version is outdated.

**Solution**:
```bash
# Check version
node --version

# Should be 14+ (16 or 18 recommended)
# Update using nvm:
nvm install 16
nvm use 16
nvm alias default 16
```

## ❌ Error: Node version too new

**Problem**: Node.js v25+ may have compatibility issues.

**Solution**:
```bash
# Use Node 16 or 18 (LTS versions)
nvm install 18
nvm use 18
npm install
npm start
```

## ❌ Error: EACCES permission error

**Problem**: Permission issues with npm.

**Solution**:
```bash
# Fix npm permissions (Mac/Linux)
sudo chown -R $USER:$(id -gn $USER) ~/.npm
sudo chown -R $USER:$(id -gn $USER) ~/.config

# Then try again
npm install
```

## ❌ Error: Webpack errors

**Problem**: Webpack configuration issues.

**Solution**:
```bash
# These are usually fixed by:
rm -rf node_modules package-lock.json
npm install

# If still failing, try:
npm install react-scripts@latest
```

## ❌ Error: ESLint errors

**Problem**: Linting errors preventing start.

**Solution**:
```bash
# Disable ESLint temporarily
DISABLE_ESLINT_PLUGIN=true npm start

# Or fix the errors shown in the console
```

## ❌ Error: Out of memory

**Problem**: Node runs out of memory during build.

**Solution**:
```bash
# Increase memory limit
NODE_OPTIONS=--max_old_space_size=4096 npm start

# Or for build:
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

## 🔍 Debugging Steps

If you're still having issues:

1. **Check Node version**:
   ```bash
   node --version  # Should be 14+
   npm --version   # Should be 6+
   ```

2. **Check you're in the right directory**:
   ```bash
   pwd
   # Should show: .../prototype-factory/example-app
   ```

3. **Check package.json exists**:
   ```bash
   ls -la
   # Should see package.json
   ```

4. **Try a clean install**:
   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   ```

5. **Check for error messages**:
   - Read the full error message
   - Look for the actual error (not just warnings)
   - Google the specific error message

6. **Try with verbose logging**:
   ```bash
   npm install --verbose
   npm start --verbose
   ```

## 📝 Still Not Working?

If none of these solutions work:

1. **Check the logs**:
   ```bash
   cat ~/.npm/_logs/*-debug-0.log
   ```

2. **Create a new issue** with:
   - Your Node version (`node --version`)
   - Your npm version (`npm --version`)
   - Your OS (Mac, Windows, Linux)
   - The full error message
   - What you've tried

3. **Try the alternative setup**:
   - Use the component examples directly
   - Copy individual components
   - Build your own app from scratch

## ✅ Successful Installation Looks Like

```bash
$ npm install
added 1500 packages in 45s

$ npm start
Compiled successfully!

You can now view kaluza-component-showcase in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.100:3000
```

## 🎯 Quick Checklist

Before asking for help, make sure you've:
- [ ] Installed Node.js 14+ (16 or 18 recommended)
- [ ] Navigated to the example-app directory
- [ ] Run `npm install` before `npm start`
- [ ] Checked for error messages
- [ ] Tried a clean install
- [ ] Checked your Node version isn't too new (v25+)

## 💡 Pro Tips

1. **Use Node 16 or 18**: These are LTS versions and most stable
2. **Use nvm**: Makes switching Node versions easy
3. **Clear cache**: When in doubt, clear the npm cache
4. **Read errors**: The actual error is usually at the top
5. **Google it**: Most errors have been solved before

## 🚀 Alternative: Use CodeSandbox

If local setup is too difficult, try CodeSandbox:

1. Go to codesandbox.io
2. Create new React app
3. Copy the source files
4. Install dependencies in CodeSandbox
5. Run in the browser

No local setup required!
