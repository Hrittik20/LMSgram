require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database');
const { initBot } = require('./bot');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Initialize database
initDatabase();

// Initialize Telegram bot
if (process.env.TELEGRAM_BOT_TOKEN) {
  const webAppUrl = process.env.WEBAPP_URL || `http://localhost:${PORT}`;
  initBot(process.env.TELEGRAM_BOT_TOKEN, webAppUrl);
} else {
  console.warn('⚠️  TELEGRAM_BOT_TOKEN not set. Bot will not start.');
  console.warn('Please create a .env file with your bot token.');
}

// API Routes
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const assignmentRoutes = require('./routes/assignments');
const announcementRoutes = require('./routes/announcements');
const materialRoutes = require('./routes/materials');

app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/materials', materialRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LMS API is running' });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║   🎓 LMS Telegram Bot Server       ║
╚══════════════════════════════════════╝

✅ Server running on port ${PORT}
✅ Database initialized
${process.env.TELEGRAM_BOT_TOKEN ? '✅ Telegram bot active' : '⚠️  Telegram bot inactive'}

API Endpoints:
  • GET  /api/health
  • POST /api/users
  • GET  /api/courses
  • POST /api/courses
  • POST /api/assignments
  
Ready to serve! 🚀
  `);
});

module.exports = app;

