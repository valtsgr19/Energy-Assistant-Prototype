# Deployment Checklist

Follow these steps to deploy your Energy Usage Assistant to production.

## Pre-Deployment Checklist

- [ ] Code is committed to Git
- [ ] All tests pass locally
- [ ] Environment variables documented
- [ ] Database migrations are up to date
- [ ] CORS settings configured for production

## Step 1: Prepare Repository

### 1.1 Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit - Energy Usage Assistant"
```

### 1.2 Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Create a new repository (e.g., "energy-usage-assistant")
3. Don't initialize with README (we already have files)

### 1.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/energy-usage-assistant.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend (Railway)

### 2.1 Sign Up for Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Authorize Railway to access your repositories

### 2.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Railway will detect it's a Node.js project

### 2.3 Add PostgreSQL Database
1. In your project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will create and link the database automatically

### 2.4 Configure Backend Service
1. Click on your backend service
2. Go to "Settings" → "Environment"
3. Add these variables:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<generate-random-32-char-string>
ENCRYPTION_KEY=<generate-exactly-32-chars>
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

**Generate secrets:**
```bash
# JWT_SECRET (32+ characters)
openssl rand -base64 32

# ENCRYPTION_KEY (exactly 32 characters)
openssl rand -hex 16
```

### 2.5 Configure Build Settings
1. Go to "Settings" → "Build"
2. Root Directory: `backend`
3. Build Command: `npm install && npx prisma generate && npm run build`
4. Start Command: `npx prisma migrate deploy && npm start`

### 2.6 Deploy
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Check logs for "Backend server running"
4. Note your backend URL (e.g., `https://your-app.up.railway.app`)

### 2.7 Test Backend
```bash
curl https://your-backend-url.railway.app/health
# Should return: {"status":"ok"}
```

## Step 3: Deploy Frontend (Vercel)

### 3.1 Sign Up for Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

### 3.2 Import Project
1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Vercel will detect it's a Vite project

### 3.3 Configure Project
1. Framework Preset: Vite
2. Root Directory: `frontend`
3. Build Command: `npm run build`
4. Output Directory: `dist`

### 3.4 Add Environment Variable
1. Go to "Environment Variables"
2. Add:
```
VITE_API_URL=https://your-backend-url.railway.app
```

### 3.5 Deploy
1. Click "Deploy"
2. Wait for build to complete (~1-2 minutes)
3. Vercel will provide your URL (e.g., `https://your-app.vercel.app`)

### 3.6 Update Backend CORS
1. Go back to Railway
2. Update `FRONTEND_URL` environment variable with your Vercel URL
3. Redeploy backend

## Step 4: Test Deployment

### 4.1 Test Registration
1. Visit your Vercel URL
2. Click "Get Started"
3. Register with a new email
4. Verify demo data loads automatically

### 4.2 Test All Features
- [ ] Daily Assistant page loads
- [ ] Tomorrow's data shows correctly
- [ ] Energy Insights page works
- [ ] Settings page loads
- [ ] Can add EV/Battery
- [ ] Demo banner shows on all pages

### 4.3 Check Logs
- [ ] Railway logs show successful seeding
- [ ] No errors in Vercel logs
- [ ] Database migrations ran successfully

## Step 5: Post-Deployment

### 5.1 Update README
Add deployment URLs to your README:
```markdown
## Live Demo
- Frontend: https://your-app.vercel.app
- Backend: https://your-backend.railway.app
```

### 5.2 Monitor Usage
- Check Railway dashboard for resource usage
- Monitor Vercel analytics
- Watch for errors in logs

### 5.3 Share!
Your app is now live! Share the URL:
- Twitter/X
- LinkedIn
- Reddit (r/webdev, r/reactjs)
- Show HN (Hacker News)

## Troubleshooting

### Backend won't start
- Check DATABASE_URL is set
- Verify migrations ran: Check Railway logs for "prisma migrate"
- Check all environment variables are set

### Frontend can't connect to backend
- Verify VITE_API_URL is correct
- Check CORS settings in backend
- Test backend health endpoint directly

### Database errors
- Check PostgreSQL is running in Railway
- Verify DATABASE_URL format
- Run migrations manually: `npx prisma migrate deploy`

### Auto-seed not working
- Check backend logs for "Seeding demo data"
- Verify seedTestData function is imported
- Check database has all tables

## Cost Monitoring

### Railway (Backend + Database)
- Free tier: $5 credit/month
- Typical usage: ~$3-4/month for demo
- Monitor in Railway dashboard

### Vercel (Frontend)
- Free tier: Unlimited
- 100GB bandwidth/month
- More than enough for demo

## Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] ENCRYPTION_KEY is exactly 32 characters
- [ ] Environment variables not committed to Git
- [ ] CORS only allows your frontend domain
- [ ] HTTPS enabled (automatic with Vercel/Railway)
- [ ] Database credentials secure

## Next Steps

After successful deployment:
1. Add custom domain (optional)
2. Set up monitoring/alerts
3. Add analytics (Google Analytics, Plausible)
4. Create landing page
5. Add social sharing meta tags

## Support

If you encounter issues:
1. Check Railway/Vercel logs
2. Review this checklist
3. Test locally first
4. Check environment variables

---

**Estimated Time**: 30-45 minutes for first deployment

**Cost**: $0/month (free tiers sufficient for demo)
