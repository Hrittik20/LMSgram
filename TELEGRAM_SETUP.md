# 🤖 Telegram Bot Setup - Complete Guide

## Current Status
✅ Frontend running: http://localhost:5173
✅ Backend running: http://localhost:3000
⚠️ Need: HTTPS URL for Telegram Mini App

## Why HTTPS is Required
Telegram Mini Apps **only work with HTTPS URLs**. For local development, we'll use **ngrok** to create a secure tunnel.

## Step-by-Step Setup

### Step 1: Install ngrok
Open a **NEW terminal** (Terminal 4) and run:
```bash
npm install -g ngrok
```

### Step 2: Create ngrok Account (Free)
1. Go to https://ngrok.com/
2. Sign up (free account)
3. Copy your authtoken from the dashboard

### Step 3: Authenticate ngrok
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Step 4: Start ngrok Tunnel
Keep frontend running (port 5173), then run:
```bash
ngrok http 5173
```

You'll see output like:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:5173
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

### Step 5: Update .env File
Open your `.env` file and update WEBAPP_URL:
```env
TELEGRAM_BOT_TOKEN=your_actual_bot_token
WEBAPP_URL=https://abc123.ngrok-free.app
PORT=3000
NODE_ENV=development
DB_PATH=./lms.db
```

### Step 6: Restart Backend Server
1. Go to your backend terminal (Terminal 2)
2. Press `Ctrl+C` to stop
3. Run again: `npm run dev`

### Step 7: Update BotFather
1. Open Telegram → Search `@BotFather`
2. Send `/myapps`
3. Select your app
4. Choose "Edit Web App URL"
5. Enter: `https://abc123.ngrok-free.app`

### Step 8: Test in Telegram!
1. Find your bot in Telegram
2. Send `/start`
3. Click "Open LMS" button
4. Your app should load! 🎉

## Important Notes

⚠️ **ngrok URL changes** every time you restart ngrok (free plan)
- You'll need to update `.env` and BotFather each time
- Or upgrade to ngrok paid plan for a permanent URL

⚠️ **Keep all 3 terminals running:**
- Terminal 2: Backend server
- Terminal 3: Frontend server  
- Terminal 4: ngrok tunnel

## Troubleshooting

**"Invalid Web App URL" error:**
- Make sure you're using the HTTPS URL from ngrok
- Don't include trailing slash
- Update both `.env` and BotFather

**Bot doesn't respond:**
- Check backend terminal for errors
- Verify bot token in `.env` is correct
- Make sure backend server restarted after .env change

**Mini app shows blank screen:**
- Check browser console (F12) for errors
- Verify ngrok URL matches in both .env and BotFather
- Try clearing Telegram cache

## Production Alternative

For a permanent solution without ngrok:
1. Deploy to Heroku/Vercel (free tier)
2. Get automatic HTTPS URL
3. Update BotFather once
4. No need for ngrok!

See `SETUP_GUIDE.md` for deployment instructions.

