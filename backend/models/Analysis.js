const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  prediction: {
    type: String,
    enum: ['Real', 'AI Generated'],
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  featuresChecked: [{
    type: String
  }],
  imageAnalysis: {
    blurScore: Number,
    noiseLevel: Number,
    compressionArtifacts: Number,
    faceConsistency: Number,
    frequencyAnomaly: Number,
    edgeInconsistency: Number,
    textureAnomaly: Number,
    overallRisk: String
  },
  faceCount: {
    type: Number,
    default: 0
  },
  faces: [{
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    confidence: Number
  }],
  processingTime: {
    type: String
  },
  model: {
    type: String,
    default: 'OpenCV-based Deepfake Detector'
  },
  modelVersion: {
    type: String,
    default: 'v1.0.0'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  errorMessage: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ status: 1 });
analysisSchema.index({ prediction: 1 });

// Method to update status
analysisSchema.methods.updateStatus = function(status, errorMessage = null) {
  this.status = status;
  if (errorMessage) {
    this.errorMessage = errorMessage;
  }
  return this.save();
};

module.exports = mongoose.model('Analysis', analysisSchema);
