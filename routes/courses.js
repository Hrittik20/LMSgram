const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { 
  courseQueries, 
  userQueries, 
  enrollmentQueries 
} = require('../database');

// Get all courses for a user
router.get('/', async (req, res) => {
  try {
    const { telegram_id } = req.query;
    
    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id is required' });
    }

    const user = await userQueries.findByTelegramId(telegram_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let courses;
    if (user.role === 'teacher') {
      courses = await courseQueries.findByTeacher(user.id);
    } else {
      courses = await courseQueries.findByStudent(user.id);
    }

    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await courseQueries.findById(req.params.id);
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ error: 'Course not found' });
    }
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new course
router.post('/', async (req, res) => {
  try {
    const { title, description, telegram_id } = req.body;

    if (!title || !telegram_id) {
      return res.status(400).json({ error: 'Title and telegram_id are required' });
    }

    const user = await userQueries.findByTelegramId(telegram_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can create courses' });
    }

    // Generate unique access code
    const accessCode = uuidv4().substring(0, 8).toUpperCase();
    
    const courseId = await courseQueries.create(title, description, accessCode, user.id);
    const course = await courseQueries.findById(courseId);
    
    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join a course with access code
router.post('/join', async (req, res) => {
  try {
    const { access_code, telegram_id } = req.body;

    if (!access_code || !telegram_id) {
      return res.status(400).json({ error: 'Access code and telegram_id are required' });
    }

    const user = await userQueries.findByTelegramId(telegram_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const course = await courseQueries.findByAccessCode(access_code);
    if (!course) {
      return res.status(404).json({ error: 'Invalid access code' });
    }

    try {
      await enrollmentQueries.enroll(course.id, user.id);
      res.json({ message: 'Successfully joined course', course });
    } catch (error) {
      if (error.message.includes('UNIQUE constraint')) {
        res.status(400).json({ error: 'Already enrolled in this course' });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error joining course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get students in a course
router.get('/:id/students', async (req, res) => {
  try {
    const students = await enrollmentQueries.getStudents(req.params.id);
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

