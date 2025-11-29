# 🚀 Quick Start Guide - Get Running in 5 Minutes!

## ⚡ Super Quick Start (Windows)

### Step 1: Get Your Bot Token (2 minutes)
1. Open Telegram, search for `@BotFather`
2. Send `/newbot`
3. Follow prompts to create your bot
4. **Copy the token** you receive

### Step 2: Install & Configure (1 minute)
```bash
# Double-click this file:
install.bat

# Then edit .env.example and add your token:
# TELEGRAM_BOT_TOKEN=your_token_here
# Save as .env (remove .example)
```

Or manually:
```bash
npm install
cd frontend
npm install
cd ..
```

### Step 3: Start Development Servers (1 minute)
```bash
# Double-click this file:
start-dev.bat
```

Or manually:
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Step 4: Set Up Mini App in Telegram (1 minute)
1. Go back to `@BotFather`
2. Send `/newapp`
3. Select your bot
4. Provide:
   - Title: "LMS"
   - Description: "Learning Management System"
   - Photo: (skip with `/empty`)
   - Web App URL: `http://localhost:5173` (for dev)
   - Short name: "lms"

### Step 5: Test It! (30 seconds)
1. Find your bot in Telegram
2. Send `/start`
3. Click "Open LMS" button
4. You're in! 🎉

## 📋 What's Next?

### Become a Teacher
1. In your bot, click "Become a Teacher" button
2. Now you can create courses!

### Create Your First Course
1. Open LMS mini app
2. Go to "Courses" tab
3. Click "Create Course"
4. Enter course name and description
5. Get your access code!

### Invite Students
Share the access code with students. They can:
1. Open your bot
2. Click "Open LMS"
3. Go to "Courses" tab
4. Click "Join Course"
5. Enter the access code

## 🎯 Common Tasks

### Create an Assignment
1. Open your course
2. Go to "Assignments" tab
3. Click "Create Assignment"
4. Fill in details and due date
5. Submit!

### Post an Announcement
1. Open your course
2. Go to "Announcements" tab
3. Click "Post Announcement"
4. Write your message
5. All students get notified! 📢

### Upload Course Material
1. Open your course
2. Go to "Materials" tab
3. Click "Upload Material"
4. Select your file
5. Done!

### Grade Submissions
1. Go to "Assignments" tab
2. Click on an assignment
3. View student submissions
4. Click "Grade Submission"
5. Enter grade and feedback
6. Student gets notified! ✅

## 🔧 Troubleshooting

### Bot doesn't respond?
- Check if backend server is running
- Verify bot token in `.env` file
- Make sure token doesn't have extra spaces

### Mini app doesn't load?
- Check if frontend server is running on port 5173
- Clear Telegram cache (Settings → Data)
- Try `/start` command again

### Can't create course?
- Make sure you're a teacher (click "Become a Teacher")
- Check browser console for errors (F12)
- Verify backend server is running

### File upload fails?
- Check file size (10MB for assignments, 50MB for materials)
- Ensure `uploads/` folder exists
- Check backend logs for errors

## 📱 Bot Commands

- `/start` - Start the bot and open menu
- `/help` - Show help information
- `/role` - Check your current role

## 🌐 For Production Deployment

### Quick Deploy to Heroku
```bash
# Login to Heroku
heroku login

# Create app
heroku create my-lms-bot

# Set environment variables
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set WEBAPP_URL=https://my-lms-bot.herokuapp.com
heroku config:set NODE_ENV=production

# Build frontend
cd frontend && npm run build && cd ..

# Deploy
git add .
git commit -m "Deploy"
git push heroku main
```

Then update your bot's Web App URL in BotFather to your Heroku URL!

## 💡 Pro Tips

1. **Test with two accounts** - One teacher, one student
2. **Use meaningful course codes** - Makes it easier for students
3. **Set due dates** - Students get automatic reminders
4. **Provide feedback** - Students appreciate detailed feedback
5. **Post regular announcements** - Keep students engaged

## 📚 Need More Help?

- **Full Setup Guide**: See `SETUP_GUIDE.md`
- **Architecture**: See `ARCHITECTURE.md`
- **Project Details**: See `PROJECT_SUMMARY.md`
- **Main Documentation**: See `README.md`

## 🎓 Example Workflow

**Teacher Creates Class:**
1. Become teacher → Create course → Get code: `ABC12345`
2. Create assignment: "Homework 1" (Due: Next week)
3. Post announcement: "Welcome to the course!"
4. Upload material: "Lecture_Notes.pdf"

**Student Joins Class:**
1. Join course with code `ABC12345`
2. See announcement
3. Download lecture notes
4. View assignment
5. Submit homework (text + file)
6. Check grade and feedback

**Teacher Grades:**
1. View submissions
2. Review student work
3. Grade: 95/100
4. Feedback: "Excellent work!"
5. Student gets notified

## 🚀 That's It!

You now have a fully functional LMS in Telegram! 

Start creating courses and invite your students. Happy teaching! 📚✨

---

**Need help?** Check the other documentation files or the code comments.



