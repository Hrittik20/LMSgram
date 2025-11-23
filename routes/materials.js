const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
  materialQueries,
  userQueries
} = require('../database');

// Create uploads directory if it doesn't exist
const uploadsDir = './uploads/materials';
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
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Get materials for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const materials = await materialQueries.findByCourse(req.params.courseId);
    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload material
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { course_id, title, telegram_id } = req.body;

    if (!course_id || !title || !telegram_id || !req.file) {
      return res.status(400).json({ error: 'All fields and file are required' });
    }

    const user = await userQueries.findByTelegramId(telegram_id);
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can upload materials' });
    }

    const fileType = path.extname(req.file.originalname);
    const filePath = 'materials/' + req.file.filename;

    const materialId = await materialQueries.create(
      course_id,
      title,
      filePath,
      fileType
    );

    res.status(201).json({ 
      id: materialId,
      message: 'Material uploaded successfully',
      file_path: filePath
    });
  } catch (error) {
    console.error('Error uploading material:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

