# LMS Telegram Bot - Setup Guide 🚀

## Quick Start Guide

### Step 1: Create Your Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the instructions:
   - Choose a name for your bot (e.g., "My LMS Bot")
   - Choose a username (must end with 'bot', e.g., "mylms_bot")
4. **Save the bot token** - you'll need this!

### Step 2: Create a Mini App

1. Still in BotFather, send `/newapp`
2. Select your bot
3. Provide app details:
   - **Title**: "LMS" (or your preferred name)
   - **Description**: "Learning Management System"
   - **Photo**: Upload an icon (optional)
   - **GIF/Video**: Skip this (send `/empty`)
   - **Web App URL**: This will be your hosted URL (see Step 5)
   - **Short name**: "lms" (this will be used in the URL)

### Step 3: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 4: Configure Environment

```bash
# Create .env file
cp .env.example .env
```

Edit `.env` file with your values:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
WEBAPP_URL=https://your-domain.com
PORT=3000
NODE_ENV=development
```

### Step 5: Deploy Your Application

#### Option A: Deploy to Heroku (Recommended for beginners)

1. Create a Heroku account at https://heroku.com
2. Install Heroku CLI
3. Deploy:

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set WEBAPP_URL=https://your-app-name.herokuapp.com
heroku config:set NODE_ENV=production

# Build frontend
cd frontend
npm run build
cd ..

# Deploy
git add .
git commit -m "Initial deployment"
git push heroku main
```

#### Option B: Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Build frontend: `cd frontend && npm run build && cd ..`
3. Deploy: `vercel`
4. Set environment variables in Vercel dashboard

#### Option C: Deploy to VPS (Advanced)

```bash
# On your server
git clone your-repo
cd TgBot
npm install
cd frontend
npm install
npm run build
cd ..

# Set up environment variables
nano .env

# Install PM2
npm install -g pm2

# Start server
pm2 start server.js --name lms-bot
pm2 save
pm2 startup
```

### Step 6: Update BotFather with Your URL

1. Go back to BotFather
2. Send `/myapps`
3. Select your app
4. Choose "Edit App" → "Web App URL"
5. Enter your deployed URL (from Step 5)

### Step 7: Test Your Bot

1. Search for your bot in Telegram (by username)
2. Send `/start` command
3. Click "Open LMS" button
4. Your mini app should load!

## Development Mode

For local development:

```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Note**: In development, the Telegram mini app features won't work fully. You'll need to use ngrok or similar to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose port 5173 (frontend)
ngrok http 5173

# Use the ngrok URL as your WEBAPP_URL
```

## Default User Roles

- **Students**: Default role for all new users
- **Teachers**: Click "Become a Teacher" button in the bot, or use `/role` command

## Features Overview

### For Teachers 👨‍🏫
1. Click "Open LMS" in bot
2. Go to "Courses" tab
3. Click "Create Course"
4. Share the access code with students
5. Create assignments, post announcements, upload materials
6. Grade student submissions

### For Students 👨‍🎓
1. Click "Open LMS" in bot
2. Go to "Courses" tab
3. Click "Join Course"
4. Enter the access code from your teacher
5. View assignments, submit work, check grades

## Troubleshooting

### Bot doesn't respond
- Check if TELEGRAM_BOT_TOKEN is correct in .env
- Ensure server is running
- Check server logs for errors

### Mini app doesn't load
- Verify WEBAPP_URL is correct
- Ensure frontend is built (`npm run build` in frontend folder)
- Check browser console for errors
- Make sure your server is accessible from the internet

### Database errors
- Database is created automatically on first run
- If corrupted, delete `lms.db` file and restart server
- Check file permissions in the project directory

### File upload issues
- Ensure `uploads/` directory exists and is writable
- Check file size limits (10MB for assignments, 50MB for materials)

## Production Checklist

Before going live:

- [ ] Set NODE_ENV=production in .env
- [ ] Use a proper database (PostgreSQL/MySQL instead of SQLite)
- [ ] Set up HTTPS for your domain
- [ ] Configure proper file storage (AWS S3, etc.)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for database
- [ ] Set up domain name and SSL certificate
- [ ] Test all features thoroughly
- [ ] Implement rate limiting
- [ ] Set up error tracking (Sentry, etc.)

## Upgrading from SQLite

For production, consider using PostgreSQL:

1. Install PostgreSQL
2. Update `database.js` to use pg instead of sqlite3
3. Update connection string in .env

## Support

If you encounter issues:
1. Check the logs: `pm2 logs lms-bot` (if using PM2)
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check Telegram Bot API status

## Security Notes

- Never commit `.env` file to git
- Keep your bot token secret
- Use environment variables for all sensitive data
- Implement proper authentication in production
- Validate all user inputs
- Sanitize file uploads
- Use HTTPS in production

## Next Steps

- Customize the UI colors in `frontend/src/index.css`
- Add more features (video lessons, quizzes, etc.)
- Integrate with external services (Google Drive, etc.)
- Add analytics and reporting
- Implement notifications for assignment deadlines
- Add support for multiple languages

Enjoy your LMS! 🎓



