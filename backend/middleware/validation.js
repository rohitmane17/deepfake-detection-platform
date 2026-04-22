const Joi = require('joi');

// Validation schemas
const schemas = {
  // User registration validation
  register: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters'
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address'
    }),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)')).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    })
  }),

  // User login validation
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required'
    })
  }),

  // Contact form validation
  contactForm: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters'
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address'
    }),
    subject: Joi.string().min(5).max(100).required().messages({
      'string.empty': 'Subject is required',
      'string.min': 'Subject must be at least 5 characters'
    }),
    message: Joi.string().min(10).max(1000).required().messages({
      'string.empty': 'Message is required',
      'string.min': 'Message must be at least 10 characters',
      'string.max': 'Message cannot exceed 1000 characters'
    })
  }),

  // File upload validation
  fileUpload: Joi.object({
    // This will be validated by multer middleware
  }),

  // Social engineering scenario evaluation
  scenarioEvaluation: Joi.object({
    scenarioId: Joi.string().required().messages({
      'string.empty': 'Scenario ID is required'
    }),
    userAnswer: Joi.string().valid('safe', 'scam').required().messages({
      'string.empty': 'User answer is required',
      'any.only': 'User answer must be either "safe" or "scam"'
    }),
    timeSpent: Joi.number().min(0).optional().messages({
      'number.min': 'Time spent cannot be negative'
    })
  })
};

// Validation middleware factory
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages
      });
    }

    req[source] = value;
    next();
  };
};

// Specific validation middleware functions
const validateRegistration = validate(schemas.register);
const validateLogin = validate(schemas.login);
const validateContactForm = validate(schemas.contactForm);
const validateFileUpload = validate(schemas.fileUpload);
const validateScenarioEvaluation = validate(schemas.scenarioEvaluation);

// Custom file validation middleware
const validateFileUploadCustom = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,video/mp4,video/avi,video/mov').split(',');

  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: `File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB`
    });
  }

  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Only images and videos are allowed'
    });
  }

  next();
};

module.exports = {
  validate,
  validateRegistration,
  validateLogin,
  validateContactForm,
  validateFileUpload,
  validateFileUploadCustom,
  validateScenarioEvaluation,
  schemas
};
