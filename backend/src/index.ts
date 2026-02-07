import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import onboardingRouter from './routes/onboarding.js';
import dailyAssistantRouter from './routes/dailyAssistant.js';
import settingsRouter from './routes/settings.js';
import insightsRouter from './routes/insights.js';
import eventsRouter from './routes/events.js';
import tariffRouter from './routes/tariff.js';
import consumptionRouter from './routes/consumption.js';
import energyEventsRouter from './routes/energy-events.js';
import energyInsightsRouter from './routes/energy-insights.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/daily-assistant', dailyAssistantRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/insights', insightsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/tariff', tariffRouter);
app.use('/api/consumption', consumptionRouter);
app.use('/api/energy-events', energyEventsRouter);
app.use('/api/energy-insights', energyInsightsRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}

export default app;
