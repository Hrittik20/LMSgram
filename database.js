const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || './lms.db';
const db = new sqlite3.Database(dbPath);

// Initialize database schema
function initDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id TEXT UNIQUE NOT NULL,
        username TEXT,
        first_name TEXT,
        last_name TEXT,
        role TEXT DEFAULT 'student',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Courses table
    db.run(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        access_code TEXT UNIQUE NOT NULL,
        teacher_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users(id)
      )
    `);

    // Course enrollments
    db.run(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(course_id, user_id)
      )
    `);

    // Assignments table
    db.run(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        due_date DATETIME,
        max_points INTEGER DEFAULT 100,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )
    `);

    // Submissions table
    db.run(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignment_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT,
        file_path TEXT,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        grade INTEGER,
        feedback TEXT,
        graded_at DATETIME,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(assignment_id, user_id)
      )
    `);

    // Announcements table
    db.run(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )
    `);

    // Materials/files table
    db.run(`
      CREATE TABLE IF NOT EXISTS materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_type TEXT,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )
    `);

    console.log('Database initialized successfully');
  });
}

// User queries
const userQueries = {
  create: (telegramId, username, firstName, lastName, role = 'student') => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (telegram_id, username, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
        [telegramId, username, firstName, lastName, role],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },
  
  findByTelegramId: (telegramId) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE telegram_id = ?', [telegramId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  updateRole: (userId, role) => {
    return new Promise((resolve, reject) => {
      db.run('UPDATE users SET role = ? WHERE id = ?', [role, userId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Course queries
const courseQueries = {
  create: (title, description, accessCode, teacherId) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO courses (title, description, access_code, teacher_id) VALUES (?, ?, ?, ?)',
        [title, description, accessCode, teacherId],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },

  findById: (courseId) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM courses WHERE id = ?', [courseId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findByTeacher: (teacherId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM courses WHERE teacher_id = ?', [teacherId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  findByStudent: (userId) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT c.* FROM courses c
         INNER JOIN enrollments e ON c.id = e.course_id
         WHERE e.user_id = ?`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  findByAccessCode: (accessCode) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM courses WHERE access_code = ?', [accessCode], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};

// Enrollment queries
const enrollmentQueries = {
  enroll: (courseId, userId) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO enrollments (course_id, user_id) VALUES (?, ?)',
        [courseId, userId],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },

  getStudents: (courseId) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT u.* FROM users u
         INNER JOIN enrollments e ON u.id = e.user_id
         WHERE e.course_id = ?`,
        [courseId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
};

// Assignment queries
const assignmentQueries = {
  create: (courseId, title, description, dueDate, maxPoints) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO assignments (course_id, title, description, due_date, max_points) VALUES (?, ?, ?, ?, ?)',
        [courseId, title, description, dueDate, maxPoints],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },

  findByCourse: (courseId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM assignments WHERE course_id = ? ORDER BY due_date', [courseId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  findById: (assignmentId) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM assignments WHERE id = ?', [assignmentId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};

// Submission queries
const submissionQueries = {
  create: (assignmentId, userId, content, filePath) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT OR REPLACE INTO submissions (assignment_id, user_id, content, file_path) VALUES (?, ?, ?, ?)',
        [assignmentId, userId, content, filePath],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },

  findByAssignmentAndUser: (assignmentId, userId) => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM submissions WHERE assignment_id = ? AND user_id = ?',
        [assignmentId, userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  },

  findByAssignment: (assignmentId) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT s.*, u.first_name, u.last_name, u.username 
         FROM submissions s
         INNER JOIN users u ON s.user_id = u.id
         WHERE s.assignment_id = ?`,
        [assignmentId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  grade: (submissionId, grade, feedback) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE submissions SET grade = ?, feedback = ?, graded_at = CURRENT_TIMESTAMP WHERE id = ?',
        [grade, feedback, submissionId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
};

// Announcement queries
const announcementQueries = {
  create: (courseId, title, content) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO announcements (course_id, title, content) VALUES (?, ?, ?)',
        [courseId, title, content],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },

  findByCourse: (courseId) => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM announcements WHERE course_id = ? ORDER BY created_at DESC',
        [courseId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
};

// Materials queries
const materialQueries = {
  create: (courseId, title, filePath, fileType) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO materials (course_id, title, file_path, file_type) VALUES (?, ?, ?, ?)',
        [courseId, title, filePath, fileType],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },

  findByCourse: (courseId) => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM materials WHERE course_id = ? ORDER BY uploaded_at DESC',
        [courseId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
};

module.exports = {
  db,
  initDatabase,
  userQueries,
  courseQueries,
  enrollmentQueries,
  assignmentQueries,
  submissionQueries,
  announcementQueries,
  materialQueries
};



