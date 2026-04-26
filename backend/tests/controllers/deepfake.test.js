const request = require('supertest');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Analysis = require('../../models/Analysis');
const { analyzeDeepfake } = require('../../controllers/deepfakeController');

// Mock the Analysis model
jest.mock('../../models/Analysis');
jest.mock('child_process');

describe('Deepfake Controller Tests', () => {
  let app;
  let mockAnalysis;

  beforeEach(() => {
    app = express();
    
    // Setup multer for file uploads
    const upload = multer({ dest: 'uploads/' });
    app.post('/api/analyze', upload.single('image'), analyzeDeepfake);
    
    // Mock analysis data
    mockAnalysis = {
      _id: '507f1f77bcf86cd799439011',
      userId: null,
      filename: 'test-image.jpg',
      originalName: 'test-image.jpg',
      fileSize: 1024,
      fileType: 'image/jpeg',
      filePath: 'uploads/test-image.jpg',
      prediction: 'Real',
      confidence: 85,
      riskLevel: 'Low',
      explanation: 'No deepfake indicators detected',
      featuresChecked: ['Facial inconsistencies', 'Lighting mismatch'],
      imageAnalysis: {
        blurScore: 0.1,
        noiseLevel: 0.2,
        compressionArtifacts: 0.1,
        faceConsistency: 0.9,
        frequencyAnomaly: 0.1,
        edgeInconsistency: 0.1,
        textureAnomaly: 0.1,
        overallRisk: 'Low'
      },
      faceCount: 1,
      faces: [{ x: 100, y: 100, width: 50, height: 50, confidence: 0.95 }],
      processingTime: '2.3s',
      model: 'OpenCV-based Deepfake Detector',
      modelVersion: 'v1.0.0',
      status: 'completed',
      save: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/analyze', () => {
    it('should analyze image successfully', async () => {
      // Create a test image file
      const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
      if (!fs.existsSync(path.dirname(testImagePath))) {
        fs.mkdirSync(path.dirname(testImagePath), { recursive: true });
      }
      fs.writeFileSync(testImagePath, 'fake-image-data');

      // Mock Analysis constructor and save
      Analysis.mockImplementation(() => mockAnalysis);
      mockAnalysis.save.mockResolvedValue(mockAnalysis);

      // Mock Python script execution
      const { spawn } = require('child_process');
      const mockSpawn = {
        on: jest.fn((event, callback) => {
          if (event === 'close') callback(0);
        }),
        stdout: {
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              callback(JSON.stringify({
                success: true,
                is_deepfake: false,
                confidence: 85,
                explanation: 'No deepfake indicators detected',
                image_analysis: {
                  blur_score: 0.1,
                  noise_level: 0.2,
                  compression_artifacts: 0.1,
                  face_consistency: 0.9,
                  frequency_anomaly: 0.1,
                  edge_inconsistency: 0.1,
                  texture_anomaly: 0.1,
                  overall_risk: 'Low'
                },
                face_count: 1,
                faces: [{ x: 100, y: 100, width: 50, height: 50, confidence: 0.95 }],
                analysis_time: '2.3s'
              }));
            }
          })
        },
        stderr: {
          on: jest.fn()
        }
      };
      spawn.mockReturnValue(mockSpawn);

      const response = await request(app)
        .post('/api/analyze')
        .attach('image', testImagePath);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.prediction).toBe('Real');
      expect(response.body.data.confidence).toBe(85);
      
      // Clean up
      fs.unlinkSync(testImagePath);
    });

    it('should return error if no file uploaded', async () => {
      const response = await request(app)
        .post('/api/analyze');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No file uploaded');
    });

    it('should handle analysis failure', async () => {
      // Create a test image file
      const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
      if (!fs.existsSync(path.dirname(testImagePath))) {
        fs.mkdirSync(path.dirname(testImagePath), { recursive: true });
      }
      fs.writeFileSync(testImagePath, 'fake-image-data');

      // Mock Analysis constructor and save
      Analysis.mockImplementation(() => mockAnalysis);
      mockAnalysis.save.mockResolvedValue(mockAnalysis);

      // Mock Python script execution failure
      const { spawn } = require('child_process');
      const mockSpawn = {
        on: jest.fn((event, callback) => {
          if (event === 'close') callback(1); // Non-zero exit code
        }),
        stdout: {
          on: jest.fn()
        },
        stderr: {
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              callback('Error: Python script failed');
            }
          })
        }
      };
      spawn.mockReturnValue(mockSpawn);

      const response = await request(app)
        .post('/api/analyze')
        .attach('image', testImagePath);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      
      // Clean up
      fs.unlinkSync(testImagePath);
    });

    it('should validate file type', async () => {
      // Create a test text file
      const testFilePath = path.join(__dirname, '../fixtures/test-file.txt');
      if (!fs.existsSync(path.dirname(testFilePath))) {
        fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
      }
      fs.writeFileSync(testFilePath, 'fake-text-data');

      const response = await request(app)
        .post('/api/analyze')
        .attach('image', testFilePath);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid file type');
      
      // Clean up
      fs.unlinkSync(testFilePath);
    });
  });
});
