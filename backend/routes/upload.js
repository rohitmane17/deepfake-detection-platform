const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ErrorHandler = require('../utils/errorHandler');

const router = express.Router();

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
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for validation
const fileFilter = (req, file, cb) => {
  // Only allow jpg, png, mp4
  const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and MP4 files are allowed.'), false);
  }
};

// Configure multer with limits and validation
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

// POST /api/upload - Upload file endpoint
router.post('/', upload.single('file'), ErrorHandler.asyncWrapper((req, res) => {
  // Validate file upload
  const fileValidation = ErrorHandler.validateFileUpload(req.file);
  if (!fileValidation.isValid) {
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return ErrorHandler.handleValidationError(res, 'file', fileValidation.error, fileValidation.details);
  }

  // Return file information as requested
  const fileInfo = {
    filename: req.file.filename,
    fileType: req.file.mimetype,
    fileSize: req.file.size,
    originalName: req.file.originalname,
    uploadDate: new Date().toISOString(),
    filePath: req.file.path
  };

  res.status(200).json({
    success: true,
    message: 'File uploaded successfully',
    data: fileInfo
  });
}));

// GET /api/upload/info - Get upload information and limits
router.get('/info', ErrorHandler.asyncWrapper((req, res) => {
  res.status(200).json({
    success: true,
    message: 'Upload endpoint information',
    data: {
      endpoint: 'POST /api/upload',
      allowedTypes: ['image/jpeg', 'image/png', 'video/mp4'],
      maxFileSize: '10MB',
      uploadFolder: './uploads',
      fieldName: 'file'
    }
  });
}));

// DELETE /api/upload/:filename - Delete uploaded file
router.delete('/:filename', ErrorHandler.asyncWrapper((req, res) => {
  const filename = req.params.filename;
  
  // Validate filename parameter
  if (!filename || typeof filename !== 'string') {
    return ErrorHandler.handleValidationError(res, 'filename', 'Filename is required');
  }
  
  // Sanitize filename to prevent path traversal
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
  if (sanitizedFilename !== filename) {
    return ErrorHandler.handleValidationError(res, 'filename', 'Invalid filename format');
  }
  
  const filePath = path.join('./uploads', sanitizedFilename);
  
  if (!fs.existsSync(filePath)) {
    return ErrorHandler.handleNotFound(res, 'File', sanitizedFilename);
  }
  
  fs.unlinkSync(filePath);
  
  res.status(200).json({
    success: true,
    message: 'File deleted successfully',
    data: {
      filename: sanitizedFilename
    }
  });
}));

module.exports = router;
