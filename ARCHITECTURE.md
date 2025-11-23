# LMS Telegram Bot - Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         TELEGRAM USER                            │
│                    (Opens bot in Telegram)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ├─────► /start, /help commands
                         │
                         ▼
        ┌────────────────────────────────────┐
        │     TELEGRAM BOT (bot.js)          │
        │  - Handle commands                 │
        │  - Send notifications              │
        │  - Manage inline keyboard          │
        │  - Open Mini App button            │
        └────────┬───────────────────────────┘
                 │
                 │ User clicks "Open LMS" button
                 │
                 ▼
        ┌────────────────────────────────────┐
        │   TELEGRAM MINI APP (React)        │
        │   ┌────────────────────────────┐   │
        │   │  Frontend (Port 5173/5000) │   │
        │   │  - Dashboard               │   │
        │   │  - Courses                 │   │
        │   │  - Assignments             │   │
        │   │  - Submissions             │   │
        │   │  - Grading                 │   │
        │   └────────────┬───────────────┘   │
        └────────────────┼───────────────────┘
                         │
                         │ HTTP Requests (Axios)
                         │
                         ▼
        ┌────────────────────────────────────┐
        │   EXPRESS SERVER (Port 3000)       │
        │   ┌────────────────────────────┐   │
        │   │  API Routes                │   │
        │   │  /api/users                │   │
        │   │  /api/courses              │   │
        │   │  /api/assignments          │   │
        │   │  /api/submissions          │   │
        │   │  /api/announcements        │   │
        │   │  /api/materials            │   │
        │   └────────────┬───────────────┘   │
        └────────────────┼───────────────────┘
                         │
                         │ Database Queries
                         │
                         ▼
        ┌────────────────────────────────────┐
        │   SQLITE DATABASE (lms.db)         │
        │   ┌────────────────────────────┐   │
        │   │  Tables:                   │   │
        │   │  - users                   │   │
        │   │  - courses                 │   │
        │   │  - enrollments             │   │
        │   │  - assignments             │   │
        │   │  - submissions             │   │
        │   │  - announcements           │   │
        │   │  - materials               │   │
        │   └────────────────────────────┘   │
        └────────────────────────────────────┘

        ┌────────────────────────────────────┐
        │   FILE STORAGE                     │
        │   - /uploads/                      │
        │     - Assignment submissions       │
        │     - /materials/                  │
        │       - Course materials           │
        └────────────────────────────────────┘
```

## Data Flow Examples

### 1. Student Joins Course

```
Student                Mini App              Server              Database
   │                      │                     │                     │
   │  Click "Join"        │                     │                     │
   ├──────────────────────►                     │                     │
   │                      │  POST /api/courses/join                  │
   │                      ├─────────────────────►                     │
   │                      │  {access_code, telegram_id}              │
   │                      │                     │  Find course by code│
   │                      │                     ├─────────────────────►
   │                      │                     │  Create enrollment  │
   │                      │                     ├─────────────────────►
   │                      │  ◄───Success────────┤                     │
   │  ◄──Show Course──────┤                     │                     │
   │                      │                     │                     │
```

### 2. Teacher Creates Assignment

```
Teacher                Mini App              Server              Database            Bot
   │                      │                     │                     │                │
   │  Fill form           │                     │                     │                │
   ├──────────────────────►                     │                     │                │
   │  Click "Create"      │                     │                     │                │
   │                      │  POST /api/assignments                    │                │
   │                      ├─────────────────────►                     │                │
   │                      │                     │  Insert assignment  │                │
   │                      │                     ├─────────────────────►                │
   │                      │                     │  Get enrolled students               │
   │                      │                     ├─────────────────────►                │
   │                      │                     │                     │  Send notifications
   │                      │                     ├─────────────────────────────────────►
   │                      │  ◄───Success────────┤                     │                │
   │  ◄──Show Assignment──┤                     │                     │                │
```

### 3. Student Submits Assignment

```
Student                Mini App              Server              Database            Bot
   │                      │                     │                     │                │
   │  Write answer        │                     │                     │                │
   │  Upload file         │                     │                     │                │
   ├──────────────────────►                     │                     │                │
   │  Click "Submit"      │                     │                     │                │
   │                      │  POST /api/assignments/:id/submit         │                │
   │                      ├─────────────────────►                     │                │
   │                      │  FormData + file    │                     │                │
   │                      │                     │  Save file          │                │
   │                      │                     │  Create submission  │                │
   │                      │                     ├─────────────────────►                │
   │                      │                     │                     │  Notify student │
   │                      │                     ├─────────────────────────────────────►
   │                      │  ◄───Success────────┤                     │                │
   │  ◄──Confirmation─────┤                     │                     │                │
```

### 4. Teacher Grades Submission

```
Teacher                Mini App              Server              Database            Bot
   │                      │                     │                     │                │
   │  View submissions    │                     │                     │                │
   ├──────────────────────►                     │                     │                │
   │  Enter grade         │                     │                     │                │
   │  Write feedback      │                     │                     │                │
   │  Click "Save"        │                     │                     │                │
   │                      │  POST /api/assignments/submissions/:id/grade               │
   │                      ├─────────────────────►                     │                │
   │                      │                     │  Update submission  │                │
   │                      │                     ├─────────────────────►                │
   │                      │                     │                     │  Notify student │
   │                      │                     ├─────────────────────────────────────►
   │                      │  ◄───Success────────┤                     │                │
   │  ◄──Updated──────────┤                     │                     │                │
```

## Component Hierarchy

```
App
├── Dashboard
│   └── Stats Cards
│       ├── Total Courses
│       ├── Total Assignments
│       ├── Pending Submissions (Student)
│       └── Average Grade (Student)
│
├── Courses
│   ├── CreateCourseModal (Teacher)
│   ├── JoinCourseModal (Student)
│   └── CourseDetail
│       ├── Assignments Tab
│       │   └── CreateAssignmentModal (Teacher)
│       ├── Announcements Tab
│       │   └── CreateAnnouncementModal (Teacher)
│       ├── Materials Tab
│       │   └── UploadMaterialModal (Teacher)
│       └── Students Tab (Teacher)
│
└── Assignments
    └── AssignmentDetail
        ├── Submission Form (Student)
        ├── Grade Display (Student)
        └── Submissions List (Teacher)
            └── GradeModal (Teacher)
```

## Database Relationships

```
users (1) ────────────── (N) courses [teacher_id]
  │                            │
  │                            │
  │                            │
  ├── (N) enrollments (N) ────┤
  │                            │
  │                            │
  │                            ├── (N) assignments
  │                            │         │
  │                            │         │
  └── (N) submissions (N) ─────┘         │
                                         │
                                         │
                                    (1) ─┘

courses (1) ──── (N) announcements
courses (1) ──── (N) materials
```

## Authentication Flow

```
1. User opens bot in Telegram
   │
   ▼
2. User clicks "Open LMS" button
   │
   ▼
3. Telegram Mini App loads
   │
   ▼
4. App reads Telegram.WebApp.initDataUnsafe.user
   │
   ▼
5. App sends user data to POST /api/users
   │
   ▼
6. Server creates/finds user by telegram_id
   │
   ▼
7. Server returns user with role
   │
   ▼
8. App stores user in state
   │
   ▼
9. App shows appropriate UI based on role
```

## Security Layers

```
┌─────────────────────────────────────┐
│  Telegram Authentication            │
│  - Validates user via Telegram ID   │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Role-Based Access Control          │
│  - Teacher: Can create, grade       │
│  - Student: Can join, submit        │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Input Validation                   │
│  - Server-side validation           │
│  - File size/type checks            │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Parameterized Queries              │
│  - SQL injection prevention         │
└─────────────────────────────────────┘
```

## File Upload Flow

```
User                     Frontend              Multer              Server              Disk
 │                          │                     │                   │                   │
 │  Select file             │                     │                   │                   │
 ├──────────────────────────►                     │                   │                   │
 │  Submit form             │                     │                   │                   │
 │                          │  FormData           │                   │                   │
 │                          ├─────────────────────►                   │                   │
 │                          │                     │  Parse multipart  │                   │
 │                          │                     │  Validate file    │                   │
 │                          │                     │  Save to disk     │                   │
 │                          │                     ├───────────────────────────────────────►
 │                          │                     │  ◄────file path───┤                   │
 │                          │                     │  Return to server │                   │
 │                          │                     ├──────────────────►                    │
 │                          │                     │  Save path to DB  │                   │
 │                          │  ◄─────Success──────┤                   │                   │
 │  ◄───Confirmation────────┤                     │                   │                   │
```

## Deployment Architecture (Production)

```
┌─────────────────────────────────────────────────────────────┐
│                      NGINX (Reverse Proxy)                   │
│                   - SSL/TLS Termination                      │
│                   - Static file serving                      │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──── /api/* ───────► Express Server (PM2)
             │                     - Handle API requests
             │                     - Bot polling
             │
             └──── /* ──────────► Static files (React build)
                                  - Serve frontend

┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                        │
│                   (Replaces SQLite in prod)                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   S3 / Cloud Storage                         │
│                   - File uploads                             │
│                   - Course materials                         │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack Details

### Backend Stack
- **Node.js v16+** - JavaScript runtime
- **Express 4.x** - Web framework
- **SQLite3** - Embedded database
- **node-telegram-bot-api** - Bot API wrapper
- **Multer** - Multipart/form-data handling
- **CORS** - Cross-origin resource sharing
- **Body-parser** - Request body parsing
- **dotenv** - Environment configuration

### Frontend Stack
- **React 18** - UI library with hooks
- **Vite 5** - Fast build tool
- **Axios** - Promise-based HTTP client
- **React Router 6** - Client-side routing
- **Telegram WebApp SDK** - Mini app integration

### DevOps
- **Git** - Version control
- **PM2** - Process manager
- **Nodemon** - Development auto-reload
- **npm** - Package manager

## Performance Considerations

### Database Optimization
- Indexed fields: telegram_id, access_code
- Foreign key constraints for referential integrity
- Prepared statements for all queries

### File Handling
- Size limits: 10MB (assignments), 50MB (materials)
- Unique filenames to prevent conflicts
- Separate directories for organization

### Frontend Optimization
- Lazy loading of components
- Efficient re-rendering with React hooks
- Minimal API calls with proper caching
- Responsive images and assets

## Scalability Path

### Current (Small-Medium Scale)
- SQLite database
- Local file storage
- Single server deployment
- Up to 1,000 users

### Future (Large Scale)
- PostgreSQL/MySQL cluster
- S3/Cloud storage
- Load-balanced servers
- Redis caching
- CDN for static assets
- Microservices architecture
- 10,000+ users

---

This architecture provides a solid foundation that can scale from a small classroom to a large educational institution.

