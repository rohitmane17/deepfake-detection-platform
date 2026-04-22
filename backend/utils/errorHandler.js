/**
 * Centralized Error Handler for Backend API
 * Provides consistent error responses and logging
 */

class ErrorHandler {
  /**
   * Send standardized error response
   * @param {object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {object} details - Additional error details
   */
  static sendError(res, statusCode, message, details = null) {
    const errorResponse = {
      success: false,
      message: message,
      timestamp: new Date().toISOString()
    };

    if (details) {
      errorResponse.details = details;
    }

    // Log error for debugging
    console.error(`[${statusCode}] ${message}`, details || '');

    res.status(statusCode).json(errorResponse);
  }

  /**
   * Handle multer file upload errors
   * @param {object} error - Multer error object
   * @param {object} res - Express response object
   */
  static handleMulterError(error, res) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return this.sendError(res, 400, 'File size too large', {
        maxSize: '10MB',
        receivedSize: error.limit ? `${(error.limit / 1024 / 1024).toFixed(2)}MB` : 'Unknown'
      });
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      return this.sendError(res, 400, 'Too many files uploaded', {
        maxFiles: '1'
      });
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return this.sendError(res, 400, 'Unexpected file field', {
        expectedField: 'file'
      });
    }

    if (error.code === 'LIMIT_PART_COUNT') {
      return this.sendError(res, 400, 'Invalid multipart form data');
    }

    // Generic file upload error
    return this.sendError(res, 400, 'File upload failed', {
      originalError: error.message
    });
  }

  /**
   * Handle validation errors
   * @param {object} res - Express response object
   * @param {string} field - Field that failed validation
   * @param {string} message - Validation error message
   */
  static handleValidationError(res, field, message) {
    return this.sendError(res, 400, 'Validation failed', {
      field: field,
      message: message
    });
  }

  /**
   * Handle not found errors
   * @param {object} res - Express response object
   * @param {string} resource - Resource type that was not found
   * @param {string} id - Resource identifier
   */
  static handleNotFound(res, resource, id = null) {
    const message = id ? `${resource} with ID '${id}' not found` : `${resource} not found`;
    return this.sendError(res, 404, message, { resource, id });
  }

  /**
   * Handle unauthorized errors
   * @param {object} res - Express response object
   * @param {string} message - Error message
   */
  static handleUnauthorized(res, message = 'Unauthorized access') {
    return this.sendError(res, 401, message);
  }

  /**
   * Handle forbidden errors
   * @param {object} res - Express response object
   * @param {string} message - Error message
   */
  static handleForbidden(res, message = 'Access forbidden') {
    return this.sendError(res, 403, message);
  }

  /**
   * Handle server errors
   * @param {object} res - Express response object
   * @param {Error} error - Error object
   * @param {string} message - Error message
   */
  static handleServerError(res, error, message = 'Internal server error') {
    // Log full error for debugging
    console.error('Server Error:', error);
    
    const errorDetails = {
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      name: error.name,
      message: error.message
    };

    return this.sendError(res, 500, message, errorDetails);
  }

  /**
   * Async error wrapper for route handlers
   * @param {Function} fn - Async function to wrap
   * @returns {Function} Wrapped function with error handling
   */
  static asyncWrapper(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Validate file upload
   * @param {object} file - Uploaded file object
   * @returns {object} Validation result
   */
  static validateFileUpload(file) {
    if (!file) {
      return {
        isValid: false,
        error: 'No file uploaded'
      };
    }

    // Check file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size exceeds maximum limit of 10MB',
        details: {
          maxSize: '10MB',
          fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`
        }
      };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/mov'];
    if (!allowedTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: 'Invalid file type',
        details: {
          allowedTypes: allowedTypes,
          receivedType: file.mimetype
        }
      };
    }

    return {
      isValid: true
    };
  }

  /**
   * Validate request body fields
   * @param {object} body - Request body
   * @param {array} requiredFields - Array of required field names
   * @returns {object} Validation result
   */
  static validateRequestBody(body, requiredFields = []) {
    const missingFields = [];
    const invalidFields = [];

    for (const field of requiredFields) {
      if (!body[field]) {
        missingFields.push(field);
      }
    }

    return {
      isValid: missingFields.length === 0 && invalidFields.length === 0,
      missingFields,
      invalidFields
    };
  }
}

module.exports = ErrorHandler;
