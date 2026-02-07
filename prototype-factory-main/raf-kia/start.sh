#!/bin/bash

echo "🚀 Starting Kia Smart Charging Onboarding..."

# Check if node_modules exist
if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm run install:all
fi

# Start both backend and frontend
echo "🔧 Starting backend and frontend..."
npm run dev
