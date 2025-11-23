# Telegram LMS Mini App 🎓

A modern Learning Management System (LMS) built as a Telegram Mini App - an easy alternative to Google Classroom.

## Features

### For Teachers 👨‍🏫
- Create and manage courses
- Post assignments with deadlines
- Grade student submissions
- Share announcements
- Upload course materials
- View student progress

### For Students 👨‍🎓
- Join courses with access codes
- View and submit assignments
- Track grades and feedback
- Receive notifications
- Download course materials
- View announcements

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite
- **Bot**: node-telegram-bot-api
- **Frontend**: React + Vite
- **UI**: Modern, responsive design with Telegram theme integration

## Setup Instructions

### 1. Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Telegram Bot Token (get from [@BotFather](https://t.me/botfather))

### 2. Installation

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Configuration

```bash
# Copy environment file
cp .env.example .env

# Edit .env and add your Telegram Bot Token
```

### 4. Running the Application

**Development Mode:**
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Production Mode:**
```bash
# Build frontend
npm run build

# Start server
npm start
```

### 5. Create Your Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` and follow instructions
3. Copy the bot token to `.env`
4. Set up the mini app with `/newapp`
5. Link it to your bot and provide the webapp URL

## Usage

1. Start the bot in Telegram
2. Use `/start` command to initialize
3. Click "Open LMS" button to launch the mini app
4. Teachers can create courses, students can join with access codes

## Project Structure

```
TgBot/
├── server.js           # Main server file
├── bot.js              # Telegram bot logic
├── database.js         # Database setup and queries
├── routes/             # API routes
│   ├── courses.js
│   ├── assignments.js
│   └── users.js
├── uploads/            # File uploads
├── frontend/           # React mini app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
└── package.json
```

## API Endpoints

### Courses
- `GET /api/courses` - Get all courses for user
- `POST /api/courses` - Create new course
- `POST /api/courses/:id/join` - Join course with code

### Assignments
- `GET /api/courses/:id/assignments` - Get course assignments
- `POST /api/assignments` - Create assignment
- `POST /api/assignments/:id/submit` - Submit assignment

### Users
- `GET /api/user/:telegramId` - Get user info
- `PUT /api/user/:telegramId` - Update user profile

## License

MIT

