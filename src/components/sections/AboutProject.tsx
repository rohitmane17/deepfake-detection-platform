'use client';

import Card from '@/components/ui/Card';
import { Target, AlertTriangle, Eye } from 'lucide-react';

const AboutProject = () => {
  return (
    <section id="about-project" className="py-24 bg-gradient-to-br from-primary-dark to-accent-dark">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent mb-6 animate-glow">
            About Project
          </h2>
          <p className="text-xl text-text-secondary max-w-4xl mx-auto leading-relaxed">
            Learn about our mission, the threats we address, and our commitment to ethical AI development.
          </p>
        </div>

        <Card className="mb-12">
          {/* Purpose Section */}
          <div className="mb-16">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center text-primary-dark shadow-large">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-neon-blue">
                Purpose of Platform
              </h3>
            </div>
            <div className="bg-glass-bg border-glass-border rounded-xl p-8">
              <p className="text-text-secondary leading-relaxed mb-6">
                The NeuroX AI Defense platform serves as an educational resource designed to raise awareness about 
                emerging digital threats in the age of artificial intelligence. Our mission is to provide comprehensive 
                knowledge and practical tools for identifying, understanding, and defending against deepfake technology 
                and social engineering attacks.
              </p>
              <p className="text-text-secondary leading-relaxed">
                Through interactive demonstrations, educational content, and practical guidance, we aim to bridge the gap 
                between technical complexity and public understanding, empowering individuals to navigate the digital landscape 
                with enhanced critical thinking and security awareness.
              </p>
            </div>
          </div>

          {/* Risks Section */}
          <div className="mb-16">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center text-primary-dark shadow-large">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-neon-blue">
                Digital Threat Landscape
              </h3>
            </div>
            <div className="space-y-8">
              {/* Deepfake Technology */}
              <div className="bg-glass-bg border-l-4 border-l-neon-blue rounded-xl p-8">
                <h4 className="text-xl font-bold text-neon-blue mb-4">
                  Deepfake Technology
                </h4>
                <p className="text-text-secondary leading-relaxed">
                  Advanced AI systems can now generate synthetic media that convincingly mimics real individuals, 
                  creating unprecedented challenges for information authenticity. These technologies manipulate facial 
                  features, vocal patterns, and behavioral characteristics to produce content that appears genuine 
                  despite being entirely fabricated.
                </p>
              </div>

              {/* Social Engineering Attacks */}
              <div className="bg-glass-bg border-l-4 border-l-neon-blue rounded-xl p-8">
                <h4 className="text-xl font-bold text-neon-blue mb-4">
                  Social Engineering Attacks
                </h4>
                <p className="text-text-secondary leading-relaxed">
                  Psychological manipulation techniques exploit cognitive biases and social trust to deceive targets. 
                  When combined with deepfake capabilities, these attacks become highly personalized and significantly 
                  more convincing, increasing their potential for harm in personal, professional, and political contexts.
                </p>
              </div>
            </div>
          </div>

          {/* Ethics Section */}
          <div>
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center text-primary-dark shadow-large">
              </div>
              <h3 className="text-2xl font-bold text-neon-blue">
                Ethical Considerations
              </h3>
            </div>
            <div className="space-y-8">
              {/* Educational Mission */}
              <div className="bg-glass-bg border-l-4 border-l-green-500 rounded-xl p-8">
                <h4 className="text-xl font-bold text-green-400 mb-4">
                  Educational Mission
                </h4>
                <p className="text-text-secondary leading-relaxed">
                  This platform is strictly educational and does not provide tools for creating or distributing 
                  deepfake content. All demonstrations are simulated for learning purposes only, designed to help 
                  users recognize potential threats rather than create them.
                </p>
              </div>

              {/* Research Integrity */}
              <div className="bg-glass-bg border-l-4 border-l-green-500 rounded-xl p-8">
                <h4 className="text-xl font-bold text-green-400 mb-4">
                  Research Integrity
                </h4>
                <p className="text-text-secondary leading-relaxed">
                  We are committed to responsible AI research and education. Our work focuses on defensive 
                  technologies, threat awareness, and ethical guidelines for the development and deployment of 
                  synthetic media detection systems.
                </p>
              </div>

              {/* Privacy and Security */}
              <div className="bg-glass-bg border-l-4 border-l-green-500 rounded-xl p-8">
                <h4 className="text-xl font-bold text-green-400 mb-4">
                  Privacy and Security
                </h4>
                <p className="text-text-secondary leading-relaxed">
                  No user data is collected, stored, or processed beyond what is necessary for the educational 
                  demonstrations. All uploaded files are processed locally in the browser and are not transmitted 
                  to external servers.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default AboutProject;
