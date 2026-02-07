# Energy Usage Assistant

A residential electricity management application that helps consumers reduce energy costs and carbon footprint through actionable advice.

## Current Status

✅ **Core Features Implemented:**
- User authentication and energy account linking
- Solar system configuration and forecasting
- Tariff management with time-of-use pricing
- Consumption data retrieval and storage
- Daily Assistant with 24-hour chart visualization
- Energy advice generation (general, solar-specific, overnight tasks)
- Tomorrow's consumption forecasting based on historical patterns
- Current status display with real-time indicators

✅ **All Tests Passing:** 173 backend tests, 100% success rate

## Project Structure

```
energy-usage-assistant/
├── frontend/          # React + TypeScript + Vite + Tailwind CSS
├── backend/           # Node.js + Express + TypeScript + Prisma
└── package.json       # Monorepo root
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
cd ..
```

### Development

Run both frontend and backend in development mode:
```bash
npm run dev
```

This will start:
- Backend server at http://localhost:3001
- Frontend application at http://localhost:3000

Or run them separately:
```bash
# Backend (http://localhost:3001)
npm run dev:backend

# Frontend (http://localhost:3000)
npm run dev:frontend
```

### Testing the Application

1. Navigate to http://localhost:3000
2. Complete the onboarding flow:
   - Register with any email and password
   - Link energy account (use test account: `ACC001` / `password123`)
   - Configure solar system (or select "No solar")
3. View the Daily Assistant with:
   - 24-hour energy chart with consumption, solar, and pricing
   - Current status with real-time indicators
   - Personalized energy advice (up to 3 recommendations)
   - Toggle between Today and Tomorrow views

### Mock Test Accounts

For testing, use these mock energy provider accounts:
- `ACC001` / `password123`
- `ACC002` / `securepass456`
- `ACC003` / `energyuser789`
- `TEST123` / `testpass`

### Testing

Run all tests:
```bash
npm test
```

Run tests for specific workspace:
```bash
npm run test:backend
npm run test:frontend
```

## Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Recharts** - Chart visualization
- **React Router** - Navigation
- **Vitest** - Testing framework
- **fast-check** - Property-based testing

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **SQLite** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Jest** - Testing framework
- **fast-check** - Property-based testing

## API Endpoints

All API endpoints are prefixed with `/api`:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login existing user
- `POST /api/auth/link-energy-account` - Link energy provider account

### Onboarding
- `POST /api/onboarding/solar` - Configure solar system

### Daily Assistant
- `GET /api/daily-assistant/chart-data` - Get 24-hour chart data (today/tomorrow)
- `GET /api/daily-assistant/advice` - Get energy advice recommendations

### Tariff
- `POST /api/tariff` - Create/update tariff structure
- `GET /api/tariff` - Get current tariff

### Consumption
- `POST /api/consumption/sync` - Sync consumption data from provider
- `GET /api/consumption` - Get consumption data for date range

### Settings (Placeholder)
- `/api/settings` - User settings and configuration

### Insights (Placeholder)
- `/api/insights` - Energy insights and analytics

### Events (Placeholder)
- `/api/events` - Energy events

## Database Schema

The application uses Prisma with SQLite. Key models include:

- **UserProfile** - User accounts and authentication
- **SolarSystem** - Solar panel configuration
- **ElectricVehicle** - EV details for charging advice
- **HomeBattery** - Battery storage configuration
- **ConsumptionDataPoint** - Historical energy usage
- **TariffStructure** - Electricity pricing
- **SolarForecast** - Solar generation predictions
- **EnergyAdvice** - Generated recommendations
- **EnergyEvent** - Grid events and incentives

## Development Workflow

1. Review requirements in `.kiro/specs/energy-usage-assistant/requirements.md`
2. Check design in `.kiro/specs/energy-usage-assistant/design.md`
3. Follow tasks in `.kiro/specs/energy-usage-assistant/tasks.md`
4. Write tests (unit + property-based) for each feature
5. Implement features incrementally
6. Run tests to verify correctness

## Recent Updates

### Immediate Fixes Completed (February 2, 2026)

All 11 immediate fixes have been implemented and tested:

1. ✅ Updated mock consumption data pattern (realistic 48-interval pattern)
2. ✅ Added current time display to Current Status
3. ✅ Added current time vertical line to chart (Today view only)
4. ✅ Made advice messages more specific (dryer, AC, dishwasher, washing machine)
5. ✅ Enabled re-onboarding with same email (auto-login)
6. ✅ Added logout button to Daily Assistant
7. ✅ Fixed missing solar configuration error (default config)
8. ✅ Fixed Recharts ReferenceLine error (white screen crash)
9. ✅ Added consumption and tariff sync to onboarding
10. ✅ Implemented tomorrow's consumption forecast (7-day historical average)
11. ✅ Verified tariff setup in onboarding (all 4 periods saved correctly)

See `IMMEDIATE_FIXES_SUMMARY.md` for detailed information.

## Documentation

**Quick Links:**
- 📋 [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) - Complete documentation guide
- 📊 [PROJECT_STATUS.md](PROJECT_STATUS.md) - Current implementation status
- 🔧 [IMMEDIATE_FIXES_SUMMARY.md](IMMEDIATE_FIXES_SUMMARY.md) - Recent fixes and improvements

**Detailed Documentation:**
- `README.md` - This file (project overview and setup)
- `SETUP_COMPLETE.md` - Initial setup documentation
- `TEST_FIXES_SUMMARY.md` - Test infrastructure improvements
- `.kiro/specs/energy-usage-assistant/` - Complete specification
  - `requirements.md` - Feature requirements
  - `design.md` - Technical design and correctness properties
  - `tasks.md` - Implementation task list

## License

Private project - All rights reserved
