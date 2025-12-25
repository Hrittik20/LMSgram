const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
  assignmentQueries, 
  submissionQueries,
  userQueries,
  courseQueries,
  courseTeacherQueries
} = require('../database');
const { sendNotification } = require('../bot');

// Create uploads directory if it doesn't exist
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Get assignments for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const assignments = await assignmentQueries.findByCourse(req.params.courseId);
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single assignment
router.get('/:id', async (req, res) => {
  try {
    const assignment = await assignmentQueries.findById(req.params.id);
    if (assignment) {
      res.json(assignment);
    } else {
      res.status(404).json({ error: 'Assignment not found' });
    }
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create assignment
router.post('/', async (req, res) => {
  try {
    const { course_id, title, description, due_date, max_points } = req.body;

    if (!course_id || !title) {
      return res.status(400).json({ error: 'Course ID and title are required' });
    }

    const assignmentId = await assignmentQueries.create(
      course_id,
      title,
      description,
      due_date,
      max_points || 100
    );

    const assignment = await assignmentQueries.findById(assignmentId);
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get submissions for an assignment
router.get('/:id/submissions', async (req, res) => {
  try {
    const submissions = await submissionQueries.findByAssignment(req.params.id);
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit assignment
router.post('/:id/submit', upload.single('file'), async (req, res) => {
  try {
    const { telegram_id, content } = req.body;
    const assignmentId = req.params.id;

    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id is required' });
    }

    const user = await userQueries.findByTelegramId(telegram_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const filePath = req.file ? req.file.filename : null;

    const submissionId = await submissionQueries.create(
      assignmentId,
      user.id,
      content || '',
      filePath
    );

    const submission = await submissionQueries.findByAssignmentAndUser(assignmentId, user.id);
    
    // Send notification to user
    const assignment = await assignmentQueries.findById(assignmentId);
    sendNotification(
      telegram_id,
      `✅ Assignment "${assignment.title}" submitted successfully!`
    );

    res.status(201).json(submission);
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Grade submission
router.post('/submissions/:id/grade', async (req, res) => {
  try {
    const { grade, feedback, telegram_id } = req.body;
    const submissionId = req.params.id;

    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id is required' });
    }

    const user = await userQueries.findByTelegramId(telegram_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get submission to find assignment
    const submission = await submissionQueries.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Get assignment to find course_id
    const assignment = await assignmentQueries.findById(submission.assignment_id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if user is a teacher of this course
    const isTeacher = await courseTeacherQueries.isTeacher(assignment.course_id, user.id);
    const course = await courseQueries.findById(assignment.course_id);
    const isCreator = course && course.teacher_id === user.id;

    if (!isTeacher && !isCreator) {
      return res.status(403).json({ error: 'Only course teachers can grade submissions' });
    }

    await submissionQueries.grade(submissionId, grade, feedback);
    
    res.json({ message: 'Submission graded successfully' });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's submission for an assignment
router.get('/:id/my-submission', async (req, res) => {
  try {
    const { telegram_id } = req.query;

    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id is required' });
    }

    const user = await userQueries.findByTelegramId(telegram_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const submission = await submissionQueries.findByAssignmentAndUser(req.params.id, user.id);
    
    if (submission) {
      res.json(submission);
    } else {
      res.status(404).json({ error: 'Submission not found' });
    }
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;














