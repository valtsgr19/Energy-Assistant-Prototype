# EV Virtual Power Plant Onboarding

A complete, minimal implementation of an EV VPP onboarding application built from scratch.

## ✅ Implementation Complete!

This is a **fully working MVP** with all core onboarding steps implemented. See [IMPLEMENTATION-COMPLETE.md](./IMPLEMENTATION-COMPLETE.md) for full details.

## Quick Start

```bash
cd raf-b2c
./start.sh
```

Then visit: **http://localhost:5173**

## Complete User Flow

1. **Landing Page** - Introduction and benefits
2. **Email Capture** - Create account (code: `123456`)
3. **Bill Upload** - Upload electricity bill (PDF/JPG/PNG) or skip to manual entry
4. **Bill Processing** - Simulated OCR processing (extracts E.On Next Flex TOU tariff)
5. **Tariff Confirmation** - Review extracted tariff or enter manually
6. **Optimisation Preferences** - Set ready-by time, SoC, optimisation mode
7. **Manufacturer Selection** - Choose from 10 EV manufacturers
8. **Activation Success** - Enrollment complete!

## What's Implemented

### Backend ✅
- User management with email verification
- Complete onboarding API (address, tariff, preferences, manufacturer)
- In-memory storage (no database required)
- Progress tracking and resumability
- Input validation with Zod
- 10 EV manufacturers supported

### Frontend ✅
- Landing page with Kaluza branding
- Email capture and verification
- **Bill upload with file validation (PDF/JPG/PNG, max 10MB)**
- **Bill processing simulation with realistic TOU tariff extraction**
- **Time-of-use tariff display (Peak/Off-peak rates)**
- Complete 6-step onboarding flow in one component
- Kaluza theme (Aspekta font, nature-inspired colors)
- Material-UI components
- Responsive design
- API integration

## Tech Stack

- **Backend**: Express + TypeScript
- **Frontend**: React + TypeScript + Material-UI
- **Storage**: In-memory (no database)
- **Theme**: Kaluza branding
- **Build**: Vite

## Project Structure

```
raf-b2c/
├── backend/          # Express API
│   ├── src/
│   │   ├── storage/  # In-memory storage
│   │   ├── routes/   # API endpoints
│   │   └── types/    # TypeScript types
│   └── package.json
├── frontend/         # React UI
│   ├── src/
│   │   ├── api/      # API client
│   │   ├── pages/    # Components
│   │   └── theme/    # Kaluza theme
│   └── package.json
└── package.json      # Root scripts
```

## Testing

1. Visit http://localhost:5173
2. Click "Get Started"
3. Enter any email
4. Use verification code: `123456`
5. **Upload a bill (any PDF/JPG/PNG) or skip to manual entry**
6. **Wait for processing - it will extract E.On Next Flex tariff with TOU rates!**
7. **Review the extracted tariff (Peak: 30p, Off-peak: 13p) or edit if needed**
8. Complete all remaining onboarding steps
9. See success confirmation!

## What's NOT Implemented

- PostgreSQL storage mode
- **Real OCR processing (simulated with mock E.On tariff)**
- Real OAuth with EV manufacturers
- JWT authentication
- Email service
- Tests

See [IMPLEMENTATION-COMPLETE.md](./IMPLEMENTATION-COMPLETE.md) for the complete list.

## Requirements

- Node.js >= 18.0.0

## Documentation

- **Implementation Summary**: [IMPLEMENTATION-COMPLETE.md](./IMPLEMENTATION-COMPLETE.md)
- **Spec**: `.kiro/specs/ev-vpp-onboarding/`
- **Original Spec**: `raf_b2c_onboarding_spec.md`

---

**Status**: ✅ MVP Complete and Working
**Ready for**: Demo, testing, and feature additions
