import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Logo Section */}
          <div className="footer-logo-section">
            <Link href="#home" className="footer-logo-link">
              <div className="footer-logo">
                <div className="footer-logo-icon">N</div>
                <span className="footer-logo-text">NeuroX AI</span>
              </div>
            </Link>
            <p className="footer-tagline">
              Advanced cybersecurity solutions for the digital age
            </p>
          </div>

          {/* Navigation Links */}
          <div className="footer-links-section">
            <h3 className="footer-heading">Quick Links</h3>
            <div className="footer-links">
              <Link href="#what-is-deepfake" className="footer-link">
                What is Deepfake?
              </Link>
              <Link href="#social-engineering-simulator" className="footer-link">
                Social Engineering
              </Link>
              <Link href="#deepfake-detection" className="footer-link">
                Detection Demo
              </Link>
              <Link href="#how-to-protect" className="footer-link">
                Protection
              </Link>
              <Link href="#about-project" className="footer-link">
                About Project
              </Link>
            </div>
          </div>

          {/* Social Links */}
          <div className="footer-social-section">
            <h3 className="footer-heading">Connect With Us</h3>
            <div className="footer-social-links">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
              >
                LinkedIn
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
              >
                Twitter
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {currentYear} NeuroX AI Defense. All rights reserved.
            </p>
            <p className="footer-built">
              Built with cybersecurity awareness in mind 🛡️
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
