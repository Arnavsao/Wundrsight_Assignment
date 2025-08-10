const { body, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errorMessages
      }
    });
  }
  next();
};

// Validation rules for user registration
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  handleValidationErrors
];

// Validation rules for user login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Validation rules for slot queries
const validateSlotQuery = [
  query('from')
    .isISO8601()
    .withMessage('From date must be a valid ISO date string'),
  
  query('to')
    .isISO8601()
    .withMessage('To date must be a valid ISO date string')
    .custom((to, { req }) => {
      const fromDate = new Date(req.query.from);
      const toDate = new Date(to);
      
      if (toDate <= fromDate) {
        throw new Error('To date must be after from date');
      }
      
      if (toDate > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
        throw new Error('Cannot query slots more than 7 days in the future');
      }
      
      return true;
    }),
  
  handleValidationErrors
];

// Validation rules for booking creation
const validateBooking = [
  body('slotId')
    .isMongoId()
    .withMessage('Slot ID must be a valid MongoDB ObjectId'),
  
  handleValidationErrors
];

// Validation rules for user ID parameter
const validateUserId = [
  body('userId')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
  
  handleValidationErrors
];

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Trim whitespace from string fields
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key].trim();
    }
  });
  
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateSlotQuery,
  validateBooking,
  validateUserId,
  sanitizeInput,
  handleValidationErrors
};
