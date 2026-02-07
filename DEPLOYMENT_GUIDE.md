# Deployment Guide

Quick guide to deploy the Energy Usage Assistant for public demo.

## Prerequisites

- GitHub account
- Vercel account (free tier)
- Railway or Render account (free tier)

## Option 1: Quick Deploy (Recommended)

### Frontend (Vercel)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set root directory: `frontend`
   - Environment variables:
     ```
     VITE_API_URL=<your-backend-url>
     ```
   - Deploy!

### Backend (Railway)

1. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Set root directory: `backend`
   - Add PostgreSQL database (click "+ New")
   - Environment variables:
     ```
     DATABASE_URL=<auto-filled-by-railway>
     JWT_SECRET=<generate-random-string>
     ENCRYPTION_KEY=<generate-32-char-string>
     PORT=3001
     NODE_ENV=production
     ```

2. **Run migrations**
   - In Railway dashboard, go to your backend service
   - Open "Settings" → "Deploy"
   - Add build command: `npx prisma migrate deploy`

## Option 2: Manual Deploy

### Backend (Any Node.js host)

1. **Build**
   ```bash
   cd backend
   npm install
   npm run build
   ```

2. **Set environment variables**
   ```bash
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret-key
   ENCRYPTION_KEY=your-32-char-key
   PORT=3001
   NODE_ENV=production
   ```

3. **Run migrations**
   ```bash
   npx prisma migrate deploy
   ```

4. **Start server**
   ```bash
   npm start
   ```

### Frontend (Any static host)

1. **Build**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy `dist` folder** to:
   - Vercel
   - Netlify
   - GitHub Pages
   - Any static hosting

## Environment Variables

### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens (generate random string)
- `ENCRYPTION_KEY` - 32-character key for encryption
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Set to "production"

### Frontend
- `VITE_API_URL` - Backend API URL (e.g., https://your-backend.railway.app)

## Post-Deployment

1. **Test registration**
   - Sign up with a new account
   - Verify demo data loads automatically
   - Check all pages work

2. **Monitor logs**
   - Check backend logs for seeding success
   - Verify no errors during registration

3. **Share!**
   - Share your frontend URL
   - Users can sign up and explore immediately

## Free Tier Limits

### Vercel (Frontend)
- ✅ Unlimited bandwidth
- ✅ Automatic HTTPS
- ✅ Global CDN
- ⚠️ 100GB bandwidth/month (plenty for demo)

### Railway (Backend)
- ✅ $5 free credit/month
- ✅ PostgreSQL included
- ✅ Automatic deployments
- ⚠️ ~500 hours/month (enough for demo)

### Render (Alternative Backend)
- ✅ Free tier available
- ✅ PostgreSQL included
- ✅ Auto-deploy from Git
- ⚠️ Spins down after 15min inactivity (cold starts)

## Troubleshooting

### "Cannot connect to database"
- Check DATABASE_URL is set correctly
- Verify PostgreSQL is running
- Run migrations: `npx prisma migrate deploy`

### "Auto-seed not working"
- Check backend logs for errors
- Verify seedTestData function is being called
- Check database has tables created

### "CORS errors"
- Update backend CORS settings to allow your frontend domain
- In `backend/src/index.ts`, update CORS origin

## Security Notes

For production deployment:
- ✅ Use strong JWT_SECRET (32+ characters)
- ✅ Use HTTPS (automatic with Vercel/Railway)
- ✅ Set secure CORS origins
- ✅ Use environment variables (never commit secrets)
- ⚠️ This is a demo app - not production-ready for real user data

## Cost Estimate

**Free tier is sufficient for demo purposes:**
- Frontend: $0 (Vercel free tier)
- Backend: $0 (Railway $5 credit covers it)
- Database: $0 (included with Railway)

**Total: $0/month** for moderate demo usage!
