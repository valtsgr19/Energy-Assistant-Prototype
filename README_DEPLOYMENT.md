# Energy Usage Assistant 🔋⚡

An intelligent energy management assistant that helps households optimize their electricity usage, reduce costs, and maximize solar generation.

## 🌟 Features

- **Daily Energy Assistant**: 24-hour forecast with personalized advice
- **Smart Recommendations**: Optimal times for high-energy tasks
- **Solar Integration**: Maximize self-consumption of solar generation
- **EV Charging Optimization**: Schedule charging during off-peak hours
- **Battery Management**: Intelligent charge/discharge recommendations
- **Energy Insights**: Understand your consumption patterns
- **Time-of-Use Tariffs**: Visualize pricing throughout the day

## 🚀 Live Demo

**Try it now**: [Your Vercel URL here]

Sign up with any email to explore the app with realistic demo data!

## 📸 Screenshots

[Add screenshots here after deployment]

## 🛠️ Tech Stack

### Frontend
- React + TypeScript
- Vite
- TailwindCSS
- Recharts (data visualization)
- React Router

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt (password hashing)

## 🏃 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- PostgreSQL (or use SQLite for development)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/energy-usage-assistant.git
cd energy-usage-assistant
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Set up environment variables**

Backend (`backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/energy_assistant"
JWT_SECRET="your-secret-key-min-32-characters"
ENCRYPTION_KEY="your-exactly-32-character-key"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3001
```

4. **Set up database**
```bash
cd backend
npx prisma migrate dev
```

5. **Start development servers**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

6. **Open your browser**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 🧪 Testing

### Run all tests
```bash
cd backend
npm test
```

### Run property-based tests
```bash
cd backend
npm test -- property.test.ts
```

## 📦 Deployment

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for detailed deployment instructions.

### Quick Deploy

**Frontend (Vercel)**:
1. Push to GitHub
2. Import to Vercel
3. Set `VITE_API_URL` environment variable
4. Deploy!

**Backend (Railway)**:
1. Create new project from GitHub
2. Add PostgreSQL database
3. Set environment variables
4. Deploy!

## 🎭 Demo Mode

New users automatically get realistic demo data:
- 30 days of consumption history
- Solar system (5kW)
- Time-of-use tariff structure
- Personalized energy advice

## 🔐 Security

- JWT-based authentication
- Bcrypt password hashing
- Encrypted energy account credentials
- HTTPS enforced in production
- CORS protection

## 📊 Property-Based Testing

This project uses property-based testing (PBT) with fast-check to ensure correctness:
- 48 property tests across 9 test suites
- 4,800+ test cases per run
- Tests validate core business logic
- See [PROPERTY_BASED_TESTING_PROGRESS.md](./PROPERTY_BASED_TESTING_PROGRESS.md)

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by real-world energy management needs
- Property-based testing methodology

## 📧 Contact

[Your contact information]

## 🗺️ Roadmap

- [ ] Real energy provider integrations
- [ ] Mobile app (React Native)
- [ ] Advanced ML predictions
- [ ] Community features
- [ ] Multi-language support

---

**Note**: This is a demo application. For production use with real user data, additional security hardening and compliance measures would be required.
