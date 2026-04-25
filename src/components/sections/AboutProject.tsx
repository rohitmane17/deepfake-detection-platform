'use client';

import Card from '@/components/ui/Card';
import { Target, AlertTriangle, Eye } from 'lucide-react';

const AboutProject = () => {
  return (
    <section id="about-project" className="about-project">
      <div className="container">
        {/* Section Header */}
        <h2 className="section-title">About Project</h2>
        <p className="section-subtitle">
          Learn about our mission, the threats we address, and our commitment to ethical AI development.
        </p>

        <div className="about-content">
          {/* Purpose Section */}
          <div className="about-section">
            <div className="about-header">
              <div className="about-icon">
                <Target className="w-8 h-8" />
              </div>
              <h3>Purpose of Platform</h3>
            </div>
            <div className="about-text">
              <p>
                The NeuroX AI Defense platform serves as an educational resource designed to raise awareness about 
                emerging digital threats in the age of artificial intelligence. Our mission is to provide comprehensive 
                knowledge and practical tools for identifying, understanding, and defending against deepfake technology 
                and social engineering attacks.
              </p>
              <p>
                Through interactive demonstrations, educational content, and practical guidance, we aim to bridge the gap 
                between technical complexity and public understanding, empowering individuals to navigate the digital landscape 
                with enhanced critical thinking and security awareness.
              </p>
            </div>
          </div>

          {/* Risks Section */}
          <div className="about-section">
            <div className="about-header">
              <div className="about-icon">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3>Digital Threat Landscape</h3>
            </div>
            <div className="threat-card">
              <h4>Deepfake Technology</h4>
              <p>
                Advanced AI systems can now generate synthetic media that convincingly mimics real individuals, 
                creating unprecedented challenges for information authenticity. These technologies manipulate facial 
                features, vocal patterns, and behavioral characteristics to produce content that appears genuine 
                despite being entirely fabricated.
              </p>
            </div>
            <div className="threat-card">
              <h4>Social Engineering Attacks</h4>
              <p>
                Psychological manipulation techniques exploit cognitive biases and social trust to deceive targets. 
                When combined with deepfake capabilities, these attacks become highly personalized and significantly 
                more convincing, increasing their potential for harm in personal, professional, and political contexts.
              </p>
            </div>
          </div>

          {/* Ethics Section */}
          <div className="about-section">
            <div className="about-header">
              <div className="about-icon">
                <Eye className="w-8 h-8" />
              </div>
              <h3>Ethical Considerations</h3>
            </div>
            <div className="ethics-card">
              <h4>Educational Mission</h4>
              <p>
                This platform is strictly educational and does not provide tools for creating or distributing 
                deepfake content. All demonstrations are simulated for learning purposes only, designed to help 
                users recognize potential threats rather than create them.
              </p>
            </div>
            <div className="ethics-card">
              <h4>Research Integrity</h4>
              <p>
                We are committed to responsible AI research and education. Our work focuses on defensive 
                technologies, threat awareness, and ethical guidelines for the development and deployment of 
                synthetic media detection systems.
              </p>
            </div>
            <div className="ethics-card">
              <h4>Privacy and Security</h4>
              <p>
                No user data is collected, stored, or processed beyond what is necessary for the educational 
                demonstrations. All uploaded files are processed locally in the browser and are not transmitted 
                to external servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutProject;
