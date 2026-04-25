const nodemailer = require('nodemailer');

// Mock email transporter - in production, use real SMTP configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Submit contact form
const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // In a real application, you would:
    // 1. Save to database
    // 2. Send notification email to admin
    // 3. Send confirmation email to user

    // Mock database save
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

    // Send emails (mock implementation for demo)
    let emailSent = false;
    
    try {
      console.log('Email configuration check:', {
        hasEmailUser: !!process.env.EMAIL_USER,
        hasEmailPass: !!process.env.EMAIL_PASS,
        hasAdminEmail: !!process.env.ADMIN_EMAIL,
        emailUser: process.env.EMAIL_USER
      });

      const transporter = createTransporter();
      
      // Only send emails if email configuration is properly set up
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log('Sending admin email to:', process.env.ADMIN_EMAIL || 'admin@neurox-ai.com');
        await transporter.sendMail(adminEmailOptions);
        console.log('Admin email sent successfully');

        console.log('Sending user confirmation email to:', email);
        await transporter.sendMail(userEmailOptions);
        console.log('User email sent successfully');
        emailSent = true;
      } else {
        console.log('Email configuration incomplete - skipping email sending');
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      console.error('Email error details:', {
        message: emailError.message,
        code: emailError.code,
        response: emailError.response
      });
      // Continue without failing the request
    }

    res.status(200).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        submissionId: submissionId,
        emailSent: emailSent,
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
  getContactSubmissions,
  updateSubmissionStatus
};
