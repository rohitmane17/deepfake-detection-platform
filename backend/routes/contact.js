const express = require('express');
const { submitContactForm, getEmailStatus, testEmailConfiguration } = require('../controllers/contactController');
const { validateContactForm } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /api/contact/submit:
 *   post:
 *     summary: Submit contact form
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 description: Contact person's name
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Contact person's email
 *                 example: john@example.com
 *               subject:
 *                 type: string
 *                 description: Message subject
 *                 example: Technical Support Request
 *               message:
 *                 type: string
 *                 description: Message content
 *                 example: I need help with the deepfake detection feature
 *     responses:
 *       200:
 *         description: Contact form submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Contact form submitted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     submissionId:
 *                       type: string
 *                       description: Unique submission ID
 *                       example: sub-1234567890-abc123
 *                     emailSent:
 *                       type: boolean
 *                       description: Whether notification email was sent
 *                       example: true
 *                     estimatedResponseTime:
 *                       type: string
 *                       description: Expected response time
 *                       example: 24-48 hours
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/submit', validateContactForm, submitContactForm);

/**
 * @swagger
 * /api/contact/status:
 *   get:
 *     summary: Get contact form submission status (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contact form status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Contact form status retrieved
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_submissions:
 *                       type: integer
 *                       description: Total number of submissions
 *                       example: 25
 *                     pending_responses:
 *                       type: integer
 *                       description: Number of submissions pending response
 *                       example: 5
 *                     recent_submissions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ContactSubmission'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /api/contact/status:
 *   get:
 *     summary: Get contact form submission status (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contact form status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Contact form status retrieved
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_submissions:
 *                       type: integer
 *                       description: Total number of submissions
 *                       example: 25
 *                     pending_responses:
 *                       type: integer
 *                       description: Number of submissions pending response
 *                       example: 5
 *                     recent_submissions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ContactSubmission'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/status', async (req, res) => {
  try {
    // This would typically fetch from database
    res.status(200).json({
      success: true,
      message: 'Contact form status retrieved',
      data: {
        total_submissions: 0,
        pending_responses: 0,
        recent_submissions: []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact status',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/contact/email-status:
 *   get:
 *     summary: Get email service status
 *     tags: [Contact]
 *     responses:
 *       200:
 *         description: Email service status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Email service status retrieved
 *                 data:
 *                   type: object
 *                   properties:
 *                     configured:
 *                       type: boolean
 *                       description: Whether email service is configured
 *                       example: true
 *                     host:
 *                       type: string
 *                       description: SMTP host
 *                       example: smtp.gmail.com
 *                     port:
 *                       type: integer
 *                       description: SMTP port
 *                       example: 587
 *                     user:
 *                       type: string
 *                       description: Email user status
 *                       example: ***configured***
 *                     adminEmail:
 *                       type: string
 *                       description: Admin email status
 *                       example: ***configured***
 */
router.get('/email-status', getEmailStatus);

/**
 * @swagger
 * /api/contact/test-email:
 *   post:
 *     summary: Test email configuration
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Test email sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     messageId:
 *                       type: string
 *                       description: Email message ID
 *                     response:
 *                       type: string
 *                       description: SMTP response
 *       400:
 *         description: Test email failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/test-email', testEmailConfiguration);

module.exports = router;
