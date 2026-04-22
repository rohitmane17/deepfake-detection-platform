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
    <section id="how-to-protect" className="py-24 bg-gradient-to-br from-accent-dark to-primary-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent mb-6 animate-glow">
            How to Protect Yourself
          </h2>
          <p className="text-xl text-text-secondary max-w-4xl mx-auto leading-relaxed">
            Learn essential cybersecurity practices to defend against deepfake threats 
            and social engineering attacks. Stay safe in the digital world.
          </p>
        </div>

        {/* Protection Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {protectionTips.map((tip) => (
            <Card key={tip.id} hover className="group">
              <div className="p-8 text-center">
                {/* Icon */}
                <div className="mb-6 relative">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center text-primary-dark group-hover:scale-110 transition-transform duration-300">
                    {tip.icon}
                  </div>
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-blue/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-neon-blue mb-4 group-hover:text-neon-purple transition-colors duration-300">
                  {tip.title}
                </h3>
                <p className="text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors duration-300">
                  {tip.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Additional Tips */}
        <Card className="mt-16 border-l-4 border-l-neon-blue bg-neon-blue/5">
          <div className="p-8">
            <h3 className="text-2xl font-bold text-neon-blue mb-6">
              Pro Tips for Maximum Security
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-text-primary mb-3">
                  Digital Hygiene
                </h4>
                <ul className="space-y-3 text-text-secondary">
                  <li className="flex items-start space-x-3">
                    <span className="text-neon-blue mt-1">•</span>
                    <span>Regularly update software and operating systems</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-neon-blue mt-1">•</span>
                    <span>Use unique, complex passwords for each account</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-neon-blue mt-1">•</span>
                    <span>Review app permissions and privacy settings</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-text-primary mb-3">
                  Critical Thinking
                </h4>
                <ul className="space-y-3 text-text-secondary">
                  <li className="flex items-start space-x-3">
                    <span className="text-neon-blue mt-1">•</span>
                    <span>Question unexpected communications</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-neon-blue mt-1">•</span>
                    <span>Verify through multiple channels when possible</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-neon-blue mt-1">•</span>
                    <span>Trust your instincts about suspicious requests</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default HowToProtect;
