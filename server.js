require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database');
const { initBot, setWebhook, getBot } = require('./bot');

// Initialize database
initDatabase();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/comments', require('./routes/comments'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Webhook endpoint for Telegram (production mode)
app.post(`/webhook/${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
  const bot = getBot();
  if (bot) {
    bot.processUpdate(req.body);
  }
  res.sendStatus(200);
});

// Webhook info endpoint (for debugging)
app.get('/webhook-info', async (req, res) => {
  const { getWebhookInfo } = require('./bot');
  const info = await getWebhookInfo();
  res.json(info || { message: 'Webhook not configured' });
});

// Manual webhook setup endpoint (useful when changing bot token)
app.post('/setup-webhook', async (req, res) => {
  const { setWebhook } = require('./bot');
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const webhookUrl = process.env.WEBHOOK_URL;
  
  if (!token || !webhookUrl) {
    return res.status(400).json({ 
      error: 'TELEGRAM_BOT_TOKEN and WEBHOOK_URL must be set in environment variables' 
    });
  }
  
  try {
    const success = await setWebhook(token, webhookUrl);
    if (success) {
      res.json({ 
        success: true, 
        message: 'Webhook set successfully',
        webhookUrl: webhookUrl 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to set webhook' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Initialize Telegram bot
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('⚠️  WARNING: TELEGRAM_BOT_TOKEN not found in environment variables!');
  console.error('Please create a .env file with your bot token.');
} else {
  const webAppUrl = process.env.WEB_APP_URL || 'http://localhost:5173';
  const useWebhook = process.env.USE_WEBHOOK === 'true';
  const webhookUrl = process.env.WEBHOOK_URL;
  
  // Warn if URL is not HTTPS
  if (!webAppUrl.startsWith('https://')) {
    console.warn('⚠️  WARNING: WEB_APP_URL is not HTTPS!');
    console.warn('Telegram requires HTTPS for Web App buttons.');
    console.warn('For local development, use ngrok:');
    console.warn('  1. Run: ngrok http 5173');
    console.warn('  2. Copy the HTTPS URL (e.g., https://abc123.ngrok-free.app)');
    console.warn('  3. Update .env: WEB_APP_URL=https://your-ngrok-url.ngrok-free.app');
    console.warn('  4. Restart the server');
    console.warn('');
    console.warn('Bot will still work, but Web App button will be disabled.');
  }
  
  // Initialize bot
  initBot(process.env.TELEGRAM_BOT_TOKEN, webAppUrl, useWebhook, webhookUrl);
  
  // Set up webhook if in production mode
  if (useWebhook && webhookUrl) {
    setWebhook(process.env.TELEGRAM_BOT_TOKEN, webhookUrl).then(success => {
      if (success) {
        console.log('✅ Webhook configured successfully');
      } else {
        console.error('❌ Failed to configure webhook');
      }
    });
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Make sure your bot token is set in .env file`);
});
