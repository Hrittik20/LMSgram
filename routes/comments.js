const express = require('express');
const router = express.Router();
const { 
  commentQueries,
  userQueries,
  announcementQueries,
  courseQueries,
  enrollmentQueries,
  courseTeacherQueries
} = require('../database');

// Get comments for an announcement
router.get('/announcement/:announcementId', async (req, res) => {
  try {
    const comments = await commentQueries.findByAnnouncement(req.params.announcementId);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a comment
router.post('/', async (req, res) => {
  try {
    const { announcement_id, content, telegram_id } = req.body;

    if (!announcement_id || !content || !telegram_id) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await userQueries.findByTelegramId(telegram_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get announcement to find course_id
    const announcement = await announcementQueries.findById(announcement_id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // Check if user is enrolled in the course (student or teacher)
    const isEnrolled = await enrollmentQueries.getStudents(announcement.course_id);
    const isStudent = isEnrolled.some(s => s.id === user.id);
    const isTeacher = await courseTeacherQueries.isTeacher(announcement.course_id, user.id);
    const course = await courseQueries.findById(announcement.course_id);
    const isCreator = course && course.teacher_id === user.id;

    if (!isStudent && !isTeacher && !isCreator) {
      return res.status(403).json({ error: 'You must be enrolled in the course to comment' });
    }

    const commentId = await commentQueries.create(announcement_id, user.id, content);
    const comments = await commentQueries.findByAnnouncement(announcement_id);
    const newComment = comments.find(c => c.id === commentId);
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a comment
router.delete('/:id', async (req, res) => {
  try {
    const { telegram_id } = req.body;

    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id is required' });
    }

    const user = await userQueries.findByTelegramId(telegram_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const deleted = await commentQueries.delete(req.params.id, user.id);
    if (deleted) {
      res.json({ message: 'Comment deleted successfully' });
    } else {
      res.status(403).json({ error: 'Comment not found or you do not have permission to delete it' });
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

