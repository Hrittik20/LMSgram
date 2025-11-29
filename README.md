# 🎓 LMSgram - Telegram Learning Management System

A modern, full-featured Learning Management System built as a Telegram Mini App. Create courses, manage assignments, share materials, and engage students - all within Telegram!

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🌟 Live Demo
**Telegram Bot**: [@YourBotName](https://t.me/your_bot_name)  
**Web App**: [lmsgram.vercel.app](https://lmsgram.vercel.app)

## ✨ Features

### For Teachers
- 📚 **Create Courses** - Organize content with descriptions and access codes
- 📝 **Assign Work** - Create assignments with due dates
- 📊 **Grade Submissions** - Review and grade student work
- 📢 **Announcements** - Broadcast updates to entire class
- 📁 **Upload Materials** - Share PDFs, documents, and resources
- 🎓 **Dual Role** - Join other courses as a student

### For Students
- 🔍 **Join Courses** - Enter access code to enroll
- 📝 **Submit Assignments** - Upload work directly
- 📚 **Access Materials** - View and download course resources
- 🔔 **Real-time Notifications** - Get updates via Telegram
- 📊 **Track Progress** - View grades and pending work

### UI/UX
- 🎨 Modern gradient design with smooth animations
- 📱 Mobile-first responsive interface
- ⚡ Fast and lightweight
- 🌓 Telegram theme integration
- ✨ Intuitive navigation

## 🚀 Tech Stack

**Frontend:**
- React 18 + Vite
- Axios for API calls
- Telegram WebApp SDK
- Modern CSS with animations

**Backend:**
- Node.js + Express
- SQLite database
- Telegram Bot API
- Multer for file uploads

**Deployment:**
- Frontend: Vercel
- Backend: Render
- Bot: Telegram

## 📦 Quick Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/TgBot.git
cd TgBot
```

### 2. Install Dependencies
```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

### 3. Configure Environment
Create `.env` file:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
WEBAPP_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
PORT=3000
NODE_ENV=development
```

### 4. Create Telegram Bot
1. Message [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow instructions
3. Copy your bot token to `.env`
4. Set menu button: `/mybots` → Your Bot → Menu Button → Set URL to `http://localhost:5173`

### 5. Run Development
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` or open your bot in Telegram!

## 🌐 Production Deployment

### Backend (Render)
1. Push code to GitHub
2. Go to [Render](https://render.com) → New Web Service
3. Connect your repository
4. Add environment variables
5. Deploy

### Frontend (Vercel)
1. Go to [Vercel](https://vercel.com) → New Project
2. Import your repository
3. Set Root Directory to `frontend`
4. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com/api`
5. Deploy

### Update Bot
Message @BotFather → `/mybots` → Your Bot → Menu Button → Update URL to your Vercel deployment

## 📁 Project Structure
```
TgBot/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── App.jsx      # Main app
│   │   └── index.css    # Styles
│   └── package.json
├── routes/            # API routes
│   ├── users.js
│   ├── courses.js
│   ├── assignments.js
│   └── ...
├── bot.js            # Telegram bot logic
├── database.js       # Database queries
├── server.js         # Express server
└── package.json
```

## 🔑 Environment Variables

**Backend (Render):**
```
TELEGRAM_BOT_TOKEN=your_token
WEBAPP_URL=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

**Frontend (Vercel):**
```
VITE_API_URL=https://your-backend.onrender.com/api
```

## 🤝 Contributing
Contributions are welcome! Feel free to submit issues and pull requests.

## 📄 License
MIT License - feel free to use this project for learning or commercial purposes.

## 🆘 Support
- **Issues**: [GitHub Issues](https://github.com/yourusername/TgBot/issues)
- **Telegram**: [@YourUsername](https://t.me/yourusername)

## 🙏 Acknowledgments
Built with ❤️ using Telegram Mini Apps, React, and Node.js

---

⭐ Star this repo if you find it helpful!
