const emailService = require('../config/emailConfig');

// Email validation helper
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Submit contact form
const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate field lengths
    if (name.length > 100 || subject.length > 200 || message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input length. Name (max 100), Subject (max 200), Message (max 2000)'
      });
    }

    // Generate unique submission ID
    const submissionId = 'sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    // Prepare email to admin
    const adminEmailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@neurox-ai.com',
      to: process.env.ADMIN_EMAIL || 'admin@neurox-ai.com', // Admin email
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <p><strong>Submission ID:</strong> ${submissionId}</p>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
      `
    };

    // Prepare confirmation email to user
    const userEmailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@neurox-ai.com',
      to: email,
      subject: 'Thank you for contacting NeuroX AI Defense',
      html: `
        <h2>Thank You for Contacting Us</h2>
        <p>Dear ${name},</p>
        <p>We have received your message regarding "${subject}" and will get back to you as soon as possible.</p>
        <p><strong>Your Message:</strong></p>
        <p>${message}</p>
        <p><strong>Reference ID:</strong> ${submissionId}</p>
        <p>We typically respond within 24-48 hours during business days.</p>
        <p>Best regards,<br>NeuroX AI Defense Team</p>
      `
    };

    // Send emails using the email service
    let emailSent = false;
    let emailError = null;
    
    try {
      // Send admin notification
      const adminResult = await emailService.sendContactNotification({
        name, email, subject, message, submissionId
      });
      
      // Send user confirmation
      const userResult = await emailService.sendUserConfirmation({
        name, email, subject, submissionId
      });
      
      emailSent = adminResult.success && userResult.success;
      
      if (!emailSent) {
        emailError = 'Email service unavailable';
        console.warn('Email service issues:', { adminResult, userResult });
      }
      
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      emailError = emailError.message;
      // Continue with response even if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        submissionId: submissionId,
        emailSent: emailSent,
        emailError: emailError,
        estimatedResponseTime: '24-48 hours'
      }
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form',
      error: error.message
    });
  }
};

// Get contact form submissions (admin only)
const getContactSubmissions = async (req, res) => {
  try {
    // Mock data - in real app, this would come from database
    const submissions = [];
    
    res.status(200).json({
      success: true,
      message: 'Contact submissions retrieved',
      data: {
        submissions: submissions,
        total: submissions.length,
        pending: submissions.filter(s => s.status === 'pending').length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact submissions',
      error: error.message
    });
  }
};

// Update contact submission status (admin only)
const updateSubmissionStatus = async (req, res) => {
  try {
    const { submissionId, status, notes } = req.body;
    
    // In real app, this would update the database
    res.status(200).json({
      success: true,
      message: 'Submission status updated successfully',
      data: {
        submissionId: submissionId,
        status: status,
        notes: notes,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update submission status',
      error: error.message
    });
  }
};

module.exports = {
  submitContactForm,
  getEmailStatus,
  testEmailConfiguration,
  getContactSubmissions,
  updateSubmissionStatus
};
