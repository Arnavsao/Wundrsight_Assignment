const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateRegistration, validateLogin, sanitizeInput } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

router.post('/register', sanitizeInput, validateRegistration, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists'
        }
      });
    }
    
    const user = new User({
      name,
      email,
      password,
      role: 'patient'
    });
    
    await user.save();
    
    const token = generateToken(user._id, user.role);
    
    res.status(201).json({
      message: 'User registered successfully',
      data: {
        user: user.toPublicJSON(),
        token,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists'
        }
      });
    }
    
    res.status(500).json({
      error: {
        code: 'REGISTRATION_FAILED',
        message: 'Failed to register user'
      }
    });
  }
});

router.post('/login', sanitizeInput, validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }
    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    const token = generateToken(user._id, user.role);
    
    res.json({
      message: 'Login successful',
      data: {
        user: user.toPublicJSON(),
        token,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: {
        code: 'LOGIN_FAILED',
        message: 'Failed to authenticate user'
      }
    });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      message: 'Profile retrieved successfully',
      data: {
        user: req.user
      }
    });
    
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({
      error: {
        code: 'PROFILE_RETRIEVAL_FAILED',
        message: 'Failed to retrieve user profile'
      }
    });
  }
});

module.exports = router;
