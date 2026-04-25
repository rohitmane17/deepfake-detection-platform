'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const Navbar = () => {
  const [activeLink, setActiveLink] = useState('#home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      const scrollY = window.scrollY;

      sections.forEach((section) => {
        const sectionHeight = (section as HTMLElement).offsetHeight;
        const sectionTop = (section as HTMLElement).offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          setActiveLink(`#${sectionId}`);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#what-is-deepfake', label: 'What is Deepfake' },
    { href: '#social-engineering-simulator', label: 'Social Engineering' },
    { href: '#deepfake-detection', label: 'Detection Demo' },
    { href: '#how-to-protect', label: 'Protection' },
    { href: '#about-project', label: 'About Project' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <div className="nav-logo-3d">
            <div className="logo-cube-small">
              <div className="cube-face-small cube-front-small">N</div>
              <div className="cube-face-small cube-back-small">E</div>
              <div className="cube-face-small cube-left-small">U</div>
              <div className="cube-face-small cube-right-small">R</div>
              <div className="cube-face-small cube-top-small">O</div>
              <div className="cube-face-small cube-bottom-small">X</div>
            </div>
          </div>
          <span>NeuroX AI</span>
        </div>
        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.href} className="nav-item">
              <Link 
                href={link.href} 
                className={`nav-link ${activeLink === link.href ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className={`bar ${isMenuOpen ? 'active' : ''}`}></span>
          <span className={`bar ${isMenuOpen ? 'active' : ''}`}></span>
          <span className={`bar ${isMenuOpen ? 'active' : ''}`}></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
