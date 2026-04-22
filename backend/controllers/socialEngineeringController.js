// Mock social engineering scenarios database
const scenarios = [
  {
    id: 'phishing-email-1',
    type: 'email',
    title: 'Suspicious Email from IT Department',
    content: {
      sender: 'it-support@company-update.com',
      subject: 'URGENT: Account Security Update Required',
      body: 'Dear User,\n\nWe have detected suspicious activity on your account. Please click the link below to verify your identity and secure your account:\n\nhttp://company-update-secure.com/verify\n\nFailure to act within 24 hours will result in account suspension.\n\nIT Security Team'
    },
    correctAnswer: 'scam',
    explanation: 'This is a classic phishing attempt. The email sender domain is suspicious, creates urgency, and asks for immediate action.',
    redFlags: [
      'Suspicious sender domain (company-update.com)',
      'Creates false urgency',
      'Generic greeting (Dear User)',
      'Requests immediate action',
      'Suspicious link URL'
    ]
  },
  {
    id: 'sms-scam-1',
    type: 'sms',
    title: 'Package Delivery SMS',
    content: {
      sender: '+1-555-0123',
      message: 'Your package #12345 is on hold. Please pay $2.50 processing fee at: bit.ly/package-fee to release delivery.'
    },
    correctAnswer: 'scam',
    explanation: 'Legitimate delivery services never ask for payment via suspicious links. The shortened URL is a red flag.',
    redFlags: [
      'Unexpected delivery notification',
      'Requests payment via link',
      'Shortened URL (bit.ly)',
      'Small amount to seem harmless',
      'No company name mentioned'
    ]
  },
  {
    id: 'legitimate-email-1',
    type: 'email',
    title: 'Order Confirmation',
    content: {
      sender: 'orders@amazon.com',
      subject: 'Your Amazon.com Order #123-4567890 has shipped',
      body: 'Hello Customer,\n\nYour recent order has shipped!\n\nOrder Details:\nOrder: 123-4567890\nItems: 1\nShipped to: Your Address\n\nTrack your package: https://www.amazon.com/tracking\n\nThank you for shopping with Amazon.'
    },
    correctAnswer: 'safe',
    explanation: 'This is a legitimate order confirmation from Amazon with proper branding and tracking information.',
    redFlags: []
  }
];

// Get all available scenarios
const getScenarios = async (req, res) => {
  try {
    // Return scenario summaries without revealing answers
    const scenarioSummaries = scenarios.map(scenario => ({
      id: scenario.id,
      type: scenario.type,
      title: scenario.title,
      difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
    }));

    res.status(200).json({
      success: true,
      message: 'Scenarios retrieved successfully',
      data: scenarioSummaries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve scenarios',
      error: error.message
    });
  }
};

// Evaluate user's response to a scenario
const evaluateScenario = async (req, res) => {
  try {
    const { scenarioId, userAnswer, timeSpent } = req.body;

    // Find the scenario
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: 'Scenario not found'
      });
    }

    // Evaluate the answer
    const isCorrect = userAnswer.toLowerCase() === scenario.correctAnswer;
    const score = isCorrect ? 100 : 0;

    // Calculate performance metrics
    const evaluation = {
      scenarioId: scenario.id,
      userAnswer: userAnswer,
      correctAnswer: scenario.correctAnswer,
      isCorrect: isCorrect,
      score: score,
      timeSpent: timeSpent || 0,
      explanation: scenario.explanation,
      redFlags: scenario.redFlags,
      feedback: isCorrect 
        ? 'Excellent! You correctly identified this as a ' + scenario.correctAnswer + '.'
        : 'This was actually ' + scenario.correctAnswer + '. ' + scenario.explanation,
      recommendations: [
        'Always verify the sender\'s email address',
        'Look for urgency tactics in messages',
        'Check for spelling and grammar errors',
        'Never click on suspicious links',
        'Verify through official channels when in doubt'
      ]
    };

    // In a real application, you would save this to the database
    // await saveUserEvaluation(userId, evaluation);

    res.status(200).json({
      success: true,
      message: 'Scenario evaluated successfully',
      data: evaluation
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to evaluate scenario',
      error: error.message
    });
  }
};

// Get user's performance statistics
const getUserStats = async (req, res) => {
  try {
    // Mock user statistics - in real app, this would come from database
    const stats = {
      totalAttempts: 0,
      correctAnswers: 0,
      averageTime: 0,
      bestScore: 0,
      recentActivity: [],
      skillLevel: 'beginner',
      achievements: []
    };

    res.status(200).json({
      success: true,
      message: 'User statistics retrieved',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user statistics',
      error: error.message
    });
  }
};

module.exports = {
  getScenarios,
  evaluateScenario,
  getUserStats
};
