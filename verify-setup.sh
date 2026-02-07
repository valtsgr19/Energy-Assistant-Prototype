#!/bin/bash

echo "🔍 Verifying Energy Usage Assistant Setup..."
echo ""

# Check Node.js version
echo "✓ Node.js version:"
node --version
echo ""

# Check npm version
echo "✓ npm version:"
npm --version
echo ""

# Check if dependencies are installed
echo "✓ Checking dependencies..."
if [ -d "node_modules" ]; then
  echo "  Root dependencies: ✓"
else
  echo "  Root dependencies: ✗ (run 'npm install')"
fi

if [ -d "backend/node_modules" ]; then
  echo "  Backend dependencies: ✓"
else
  echo "  Backend dependencies: ✗ (run 'npm install')"
fi

if [ -d "frontend/node_modules" ]; then
  echo "  Frontend dependencies: ✓"
else
  echo "  Frontend dependencies: ✗ (run 'npm install')"
fi
echo ""

# Check if Prisma is set up
echo "✓ Checking Prisma setup..."
if [ -f "backend/prisma/dev.db" ]; then
  echo "  Database: ✓"
else
  echo "  Database: ✗ (run 'cd backend && npx prisma migrate dev')"
fi

if [ -d "node_modules/@prisma/client" ]; then
  echo "  Prisma Client: ✓"
else
  echo "  Prisma Client: ✗ (run 'cd backend && npx prisma generate')"
fi
echo ""

# Check if builds work
echo "✓ Testing builds..."
cd backend && npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  Backend build: ✓"
else
  echo "  Backend build: ✗"
fi
cd ..

cd frontend && npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  Frontend build: ✓"
else
  echo "  Frontend build: ✗"
fi
cd ..
echo ""

# Check if tests work
echo "✓ Testing test suites..."
cd backend && npm test > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  Backend tests: ✓"
else
  echo "  Backend tests: ✗"
fi
cd ..

cd frontend && npm test > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  Frontend tests: ✓"
else
  echo "  Frontend tests: ✗"
fi
cd ..
echo ""

echo "✅ Setup verification complete!"
echo ""
echo "To start development:"
echo "  npm run dev          # Start both frontend and backend"
echo "  npm run dev:backend  # Start backend only (port 3001)"
echo "  npm run dev:frontend # Start frontend only (port 3000)"
echo ""
echo "To run tests:"
echo "  npm test             # Run all tests"
echo "  npm run test:backend # Run backend tests"
echo "  npm run test:frontend # Run frontend tests"
