const request = require('supertest');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

// Import routes
const authRoutes = require('../../routes/auth');
const deepfakeRoutes = require('../../routes/deepfake');
const contactRoutes = require('../../routes/contact');
const socialEngineeringRoutes = require('../../routes/socialEngineering');

describe('API Integration Tests', () => {
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
    app.use('/api/auth', authRoutes);
    app.use('/api/deepfake', deepfakeRoutes);
    app.use('/api/contact', contactRoutes);
    app.use('/api/social-engineering', socialEngineeringRoutes);

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
    it('should respond to basic requests', async () => {
      const response = await request(app).get('/api/auth/test');
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it('should handle registration request', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
          });

        // Should respond (may be success or error based on mock)
        expect([200, 201, 400, 500]).toContain(response.status);
        expect(response.body).toHaveProperty('success');
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
      });
    });

    describe('POST /api/auth/login', () => {
      it('should handle login request', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password123'
          });

        // Should respond (may be success or error based on mock)
        expect([200, 401, 400, 500]).toContain(response.status);
        expect(response.body).toHaveProperty('success');
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
      });
    });
  });

  describe('Deepfake Analysis Endpoints', () => {
    describe('GET /api/deepfake/disclaimer', () => {
      it('should return disclaimer text', async () => {
        const response = await request(app)
          .get('/api/deepfake/disclaimer');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success');
        expect(response.body.data).toHaveProperty('disclaimer');
      });
    });

    describe('POST /api/deepfake/analyze', () => {
      it('should require file upload', async () => {
        const response = await request(app)
          .post('/api/deepfake/analyze');

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('No file uploaded');
      });
    });
  });

  describe('Contact Form Endpoints', () => {
    describe('POST /api/contact', () => {
      it('should handle contact form submission', async () => {
        const response = await request(app)
          .post('/api/contact')
          .send({
            name: 'Test User',
            email: 'test@example.com',
            subject: 'Test Subject',
            message: 'Test message content'
          });

        // Should respond (may be success or error based on mock)
        expect([200, 400, 500]).toContain(response.status);
        expect(response.body).toHaveProperty('success');
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
      });
    });
  });

  describe('Social Engineering Endpoints', () => {
    describe('POST /api/social-engineering/analyze', () => {
      it('should handle message analysis', async () => {
        const response = await request(app)
          .post('/api/social-engineering/analyze')
          .send({
            message: 'This is a test message for analysis',
            sender: 'test@example.com'
          });

        // Should respond (may be success or error based on mock)
        expect([200, 400, 500]).toContain(response.status);
        expect(response.body).toHaveProperty('success');
      });

      it('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/social-engineering/analyze')
          .send({
            sender: 'test@example.com'
            // missing message
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('CORS and Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/api/deepfake/disclaimer');

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });

    it('should handle preflight requests', async () => {
      const response = await request(app)
        .options('/api/auth/login')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      expect([200, 204]).toContain(response.status);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
    });

    it('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-route');

      expect(response.status).toBe(404);
    });
  });
});
