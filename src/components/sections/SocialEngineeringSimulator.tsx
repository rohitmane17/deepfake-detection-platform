'use client';

import { useState } from 'react';

const SocialEngineeringSimulator = () => {
  const [selectedScenario, setSelectedScenario] = useState('email');
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const scenarios = {
    email: {
      title: 'Phishing Email',
      icon: 'fa-envelope',
      content: {
        sender: 'security@paypal.com',
        subject: 'Urgent: Account Verification Required',
        body: 'Dear Customer,\n\nWe have detected unusual activity on your PayPal account. Please click the link below to verify your identity immediately:\n\nhttps://secure-paypal-verification.com/login\n\nFailure to verify within 24 hours will result in account suspension.\n\nPayPal Security Team',
      }
    },
    sms: {
      title: 'SMS Scam',
      icon: 'fa-comment',
      content: {
        sender: '+1-800-555-0123',
        subject: 'Bank Alert',
        body: 'ALERT: Your account has been temporarily locked. Click here to unlock: https://bank-security-verify.com\n\nReply STOP to unsubscribe',
      }
    },
    social: {
      title: 'Social Media Attack',
      icon: 'fa-users',
      content: {
        sender: 'HR Department',
        subject: 'Employee Update Required',
        body: 'Hi team,\n\nPlease update your employee portal credentials by clicking here: https://company-portal-update.com\n\nThis is mandatory for all employees by end of day.\n\nThank you,\nHR Team',
      }
    },
  };

  const currentScenario = scenarios[selectedScenario as keyof typeof scenarios];

  const handleAnswer = (answer: 'safe' | 'scam') => {
    setUserAnswer(answer);
    setShowResult(true);
  };

  const resetScenario = () => {
    setUserAnswer(null);
    setShowResult(false);
  };

  const isCorrectAnswer = 'scam'; // All scenarios are scams for educational purposes

  return (
    <section id="social-engineering-simulator" className="social-engineering-simulator">
      <div className="container">
        {/* Section Header */}
        <h2 className="section-title">Social Engineering Simulator</h2>
        <p className="section-subtitle">
          Learn to identify and protect against social engineering attacks through interactive scenarios.
          Practice recognizing phishing attempts and manipulation tactics in a safe environment.
        </p>

        <div className="simulator-container">
          {/* Scenario Selector */}
          <div className="scenario-selector">
            <h3>Choose a Scenario</h3>
            <div className="scenario-buttons">
              {Object.entries(scenarios).map(([key, scenario]) => (
                <button
                  key={key}
                  className={`scenario-btn ${selectedScenario === key ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedScenario(key);
                    resetScenario();
                  }}
                >
                  <i className={`fas ${scenario.icon}`}></i>
                  <span>{scenario.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Message Display */}
          <div className="message-display">
            <div className="message-header">
              <div className="sender-info">
                <i className="fas fa-user"></i>
                <span className="sender">{currentScenario.content.sender}</span>
              </div>
              <div className="subject-info">
                <i className="fas fa-envelope"></i>
                <span className="subject">{currentScenario.content.subject}</span>
              </div>
            </div>
            <div className="message-body">
              <p>{currentScenario.content.body}</p>
            </div>
          </div>

          {/* Answer Options */}
          {!showResult && (
            <div className="answer-options">
              <h4>Is this message safe or a scam?</h4>
              <div className="option-buttons">
                <button
                  className="option-btn safe-btn"
                  onClick={() => handleAnswer('safe')}
                >
                  <i className="fas fa-check-circle"></i>
                  Safe
                </button>
                <button
                  className="option-btn scam-btn"
                  onClick={() => handleAnswer('scam')}
                >
                  <i className="fas fa-exclamation-triangle"></i>
                  Scam
                </button>
              </div>
            </div>
          )}

          {/* Result Display */}
          {showResult && (
            <div className={`result-display ${userAnswer === isCorrectAnswer ? 'correct' : 'incorrect'}`}>
              <div className="result-icon">
                <i className={`fas ${userAnswer === isCorrectAnswer ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
              </div>
              <div className="result-content">
                <h4>
                  {userAnswer === isCorrectAnswer ? 'Correct!' : 'Not Quite Right'}
                </h4>
                <p>
                  {userAnswer === isCorrectAnswer 
                    ? 'You correctly identified this as a social engineering attempt. Great job!'
                    : 'This is actually a social engineering attempt. Let\'s learn what to look for.'
                  }
                </p>
                <div className="explanation">
                  <h5>Red Flags:</h5>
                  <ul>
                    <li>Urgent language creating pressure</li>
                    <li>Suspicious URLs that don\'t match official domains</li>
                    <li>Requests for sensitive information</li>
                    <li>Poor grammar or spelling errors</li>
                    <li>Unexpected communications from official services</li>
                  </ul>
                </div>
                <button className="try-again-btn" onClick={resetScenario}>
                  <i className="fas fa-redo"></i>
                  Try Another Scenario
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Educational Tips */}
        <div className="educational-tips">
          <h3>How to Protect Yourself</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <i className="fas fa-shield-alt"></i>
              <h4>Verify URLs</h4>
              <p>Always check that website URLs match official domains before clicking.</p>
            </div>
            <div className="tip-card">
              <i className="fas fa-clock"></i>
              <h4>Don't Rush</h4>
              <p>Scammers create urgency to bypass your critical thinking. Take your time.</p>
            </div>
            <div className="tip-card">
              <i className="fas fa-phone"></i>
              <h4>Contact Directly</h4>
              <p>If unsure, contact the organization through official channels, not the message.</p>
            </div>
            <div className="tip-card">
              <i className="fas fa-lock"></i>
              <h4>Protect Information</h4>
              <p>Never share passwords, financial details, or personal info via email or SMS.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialEngineeringSimulator;
