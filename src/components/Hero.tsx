'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const Hero = () => {
  const [currentText, setCurrentText] = useState(0);
  const texts = [
    'Deepfake & Social Engineering Awareness Platform',
    'Protect Your Digital Identity',
    'AI-Powered Security Solutions',
    'Advanced Threat Detection',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % texts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="hero">
      {/* Background Particles */}
      <div className="particles-container">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <div className="hero-container">
        <div className="hero-content">
          {/* 3D Logo */}
          <div className="logo-3d">
            <div className="logo-cube">
              <div className="cube-face cube-front">N</div>
              <div className="cube-face cube-back">E</div>
              <div className="cube-face cube-left">U</div>
              <div className="cube-face cube-right">R</div>
              <div className="cube-face cube-top">O</div>
              <div className="cube-face cube-bottom">X</div>
            </div>
          </div>

          {/* Hero Title */}
          <h1 className="hero-title">
            <span className="highlight">NeuroX AI</span> Defense
          </h1>

          {/* Hero Subtitle */}
          <p className="hero-subtitle">
            In an era of AI-powered deception, understanding the risks of deepfakes and social engineering attacks is crucial. 
            Our platform provides cutting-edge tools and knowledge to help you identify, prevent, and respond to these emerging threats.
          </p>

          {/* Hero Buttons */}
          <div className="hero-buttons">
            <Link href="#deepfake-detection" className="cta-button">
              <i className="fas fa-play"></i>
              Try Demo
            </Link>
            <Link href="#what-is-deepfake" className="secondary-button">
              <i className="fas fa-graduation-cap"></i>
              Learn More
            </Link>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="hero-visual">
          <div className="cyber-grid"></div>
          <div className="floating-elements">
            <div className="element element-1">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div className="element element-2">
              <i className="fas fa-brain"></i>
            </div>
            <div className="element element-3">
              <i className="fas fa-eye"></i>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
