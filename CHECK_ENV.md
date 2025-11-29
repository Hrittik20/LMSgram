# ⚙️ Environment Configuration Checklist

## Your .env File Should Look Like This:

```env
# Get this from @BotFather in Telegram
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Get this from ngrok (must be HTTPS!)
WEBAPP_URL=https://abc123.ngrok-free.app

# Server settings (leave as is)
PORT=3000
NODE_ENV=development
DB_PATH=./lms.db
```

## ✅ Checklist

- [ ] TELEGRAM_BOT_TOKEN is filled in (from @BotFather)
- [ ] WEBAPP_URL starts with `https://` (not http://)
- [ ] WEBAPP_URL has no trailing slash
- [ ] Backend server restarted after changing .env
- [ ] BotFather Web App URL matches WEBAPP_URL

## 🔍 How to Get Each Value

### TELEGRAM_BOT_TOKEN
1. Open Telegram
2. Search for `@BotFather`
3. Send `/newbot`
4. Follow the prompts
5. Copy the token (long string with numbers and letters)

### WEBAPP_URL
1. Install ngrok: `npm install -g ngrok`
2. Get free account: https://ngrok.com
3. Authenticate: `ngrok config add-authtoken YOUR_TOKEN`
4. Start tunnel: `ngrok http 5173`
5. Copy the HTTPS URL shown (e.g., https://abc123.ngrok-free.app)

## 🔧 Testing Your Configuration

After setting up your .env:

1. **Stop backend server** (Ctrl+C in Terminal 2)
2. **Restart backend**: `npm run dev`
3. **Check for errors** in the terminal
4. **Test bot**: Send `/start` to your bot in Telegram
5. **Open app**: Click "Open LMS" button

## ⚠️ Common Mistakes

❌ Using http:// instead of https://
❌ Adding trailing slash: `https://abc123.ngrok-free.app/`
❌ Not restarting backend after changing .env
❌ BotFather URL doesn't match .env URL
❌ Bot token has extra spaces

## 💡 Quick Test

Run this to check if your .env is loaded:
```bash
node -e "require('dotenv').config(); console.log('Bot Token:', process.env.TELEGRAM_BOT_TOKEN ? '✓ Set' : '✗ Missing'); console.log('Web App URL:', process.env.WEBAPP_URL);"
```

Should output:
```
Bot Token: ✓ Set
Web App URL: https://your-ngrok-url.ngrok-free.app
```



