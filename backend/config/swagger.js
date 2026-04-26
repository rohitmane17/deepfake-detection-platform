const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NeuroX AI Defense API',
      version: '1.0.0',
      description: 'Deepfake Detection and Security Analysis API',
      contact: {
        name: 'NeuroX AI Team',
        email: 'support@neurox-ai.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://neurox-ai-backend-6gz3.onrender.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authentication token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User name',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
              example: 'john@example.com'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role',
              example: 'user'
            },
            isActive: {
              type: 'boolean',
              description: 'Account status',
              example: true
            },
            analysisCount: {
              type: 'integer',
              description: 'Number of analyses performed',
              example: 5
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            }
          }
        },
        Analysis: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Analysis ID'
            },
            userId: {
              type: 'string',
              description: 'User ID who performed the analysis'
            },
            filename: {
              type: 'string',
              description: 'Uploaded filename',
              example: 'image.jpg'
            },
            originalName: {
              type: 'string',
              description: 'Original filename',
              example: 'my-photo.jpg'
            },
            fileSize: {
              type: 'integer',
              description: 'File size in bytes',
              example: 1024000
            },
            fileType: {
              type: 'string',
              description: 'MIME type',
              example: 'image/jpeg'
            },
            prediction: {
              type: 'string',
              enum: ['Real', 'AI Generated'],
              description: 'Analysis result',
              example: 'Real'
            },
            confidence: {
              type: 'number',
              format: 'float',
              minimum: 0,
              maximum: 100,
              description: 'Confidence percentage',
              example: 85.5
            },
            riskLevel: {
              type: 'string',
              enum: ['Low', 'Medium', 'High'],
              description: 'Risk assessment',
              example: 'Low'
            },
            explanation: {
              type: 'string',
              description: 'Detailed explanation of the analysis',
              example: 'No deepfake indicators detected in the image'
            },
            featuresChecked: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of features analyzed',
              example: ['Facial inconsistencies', 'Lighting mismatch', 'Frame artifacts']
            },
            imageAnalysis: {
              type: 'object',
              properties: {
                blurScore: {
                  type: 'number',
                  description: 'Blur detection score',
                  example: 0.1
                },
                noiseLevel: {
                  type: 'number',
                  description: 'Noise level detected',
                  example: 0.2
                },
                compressionArtifacts: {
                  type: 'number',
                  description: 'Compression artifacts score',
                  example: 0.1
                },
                faceConsistency: {
                  type: 'number',
                  description: 'Face consistency score',
                  example: 0.9
                },
                frequencyAnomaly: {
                  type: 'number',
                  description: 'Frequency domain anomaly score',
                  example: 0.1
                },
                edgeInconsistency: {
                  type: 'number',
                  description: 'Edge inconsistency score',
                  example: 0.1
                },
                textureAnomaly: {
                  type: 'number',
                  description: 'Texture anomaly score',
                  example: 0.1
                },
                overallRisk: {
                  type: 'string',
                  enum: ['Low', 'Medium', 'High'],
                  description: 'Overall risk assessment',
                  example: 'Low'
                }
              }
            },
            faceCount: {
              type: 'integer',
              description: 'Number of faces detected',
              example: 1
            },
            faces: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  x: {
                    type: 'number',
                    description: 'X coordinate'
                  },
                  y: {
                    type: 'number',
                    description: 'Y coordinate'
                  },
                  width: {
                    type: 'number',
                    description: 'Face width'
                  },
                  height: {
                    type: 'number',
                    description: 'Face height'
                  },
                  confidence: {
                    type: 'number',
                    description: 'Detection confidence'
                  }
                }
              },
              description: 'Detected faces with coordinates'
            },
            processingTime: {
              type: 'string',
              description: 'Time taken for analysis',
              example: '2.3s'
            },
            model: {
              type: 'string',
              description: 'Model used for analysis',
              example: 'OpenCV-based Deepfake Detector'
            },
            modelVersion: {
              type: 'string',
              description: 'Model version',
              example: 'v1.0.0'
            },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'completed', 'failed'],
              description: 'Analysis status',
              example: 'completed'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Analysis creation timestamp'
            }
          }
        },
        ContactSubmission: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Submission ID'
            },
            name: {
              type: 'string',
              description: 'Submitter name',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Submitter email',
              example: 'john@example.com'
            },
            subject: {
              type: 'string',
              description: 'Message subject',
              example: 'Technical Support Request'
            },
            message: {
              type: 'string',
              description: 'Message content',
              example: 'I need help with the deepfake detection feature'
            },
            status: {
              type: 'string',
              enum: ['pending', 'in-progress', 'resolved'],
              description: 'Submission status',
              example: 'pending'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Submission timestamp'
            }
          }
        },
        SocialEngineeringAnalysis: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Analysis ID'
            },
            message: {
              type: 'string',
              description: 'Analyzed message',
              example: 'Click here to claim your prize!'
            },
            sender: {
              type: 'string',
              description: 'Message sender',
              example: 'scammer@example.com'
            },
            riskScore: {
              type: 'number',
              format: 'float',
              minimum: 0,
              maximum: 100,
              description: 'Risk score (0-100)',
              example: 75
            },
            riskLevel: {
              type: 'string',
              enum: ['Low', 'Medium', 'High'],
              description: 'Risk assessment',
              example: 'High'
            },
            indicators: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    description: 'Indicator type',
                    example: 'Urgency'
                  },
                  detected: {
                    type: 'boolean',
                    description: 'Whether indicator was detected',
                    example: true
                  },
                  confidence: {
                    type: 'number',
                    description: 'Detection confidence',
                    example: 0.8
                  }
                }
              },
              description: 'Social engineering indicators detected'
            },
            explanation: {
              type: 'string',
              description: 'Analysis explanation',
              example: 'Message contains urgency indicators and suspicious links'
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Security recommendations',
              example: ['Do not click any links', 'Verify sender identity', 'Report as spam']
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Analysis timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Validation failed'
            },
            error: {
              type: 'string',
              description: 'Detailed error information',
              example: 'Email is required'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    }
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './server.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi
};
