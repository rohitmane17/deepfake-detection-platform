import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-dark border-t border-glass-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo Section */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="#home" className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <div className="w-8 h-8">
                  <div className="w-full h-full bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center text-primary-dark font-bold text-sm">
                    N
                  </div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                  NeuroX AI
                </span>
              </div>
            </Link>
            <p className="text-text-secondary text-sm">
              Advanced cybersecurity solutions for the digital age
            </p>
          </div>

          {/* Navigation Links */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-text-primary mb-4">
              Quick Links
            </h3>
            <div className="space-y-3">
              <Link href="#what-is-deepfake" className="text-text-secondary hover:text-neon-blue transition-colors duration-300">
                What is Deepfake?
              </Link>
              <Link href="#social-engineering-simulator" className="text-text-secondary hover:text-neon-blue transition-colors duration-300">
                Social Engineering
              </Link>
              <Link href="#deepfake-detection" className="text-text-secondary hover:text-neon-blue transition-colors duration-300">
                Detection Demo
              </Link>
              <Link href="#how-to-protect" className="text-text-secondary hover:text-neon-blue transition-colors duration-300">
                Protection
              </Link>
            </div>
          </div>

          {/* Social Links */}
          <div className="text-center md:text-right">
            <h3 className="text-lg font-bold text-text-primary mb-4">
              Connect With Us
            </h3>
            <div className="flex justify-center md:justify-end space-x-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-neon-blue transition-colors duration-300"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-neon-blue transition-colors duration-300"
              >
                LinkedIn
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-neon-blue transition-colors duration-300"
              >
                Twitter
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-glass-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-center">
            <p className="text-text-secondary text-sm">
              © {currentYear} NeuroX AI Defense. All rights reserved.
            </p>
            <p className="text-text-secondary text-sm">
              Built with cybersecurity awareness in mind 🛡️
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
