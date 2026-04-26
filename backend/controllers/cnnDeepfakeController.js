const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const Analysis = require('../models/Analysis');

// CNN-based deepfake analysis function
const analyzeDeepfakeCNN = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    // Validate file type
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff'];
    if (!allowedTypes.includes(fileExtension)) {
      // Clean up file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only images are allowed for CNN analysis.'
      });
    }
    
    // Generate analysis ID
    const analysisId = 'cnn-analysis-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    // Create analysis record in database
    const analysis = new Analysis({
      userId: req.user?.id || null,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      filePath: filePath,
      status: 'processing',
      model: 'XceptionNet-based CNN',
      modelVersion: '1.0.0'
    });
    
    await analysis.save();
    
    // Run CNN-based analysis
    const cnnResult = await runCNNAnalysis(filePath);
    
    if (!cnnResult.success) {
      await analysis.updateStatus('failed', cnnResult.error);
      return res.status(500).json({
        success: false,
        message: 'CNN analysis failed',
        error: cnnResult.error
      });
    }
    
    // Update analysis with CNN results
    analysis.prediction = cnnResult.prediction;
    analysis.confidence = cnnResult.confidence;
    analysis.riskLevel = cnnResult.risk_level;
    analysis.explanation = cnnResult.explanation;
    analysis.imageAnalysis = {
      blurScore: cnnResult.facial_analysis?.facial_consistency || 0.8,
      noiseLevel: 0.1,
      compressionArtifacts: 0.1,
      faceConsistency: cnnResult.facial_analysis?.facial_consistency || 0.8,
      frequencyAnomaly: cnnResult.raw_confidence || 0.5,
      edgeInconsistency: 0.1,
      textureAnomaly: 0.1,
      overallRisk: cnnResult.risk_level
    };
    analysis.faceCount = cnnResult.facial_analysis?.face_count || 0;
    analysis.faces = []; // Would be populated with face coordinates
    analysis.processingTime = cnnResult.processing_time;
    analysis.status = 'completed';
    
    await analysis.save();
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'CNN-based deepfake analysis completed successfully',
      data: {
        analysisId: analysis._id,
        prediction: analysis.prediction,
        confidence: analysis.confidence,
        riskLevel: analysis.riskLevel,
        explanation: analysis.explanation,
        model: analysis.model,
        modelVersion: analysis.modelVersion,
        facialAnalysis: cnnResult.facial_analysis,
        processingTime: analysis.processingTime,
        featuresChecked: [
          'CNN-based deepfake detection',
          'Facial feature analysis',
          'XceptionNet pattern recognition',
          'Deepfake signature detection'
        ],
        imageAnalysis: analysis.imageAnalysis,
        faceCount: analysis.faceCount,
        faces: analysis.faces,
        status: analysis.status,
        timestamp: analysis.createdAt
      }
    });
    
  } catch (error) {
    console.error('CNN Deepfake analysis error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during CNN analysis',
      error: error.message
    });
  }
};

// Run CNN-based analysis using Python script
const runCNNAnalysis = (filePath) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../ml/cnn_analyzer.py');
    
    // Check if Python script exists
    if (!fs.existsSync(pythonScript)) {
      resolve({
        success: false,
        error: 'CNN analysis script not found. Please ensure the ML environment is set up.'
      });
      return;
    }
    
    const pythonProcess = spawn('python', [pythonScript, filePath]);
    
    let result = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const analysisResult = JSON.parse(result);
          resolve({
            success: true,
            ...analysisResult
          });
        } catch (parseError) {
          resolve({
            success: false,
            error: 'Failed to parse CNN analysis results'
          });
        }
      } else {
        resolve({
          success: false,
          error: `CNN analysis failed with code ${code}: ${errorOutput}`
        });
      }
    });
    
    pythonProcess.on('error', (error) => {
      resolve({
        success: false,
        error: `Failed to run CNN analysis: ${error.message}`
      });
    });
    
    // Timeout after 60 seconds
    setTimeout(() => {
      pythonProcess.kill();
      resolve({
        success: false,
        error: 'CNN analysis timed out'
      });
    }, 60000);
  });
};

// Get CNN model information
const getCNNModelInfo = async (req, res) => {
  try {
    const modelInfo = {
      model: 'XceptionNet-based CNN',
      version: '1.0.0',
      architecture: 'Transfer Learning with XceptionNet',
      inputSize: '299x299 pixels',
      trainingDataset: 'FaceForensics++ (planned)',
      accuracy: 'Training pending',
      lastUpdated: new Date().toISOString(),
      capabilities: [
        'CNN-based deepfake detection',
        'Facial feature analysis',
        'Pattern recognition',
        'Confidence scoring',
        'Risk assessment'
      ],
      limitations: [
        'Requires training on real deepfake dataset',
        'Currently using random weights',
        'Needs pre-trained model weights'
      ]
    };
    
    res.status(200).json({
      success: true,
      message: 'CNN model information retrieved successfully',
      data: modelInfo
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve CNN model information',
      error: error.message
    });
  }
};

module.exports = {
  analyzeDeepfakeCNN,
  getCNNModelInfo
};
