# Email Service Configuration Guide

## Overview

This guide explains how to configure the email service for the NeuroX AI Defense Platform contact form notifications.

## Prerequisites

- SMTP email account (Gmail, Outlook, etc.)
- Email credentials (username/password or app password)
- Environment variables configuration

## Supported Email Providers

### Gmail (Recommended)
- **Host**: smtp.gmail.com
- **Port**: 587 (TLS) or 465 (SSL)
- **Authentication**: Username + App Password

### Outlook/Hotmail
- **Host**: smtp-mail.outlook.com
- **Port**: 587 (TLS)
- **Authentication**: Username + Password

### Custom SMTP
- **Host**: Your SMTP server
- **Port**: 587 (TLS) or 465 (SSL)
- **Authentication**: Username + Password

## Environment Variables

Add these environment variables to your `.env` file:

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@neurox-ai.com
ADMIN_EMAIL=admin@neurox-ai.com
EMAIL_REJECT_UNAUTHORIZED=true
```

### Variable Descriptions

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP server port | `587` |
| `EMAIL_SECURE` | Use SSL (true for 465, false for 587) | `false` |
| `EMAIL_USER` | Email username | `your-email@gmail.com` |
| `EMAIL_PASS` | Email password or app password | `your-app-password` |
| `EMAIL_FROM` | From email address | `noreply@neurox-ai.com` |
| `ADMIN_EMAIL` | Admin notification email | `admin@neurox-ai.com` |
| `EMAIL_REJECT_UNAUTHORIZED` | TLS certificate validation | `true` |

## Gmail Setup (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Select "Security"
3. Enable 2-Step Verification

### Step 2: Generate App Password
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" for the app
3. Select "Other (Custom name)" and enter "NeuroX AI"
4. Click "Generate"
5. Copy the 16-character password

### Step 3: Configure Environment
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=generated-16-char-password
EMAIL_FROM=noreply@neurox-ai.com
ADMIN_EMAIL=admin@neurox-ai.com
```

## Outlook/Hotmail Setup

### Step 1: Enable App Passwords
1. Go to [Microsoft Account Security](https://account.microsoft.com/security)
2. Enable 2-Step Verification
3. Generate app password for mail

### Step 2: Configure Environment
```bash
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=generated-app-password
EMAIL_FROM=noreply@neurox-ai.com
ADMIN_EMAIL=admin@neurox-ai.com
```

## Testing Email Configuration

### Method 1: API Endpoint
```bash
curl -X POST http://localhost:5000/api/contact/test-email \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Method 2: Direct Test
```javascript
const emailService = require('./config/emailConfig');

// Test email configuration
const result = await emailService.testConfiguration();
console.log('Test result:', result);
```

### Method 3: Status Check
```bash
curl http://localhost:5000/api/contact/email-status
```

## Email Templates

### Admin Notification Template
- **Purpose**: Notify admin of new contact form submissions
- **Content**: User details, message, submission ID, timestamp
- **Design**: Professional HTML with company branding

### User Confirmation Template
- **Purpose**: Confirm receipt of user's message
- **Content**: Thank you message, reference ID, response timeline
- **Design**: Friendly HTML with next steps

## Email Service Features

### Connection Pooling
- **Max Connections**: 5
- **Max Messages**: 100 per connection
- **Rate Limiting**: 5 emails per second
- **Timeout**: 30 seconds per email

### Error Handling
- **Graceful Degradation**: Form submission succeeds even if email fails
- **Error Logging**: Detailed error information in logs
- **Status Reporting**: Email success/failure in API response

### Security Features
- **TLS Encryption**: Secure email transmission
- **App Passwords**: No plain text passwords
- **Rate Limiting**: Prevent email spamming
- **Input Validation**: Sanitized email content

## Troubleshooting

### Common Issues

#### 1. "Email service not configured"
**Cause**: Missing `EMAIL_USER` or `EMAIL_PASS`
**Solution**: Add environment variables to `.env` file

#### 2. "Authentication failed"
**Cause**: Incorrect credentials or 2FA not enabled
**Solution**: Use app password, enable 2FA

#### 3. "Connection timeout"
**Cause**: Firewall blocking SMTP port
**Solution**: Check network settings, try different port

#### 4. "Self-signed certificate"
**Cause**: TLS certificate validation failing
**Solution**: Set `EMAIL_REJECT_UNAUTHORIZED=false`

### Debug Mode
Enable verbose logging:
```bash
DEBUG=nodemailer:* npm start
```

### Test SMTP Connection
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-password'
  }
});

transporter.verify().then(console.log).catch(console.error);
```

## Production Considerations

### Environment Security
- Use environment variables, not hardcoded credentials
- Rotate app passwords regularly
- Monitor email sending volume
- Implement rate limiting on API endpoints

### Performance Optimization
- Connection pooling enabled by default
- Async email sending (non-blocking)
- Email queue for high volume
- Fallback to queue if SMTP fails

### Monitoring
- Track email delivery rates
- Monitor SMTP response times
- Alert on authentication failures
- Log email sending attempts

## API Endpoints

### Submit Contact Form
```
POST /api/contact/submit
```

### Get Email Status
```
GET /api/contact/email-status
```

### Test Email Configuration
```
POST /api/contact/test-email
```

## Integration Examples

### Frontend Integration
```javascript
// Submit contact form
const response = await fetch('/api/contact/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Technical Support',
    message: 'I need help with...'
  })
});

const result = await response.json();
console.log('Email sent:', result.data.emailSent);
```

### Backend Integration
```javascript
const emailService = require('./config/emailConfig');

// Send custom email
const result = await emailService.sendEmail({
  from: 'noreply@neurox-ai.com',
  to: 'user@example.com',
  subject: 'Custom Email',
  html: '<h1>Custom Content</h1>'
});
```

## Best Practices

1. **Use App Passwords**: Never use main account password
2. **Enable 2FA**: Add extra security layer
3. **Monitor Usage**: Track email sending patterns
4. **Test Regularly**: Verify configuration works
5. **Handle Failures**: Graceful degradation
6. **Secure Credentials**: Use environment variables
7. **Rate Limit**: Prevent abuse
8. **Log Events**: Track email activities

## Support

For email configuration issues:
1. Check environment variables
2. Verify SMTP credentials
3. Test network connectivity
4. Review error logs
5. Consult email provider documentation

## Security Notes

- Email credentials are stored in environment variables only
- App passwords provide limited access
- TLS encryption is used for all email communications
- Input validation prevents email injection attacks
- Rate limiting prevents email spamming
- All email content is sanitized before sending
