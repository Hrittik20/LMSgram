# 📋 LMSgram - Project Report Documentation


## 🤖 AI Prompt for Understanding This Project

Use this prompt when you need an AI to understand and work with this project:

---

**PROMPT:**

```
You are analyzing a Learning Management System (LMS) called "LMSgram" built as a Telegram Mini App. Here is the complete technical specification:

## Architecture Overview
- **Type**: Full-stack web application integrated with Telegram Bot API
- **Pattern**: Client-Server with RESTful API
- **Platform**: Telegram Mini App (WebApp)

## Tech Stack
- **Frontend**: React 18 + Vite, Axios, CSS with animations
- **Backend**: Node.js + Express.js
- **Database**: SQLite (sqlite3)
- **Bot**: node-telegram-bot-api
- **File Uploads**: Multer
- **Deployment**: Vercel (frontend), Render (backend)

## Database Schema (9 Tables)

### 1. users
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| telegram_id | TEXT | UNIQUE NOT NULL |
| username | TEXT | - |
| first_name | TEXT | - |
| last_name | TEXT | - |
| role | TEXT | DEFAULT 'student' (values: 'student', 'teacher') |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### 2. courses
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| title | TEXT | NOT NULL |
| description | TEXT | - |
| access_code | TEXT | UNIQUE NOT NULL |
| teacher_id | INTEGER | FK → users(id) (original creator) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### 3. course_teachers (Many-to-Many: courses ↔ teachers)
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| course_id | INTEGER | FK → courses(id) |
| teacher_id | INTEGER | FK → users(id) |
| added_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| UNIQUE(course_id, teacher_id) | | |

### 4. enrollments (Many-to-Many: users ↔ courses)
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| course_id | INTEGER | FK → courses(id) |
| user_id | INTEGER | FK → users(id) |
| enrolled_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| UNIQUE(course_id, user_id) | | |

### 5. assignments
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| course_id | INTEGER | FK → courses(id) |
| title | TEXT | NOT NULL |
| description | TEXT | - |
| due_date | DATETIME | - |
| max_points | INTEGER | DEFAULT 100 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### 6. submissions
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| assignment_id | INTEGER | FK → assignments(id) |
| user_id | INTEGER | FK → users(id) |
| content | TEXT | - |
| file_path | TEXT | - |
| submitted_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| grade | INTEGER | - |
| feedback | TEXT | - |
| graded_at | DATETIME | - |
| UNIQUE(assignment_id, user_id) | | |

### 7. announcements
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| course_id | INTEGER | FK → courses(id) |
| title | TEXT | NOT NULL |
| content | TEXT | NOT NULL |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### 8. comments (for announcements)
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| announcement_id | INTEGER | FK → announcements(id) |
| user_id | INTEGER | FK → users(id) |
| content | TEXT | NOT NULL |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### 9. materials
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| course_id | INTEGER | FK → courses(id) |
| title | TEXT | NOT NULL |
| file_path | TEXT | NOT NULL |
| file_type | TEXT | - |
| uploaded_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

## API Endpoints

### Users (/api/users)
- GET /:telegramId - Get user by Telegram ID
- POST / - Create or get user
- PUT /:telegramId/role - Update user role

### Courses (/api/courses)
- GET / - Get courses for user (query: telegram_id)
- GET /:id - Get course by ID
- POST / - Create course (teachers only)
- POST /join - Join course with access code
- GET /:id/students - Get enrolled students

### Assignments (/api/assignments)
- GET /course/:courseId - Get assignments for course
- GET /:id - Get single assignment
- POST / - Create assignment
- GET /:id/submissions - Get all submissions
- POST /:id/submit - Submit assignment (with file upload)
- POST /submissions/:id/grade - Grade submission
- GET /:id/my-submission - Get user's submission

### Announcements (/api/announcements)
- GET /course/:courseId - Get announcements
- POST / - Create announcement (notifies all students, course teachers only)

### Comments (/api/comments)
- GET /announcement/:announcementId - Get comments for an announcement
- POST / - Create comment (enrolled users only)
- DELETE /:id - Delete comment (own comments only)

### Materials (/api/materials)
- GET /course/:courseId - Get materials
- POST / - Upload material (course teachers only)

### Courses - Additional Endpoints
- GET /:id/teachers - Get all teachers for a course
- POST /:id/teachers - Add teacher to course (course teachers only)

## User Roles & Permissions
- **Student**: Join courses, view materials, submit assignments, view grades, comment on announcements
- **Teacher**: Create courses, create assignments, upload materials, create announcements, grade submissions, add other teachers to courses, can also join other courses as student
- **Course Teacher** (Multiple teachers per course): All teacher permissions for courses they are assigned to, can add other teachers to the course

## Frontend Components
1. App.jsx - Main app with routing and user state
2. Dashboard.jsx - Stats and quick actions
3. Courses.jsx - Course list with create/join
4. CourseDetail.jsx - Single course view with teachers management
5. Assignments.jsx - Assignment list
6. AssignmentDetail.jsx - Submit/grade assignments
7. AnnouncementCard.jsx - Announcement display with comments
8. CreateCourseModal.jsx, JoinCourseModal.jsx
9. CreateAssignmentModal.jsx, CreateAnnouncementModal.jsx
10. UploadMaterialModal.jsx

## Bot Commands
- /start - Initialize user, show inline keyboard
- /help - Show help information
- /role - Check current role
- Callback: become_teacher - Upgrade to teacher role

## Key Features
1. Telegram-first authentication (no passwords)
2. Access code based course enrollment
3. **Multiple teachers per course** - Collaborative teaching support
4. **Comments on announcements** - Interactive discussions
5. File upload for assignments and materials
6. Real-time Telegram notifications
7. Dual role support (teacher can be student)
8. Modern UI with animations
9. Teacher management - Add/remove teachers from courses

## Data Flow
1. User opens bot → /start → User created in DB
2. User opens Mini App → POST /api/users → Get/create user
3. Teacher creates course → POST /api/courses → Access code generated, creator added to course_teachers
4. Student joins → POST /api/courses/join → Enrollment created
5. Teacher adds another teacher → POST /api/courses/:id/teachers → Added to course_teachers
6. Teacher posts assignment → POST /api/assignments → Course teachers can create
7. Student submits → POST /api/assignments/:id/submit → File saved
8. Teacher grades → POST /api/assignments/submissions/:id/grade → Course teachers can grade
9. Announcement → POST /api/announcements → Course teachers can post, all enrolled students notified
10. Comment on announcement → POST /api/comments → Enrolled users can comment
```

---

## 📊 UML Diagrams Guide

Below are the recommended UML diagrams for this project and how to create them:

---

### 1. **Class Diagram** (Structural)

**Purpose**: Shows the static structure of the system - classes, attributes, methods, and relationships.

**How to Draw**:

```
┌─────────────────────────────┐
│          <<entity>>         │
│            User             │
├─────────────────────────────┤
│ - id: Integer               │
│ - telegram_id: String       │
│ - username: String          │
│ - first_name: String        │
│ - last_name: String         │
│ - role: String              │
│ - created_at: DateTime      │
├─────────────────────────────┤
│ + create()                  │
│ + findByTelegramId()        │
│ + updateRole()              │
└─────────────────────────────┘
```

**Relationships to Show**:
- User `1` ─────◇ `*` Course (Teacher creates many courses)
- User `*` ─────── `*` Course (Students enroll in many courses via Enrollment)
- Course `1` ────◇ `*` Assignment
- Course `1` ────◇ `*` Announcement
- Course `1` ────◇ `*` Material
- Assignment `1` ────◇ `*` Submission
- User `1` ─────◇ `*` Submission

**UML Notation**:
- `─────` = Association
- `─────◇` = Aggregation (hollow diamond on container side)
- `1` and `*` = Multiplicity (1 = one, * = many)
- `<<entity>>` = Stereotype

**Tools**: Draw.io, Lucidchart, PlantUML, StarUML

---

### 2. **Entity-Relationship Diagram (ERD)** (Database)

**Purpose**: Shows database tables and relationships.

**How to Draw**:

```
┌──────────┐       ┌──────────────┐       ┌──────────┐
│  users   │───1:N─│  courses     │───1:N─│assignments│
└──────────┘       └──────────────┘       └──────────┘
     │                    │                     │
     │ M:N (enrollments)  │                     │
     └────────────────────┘                     │
                                                │
                                           ┌────────────┐
                                           │submissions │
                                           └────────────┘
```

**Cardinality Notation**:
- `1:N` = One-to-Many (e.g., one course has many assignments)
- `M:N` = Many-to-Many (users-courses via enrollments)
- `1:1` = One-to-One

**Tables**: users, courses, enrollments, assignments, submissions, announcements, materials

**Primary/Foreign Keys**: Show PK and FK relationships with arrows

---

### 3. **Use Case Diagram** (Behavioral)

**Purpose**: Shows system functionality from user perspective.

**How to Draw**:

```
                    ┌─────────────────────────────────────┐
                    │           LMSgram System            │
                    │                                     │
   ┌─────┐          │  ┌─────────────────────┐           │
   │     │──────────┼──│   Create Course     │           │
   │     │          │  └─────────────────────┘           │
   │     │          │  ┌─────────────────────┐           │
   │Teacher│─────────┼──│   Post Assignment   │           │
   │     │          │  └─────────────────────┘           │
   │     │          │  ┌─────────────────────┐           │
   │     │──────────┼──│   Grade Submission  │           │
   └─────┘          │  └─────────────────────┘           │
                    │  ┌─────────────────────┐           │
   ┌─────┐          │  │    Join Course      │           │
   │     │──────────┼──│                     │           │
   │     │          │  └─────────────────────┘           │
   │Student│─────────┼──┌─────────────────────┐           │
   │     │          │  │  Submit Assignment  │           │
   │     │          │  └─────────────────────┘           │
   └─────┘          │                                     │
                    └─────────────────────────────────────┘
```

**Actors**: Teacher, Student, System (Telegram Bot)

**Use Cases**:
- Teacher: Create Course, Post Assignment, Grade Submission, Post Announcement, Upload Material
- Student: Join Course, View Materials, Submit Assignment, View Grades
- Both: View Dashboard, View Courses, Receive Notifications

**UML Notation**:
- Stick figures = Actors
- Ovals = Use Cases
- Rectangle = System Boundary
- Lines = Associations

---

### 4. **Sequence Diagram** (Behavioral)

**Purpose**: Shows interaction between objects over time.

**Example: Student Submits Assignment**

```
┌────────┐     ┌──────────┐     ┌───────────┐     ┌──────────┐     ┌────────┐
│Student │     │ Frontend │     │  Backend  │     │ Database │     │Telegram│
└───┬────┘     └────┬─────┘     └─────┬─────┘     └────┬─────┘     └───┬────┘
    │               │                 │                 │               │
    │ Click Submit  │                 │                 │               │
    │──────────────>│                 │                 │               │
    │               │ POST /submit    │                 │               │
    │               │────────────────>│                 │               │
    │               │                 │ INSERT submission               │
    │               │                 │────────────────>│               │
    │               │                 │    Success      │               │
    │               │                 │<────────────────│               │
    │               │                 │ Send Notification               │
    │               │                 │─────────────────────────────────>│
    │               │  201 Created    │                 │               │
    │               │<────────────────│                 │               │
    │ Show Success  │                 │                 │               │
    │<──────────────│                 │                 │               │
    │               │                 │                 │   📱 Notify   │
    │<─────────────────────────────────────────────────────────────────│
```

**Components to Include**:
- Lifelines (vertical dashed lines)
- Messages (horizontal arrows with labels)
- Activation boxes (rectangles on lifelines)
- Return messages (dashed arrows)

**Scenarios to Diagram**:
1. User Registration (via Telegram)
2. Course Creation
3. Student Enrollment
4. Assignment Submission
5. Grading Flow

---

### 5. **Activity Diagram** (Behavioral)

**Purpose**: Shows workflow or process flow.

**Example: Assignment Submission Flow**

```
    (●)  Start
     │
     ▼
┌──────────────────┐
│  Open Assignment │
└────────┬─────────┘
         │
         ▼
    ◇ Has Submitted?
   /           \
  No           Yes
   │             │
   ▼             ▼
┌─────────┐  ┌──────────────┐
│Fill Form│  │View Submission│
└────┬────┘  └──────────────┘
     │
     ▼
◇ Attach File?
  /      \
 Yes      No
  │        │
  ▼        │
┌────────┐ │
│ Upload │ │
└───┬────┘ │
    │      │
    ▼      │
┌─────────────┐
│   Submit    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│Send Notification│
└────────┬────────┘
       │
       ▼
      (●)  End
```

**UML Notation**:
- `(●)` = Initial/Final node
- `◇` = Decision node (diamond)
- Rectangles = Actions
- Arrows = Flow

---

### 6. **Component Diagram** (Structural)

**Purpose**: Shows high-level system components and dependencies.

```
┌─────────────────────────────────────────────────────────────┐
│                      LMSgram System                          │
│                                                              │
│  ┌──────────────┐      ┌───────────────┐      ┌──────────┐  │
│  │   Frontend   │      │    Backend    │      │ Database │  │
│  │   (React)    │─────>│   (Express)   │─────>│ (SQLite) │  │
│  │              │ HTTP │               │ SQL  │          │  │
│  │ - Dashboard  │      │ - Routes      │      │ - Tables │  │
│  │ - Courses    │      │ - Database.js │      │          │  │
│  │ - Assignments│      │ - Bot.js      │      │          │  │
│  └──────────────┘      └───────┬───────┘      └──────────┘  │
│                                │                             │
│                                │ Telegram API                │
│                                ▼                             │
│                        ┌───────────────┐                     │
│                        │ Telegram Bot  │                     │
│                        │     API       │                     │
│                        └───────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

---

### 7. **Deployment Diagram** (Structural)

**Purpose**: Shows physical deployment of system components.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Cloud Infrastructure                     │
│                                                                  │
│  ┌──────────────────┐                  ┌──────────────────────┐ │
│  │     Vercel       │                  │       Render         │ │
│  │  <<cloud>>       │                  │     <<cloud>>        │ │
│  │                  │     HTTPS        │                      │ │
│  │ ┌──────────────┐ │ ───────────────> │ ┌──────────────────┐ │ │
│  │ │React Frontend│ │                  │ │ Node.js Backend  │ │ │
│  │ │  (Static)    │ │                  │ │                  │ │ │
│  │ └──────────────┘ │                  │ │ ┌──────────────┐ │ │ │
│  └──────────────────┘                  │ │ │ SQLite DB    │ │ │ │
│                                        │ │ └──────────────┘ │ │ │
│  ┌──────────────────┐                  │ └──────────────────┘ │ │
│  │   User Device    │                  └───────────┬──────────┘ │
│  │   <<device>>     │                              │            │
│  │                  │                    Telegram API           │
│  │ ┌──────────────┐ │                              │            │
│  │ │ Telegram App │ │                              ▼            │
│  │ │ + Mini App   │ │                  ┌──────────────────────┐ │
│  │ └──────────────┘ │                  │  Telegram Servers    │ │
│  └──────────────────┘                  │     <<cloud>>        │ │
│                                        └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Recommended Tools for UML Diagrams

| Tool | Best For | Free? | Online? |
|------|----------|-------|---------|
| **Draw.io** | All diagrams | ✅ Yes | ✅ Yes |
| **Lucidchart** | Professional diagrams | Freemium | ✅ Yes |
| **PlantUML** | Code-based diagrams | ✅ Yes | ✅ Yes |
| **StarUML** | Complex class diagrams | Trial | ❌ No |
| **Mermaid** | Markdown diagrams | ✅ Yes | ✅ Yes |
| **Creately** | Quick diagrams | Freemium | ✅ Yes |
| **Visual Paradigm** | Academic projects | Free Community | ❌ No |

---

## 📝 Diagrams Checklist for Report

For a comprehensive project report, include:

1. **✅ Use Case Diagram** - Shows WHAT the system does
2. **✅ Class Diagram / ERD** - Shows database structure
3. **✅ Sequence Diagram** - Shows HOW features work (2-3 examples)
4. **✅ Activity Diagram** - Shows workflow (1-2 examples)
5. **✅ Component Diagram** - Shows system architecture
6. **✅ Deployment Diagram** - Shows where components run

---

## 📋 Quick Reference: UML Notation

```
Relationships:
───────────────  Association (uses)
- - - - - - - -  Dependency (depends on)
────────────────> Directed Association
◇──────────────  Aggregation (has-a, hollow diamond)
◆──────────────  Composition (owns, filled diamond)
──────────────▷  Inheritance (is-a, hollow triangle)
- - - - - - - ->  Interface realization

Multiplicity:
1      = Exactly one
0..1   = Zero or one
*      = Many (0 or more)
1..*   = One or more
0..*   = Zero or more

Stereotypes:
<<entity>>      Database entity
<<boundary>>    UI component
<<control>>     Business logic
<<interface>>   API/Interface
<<device>>      Physical device
<<cloud>>       Cloud service
```

---

## 💡 Tips for Your Report

1. **Start with Use Case** - Explains system from user's view
2. **ERD is essential** - Shows your understanding of data
3. **Pick 2-3 key sequences** - Don't diagram everything
4. **Keep it clean** - White space is your friend
5. **Use consistent notation** - Stick to UML standards
6. **Add legends** - Explain symbols you use
7. **Reference diagrams in text** - "As shown in Figure 2..."

