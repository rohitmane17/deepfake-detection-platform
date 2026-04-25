const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { spawn } = require('child_process');
const Analysis = require('../models/Analysis');

// Deepfake analysis function using Python script
const analyzeDeepfake = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    // Generate analysis ID
    const analysisId = 'analysis-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    // Create analysis record in database
    const analysis = new Analysis({
      userId: req.user?.id || null, // Will be null for unauthenticated users
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      filePath: filePath,
      status: 'processing'
    });
    
    await analysis.save();
    
    // Run Python face detection script
    const pythonResult = await runPythonAnalysis(filePath);
    
    if (!pythonResult.success) {
      await analysis.updateStatus('failed', pythonResult.error);
      return res.status(500).json({
        success: false,
        message: 'Analysis failed',
        error: pythonResult.error
      });
    }
    
    // Update analysis with results
    analysis.prediction = pythonResult.is_deepfake ? 'AI Generated' : 'Real';
    analysis.confidence = pythonResult.confidence;
    analysis.riskLevel = pythonResult.image_analysis?.overall_risk || 'Low';
    analysis.explanation = pythonResult.explanation;
    analysis.featuresChecked = [
      'Facial inconsistencies',
      'Lighting mismatch',
      'Frame artifacts',
      'Eye blink patterns',
      'Skin texture analysis',
      'Background consistency',
      'Compression artifacts',
      'Frequency analysis',
      'Edge detection',
      'Texture analysis'
    ];
    analysis.imageAnalysis = {
      blurScore: pythonResult.image_analysis?.blur_score || 0,
      noiseLevel: pythonResult.image_analysis?.noise_level || 0,
      compressionArtifacts: pythonResult.image_analysis?.compression_artifacts || 0,
      faceConsistency: pythonResult.image_analysis?.face_consistency || 0,
      frequencyAnomaly: pythonResult.image_analysis?.frequency_anomaly || 0,
      edgeInconsistency: pythonResult.image_analysis?.edge_inconsistency || 0,
      textureAnomaly: pythonResult.image_analysis?.texture_anomaly || 0,
      overallRisk: pythonResult.image_analysis?.overall_risk || 'Low'
    };
    analysis.faceCount = pythonResult.face_count || 0;
    analysis.faces = pythonResult.faces || [];
    analysis.processingTime = pythonResult.analysis_time || '0s';
    analysis.status = 'completed';
    
    await analysis.save();
    
    // Increment user's analysis count if authenticated
    if (req.user?.id) {
      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      if (user) {
        await user.incrementAnalysisCount();
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Deepfake analysis completed successfully',
      data: {
        id: analysis._id,
        filename: analysis.filename,
        originalName: analysis.originalName,
        fileSize: analysis.fileSize,
        fileType: analysis.fileType,
        prediction: analysis.prediction,
        confidence: analysis.confidence,
        riskLevel: analysis.riskLevel,
        explanation: analysis.explanation,
        featuresChecked: analysis.featuresChecked,
        imageAnalysis: analysis.imageAnalysis,
        faceCount: analysis.faceCount,
        faces: analysis.faces,
        processingTime: analysis.processingTime,
        model: analysis.model,
        modelVersion: analysis.modelVersion,
        createdAt: analysis.createdAt
      }
    });

  } catch (error) {
    console.error('Deepfake analysis error:', error);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to analyze file',
      error: error.message
    });
  }
};

// Run Python analysis script
const runPythonAnalysis = (imagePath) => {
  return new Promise((resolve, reject) => {
    const python = spawn('python', ['face_detection.py', imagePath], {
      cwd: __dirname
    });
    
    let dataString = '';
    let errorString = '';
    
    python.stdout.on('data', (data) => {
      dataString += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      errorString += data.toString();
    });
    
    python.on('close', (code) => {
      if (code !== 0) {
        reject({
          success: false,
          error: errorString || 'Python script failed'
        });
      } else {
        try {
          const result = JSON.parse(dataString);
          resolve(result);
        } catch (e) {
          reject({
            success: false,
            error: 'Failed to parse Python output'
          });
        }
      }
    });
    
    python.on('error', (err) => {
      reject({
        success: false,
        error: `Failed to start Python script: ${err.message}`
      });
    });
  });
};

// Advanced deepfake analysis with image processing
const performAdvancedAnalysis = async (filePath) => {
  try {
    // Use Sharp for image analysis
    const metadata = await sharp(filePath).metadata();
    const stats = await sharp(filePath).stats();
    
    // Mock advanced analysis based on image properties
    const analysis = {
      imageMetadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        hasAlpha: metadata.hasAlpha,
        density: metadata.density
      },
      imageStats: {
        channels: stats.channels,
        isOpaque: stats.isOpaque
      },
      deepfakeIndicators: {
        compressionAnomalies: Math.random() * 0.3,
        colorInconsistencies: Math.random() * 0.2,
        edgeArtifacts: Math.random() * 0.4,
        noisePatterns: Math.random() * 0.25
      }
    };
    
    return analysis;
  } catch (error) {
    console.error('Advanced analysis error:', error);
    return null;
  }
};

module.exports = {
  analyzeDeepfake,
  performAdvancedAnalysis
};
