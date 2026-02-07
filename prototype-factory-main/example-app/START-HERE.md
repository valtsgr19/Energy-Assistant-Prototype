# 🚀 START HERE - Quick Setup Guide

## Copy and Paste These Commands

Open your terminal and run these commands **one at a time**:

### Step 1: Navigate to the directory
```bash
cd /Users/robinabraham/Desktop/Development/prototype-factory/example-app
```

### Step 2: Verify you're in the right place
```bash
pwd
```
Should show: `/Users/robinabraham/Desktop/Development/prototype-factory/example-app`

### Step 3: Check Node version (optional but recommended)
```bash
node --version
```
**Recommended**: v16.x or v18.x (LTS versions)
**Your version**: v25.4.0 (may have issues - consider downgrading)

### Step 4: Install dependencies
```bash
npm install
```
⏱️ This takes 1-2 minutes. Wait for it to complete!

You should see:
```
added 1500+ packages in 45s
```

### Step 5: Start the app
```bash
npm start
```

You should see:
```
Compiled successfully!

You can now view kaluza-component-showcase in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.x:3000
```

The app will automatically open in your browser! 🎉

---

## ⚠️ If You Get Errors

### Error: "command not found: npm"
Your npm is not in PATH. Try:
```bash
which npm
/opt/homebrew/bin/npm
```

If it shows a path, npm is installed. If not, reinstall Node.js.

### Error: "npm start" fails with exit code 127
You ran `npm start` before `npm install`. Run:
```bash
npm install
npm start
```

### Error: Port 3000 already in use
```bash
PORT=3001 npm start
```

### Error: Module not found
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

### Node v25 compatibility issues
Downgrade to Node v18 (recommended):
```bash
# If you have nvm:
nvm install 18
nvm use 18
npm install
npm start
```

---

## 🧪 Test Your Setup (Optional)

Run the verification script:
```bash
chmod +x verify-setup.sh
./verify-setup.sh
```

---

## 📱 View on Mobile

Once the app is running:

1. Find your computer's IP:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. On your phone, open:
   ```
   http://YOUR_IP:3000
   ```
   Example: `http://192.168.1.100:3000`

---

## ✅ Success Checklist

- [ ] Navigated to example-app directory
- [ ] Ran `npm install` (completed successfully)
- [ ] Ran `npm start` (app opened in browser)
- [ ] Can see the Kaluza Component Showcase
- [ ] Can click through the menu items
- [ ] Tested on mobile (optional)

---

## 🆘 Still Having Issues?

1. **Read the error message carefully** - it usually tells you what's wrong
2. **Check TROUBLESHOOTING.md** - covers 15+ common issues
3. **Try a clean install**:
   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   npm start
   ```

---

## 🎯 What You'll See

When successful, you'll see:
- **Home Page** - Welcome and overview
- **Menu Button** (top left) - Opens navigation
- **10 Pages** - Colors, Typography, Buttons, Forms, etc.
- **Mobile Responsive** - Works on all screen sizes

---

## 💡 Pro Tips

1. **Keep the terminal open** - Don't close it while the app is running
2. **Use Cmd+C** - To stop the app (in terminal)
3. **Refresh browser** - If you see errors, try refreshing
4. **Check console** - Press F12 to see browser console for errors
5. **Use Node v18** - Most stable version for this project

---

## 📚 Documentation

- **QUICKSTART.md** - 3-minute quick start
- **INSTALLATION.md** - Detailed setup guide  
- **TROUBLESHOOTING.md** - Common issues and fixes
- **FEATURES.md** - What's included
- **SUMMARY.md** - Project overview

---

## 🎉 You're Ready!

Once you see the app in your browser, you're all set! Explore the components and use them in your projects.

Happy coding! 🚀
