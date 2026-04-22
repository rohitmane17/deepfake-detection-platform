const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const DetectionSimulator = require('../utils/detectionSimulator');
const ErrorHandler = require('../utils/errorHandler');

const router = express.Router();
const simulator = new DetectionSimulator();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads';
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

// File filter for validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/mov'];
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

// POST /api/detection/analyze - Analyze uploaded file for deepfake detection
router.post('/analyze', upload.single('file'), ErrorHandler.asyncWrapper(async (req, res) => {
  // Validate file upload
  const fileValidation = ErrorHandler.validateFileUpload(req.file);
  if (!fileValidation.isValid) {
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return ErrorHandler.handleValidationError(res, 'file', fileValidation.error, fileValidation.details);
  }

  const fileInfo = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    fileSize: req.file.size,
    fileType: req.file.mimetype,
    path: req.file.path
  };

  try {
    // Run detection simulation
    const result = await simulator.analyzeFile(fileInfo);

    // Clean up uploaded file after analysis (optional - comment out to keep files)
    // fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: 'Detection analysis completed',
      data: result
    });

  } catch (analysisError) {
    // Clean up file on analysis error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    throw analysisError; // Let the error handler catch this
  }
}));

// POST /api/detection/quick - Quick analysis with simple response
router.post('/quick', upload.single('file'), ErrorHandler.asyncWrapper(async (req, res) => {
  // Validate file upload
  const fileValidation = ErrorHandler.validateFileUpload(req.file);
  if (!fileValidation.isValid) {
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return ErrorHandler.handleValidationError(res, 'file', fileValidation.error, fileValidation.details);
  }

  const fileInfo = {
    filename: req.file.filename,
    fileSize: req.file.size,
    fileType: req.file.mimetype
  };

  try {
    // Quick analysis (matches user requirements)
    const result = simulator.quickAnalyze(fileInfo);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: 'Quick detection completed',
      data: result
    });

  } catch (analysisError) {
    // Clean up file on analysis error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    throw analysisError; // Let the error handler catch this
  }
}));

// GET /api/detection/info - Get detection information
router.get('/info', ErrorHandler.asyncWrapper((req, res) => {
  res.status(200).json({
    success: true,
    message: 'Detection API information',
    data: {
      endpoints: {
        analyze: 'POST /api/detection/analyze - Full analysis with detailed results',
        quick: 'POST /api/detection/quick - Quick analysis with basic results'
      },
      supportedFormats: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/mov'],
      maxFileSize: process.env.MAX_FILE_SIZE || '10MB',
      responseFormat: {
        prediction: "Real or AI Generated",
        confidence: "50-99%",
        risk: "High, Medium, or Low"
      }
    }
  });
}));

// GET /api/detection/demo - Get demo results without file upload
router.get('/demo', ErrorHandler.asyncWrapper((req, res) => {
  const demoFile = {
    filename: 'demo-file.jpg',
    fileSize: 1024000,
    fileType: 'image/jpeg'
  };

  const result = simulator.quickAnalyze(demoFile);

  res.status(200).json({
    success: true,
    message: 'Demo detection results',
    data: result
  });
}));

module.exports = router;
