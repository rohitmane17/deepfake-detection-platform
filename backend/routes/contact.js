const express = require('express');
const { submitContactForm } = require('../controllers/contactController');
const { validateContactForm } = require('../middleware/validation');

const router = express.Router();

// POST /api/contact/submit - Submit contact form
router.post('/submit', validateContactForm, submitContactForm);

// GET /api/contact/status - Get contact form submission status (for admin)
router.get('/status', async (req, res) => {
  try {
    // This would typically fetch from database
    res.status(200).json({
      success: true,
      message: 'Contact form status retrieved',
      data: {
        total_submissions: 0,
        pending_responses: 0,
        recent_submissions: []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact status',
      error: error.message
    });
  }
});

module.exports = router;
