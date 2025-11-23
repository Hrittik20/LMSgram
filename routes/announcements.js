const express = require('express');
const router = express.Router();
const { 
  announcementQueries,
  userQueries,
  courseQueries,
  enrollmentQueries
} = require('../database');
const { sendNotification } = require('../bot');

// Get announcements for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const announcements = await announcementQueries.findByCourse(req.params.courseId);
    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create announcement
router.post('/', async (req, res) => {
  try {
    const { course_id, title, content, telegram_id } = req.body;

    if (!course_id || !title || !content || !telegram_id) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await userQueries.findByTelegramId(telegram_id);
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can create announcements' });
    }

    const announcementId = await announcementQueries.create(course_id, title, content);
    
    // Notify all enrolled students
    const course = await courseQueries.findById(course_id);
    const students = await enrollmentQueries.getStudents(course_id);
    
    students.forEach(student => {
      sendNotification(
        student.telegram_id,
        `📢 New announcement in ${course.title}:\n\n${title}\n\n${content}`
      );
    });

    res.status(201).json({ 
      id: announcementId,
      message: 'Announcement created and students notified' 
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

