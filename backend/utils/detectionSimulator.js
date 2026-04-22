/**
 * Detection Simulator - Mock AI Deepfake Detection System
 * Provides realistic detection results with heuristics and processing delays
 * Integrates with Flask AI microservice for processing
 */

const AIServiceClient = require('../services/aiServiceClient');

class DetectionSimulator {
  constructor() {
    // Initialize AI service client
    this.aiClient = new AIServiceClient();
    this.useAIService = process.env.USE_AI_SERVICE === 'true';
    this.fallbackToLocal = process.env.AI_FALLBACK_TO_LOCAL === 'true';
    
    console.log(`[DetectionSimulator] AI Service enabled: ${this.useAIService}`);
    console.log(`[DetectionSimulator] Fallback to local: ${this.fallbackToLocal}`);
    
    // Local simulation properties (for fallback)
    this.probabilities = {
      aiGenerated: 0.65, // 65% chance of being AI generated
      highConfidence: 0.40, // 40% chance of high confidence
      mediumConfidence: 0.35, // 35% chance of medium confidence
      lowConfidence: 0.25, // 25% chance of low confidence
    };
    
    // Heuristic keywords that indicate AI-generated content
    this.aiKeywords = [
      'deepfake', 'ai', 'synthetic', 'generated', 'artificial', 
      'fake', 'simulation', 'render', 'cg', 'computer', 'digital',
      'virtual', 'animated', 'manipulated', 'altered', 'enhanced'
    ];
    
    // File size thresholds (in bytes)
    this.sizeThresholds = {
      verySmall: 50 * 1024,      // 50KB
      small: 100 * 1024,         // 100KB
      normal: 5 * 1024 * 1024,  // 5MB
      large: 20 * 1024 * 1024,  // 20MB
      veryLarge: 50 * 1024 * 1024 // 50MB
    };
    
    // AI Model information
    this.modelInfo = {
      name: "Simulated CNN-based Deepfake Detector",
      version: "v2.1.0",
      type: "Convolutional Neural Network",
      trainingData: "Mixed dataset of real and synthetic media"
    };
    
    // Analysis features that can be checked
    this.availableFeatures = [
      "Facial inconsistencies",
      "Lighting mismatch", 
      "Frame artifacts",
      "Eye blink patterns",
      "Skin texture analysis",
      "Background consistency",
      "Audio-visual sync",
      "Compression artifacts",
      "Geometric distortions",
      "Color channel anomalies"
    ];
  }

  /**
   * Analyze filename for AI-related keywords
   * @param {string} filename - Original filename
   * @returns {number} AI probability adjustment (0-0.3)
   */
  analyzeFilename(filename) {
    if (!filename) return 0;
    
    const lowercaseFilename = filename.toLowerCase();
    let keywordCount = 0;
    
    // Count AI-related keywords in filename
    this.aiKeywords.forEach(keyword => {
      if (lowercaseFilename.includes(keyword)) {
        keywordCount++;
      }
    });
    
    // Calculate probability adjustment (max 0.3 or 30% increase)
    const adjustment = Math.min(keywordCount * 0.1, 0.3);
    return adjustment;
  }

  /**
   * Analyze file size and adjust confidence
   * @param {number} fileSize - File size in bytes
   * @returns {number} Confidence adjustment (-10 to +10)
   */
  analyzeFileSize(fileSize) {
    let adjustment = 0;
    
    if (fileSize < this.sizeThresholds.verySmall) {
      // Very small files - slightly reduce confidence (might be thumbnails)
      adjustment = -5;
    } else if (fileSize < this.sizeThresholds.small) {
      // Small files - minimal adjustment
      adjustment = -2;
    } else if (fileSize > this.sizeThresholds.veryLarge) {
      // Very large files - increase confidence (more data to analyze)
      adjustment = 8;
    } else if (fileSize > this.sizeThresholds.large) {
      // Large files - moderate increase
      adjustment = 5;
    }
    
    // Add slight randomness to make it less deterministic
    const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
    return Math.round(adjustment + randomFactor);
  }

  /**
   * Generate confidence score with heuristics
   * @param {string} filename - Original filename
   * @param {number} fileSize - File size in bytes
   * @returns {number} Confidence score
   */
  generateConfidenceScore(filename, fileSize) {
    // Base confidence generation
    const random = Math.random();
    let confidence;
    
    if (random < 0.25) {
      // 25% chance for 50-60 range (lower confidence)
      confidence = 50 + Math.random() * 10;
    } else if (random < 0.60) {
      // 35% chance for 60-80 range (medium confidence)
      confidence = 60 + Math.random() * 20;
    } else {
      // 40% chance for 80-99 range (high confidence)
      confidence = 80 + Math.random() * 19;
    }
    
    // Apply heuristics adjustments
    const filenameAdjustment = this.analyzeFilename(filename);
    const sizeAdjustment = this.analyzeFileSize(fileSize);
    
    // Apply adjustments with bounds checking
    confidence = confidence + sizeAdjustment;
    confidence = confidence + (filenameAdjustment * 20); // Convert to percentage points
    
    // Ensure confidence stays within 50-99 range
    confidence = Math.max(50, Math.min(99, confidence));
    
    return Math.round(confidence);
  }

  /**
   * Generate classification based on confidence, probabilities, and filename heuristics
   * @param {number} confidence - Confidence score
   * @param {string} filename - Original filename
   * @returns {string} "Real" or "AI Generated"
   */
  generateClassification(confidence, filename) {
    // Higher confidence slightly increases chance of AI detection
    let adjustedProbability = this.probabilities.aiGenerated + (confidence - 74.5) * 0.005;
    
    // Apply filename heuristics
    const filenameAdjustment = this.analyzeFilename(filename);
    adjustedProbability += filenameAdjustment;
    
    // Ensure probability stays within reasonable bounds
    const probability = Math.max(0.2, Math.min(0.9, adjustedProbability));
    
    return Math.random() < probability ? "AI Generated" : "Real";
  }

  /**
   * Calculate risk level based on confidence score
   * @param {number} confidence - Confidence score
   * @returns {string} "High", "Medium", or "Low"
   */
  calculateRiskLevel(confidence) {
    if (confidence > 80) {
      return "High";
    } else if (confidence >= 60) {
      return "Medium";
    } else {
      return "Low";
    }
  }

  /**
   * Generate detailed analysis breakdown
   * @param {number} confidence - Confidence score
   * @param {string} classification - Classification result
   * @returns {object} Detailed analysis
   */
  generateDetailedAnalysis(confidence, classification) {
    const baseScore = confidence / 100;
    
    return {
      facialInconsistencies: Math.round((Math.random() * 0.4 + 0.1) * 100) / 100,
      audioVisualSync: Math.round((Math.random() * 0.3 + 0.05) * 100) / 100,
      digitalArtifacts: Math.round((Math.random() * 0.5 + 0.1) * 100) / 100,
      metadataAnalysis: Math.round((Math.random() * 0.2 + 0.02) * 100) / 100,
      compressionAnomalies: Math.round((Math.random() * 0.3 + 0.05) * 100) / 100,
      colorInconsistencies: Math.round((Math.random() * 0.25 + 0.02) * 100) / 100
    };
  }

  /**
   * Generate realistic processing time (1-2 seconds for AI analysis)
   * @returns {number} Processing time in seconds
   */
  generateProcessingTime() {
    // Simulate AI processing time (1-2 seconds)
    return Math.round((Math.random() * 1 + 1) * 10) / 10;
  }

  /**
   * Generate features checked array
   * @param {string} fileType - File type (image/video)
   * @returns {array} Array of features checked
   */
  generateFeaturesChecked(fileType) {
    const numFeatures = Math.floor(Math.random() * 3) + 3; // 3-5 features
    const shuffled = [...this.availableFeatures].sort(() => Math.random() - 0.5);
    
    // Filter features based on file type
    let relevantFeatures = shuffled;
    if (fileType && fileType.startsWith('image/')) {
      // For images, exclude audio-related features
      relevantFeatures = shuffled.filter(feature => 
        !feature.toLowerCase().includes('audio') && 
        !feature.toLowerCase().includes('sync')
      );
    } else if (fileType && fileType.startsWith('video/')) {
      // For videos, include video-specific features
      relevantFeatures = shuffled.filter(feature => 
        feature.toLowerCase().includes('frame') || 
        feature.toLowerCase().includes('sync') ||
        feature.toLowerCase().includes('blink') ||
        !feature.toLowerCase().includes('compression')
      );
    }
    
    return relevantFeatures.slice(0, numFeatures);
  }

  /**
   * Main detection simulation function with AI service integration
   * @param {object} fileInfo - Information about the uploaded file
   * @returns {object} Detection result
   */
  async analyzeFile(fileInfo) {
    try {
      if (this.useAIService) {
        console.log('[DetectionSimulator] Using AI service for analysis');
        
        // Use AI service for prediction
        const aiResult = await this.aiClient.predict(fileInfo);
        
        // Format AI service result to match expected format
        return {
          prediction: aiResult.prediction,
          confidence: aiResult.confidence,
          risk: aiResult.risk_level,
          processingTime: aiResult.analysis_time,
          analysis_time: aiResult.analysis_time,
          model: aiResult.model,
          features_checked: aiResult.features_checked,
          analysis: this.generateDetailedAnalysis(aiResult.confidence, aiResult.prediction),
          metadata: {
            filename: fileInfo.filename,
            originalName: fileInfo.originalName,
            fileType: fileInfo.fileType,
            fileSize: fileInfo.fileSize,
            timestamp: aiResult.metadata?.timestamp || new Date().toISOString(),
            ai_service: true,
            model_info: {
              name: aiResult.model,
              version: aiResult.metadata?.model_version || 'unknown'
            }
          },
          recommendations: this.generateRecommendations(aiResult.prediction, aiResult.risk_level)
        };
      }
    } catch (error) {
      console.error('[DetectionSimulator] AI service failed:', error.message);
      
      if (!this.fallbackToLocal) {
        throw error;
      }
      
      console.log('[DetectionSimulator] Falling back to local simulation');
    }
    
    // Fallback to local simulation
    console.log('[DetectionSimulator] Using local simulation');
    
    // Simulate AI processing delay (1-2 seconds)
    const processingTime = this.generateProcessingTime();
    await new Promise(resolve => setTimeout(resolve, processingTime * 1000));

    // Generate results with heuristics
    const confidence = this.generateConfidenceScore(fileInfo.originalName, fileInfo.fileSize);
    const classification = this.generateClassification(confidence, fileInfo.originalName);
    const riskLevel = this.calculateRiskLevel(confidence);
    const detailedAnalysis = this.generateDetailedAnalysis(confidence, classification);
    const featuresChecked = this.generateFeaturesChecked(fileInfo.fileType);

    return {
      prediction: classification,
      confidence: confidence,
      risk: riskLevel,
      processingTime: `${processingTime}s`,
      analysis_time: `${processingTime} seconds`,
      model: this.modelInfo.name,
      features_checked: featuresChecked,
      analysis: detailedAnalysis,
      metadata: {
        filename: fileInfo.filename,
        originalName: fileInfo.originalName,
        fileType: fileInfo.fileType,
        fileSize: fileInfo.fileSize,
        timestamp: new Date().toISOString(),
        ai_service: false,
        heuristics: {
          filenameKeywords: this.analyzeFilename(fileInfo.originalName) > 0,
          sizeAdjustment: this.analyzeFileSize(fileInfo.fileSize)
        },
        model_info: this.modelInfo
      },
      recommendations: this.generateRecommendations(classification, riskLevel)
    };
  }

  /**
   * Generate recommendations based on classification and risk
   * @param {string} classification - "Real" or "AI Generated"
   * @param {string} riskLevel - "High", "Medium", or "Low"
   * @returns {array} List of recommendations
   */
  generateRecommendations(classification, riskLevel) {
    const baseRecommendations = [
      'Verify the source of this content',
      'Check for unusual facial movements or expressions',
      'Look for inconsistent lighting or shadows'
    ];

    if (classification === "AI Generated") {
      baseRecommendations.push(
        'Be cautious about sharing this content',
        'Report if this content is being used maliciously'
      );
    }

    if (riskLevel === "High") {
      baseRecommendations.push(
        'Do not trust this content without verification',
        'Consult with fact-checking organizations'
      );
    } else if (riskLevel === "Medium") {
      baseRecommendations.push(
        'Exercise caution with this content',
        'Seek additional sources to verify authenticity'
      );
    } else {
      baseRecommendations.push(
        'Content appears to be authentic',
        'Still verify with original source when possible'
      );
    }

    return baseRecommendations;
  }

  /**
   * Generate explanation text based on analysis results
   * @param {string} classification - "Real" or "AI Generated"
   * @param {number} confidence - Confidence score
   * @param {object} analysis - Detailed analysis metrics
   * @returns {string} Explanation text
   */
  generateExplanation(classification, confidence, analysis) {
    if (classification === "AI Generated") {
      const explanations = [
        "This media shows signs of synthetic generation such as inconsistent facial patterns.",
        "Analysis indicates artificial content generation with detectable digital artifacts.",
        "This content exhibits characteristics typical of AI-generated media with unusual patterns.",
        "The media displays synthetic features consistent with computer-generated imagery.",
        "Detection reveals artificial manipulation with noticeable inconsistencies in visual elements."
      ];
      
      // Add specific details based on confidence
      if (confidence > 80) {
        return explanations[Math.floor(Math.random() * explanations.length)] + " High confidence in this assessment.";
      } else if (confidence > 60) {
        return explanations[Math.floor(Math.random() * explanations.length)] + " Moderate confidence in this finding.";
      } else {
        return explanations[Math.floor(Math.random() * explanations.length)] + " Lower confidence, further verification recommended.";
      }
    } else {
      const explanations = [
        "This media appears to be authentic with no significant indicators of manipulation.",
        "Analysis suggests genuine content with natural patterns and consistent visual elements.",
        "This content shows characteristics typical of authentic media with minimal artifacts.",
        "The media displays natural features consistent with unaltered imagery.",
        "Detection indicates authentic content with no detectable signs of synthetic generation."
      ];
      
      // Add specific details based on confidence
      if (confidence > 80) {
        return explanations[Math.floor(Math.random() * explanations.length)] + " High confidence in authenticity.";
      } else if (confidence > 60) {
        return explanations[Math.floor(Math.random() * explanations.length)] + " Moderate confidence in this assessment.";
      } else {
        return explanations[Math.floor(Math.random() * explanations.length)] + " Lower confidence, additional verification may be beneficial.";
      }
    }
  }

  /**
   * Quick analysis for basic response with heuristics (matches user requirements)
   * @param {object} fileInfo - File information
   * @returns {object} Simple detection result
   */
  quickAnalyze(fileInfo) {
    const confidence = this.generateConfidenceScore(fileInfo.originalName || fileInfo.filename, fileInfo.fileSize);
    const classification = this.generateClassification(confidence, fileInfo.originalName || fileInfo.filename);
    const riskLevel = this.calculateRiskLevel(confidence);
    const detailedAnalysis = this.generateDetailedAnalysis(confidence, classification);
    const explanation = this.generateExplanation(classification, confidence, detailedAnalysis);
    const featuresChecked = this.generateFeaturesChecked(fileInfo.fileType);
    const processingTime = this.generateProcessingTime();

    return {
      prediction: classification,
      confidence: confidence,
      risk: riskLevel,
      explanation: explanation,
      analysis_time: `${processingTime} seconds`,
      model: this.modelInfo.name,
      features_checked: featuresChecked
    };
  }
}

module.exports = DetectionSimulator;
