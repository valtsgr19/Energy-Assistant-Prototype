import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createStorageService } from './storage';
import { createUserRoutes } from './routes/users';
import { createOnboardingRoutes } from './routes/onboarding';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize storage
const storage = createStorageService();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    storageMode: process.env.STORAGE_MODE || 'memory'
  });
});

// API routes
app.use('/api/users', createUserRoutes(storage));
app.use('/api/onboarding', createOnboardingRoutes(storage));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📝 Storage mode: ${process.env.STORAGE_MODE || 'memory'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

export default app;
