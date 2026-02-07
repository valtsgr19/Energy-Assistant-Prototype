#!/bin/bash

# Kaluza Component Showcase - Setup Verification Script
# Run this to check if everything is ready

echo "🔍 Verifying Kaluza Component Showcase Setup..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "   Make sure you're in the example-app directory"
    echo "   Run: cd prototype-factory/example-app"
    exit 1
fi

echo "✅ Found package.json"

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed!"
    echo "   Install from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js installed: $NODE_VERSION"

# Check npm version
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed!"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "✅ npm installed: $NPM_VERSION"

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✅ node_modules directory exists"
    echo "   Dependencies appear to be installed"
else
    echo "⚠️  node_modules not found"
    echo "   You need to run: npm install"
fi

# Check if src directory exists
if [ -d "src" ]; then
    echo "✅ src directory exists"
else
    echo "❌ Error: src directory not found!"
    exit 1
fi

# Check if public directory exists
if [ -d "public" ]; then
    echo "✅ public directory exists"
else
    echo "❌ Error: public directory not found!"
    exit 1
fi

# Check key files
echo ""
echo "📁 Checking key files..."

files=(
    "src/index.tsx"
    "src/App.tsx"
    "public/index.html"
    "tsconfig.json"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file (missing)"
    fi
done

echo ""
echo "🎯 Next Steps:"
echo ""

if [ ! -d "node_modules" ]; then
    echo "1. Install dependencies:"
    echo "   npm install"
    echo ""
    echo "2. Start the app:"
    echo "   npm start"
else
    echo "1. Start the app:"
    echo "   npm start"
    echo ""
    echo "   The app will open at http://localhost:3000"
fi

echo ""
echo "📚 Need help? Check:"
echo "   - TROUBLESHOOTING.md"
echo "   - QUICKSTART.md"
echo "   - INSTALLATION.md"
echo ""
