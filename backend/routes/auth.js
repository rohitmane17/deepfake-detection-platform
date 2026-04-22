const express = require('express');
const { register, login, logout, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', validateRegistration, register);

// POST /api/auth/login - Login user
router.post('/login', validateLogin, login);

// POST /api/auth/logout - Logout user
router.post('/logout', logout);

// GET /api/auth/profile - Get user profile (protected)
router.get('/profile', authenticateToken, getProfile);

// PUT /api/auth/profile - Update user profile (protected)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    // This would typically update user profile in database
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.body.name || req.user.name
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

module.exports = router;
