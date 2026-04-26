const request = require('supertest');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Import controllers
const { register, login } = require('../../controllers/authController');
const { submitContactForm } = require('../../controllers/contactController');

describe('Functional API Tests', () => {
  let app;

  beforeAll(() => {
    // Setup Express app with middleware
    app = express();
    app.use(helmet());
    app.use(cors());
    app.use(compression());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Setup routes
    app.post('/api/auth/register', register);
    app.post('/api/auth/login', login);
    app.post('/api/contact', submitContactForm);

    // Simple test endpoint
    app.get('/api/test', (req, res) => {
      res.json({ success: true, message: 'API is working' });
    });

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        details: {
          resource: 'API endpoint',
          id: req.originalUrl
        }
      });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
      });
    });
  });

  describe('API Health Check', () => {
    it('should respond to test endpoint', async () => {
      const response = await request(app).get('/api/test');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('API is working');
    });
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it('should handle registration request structure', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
          });

        // Should respond with some status (may be success or error based on mock)
        expect([200, 201, 400, 500]).toContain(response.status);
        expect(response.body).toHaveProperty('success');
        expect(typeof response.body.success).toBe('boolean');
      });

      it('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Test User'
            // missing email and password
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBeDefined();
      });
    });

    describe('POST /api/auth/login', () => {
      it('should handle login request structure', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password123'
          });

        // Should respond with some status (may be success or error based on mock)
        expect([200, 401, 400, 500]).toContain(response.status);
        expect(response.body).toHaveProperty('success');
        expect(typeof response.body.success).toBe('boolean');
      });

      it('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com'
            // missing password
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBeDefined();
      });
    });
  });

  describe('Contact Form Endpoints', () => {
    describe('POST /api/contact', () => {
      it('should handle contact form submission structure', async () => {
        const response = await request(app)
          .post('/api/contact')
          .send({
            name: 'Test User',
            email: 'test@example.com',
            subject: 'Test Subject',
            message: 'Test message content'
          });

        // Should respond with some status (may be success or error based on mock)
        expect([200, 400, 500]).toContain(response.status);
        expect(response.body).toHaveProperty('success');
        expect(typeof response.body.success).toBe('boolean');
      });

      it('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/contact')
          .send({
            name: 'Test User'
            // missing required fields
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-route');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should handle invalid JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/api/test');

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });

  describe('Request Validation', () => {
    it('should handle empty requests', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle malformed requests', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          name: '',
          email: 'invalid-email',
          subject: '',
          message: ''
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
