# Railway Deployment Fix Guide

## The Problem

Railway deployments are crashing because of incorrect configuration. Here's how to fix it:

## Backend Deployment Fix

### Step 1: Configure Backend Service in Railway Dashboard

1. **Go to your Railway project**
2. **Click on your backend service**
3. **Go to "Settings" tab**

### Step 2: Set Root Directory

In Settings → General:
- **Root Directory**: `backend`
- Click "Save"

### Step 3: Configure Build & Start Commands

In Settings → Deploy:
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npx prisma migrate deploy && npm start`
- Click "Save"

### Step 4: Set Environment Variables

In "Variables" tab, add these (if not already set):

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=NvySne7t2OQMjWE+wXAFkvarR1JKqBJ7ZsfAjF98nPI=
ENCRYPTION_KEY=b6c8849b6cbe79915c159b470733de00
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

**Important**: Make sure `DATABASE_URL` references your PostgreSQL database. If you added a PostgreSQL database, Railway should auto-populate this.

### Step 5: Redeploy

1. Go to "Deployments" tab
2. Click "Deploy" or it will auto-deploy after saving settings

## Frontend Deployment - DON'T USE RAILWAY!

**Important**: Deploy your frontend to **Vercel**, not Railway. Railway is for the backend only.

### Why?
- Vercel is optimized for React/Vite apps
- Free tier is better for static sites
- Automatic HTTPS and CDN
- Better performance

### Deploy Frontend to Vercel Instead:

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import your repo: `valtsgr19/Energy-Assistant-Prototype`
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend.up.railway.app
   ```
7. Click "Deploy"

## Common Backend Errors & Fixes

### Error: "Cannot find module"
**Fix**: Make sure Root Directory is set to `backend` in Railway settings

### Error: "Prisma Client not generated"
**Fix**: Build command should include `npx prisma generate`

### Error: "Database connection failed"
**Fix**: 
1. Make sure PostgreSQL database is added to your project
2. Verify `DATABASE_URL` variable is set to `${{Postgres.DATABASE_URL}}`

### Error: "Port already in use"
**Fix**: Railway automatically sets the PORT. Your code should use `process.env.PORT`

### Error: "Migration failed"
**Fix**: 
1. Check that start command includes `npx prisma migrate deploy`
2. Make sure DATABASE_URL is correct

## Checking Logs

To see what's actually failing:

1. Go to your service in Railway
2. Click "Deployments" tab
3. Click on the latest deployment
4. Click "View Logs"
5. Look for error messages (usually in red)

## Quick Checklist

Backend (Railway):
- [ ] Root Directory set to `backend`
- [ ] PostgreSQL database added
- [ ] DATABASE_URL variable set
- [ ] All environment variables configured
- [ ] Build command correct
- [ ] Start command correct

Frontend (Vercel):
- [ ] Deployed to Vercel (not Railway)
- [ ] Root Directory set to `frontend`
- [ ] VITE_API_URL points to Railway backend
- [ ] Build succeeds

## Still Having Issues?

**Share the error logs** from Railway:
1. Go to Deployments → Latest deployment → View Logs
2. Copy the error messages
3. Share them so I can help debug

## Alternative: Use Render Instead of Railway

If Railway continues to have issues, you can use Render:

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repo
5. Configure:
   - **Name**: energy-assistant-backend
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm start`
6. Add PostgreSQL database (free tier available)
7. Set environment variables

Render is more straightforward and has better error messages!
