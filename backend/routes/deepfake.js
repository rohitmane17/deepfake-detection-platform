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

/**
 * @swagger
 * /api/deepfake/analyze:
 *   post:
 *     summary: Analyze uploaded file for deepfake detection
 *     tags: [Deepfake Analysis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image or video file to analyze
 *     responses:
 *       200:
 *         description: Analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Analysis completed successfully
 *                 data:
 *                   $ref: '#/components/schemas/Analysis'
 *       400:
 *         description: Invalid file or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/analyze', upload.single('file'), validateFileUpload, analyzeDeepfake);

/**
 * @swagger
 * /api/deepfake/analysis/{id}:
 *   get:
 *     summary: Get analysis results by ID
 *     tags: [Deepfake Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Analysis ID
 *     responses:
 *       200:
 *         description: Analysis results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Analysis results retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Analysis'
 *       404:
 *         description: Analysis not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/deepfake/analysis/{id}:
 *   delete:
 *     summary: Delete analysis record
 *     tags: [Deepfake Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Analysis ID
 *     responses:
 *       200:
 *         description: Analysis deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Analysis not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/deepfake/disclaimer:
 *   get:
 *     summary: Get deepfake analysis disclaimer
 *     tags: [Deepfake Analysis]
 *     responses:
 *       200:
 *         description: Disclaimer retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Disclaimer retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     disclaimer:
 *                       type: string
 *                       example: This platform is for educational purposes only and does not perform real deepfake detection.
 */
router.get('/disclaimer', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Disclaimer retrieved successfully',
    data: {
      disclaimer: 'This platform is for educational purposes only and does not perform real deepfake detection. Results should not be used as definitive evidence of authenticity or manipulation.'
    }
  });
});

module.exports = router;
