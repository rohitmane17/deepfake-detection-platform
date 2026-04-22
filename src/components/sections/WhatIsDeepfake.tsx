'use client';

const WhatIsDeepfake = () => {
  return (
    <section id="what-is-deepfake" className="what-is-deepfake">
      <div className="container">
        {/* Section Header */}
        <h2 className="section-title">What is a Deepfake?</h2>
        <p className="section-subtitle">
          Deepfake technology represents a revolutionary advancement in artificial intelligence, 
          enabling the creation of hyper-realistic synthetic media that can convincingly 
          replicate human faces, voices, and behaviors. Understanding this technology 
          is crucial for maintaining digital security and information integrity.
        </p>

        {/* Deepfake Explanation */}
        <div className="deepfake-explanation">
          <p className="explanation-text">
            Deepfakes are synthetic media created using artificial intelligence techniques, 
            particularly deep learning, to manipulate or generate visual and audio content. 
            These AI-generated videos and images can be so realistic that they become nearly 
            impossible to distinguish from authentic media, posing significant challenges 
            for information security and personal privacy.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="comparison-grid">
          {/* Real Media Card */}
          <div className="comparison-card">
            <div className="card-header">
              <span className="authenticity-label real-label">
                <i className="fas fa-check-circle"></i>
                Real
              </span>
            </div>
            <div className="card-image">
              <div className="image-placeholder">
                <i className="fas fa-image"></i>
                <span>Authentic Media</span>
              </div>
            </div>
            <div className="card-content">
              <h4>Authentic Media</h4>
              <p>
                Original, unaltered content captured by cameras or created by humans without AI manipulation.
                These media files maintain their original integrity and can be verified through traditional means.
              </p>
            </div>
          </div>

          {/* AI Generated Card */}
          <div className="comparison-card">
            <div className="card-header">
              <span className="authenticity-label analysis-label">
                <i className="fas fa-robot"></i>
                AI Generated
              </span>
            </div>
            <div className="card-image">
              <div className="analysis-placeholder">
                <i className="fas fa-brain"></i>
                <span>AI-Generated Content</span>
              </div>
            </div>
            <div className="card-content">
              <h4>AI-Generated Content</h4>
              <p>
                Synthetic media created or manipulated using artificial intelligence and machine learning algorithms.
                These are entirely computer-generated but may appear realistic to the untrained eye.
              </p>
            </div>
          </div>

          {/* Deepfake Card */}
          <div className="comparison-card">
            <div className="card-header">
              <span className="authenticity-label fake-label">
                <i className="fas fa-exclamation-triangle"></i>
                Deepfake
              </span>
            </div>
            <div className="card-image">
              <div className="image-placeholder">
                <i className="fas fa-user-secret"></i>
                <span>Deepfake Technology</span>
              </div>
            </div>
            <div className="card-content">
              <h4>Deepfake Technology</h4>
              <p>
                Hyper-realistic AI-generated media that can convincingly mimic real people, voices, and scenarios.
                These pose significant threats to privacy, security, and information integrity.
              </p>
            </div>
          </div>
        </div>

        {/* Warning Note */}
        <div className="warning-note">
          <div className="warning-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="warning-content">
            <h4>Why This Matters</h4>
            <p>
              The ability to create convincing fake content has serious implications for personal privacy, 
              business security, and public trust. Understanding how to identify and protect against 
              deepfakes is becoming an essential digital literacy skill in today's AI-driven world.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatIsDeepfake;
