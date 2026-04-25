'use client';

import { useState } from 'react';

const SocialEngineeringSimulator = () => {
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [userMessage, setUserMessage] = useState({
    sender: '',
    subject: '',
    body: ''
  });
  const [errors, setErrors] = useState({
    sender: '',
    subject: '',
    body: ''
  });

  const analyzeMessage = (message: typeof userMessage): { isScam: boolean; confidence: number; redFlags: string[] } => {
    const redFlags: string[] = [];
    const lowerBody = message.body.toLowerCase();
    const lowerSubject = message.subject.toLowerCase();
    const lowerSender = message.sender.toLowerCase();

    // Check for urgency indicators
    if (lowerBody.includes('urgent') || lowerBody.includes('immediately') || lowerBody.includes('asap') || lowerBody.includes('right now')) {
      redFlags.push('Urgent language creating pressure');
    }

    // Check for suspicious URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = lowerBody.match(urlRegex) || [];
    urls.forEach(url => {
      if (url.includes('verify') || url.includes('login') || url.includes('account') || url.includes('secure')) {
        if (!url.includes('paypal.com') && !url.includes('amazon.com') && !url.includes('google.com') && !url.includes('microsoft.com')) {
          redFlags.push('Suspicious URL that doesn\'t match official domain');
        }
      }
    });

    // Check for requests for sensitive information
    if (lowerBody.includes('password') || lowerBody.includes('ssn') || lowerBody.includes('credit card') || lowerBody.includes('bank account') || lowerBody.includes('personal information')) {
      redFlags.push('Request for sensitive information');
    }

    // Check for threats
    if (lowerBody.includes('suspended') || lowerBody.includes('locked') || lowerBody.includes('deactivated') || lowerBody.includes('closed')) {
      redFlags.push('Threat of account suspension or closure');
    }

    // Check for poor grammar (simple check)
    if (lowerBody.includes('kindly') || lowerBody.includes('dear customer') && !lowerBody.includes('dear ')) {
      redFlags.push('Generic greeting typical of scams');
    }

    // Check for unexpected sender
    if (lowerSender.includes('security') || lowerSender.includes('support') || lowerSender.includes('admin')) {
      redFlags.push('Official-looking sender that may be impersonated');
    }

    // Check for financial terms
    if (lowerBody.includes('wire transfer') || lowerBody.includes('money order') || lowerBody.includes('gift card') || lowerBody.includes('bitcoin')) {
      redFlags.push('Request for unusual payment method');
    }

    // Calculate confidence based on red flags
    const confidence = Math.min(90, redFlags.length * 20 + 30);
    const isScam = redFlags.length >= 2;

    return { isScam, confidence, redFlags };
  };

  const handleAnalyze = () => {
    if (!validateForm()) {
      return;
    }
    const analysis = analyzeMessage(userMessage);
    setUserAnswer(analysis.isScam ? 'scam' : 'safe');
    setShowResult(true);
  };

  const resetScenario = () => {
    setUserAnswer(null);
    setShowResult(false);
    setUserMessage({ sender: '', subject: '', body: '' });
  };

  const analysisResult = showResult ? analyzeMessage(userMessage) : null;

  const validateForm = () => {
    const newErrors = {
      sender: '',
      subject: '',
      body: ''
    };

    // Sender validation
    if (userMessage.sender && userMessage.sender.length > 100) {
      newErrors.sender = 'Sender must be less than 100 characters';
    } else if (userMessage.sender && !/^[a-zA-Z0-9._%+-@]+$/.test(userMessage.sender)) {
      newErrors.sender = 'Sender contains invalid characters';
    }

    // Subject validation
    if (userMessage.subject && userMessage.subject.length > 200) {
      newErrors.subject = 'Subject must be less than 200 characters';
    }

    // Body validation
    if (!userMessage.body || userMessage.body.trim().length === 0) {
      newErrors.body = 'Message body is required';
    } else if (userMessage.body.length < 10) {
      newErrors.body = 'Message must be at least 10 characters long';
    } else if (userMessage.body.length > 5000) {
      newErrors.body = 'Message must be less than 5000 characters';
    }

    setErrors(newErrors);
    return !newErrors.sender && !newErrors.subject && !newErrors.body;
  };

  const handleInputChange = (field: keyof typeof userMessage, value: string) => {
    setUserMessage(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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
          {/* Message Input Form */}
          <div className="message-input-form">
            <h3>Enter a Message to Analyze</h3>
            <p className="form-instruction">
              Paste any suspicious email, SMS, or message below to check if it might be a social engineering attack.
            </p>
            
            <div className="input-group">
              <label htmlFor="sender">Sender</label>
              <input
                type="text"
                id="sender"
                placeholder="e.g., security@paypal.com"
                value={userMessage.sender}
                onChange={(e) => handleInputChange('sender', e.target.value)}
                disabled={showResult}
              />
              {errors.sender && <span className="error-message">{errors.sender}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                placeholder="e.g., Urgent: Account Verification Required"
                value={userMessage.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                disabled={showResult}
              />
              {errors.subject && <span className="error-message">{errors.subject}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="body">Message Body</label>
              <textarea
                id="body"
                rows={6}
                placeholder="Paste the full message content here..."
                value={userMessage.body}
                onChange={(e) => handleInputChange('body', e.target.value)}
                disabled={showResult}
              />
              {errors.body && <span className="error-message">{errors.body}</span>}
            </div>

            {!showResult && (
              <button className="analyze-btn" onClick={handleAnalyze} disabled={!userMessage.body}>
                <i className="fas fa-search"></i>
                Analyze Message
              </button>
            )}
          </div>

          {/* Result Display */}
          {showResult && analysisResult && (
            <div className={`result-display ${analysisResult.isScam ? 'scam-detected' : 'safe-message'}`}>
              <div className="result-icon">
                <i className={`fas ${analysisResult.isScam ? 'fa-exclamation-triangle' : 'fa-check-circle'}`}></i>
              </div>
              <div className="result-content">
                <h4>
                  {analysisResult.isScam ? 'Potential Scam Detected' : 'Message Appears Safe'}
                </h4>
                <p>
                  {analysisResult.isScam 
                    ? `This message shows ${analysisResult.redFlags.length} red flags with ${analysisResult.confidence}% confidence.`
                    : 'This message does not show obvious signs of social engineering, but always remain cautious.'
                  }
                </p>
                {analysisResult.redFlags.length > 0 && (
                  <div className="explanation">
                    <h5>Red Flags Found:</h5>
                    <ul>
                      {analysisResult.redFlags.map((flag, index) => (
                        <li key={index}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <button className="try-again-btn" onClick={resetScenario}>
                  <i className="fas fa-redo"></i>
                  Analyze Another Message
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
