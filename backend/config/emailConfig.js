/**
 * Email Configuration and Utilities
 * Centralized email service configuration and helper functions
 */

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter with configuration validation
   */
  initializeTransporter() {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Email credentials not configured. Email service will be disabled.');
      this.isConfigured = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: process.env.EMAIL_REJECT_UNAUTHORIZED !== 'false'
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 1000,
        rateLimit: 5,
        timeout: 30000,
        connectionTimeout: 60000,
      });

      this.verifyTransporter();
      this.isConfigured = true;
      console.log('✅ Email service initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
      this.isConfigured = false;
    }
  }

  /**
   * Verify email transporter configuration
   */
  async verifyTransporter() {
    if (!this.transporter) return false;

    try {
      await this.transporter.verify();
      console.log('📧 Email transporter verified successfully');
      return true;
    } catch (error) {
      console.error('❌ Email transporter verification failed:', error.message);
      return false;
    }
  }

  /**
   * Send email with error handling and logging
   */
  async sendEmail(mailOptions) {
    if (!this.isConfigured || !this.transporter) {
      console.warn('⚠️ Email service not configured. Skipping email send.');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email sent successfully:', {
        messageId: info.messageId,
        to: mailOptions.to,
        subject: mailOptions.subject
      });
      
      return { 
        success: true, 
        messageId: info.messageId,
        response: info.response 
      };
    } catch (error) {
      console.error('❌ Failed to send email:', {
        to: mailOptions.to,
        subject: mailOptions.subject,
        error: error.message,
        code: error.code
      });
      
      return { 
        success: false, 
        message: error.message,
        code: error.code 
      };
    }
  }

  /**
   * Send contact form submission to admin
   */
  async sendContactNotification(submissionData) {
    const { name, email, subject, message, submissionId } = submissionData;

    const adminEmailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@neurox-ai.com',
      to: process.env.ADMIN_EMAIL || 'admin@neurox-ai.com',
      subject: '🔔 New Contact Form Submission: ' + subject,
      html: this.generateAdminEmailTemplate(submissionData)
    };

    return await this.sendEmail(adminEmailOptions);
  }

  /**
   * Send confirmation email to user
   */
  async sendUserConfirmation(submissionData) {
    const { name, email, subject, submissionId } = submissionData;

    const userEmailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@neurox-ai.com',
      to: email,
      subject: '✅ Thank you for contacting NeuroX AI Defense',
      html: this.generateUserEmailTemplate(submissionData)
    };

    return await this.sendEmail(userEmailOptions);
  }

  /**
   * Generate admin email template
   */
  generateAdminEmailTemplate(data) {
    const { name, email, subject, message, submissionId } = data;
    
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>New Contact Form Submission</title><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:#2563eb;color:white;padding:20px;text-align:center}.content{padding:20px;background:#f9fafb}.field{margin:10px 0}.label{font-weight:bold;color:#1f2937}.message{background:white;padding:15px;border-left:4px solid #2563eb;margin:15px 0}.footer{text-align:center;padding:20px;color:#6b7280;font-size:12px}</style></head><body><div class="container"><div class="header"><h1>🔔 New Contact Form Submission</h1></div><div class="content"><div class="field"><span class="label">Name:</span> ' + name + '</div><div class="field"><span class="label">Email:</span> ' + email + '</div><div class="field"><span class="label">Subject:</span> ' + subject + '</div><div class="field"><span class="label">Submission ID:</span> ' + submissionId + '</div><div class="field"><span class="label">Submitted:</span> ' + new Date().toLocaleString() + '</div><div class="message"><div class="label">Message:</div><p>' + message + '</p></div></div><div class="footer"><p>This email was sent from the NeuroX AI Defense contact form.</p></div></div></body></html>';
  }

  /**
   * Generate user confirmation email template
   */
  generateUserEmailTemplate(data) {
    const { name, subject, submissionId } = data;
    
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Thank You for Contacting Us</title><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:#10b981;color:white;padding:20px;text-align:center}.content{padding:20px;background:#f9fafb}.highlight{background:#dbeafe;padding:15px;border-left:4px solid #2563eb;margin:15px 0}.footer{text-align:center;padding:20px;color:#6b7280;font-size:12px}.btn{display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;margin:10px 0}</style></head><body><div class="container"><div class="header"><h1>✅ Thank You for Contacting Us</h1></div><div class="content"><p>Dear ' + name + ',</p><p>We have received your message regarding "<strong>' + subject + '</strong>" and will get back to you as soon as possible.</p><div class="highlight"><h3>📋 Your Submission Details</h3><p><strong>Reference ID:</strong> ' + submissionId + '</p><p><strong>Subject:</strong> ' + subject + '</p><p><strong>Submitted:</strong> ' + new Date().toLocaleString() + '</p></div><p><strong>What happens next?</strong></p><ul><li>Our team will review your message</li><li>We will respond within 24-48 hours during business days</li><li>You will receive a reply at this email address</li></ul><p>While you wait, feel free to explore our <a href="https://deepfake-detection-platform-j58qskqbx-rohitmane17s-projects.vercel.app" style="color:#2563eb">deepfake detection platform</a>.</p><p>Best regards,<br><strong>NeuroX AI Defense Team</strong></p></div><div class="footer"><p>© 2026 NeuroX AI Defense. All rights reserved.</p><p>This is an automated message. Please do not reply to this email.</p></div></div></body></html>';
  }

  /**
   * Get email service status
   */
  getStatus() {
    return {
      configured: this.isConfigured,
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      user: process.env.EMAIL_USER ? '***configured***' : 'not configured',
      adminEmail: process.env.ADMIN_EMAIL ? '***configured***' : 'not configured'
    };
  }

  /**
   * Test email configuration
   */
  async testConfiguration() {
    if (!this.isConfigured) {
      return { success: false, message: 'Email service not configured' };
    }

    const testEmail = {
      from: process.env.EMAIL_FROM || 'noreply@neurox-ai.com',
      to: process.env.ADMIN_EMAIL || 'admin@neurox-ai.com',
      subject: '🧪 Email Configuration Test',
      html: '<h2>Email Configuration Test</h2><p>This is a test email to verify that the email service is working correctly.</p><p><strong>Sent:</strong> ' + new Date().toLocaleString() + '</p><p><strong>Service:</strong> NeuroX AI Defense Email Service</p>'
    };

    return await this.sendEmail(testEmail);
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;
