'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      message: '',
    };

    // Name validation
    if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.name)) {
      newErrors.name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Message validation
    if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    } else if (formData.message.length > 500) {
      newErrors.message = 'Message must be less than 500 characters';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.email && !newErrors.message;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setShowSuccess(true);
    setFormData({ name: '', email: '', message: '' });
    
    // Hide success message after 5 seconds
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email',
      detail: 'info@neurox-defense.com',
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Phone',
      detail: '+1 (555) 123-4567',
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Location',
      detail: 'San Francisco, CA',
    },
  ];

  return (
    <section id="contact" className="contact">
      <div className="container">
        {/* Section Header */}
        <h2 className="section-title">Get in Touch</h2>
        <p className="section-subtitle">
          Have questions or need assistance? Reach out to our team
        </p>

        <div className="contact-grid">
          {/* Contact Information */}
          <div className="contact-info-list">
            {contactInfo.map((info, index) => (
              <div key={index} className="contact-card">
                <div className="contact-icon">
                  {info.icon}
                </div>
                <div className="contact-info">
                  <h4>{info.title}</h4>
                  <p>{info.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="contact-form-container">
            <h3>Send us a Message</h3>
            
            <form onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="form-error">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="form-error">{errors.email}</p>
                )}
              </div>

              {/* Message Field */}
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Tell us how we can help you..."
                  disabled={isSubmitting}
                />
                {errors.message && (
                  <p className="form-error">{errors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>

            {/* Success Message */}
            {showSuccess && (
              <div className="success-message">
                <div className="contact-icon" style={{ width: '2rem', height: '2rem' }}>
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4>Message sent successfully!</h4>
                  <p>We'll get back to you soon.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
