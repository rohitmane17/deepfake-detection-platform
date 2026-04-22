const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const DetectionSimulator = require('./utils/detectionSimulator');
const AnalysisLogger = require('./utils/analysisLogger');
const ErrorHandler = require('./utils/errorHandler');

// Load environment variables
dotenv.config();

// Import routes
const deepfakeRoutes = require('./routes/deepfake');
const socialEngineeringRoutes = require('./routes/socialEngineering');
const contactRoutes = require('./routes/contact');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const detectionRoutes = require('./routes/detection');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize detection simulator and logger
const simulator = new DetectionSimulator();
const logger = new AnalysisLogger();

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

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/deepfake', deepfakeRoutes);
app.use('/api/social-engineering', socialEngineeringRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/detection', detectionRoutes);

// POST /api/analyze - Main analysis endpoint
app.post('/api/analyze', upload.single('file'), ErrorHandler.asyncWrapper(async (req, res) => {
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
    fileType: req.file.mimetype
  };

  try {
    // Run detection simulation
    const result = await simulator.analyzeFile(fileInfo);

    // Format response for /api/analyze endpoint
    const responseData = {
      prediction: result.prediction,
      confidence: result.confidence,
      risk_level: result.risk,
      explanation: simulator.generateExplanation(result.prediction, result.confidence, result.analysis),
      processing_time: result.processingTime,
      metadata: {
        filename: result.metadata.filename,
        file_type: result.metadata.fileType,
        file_size: result.metadata.fileSize,
        analyzed_at: result.metadata.timestamp
      }
    };

    // Log the analysis
    logger.logAnalysis(fileInfo.originalName, responseData, result.metadata.timestamp);

    const response = {
      success: true,
      message: 'Analysis completed successfully',
      data: responseData
    };

    // Clean up uploaded file after analysis
    fs.unlinkSync(req.file.path);

    res.status(200).json(response);

  } catch (analysisError) {
    // Clean up file on analysis error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    throw analysisError; // Let the error handler catch this
  }
}));

// GET /api/history - Get analysis history
app.get('/api/history', ErrorHandler.asyncWrapper((req, res) => {
  // Validate query parameters
  const limit = parseInt(req.query.limit) || 50;
  const prediction = req.query.prediction; // Optional filter by prediction type
  
  if (limit < 1 || limit > 1000) {
    return ErrorHandler.handleValidationError(res, 'limit', 'Limit must be between 1 and 1000');
  }

  let history;
  if (prediction && (prediction === 'Real' || prediction === 'AI Generated')) {
    history = logger.getHistoryByPrediction(prediction, limit);
  } else if (prediction) {
    return ErrorHandler.handleValidationError(res, 'prediction', 'Prediction must be either "Real" or "AI Generated"');
  } else {
    history = logger.getHistory(limit);
  }

  res.status(200).json({
    success: true,
    message: 'Analysis history retrieved successfully',
    data: {
      history: history,
      total_count: history.length,
      limit: limit,
      filter: prediction || 'all'
    }
  });
}));

// GET /api/history/stats - Get analysis statistics
app.get('/api/history/stats', ErrorHandler.asyncWrapper((req, res) => {
  const stats = logger.getStatistics();
  
  res.status(200).json({
    success: true,
    message: 'Analysis statistics retrieved successfully',
    data: stats
  });
}));

// DELETE /api/history - Clear analysis history
app.delete('/api/history', ErrorHandler.asyncWrapper((req, res) => {
  logger.clearHistory();
  
  res.status(200).json({
    success: true,
    message: 'Analysis history cleared successfully'
  });
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'NeuroX AI Backend is running',
    timestamp: new Date().toISOString()
  });
});

// GET /api/disclaimer - Get platform disclaimer
app.get('/api/disclaimer', ErrorHandler.asyncWrapper((req, res) => {
  const disclaimer = "This platform is for educational purposes only and does not perform real deepfake detection.";
  
  res.status(200).json({
    success: true,
    message: 'Disclaimer retrieved successfully',
    data: {
      disclaimer: disclaimer,
      timestamp: new Date().toISOString()
    }
  });
}));

// Multer error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return ErrorHandler.handleMulterError(err, res);
  }
  next(err);
});

// General error handling middleware
app.use((err, req, res, next) => {
  ErrorHandler.handleServerError(res, err);
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  ErrorHandler.handleNotFound(res, 'API endpoint', req.originalUrl);
});

// Start server
app.listen(PORT, () => {
  console.log(`NeuroX AI Backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
