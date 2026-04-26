const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { analyzeDeepfakeCNN, getCNNModelInfo } = require('../controllers/cnnDeepfakeController');
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
  // Only allow image files for CNN analysis
  const allowedTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/tiff'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, BMP, TIFF) are allowed for CNN analysis.'), false);
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
 * /api/cnn-deepfake/analyze:
 *   post:
 *     summary: Analyze uploaded image using CNN-based deepfake detection
 *     tags: [CNN Deepfake Analysis]
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
 *                 description: Image file to analyze (JPEG, PNG, BMP, TIFF)
 *     responses:
 *       200:
 *         description: CNN analysis completed successfully
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
 *                   example: CNN-based deepfake analysis completed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     analysisId:
 *                       type: string
 *                       description: Unique analysis ID
 *                     prediction:
 *                       type: string
 *                       enum: [Real, AI Generated]
 *                       description: Analysis result
 *                     confidence:
 *                       type: number
 *                       format: float
 *                       minimum: 0
 *                       maximum: 100
 *                       description: Confidence percentage
 *                     riskLevel:
 *                       type: string
 *                       enum: [Low, Medium, High]
 *                       description: Risk assessment
 *                     explanation:
 *                       type: string
 *                       description: Detailed explanation of the analysis
 *                     model:
 *                       type: string
 *                       description: Model used for analysis
 *                       example: XceptionNet-based CNN
 *                     facialAnalysis:
 *                       type: object
 *                       description: Facial feature analysis results
 *                     processingTime:
 *                       type: string
 *                       description: Processing time information
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
router.post('/analyze', upload.single('file'), validateFileUpload, analyzeDeepfakeCNN);

/**
 * @swagger
 * /api/cnn-deepfake/model-info:
 *   get:
 *     summary: Get CNN model information
 *     tags: [CNN Deepfake Analysis]
 *     responses:
 *       200:
 *         description: CNN model information retrieved successfully
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
 *                   example: CNN model information retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     model:
 *                       type: string
 *                       example: XceptionNet-based CNN
 *                     version:
 *                       type: string
 *                       example: 1.0.0
 *                     architecture:
 *                       type: string
 *                       example: Transfer Learning with XceptionNet
 *                     capabilities:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Model capabilities
 *                     limitations:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Current limitations
 */
router.get('/model-info', getCNNModelInfo);

module.exports = router;
