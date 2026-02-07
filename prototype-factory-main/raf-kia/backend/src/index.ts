import express from 'express';
import cors from 'cors';
import { InMemoryStorageService } from './storage';
import { createOnboardingRoutes } from './routes/onboarding';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize storage
const storage = new InMemoryStorageService();

// Routes
app.use('/api', createOnboardingRoutes(storage));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'kia-onboarding-backend' });
});

app.listen(PORT, () => {
  console.log(`🚀 Kia Onboarding Backend running on http://localhost:${PORT}`);
});
