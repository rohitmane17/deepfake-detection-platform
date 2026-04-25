'use client';

import Card from '@/components/ui/Card';
import { Search, Info, Clock, Shield } from 'lucide-react';

const HowToProtect = () => {
  const protectionTips = [
    {
      id: 1,
      icon: <Search className="w-8 h-8" />,
      title: 'Verify Sources',
      description: 'Always confirm the identity of senders through official channels before taking action. Cross-reference contact information and look for verification badges.',
    },
    {
      id: 2,
      icon: <Info className="w-8 h-8" />,
      title: 'Check Metadata',
      description: 'Examine file properties, creation dates, and technical details to spot inconsistencies. Use tools to analyze EXIF data and digital signatures.',
    },
    {
      id: 3,
      icon: <Clock className="w-8 h-8" />,
      title: 'Avoid Urgency Traps',
      description: 'Scammers create false deadlines to pressure you into quick decisions. Take time to verify requests and consult trusted sources.',
    },
    {
      id: 4,
      icon: <Shield className="w-8 h-8" />,
      title: 'Use 2FA',
      description: 'Enable two-factor authentication on all accounts for an extra layer of security. Use authenticator apps or hardware keys when possible.',
    },
  ];

  return (
    <section id="how-to-protect" className="how-to-protect">
      <div className="container">
        {/* Section Header */}
        <h2 className="section-title">How to Protect Yourself</h2>
        <p className="section-subtitle">
          Learn essential cybersecurity practices to defend against deepfake threats 
          and social engineering attacks. Stay safe in the digital world.
        </p>

        {/* Protection Cards Grid */}
        <div className="protection-grid">
          {protectionTips.map((tip) => (
            <div key={tip.id} className="protection-card">
              <div className="protection-icon">
                {tip.icon}
              </div>
              <h4>{tip.title}</h4>
              <p>{tip.description}</p>
            </div>
          ))}
        </div>

        {/* Additional Tips */}
        <div className="about-content">
          <h3 className="section-title" style={{ fontSize: '1.5rem', textAlign: 'left' }}>
            Pro Tips for Maximum Security
          </h3>
          <div className="threat-card">
            <h4>Digital Hygiene</h4>
            <ul>
              <li>Regularly update software and operating systems</li>
              <li>Use unique, complex passwords for each account</li>
              <li>Review app permissions and privacy settings</li>
            </ul>
          </div>
          <div className="threat-card">
            <h4>Critical Thinking</h4>
            <ul>
              <li>Question unexpected communications</li>
              <li>Verify through multiple channels when possible</li>
              <li>Trust your instincts about suspicious requests</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowToProtect;
