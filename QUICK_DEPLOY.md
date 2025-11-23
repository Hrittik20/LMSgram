# ⚡ Quick Deployment Fix

Your frontend is on Vercel but can't reach the backend. Here's the **fastest solution**:

## 🎯 What You Need to Do

### Step 1: Deploy Backend to Render (5 minutes)

1. **Go to** https://render.com
2. **Sign up** with GitHub (free)
3. **Click** "New +" → "Web Service"
4. **Connect** your GitHub repository (TgBot)
5. **Fill in:**
   - Name: `lms-backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`

6. **Add Environment Variables** (click "Advanced"):
   ```
   TELEGRAM_BOT_TOKEN = (your bot token from @BotFather)
   WEBAPP_URL = https://your-vercel-url.vercel.app
   PORT = 3000
   NODE_ENV = production
   DB_PATH = ./lms.db
   ```

7. **Click** "Create Web Service"
8. **Wait** 2-3 minutes
9. **Copy** your backend URL (e.g., `https://lms-backend-abc.onrender.com`)

### Step 2: Configure Vercel (2 minutes)

1. **Go to** your Vercel dashboard
2. **Select** your project
3. **Click** "Settings" → "Environment Variables"
4. **Add** new variable:
   ```
   Name: VITE_API_URL
   Value: https://lms-backend-abc.onrender.com/api
   ```
   (Replace with YOUR backend URL + /api)

5. **Click** "Save"

### Step 3: Redeploy Frontend (1 minute)

1. **Go to** "Deployments" tab
2. **Click** "⋯" on the latest deployment
3. **Click** "Redeploy"
4. **Wait** ~1 minute

### Step 4: Update Telegram Bot (1 minute)

1. **Open Telegram** → Search `@BotFather`
2. **Send** `/myapps`
3. **Select** your app
4. **Choose** "Edit Web App URL"
5. **Enter** your Vercel URL: `https://your-project.vercel.app`

### Step 5: Test! 🎉

1. **Open** your bot in Telegram
2. **Send** `/start`
3. **Click** "Open LMS"
4. **It should work!** ✨

## 📋 Checklist

- [ ] Backend deployed to Render
- [ ] Backend URL copied
- [ ] VITE_API_URL added to Vercel env variables
- [ ] Frontend redeployed on Vercel
- [ ] BotFather updated with Vercel URL
- [ ] Tested in Telegram

## 🆘 Still Not Working?

### Check Backend on Render
- Go to your service dashboard
- Click "Logs"
- Look for errors
- Status should be **green** (not sleeping)

### Check Frontend on Vercel  
- Go to your project
- Click latest deployment
- Click "View Function Logs"
- Look for API call errors

### Common Issues

**"Error loading user data"**
- ✅ Make sure VITE_API_URL is set in Vercel
- ✅ Make sure you redeployed after adding it
- ✅ Check backend is running on Render

**Backend won't start**
- ✅ Check all env variables are set on Render
- ✅ Verify TELEGRAM_BOT_TOKEN is correct
- ✅ Check Render logs for errors

**Bot doesn't open app**
- ✅ Make sure Web App URL in BotFather is your Vercel URL
- ✅ URL should be HTTPS (not HTTP)
- ✅ No trailing slash in URL

## 💰 Cost

Both are **100% FREE**:
- Render: 750 hours/month (free tier)
- Vercel: Unlimited (free tier for hobby projects)

⚠️ **Note**: Render free tier sleeps after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up.

## 🔄 Push Updates

After you push to GitHub:
1. Render auto-deploys backend ✅
2. Vercel auto-deploys frontend ✅
3. Everything updates automatically! 🚀

## 📚 Full Documentation

See `DEPLOYMENT_GUIDE.md` for detailed instructions and troubleshooting.

---

That's it! Your LMS should be live in ~10 minutes! 🎓

