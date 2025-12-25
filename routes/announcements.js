const express = require('express');
const router = express.Router();
const { 
  announcementQueries,
  userQueries,
  courseQueries,
  enrollmentQueries,
  courseTeacherQueries
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
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is a teacher of this course
    const isTeacher = await courseTeacherQueries.isTeacher(course_id, user.id);
    const course = await courseQueries.findById(course_id);
    
    // Also check if user is the original creator
    const isCreator = course && course.teacher_id === user.id;
    
    if (!isTeacher && !isCreator) {
      return res.status(403).json({ error: 'Only course teachers can create announcements' });
    }

    const announcementId = await announcementQueries.create(course_id, title, content);
    
    // Notify all enrolled students (course already fetched above)
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














