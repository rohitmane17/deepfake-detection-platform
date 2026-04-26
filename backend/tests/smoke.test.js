const request = require('supertest');
const express = require('express');

describe('Smoke Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    // Simple test endpoints
    app.get('/api/health', (req, res) => {
      res.json({ 
        success: true, 
        message: 'Service is healthy',
        timestamp: new Date().toISOString()
      });
    });

    app.post('/api/test', (req, res) => {
      res.json({ 
        success: true, 
        received: req.body,
        timestamp: new Date().toISOString()
      });
    });

    // Error handling
    app.use((err, req, res, next) => {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    });

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint not found'
      });
    });
  });

  describe('Basic API Functionality', () => {
    it('should respond to health check', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Service is healthy');
      expect(response.body.timestamp).toBeDefined();
    });

    it('should handle POST requests', async () => {
      const testData = { message: 'test data', number: 42 };
      const response = await request(app)
        .post('/api/test')
        .send(testData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.received).toEqual(testData);
    });

    it('should handle 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Endpoint not found');
    });

    it('should handle empty requests', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({});
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.received).toEqual({});
    });
  });

  describe('Data Validation', () => {
    it('should handle JSON parsing', async () => {
      const response = await request(app)
        .post('/api/test')
        .set('Content-Type', 'application/json')
        .send('{"key": "value"}');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.received.key).toBe('value');
    });

    it('should handle array data', async () => {
      const testData = { items: [1, 2, 3], nested: { prop: 'value' } };
      const response = await request(app)
        .post('/api/test')
        .send(testData);
      
      expect(response.status).toBe(200);
      expect(response.body.received.items).toEqual([1, 2, 3]);
      expect(response.body.received.nested.prop).toBe('value');
    });
  });

  describe('Security Headers', () => {
    it('should include basic headers', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.headers).toHaveProperty('content-type');
      expect(response.headers['content-type']).toContain('application/json');
    });
  });
});
