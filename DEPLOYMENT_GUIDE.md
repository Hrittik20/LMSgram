# 🚀 Deployment Guide - Vercel + Render

Your frontend is on Vercel, but it needs a backend to work! Here's how to deploy everything.

## Current Issue
❌ Frontend on Vercel can't reach localhost:3000 backend
✅ Solution: Deploy backend to Render (free)

## Step-by-Step Deployment

### Part 1: Deploy Backend to Render

1. **Sign up for Render**
   - Go to https://render.com
   - Sign up with GitHub (free tier)

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your `TgBot` repository

3. **Configure Service**
   ```
   Name: lms-backend
   Region: Choose closest to you
   Branch: main (or master)
   Root Directory: (leave empty)
   Runtime: Node
   Build Command: npm install
   Start Command: node server.js
   ```

4. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable"
   
   Add these one by one:
   ```
   TELEGRAM_BOT_TOKEN = your_actual_bot_token_from_botfather
   WEBAPP_URL = https://your-vercel-url.vercel.app
   PORT = 3000
   NODE_ENV = production
   DB_PATH = ./lms.db
   ```

5. **Deploy!**
   - Click "Create Web Service"
   - Wait 2-3 minutes for deployment
   - Copy your backend URL: `https://lms-backend-xxx.onrender.com`

### Part 2: Configure Frontend for Production

1. **Update Frontend API URL**
   
   In your Vercel dashboard:
   - Go to your project → Settings → Environment Variables
   - Add this variable:
     ```
     Name: VITE_API_URL
     Value: https://your-backend-url.onrender.com/api
     ```
   - Make sure it's for "Production" environment

2. **Redeploy Frontend**
   - Go to Deployments tab
   - Click "⋯" on latest deployment
   - Click "Redeploy"

### Part 3: Update Telegram Bot

1. **Open Telegram → @BotFather**
2. Send `/myapps`
3. Select your app
4. Choose "Edit Web App URL"
5. Enter your Vercel URL: `https://your-project.vercel.app`

### Part 4: Test Everything!

1. Open your bot in Telegram
2. Send `/start`
3. Click "Open LMS"
4. Should work now! 🎉

## Troubleshooting

### Frontend shows "Error loading user data"
✅ Check that VITE_API_URL is set in Vercel environment variables
✅ Verify backend is running on Render (green status)
✅ Redeploy frontend after adding environment variables

### Backend won't start on Render
✅ Check build logs for errors
✅ Verify all environment variables are set
✅ Make sure TELEGRAM_BOT_TOKEN is correct

### Bot doesn't respond
✅ Check WEBAPP_URL in backend env matches your Vercel URL
✅ Verify bot token is correct
✅ Check backend logs on Render

## Alternative: Deploy Everything to Render

If you want to keep everything on Render:

1. **Deploy Backend** (same as above)
2. **Deploy Frontend as Static Site**
   - New → Static Site
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
3. **Set Environment Variable**
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`

## Cost Breakdown

### Render (Free Tier)
- ✅ 750 hours/month free
- ✅ Auto-sleep after 15 min inactivity
- ✅ Wake up on first request (~30 seconds)

### Vercel (Free Tier)
- ✅ Unlimited bandwidth
- ✅ 100 GB-hours/month
- ✅ Always on (no sleep)

## Production Checklist

Before going live:

- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] VITE_API_URL set in Vercel
- [ ] All backend env variables set
- [ ] WEBAPP_URL points to Vercel
- [ ] BotFather Web App URL updated
- [ ] Test in Telegram: /start → Open LMS
- [ ] Test creating a course
- [ ] Test joining a course
- [ ] Test creating assignment
- [ ] Test submitting assignment

## Quick Commands

### Update and redeploy:
```bash
# Commit changes
git add .
git commit -m "Update configuration"
git push origin main

# Render and Vercel will auto-deploy!
```

### View logs:
- **Render**: Dashboard → Your service → Logs
- **Vercel**: Dashboard → Your project → Deployments → Click deployment → View Function Logs

## Environment Variables Reference

### Backend (Render)
```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdef...
WEBAPP_URL=https://your-project.vercel.app
PORT=3000
NODE_ENV=production
DB_PATH=./lms.db
```

### Frontend (Vercel)
```env
VITE_API_URL=https://lms-backend.onrender.com/api
```

## Database Notes

⚠️ **Important**: Render's free tier doesn't persist files between restarts!

For production, consider:
1. **Render PostgreSQL** (free tier available)
2. **MongoDB Atlas** (free tier)
3. **Supabase** (free tier)

Update `database.js` to use one of these instead of SQLite.

## Need Help?

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Check logs for detailed error messages
- Ensure all URLs use HTTPS (not http)

---

Your LMS is almost live! Just follow these steps and you'll be teaching in no time! 🎓



