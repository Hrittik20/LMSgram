# 🔧 Fix: App Keeps Loading in Telegram Mini App

## Problem
When you open the app through Telegram Mini App, it keeps loading indefinitely. This is usually because the frontend can't connect to the backend API.

## Root Cause
When deployed on Vercel, the frontend needs to know where your backend server is. The `/api` proxy only works in local development.

## ✅ Solution: Set API URL in Vercel

### Step 1: Find Your Backend URL
Your backend server should be deployed somewhere (Render, Heroku, Railway, etc.). Get the full URL:
- Example: `https://your-backend.onrender.com`
- Example: `https://your-backend.herokuapp.com`
- Example: `https://api.yourdomain.com`

### Step 2: Set Environment Variable in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-backend-url.com` (your actual backend URL)
   - **Environment:** Production, Preview, Development (select all)
4. Click **Save**

### Step 3: Redeploy

After setting the environment variable:
1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**

Or push a new commit to trigger automatic redeployment.

### Step 4: Verify

1. Open the app in Telegram
2. Check the browser console (if possible) or look at the error message
3. The app should now connect to your backend

---

## 🔍 Debugging

If it still doesn't work:

### Check Browser Console
1. Open the app in Telegram
2. If possible, open browser developer tools (might not be available in Telegram)
3. Look for console errors showing the API URL being used

### Check Error Message
The app now shows debug info including:
- The API URL being used
- Whether Telegram WebApp is available
- Error messages

### Test API Manually
Try accessing your backend health endpoint:
```
https://your-backend-url.com/health
```

You should see:
```json
{"status":"ok","message":"Server is running"}
```

If this doesn't work, your backend might not be running or accessible.

---

## 📝 Example Configuration

**Backend on Render:**
```
VITE_API_URL=https://lms-bot-backend.onrender.com
```

**Backend on Heroku:**
```
VITE_API_URL=https://lms-bot-backend.herokuapp.com
```

**Backend on Railway:**
```
VITE_API_URL=https://lms-bot-backend.up.railway.app
```

**Backend on Custom Domain:**
```
VITE_API_URL=https://api.yourdomain.com
```

---

## ⚠️ Important Notes

1. **No trailing slash:** Don't add `/api` or trailing `/` to the URL
   - ✅ Correct: `https://backend.onrender.com`
   - ❌ Wrong: `https://backend.onrender.com/api`
   - ❌ Wrong: `https://backend.onrender.com/`

2. **HTTPS required:** Make sure your backend URL uses HTTPS (required for production)

3. **CORS:** Make sure your backend has CORS enabled (should already be set in `server.js`)

4. **Backend must be running:** Your backend server must be deployed and running

---

## 🚀 Quick Checklist

- [ ] Backend is deployed and accessible
- [ ] Backend health endpoint works (`/health`)
- [ ] `VITE_API_URL` is set in Vercel environment variables
- [ ] Vercel deployment is redeployed after setting variable
- [ ] Backend has CORS enabled
- [ ] Backend URL uses HTTPS

---

## 💡 Alternative: Same Domain Setup

If you want to use the same domain for both frontend and backend:

1. Deploy backend to a subdomain: `api.yourdomain.com`
2. Deploy frontend to: `app.yourdomain.com` or `yourdomain.com`
3. Set `VITE_API_URL=https://api.yourdomain.com`

Or use Vercel rewrites to proxy `/api/*` to your backend (more complex setup).

