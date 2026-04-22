const express = require('express');
const { evaluateScenario, getScenarios } = require('../controllers/socialEngineeringController');
const { validateScenarioEvaluation } = require('../middleware/validation');

const router = express.Router();

// GET /api/social-engineering/scenarios - Get available scenarios
router.get('/scenarios', getScenarios);

// POST /api/social-engineering/evaluate - Evaluate user's response to a scenario
router.post('/evaluate', validateScenarioEvaluation, evaluateScenario);

// GET /api/social-engineering/scenario/:id - Get specific scenario details
router.get('/scenario/:id', async (req, res) => {
  try {
    const scenarioId = req.params.id;
    
    // Mock scenarios - in real app, this would come from database
    const scenarios = {
      'phishing-email': {
        id: 'phishing-email',
        type: 'email',
        title: 'Suspicious Email from IT Department',
        content: {
          sender: 'it-support@company-update.com',
          subject: 'URGENT: Account Security Update Required',
          body: 'Dear User,\n\nWe have detected suspicious activity on your account. Please click the link below to verify your identity and secure your account:\n\nhttp://company-update-secure.com/verify\n\nFailure to act within 24 hours will result in account suspension.\n\nIT Security Team'
        },
        correctAnswer: 'scam',
        explanation: 'This is a classic phishing attempt. The email sender domain is suspicious, creates urgency, and asks for immediate action.'
      },
      'sms-scam': {
        id: 'sms-scam',
        type: 'sms',
        title: 'Package Delivery SMS',
        content: {
          sender: '+1-555-0123',
          message: 'Your package #12345 is on hold. Please pay $2.50 processing fee at: bit.ly/package-fee to release delivery.'
        },
        correctAnswer: 'scam',
        explanation: 'Legitimate delivery services never ask for payment via suspicious links. The shortened URL is a red flag.'
      }
    };

    const scenario = scenarios[scenarioId];
    
    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: 'Scenario not found'
      });
    }

    res.status(200).json({
      success: true,
      data: scenario
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve scenario',
      error: error.message
    });
  }
});

module.exports = router;
