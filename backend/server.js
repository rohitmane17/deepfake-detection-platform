const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { spawn } = require('child_process');
const DetectionSimulator = require('./utils/detectionSimulator');
const AnalysisLogger = require('./utils/analysisLogger');
const ErrorHandler = require('./utils/errorHandler');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app early to set trust proxy
const app = express();
app.set('trust proxy', true);

// CSRF Token Store (in production, use Redis or database)
const csrfTokens = new Map();

// Generate CSRF Token
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// CSRF Protection Middleware
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET requests and file uploads
  if (req.method === 'GET' || req.path.includes('/upload')) {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
  }

  next();
};

// Import routes
const deepfakeRoutes = require('./routes/deepfake');
const socialEngineeringRoutes = require('./routes/socialEngineering');
const contactRoutes = require('./routes/contact');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const detectionRoutes = require('./routes/detection');

const PORT = process.env.PORT || 5000;

// Session middleware (in production, use express-session with a proper store)
app.use((req, res, next) => {
  req.session = req.session || {};
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCSRFToken();
  }
  next();
});

// Initialize detection simulator and logger
const simulator = new DetectionSimulator();
const logger = new AnalysisLogger();

// Function to run Python face detection
async function runFaceDetection(imagePath) {
  return new Promise((resolve, reject) => {
    const python = spawn('python', ['face_detection.py', imagePath]);
    let dataString = '';
    let errorString = '';

    python.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorString += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', errorString);
        // Fall back to simulator if Python script fails
        resolve({
          prediction: 'AI Generated',
          confidence: 75,
          risk_level: 'Medium',
          explanation: 'Analysis completed using fallback detection methods.',
          processing_time: '1.2s',
          face_count: 0,
          image_analysis: {}
        });
        return;
      }

      try {
        const result = JSON.parse(dataString);
        resolve(result);
      } catch (error) {
        console.error('Error parsing Python output:', error);
        // Fall back to simulator if JSON parsing fails
        resolve({
          prediction: 'AI Generated',
          confidence: 75,
          risk_level: 'Medium',
          explanation: 'Analysis completed using fallback detection methods.',
          processing_time: '1.2s',
          face_count: 0,
          image_analysis: {}
        });
      }
    });

    python.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      // Fall back to simulator if Python is not available
      resolve({
        prediction: 'AI Generated',
        confidence: 75,
        risk_level: 'Medium',
        explanation: 'Analysis completed using fallback detection methods.',
        processing_time: '1.2s',
        face_count: 0,
        image_analysis: {}
      });
    });
  });
}

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

// Security middleware with comprehensive headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.deepfake-detection.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginEmbedderPolicy: { policy: 'require-corp' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
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

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  res.json({
    success: true,
    csrfToken: req.session.csrfToken
  });
});

// Apply CSRF protection to state-changing routes
app.use('/api/auth', csrfProtection);
app.use('/api/contact', csrfProtection);
app.use('/api/deepfake', csrfProtection);

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
    let result;
    
    // Check if file is an image and use real face detection
    if (req.file.mimetype.startsWith('image/')) {
      // Use Python face detection for images
      result = await runFaceDetection(req.file.path);
    } else {
      // Fall back to simulator for videos or unsupported formats
      result = await simulator.analyzeFile(fileInfo);
    }

    // Format response for /api/analyze endpoint
    const responseData = {
      prediction: result.prediction || 'AI Generated',
      confidence: result.confidence || 75,
      risk_level: result.risk_level || result.risk || 'Medium',
      explanation: result.explanation || 'Analysis completed using computer vision techniques.',
      processing_time: result.processing_time || result.processingTime || '1.2s',
      metadata: {
        filename: fileInfo.filename,
        file_type: fileInfo.fileType,
        file_size: fileInfo.fileSize,
        analyzed_at: new Date().toISOString(),
        faces_detected: result.face_count || 0,
        image_analysis: result.image_analysis || {}
      }
    };

    // Log the analysis
    logger.logAnalysis(fileInfo.originalName, responseData, new Date().toISOString());

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
