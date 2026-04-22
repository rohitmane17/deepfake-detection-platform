const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { analyzeDeepfake } = require('../controllers/deepfakeController');
const { validateFileUpload } = require('../middleware/validation');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,video/mp4,video/avi,video/mov').split(',');
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
  fileFilter: fileFilter
});

// POST /api/deepfake/analyze - Analyze uploaded file for deepfake detection
router.post('/analyze', upload.single('file'), validateFileUpload, analyzeDeepfake);

// GET /api/deepfake/analysis/:id - Get analysis results by ID
router.get('/analysis/:id', async (req, res) => {
  try {
    // This would typically fetch from database
    // For now, return a placeholder response
    res.status(200).json({
      success: true,
      message: 'Analysis results retrieved successfully',
      data: {
        id: req.params.id,
        status: 'completed',
        confidence: 0.85,
        risk_level: 'medium',
        analysis_details: {
          facial_inconsistencies: 0.3,
          audio_visual_sync: 0.2,
          digital_artifacts: 0.35
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analysis results',
      error: error.message
    });
  }
});

// DELETE /api/deepfake/analysis/:id - Delete analysis record
router.delete('/analysis/:id', async (req, res) => {
  try {
    // This would typically delete from database
    res.status(200).json({
      success: true,
      message: 'Analysis deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete analysis',
      error: error.message
    });
  }
});

module.exports = router;
