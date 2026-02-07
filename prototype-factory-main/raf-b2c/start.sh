#!/bin/bash

echo "🚀 Starting EV VPP Onboarding Application"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing root dependencies..."
  npm install
fi

if [ ! -d "backend/node_modules" ]; then
  echo "📦 Installing backend dependencies..."
  cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  cd frontend && npm install && cd ..
fi

echo ""
echo "✅ Dependencies installed"
echo ""
echo "🌐 Starting application..."
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
echo ""

npm run dev
