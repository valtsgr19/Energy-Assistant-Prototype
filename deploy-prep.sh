#!/bin/bash

echo "🚀 Energy Usage Assistant - Deployment Preparation"
echo "=================================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git repository already initialized"
fi

echo ""
echo "🔐 Generating secure keys..."
echo ""

# Generate JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET (copy this):"
echo "$JWT_SECRET"
echo ""

# Generate ENCRYPTION_KEY (exactly 32 characters)
ENCRYPTION_KEY=$(openssl rand -hex 16)
echo "ENCRYPTION_KEY (copy this):"
echo "$ENCRYPTION_KEY"
echo ""

echo "📋 Deployment Checklist:"
echo ""
echo "Backend (Railway):"
echo "  1. Create new project from GitHub"
echo "  2. Add PostgreSQL database"
echo "  3. Set environment variables:"
echo "     - DATABASE_URL=\${{Postgres.DATABASE_URL}}"
echo "     - JWT_SECRET=$JWT_SECRET"
echo "     - ENCRYPTION_KEY=$ENCRYPTION_KEY"
echo "     - PORT=3001"
echo "     - NODE_ENV=production"
echo "     - FRONTEND_URL=https://your-app.vercel.app"
echo ""
echo "Frontend (Vercel):"
echo "  1. Import project from GitHub"
echo "  2. Set root directory: frontend"
echo "  3. Set environment variable:"
echo "     - VITE_API_URL=https://your-backend.railway.app"
echo ""
echo "📚 Next Steps:"
echo "  1. Commit your code: git add . && git commit -m 'Ready for deployment'"
echo "  2. Create GitHub repo and push"
echo "  3. Follow DEPLOYMENT_CHECKLIST.md"
echo ""
echo "✨ Keys generated and saved above - copy them now!"
