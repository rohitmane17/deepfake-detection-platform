"""
Flask Microservice for Mock AI Processing
Provides deepfake detection simulation via HTTP API
"""

import os
import random
import time
import json
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

class DeepfakeDetector:
    """Mock AI Deepfake Detection System"""
    
    def __init__(self):
        self.model_name = "Simulated CNN-based Deepfake Detector"
        self.model_version = "v2.1.0"
        self.confidence_range = (50, 99)
        
        # Detection features
        self.available_features = [
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
        ]
        
        # AI keywords for heuristic analysis
        self.ai_keywords = [
            'deepfake', 'ai', 'synthetic', 'generated', 'artificial', 
            'fake', 'simulation', 'render', 'cg', 'computer', 'digital',
            'virtual', 'animated', 'manipulated', 'altered', 'enhanced'
        ]
    
    def analyze_filename(self, filename):
        """Analyze filename for AI-related keywords"""
        if not filename:
            return 0.0
        
        filename_lower = filename.lower()
        keyword_matches = sum(1 for keyword in self.ai_keywords if keyword in filename_lower)
        return min(keyword_matches * 0.1, 0.3)  # Max 30% adjustment
    
    def analyze_file_size(self, file_size):
        """Analyze file size for confidence adjustment"""
        if not file_size:
            return 0.0
        
        # Very small or very large files might be suspicious
        if file_size < 50 * 1024:  # < 50KB
            return 0.15
        elif file_size > 50 * 1024 * 1024:  # > 50MB
            return 0.1
        return 0.0
    
    def generate_confidence(self, filename, file_size):
        """Generate confidence score with heuristics"""
        base_confidence = random.uniform(*self.confidence_range)
        
        # Apply heuristics
        filename_adjustment = self.analyze_filename(filename)
        size_adjustment = self.analyze_file_size(file_size)
        
        # Adjust confidence
        adjusted_confidence = base_confidence + filename_adjustment + size_adjustment
        return max(self.confidence_range[0], min(self.confidence_range[1], adjusted_confidence))
    
    def generate_features_checked(self, file_type):
        """Generate list of features checked during analysis"""
        num_features = random.randint(3, 5)
        shuffled = self.available_features.copy()
        random.shuffle(shuffled)
        
        # Filter features based on file type
        if file_type and file_type.startswith('image/'):
            # Exclude audio-related features for images
            filtered = [f for f in shuffled if 'audio' not in f.lower() and 'sync' not in f.lower()]
        elif file_type and file_type.startswith('video/'):
            # Include video-specific features
            filtered = [f for f in shuffled if any(keyword in f.lower() 
                       for keyword in ['frame', 'sync', 'blink']) or 'compression' not in f.lower()]
        else:
            filtered = shuffled
        
        return filtered[:num_features]
    
    def predict(self, file_info):
        """Main prediction function"""
        start_time = time.time()
        
        # Simulate AI processing delay (1-2 seconds)
        processing_time = random.uniform(1.0, 2.0)
        time.sleep(processing_time)
        
        # Generate prediction results
        confidence = self.generate_confidence(file_info.get('filename'), file_info.get('file_size'))
        is_ai_generated = confidence > 70  # Threshold for AI detection
        prediction = "AI Generated" if is_ai_generated else "Real"
        
        # Calculate risk level
        if confidence > 85:
            risk_level = "High"
        elif confidence > 65:
            risk_level = "Medium"
        else:
            risk_level = "Low"
        
        # Generate features checked
        features_checked = self.generate_features_checked(file_info.get('file_type'))
        
        # Generate explanation
        if is_ai_generated:
            explanations = [
                "This media shows signs of synthetic generation such as inconsistent facial patterns.",
                "Analysis reveals artificial characteristics typical of AI-generated content.",
                "Multiple indicators suggest this content was created using deep learning models.",
                "Detected anomalies consistent with computer-generated imagery."
            ]
        else:
            explanations = [
                "This media appears to be authentic with natural characteristics.",
                "Analysis shows consistent patterns typical of genuine content.",
                "No significant indicators of synthetic manipulation detected.",
                "Features suggest this is original, unaltered media."
            ]
        
        explanation = random.choice(explanations)
        
        # Calculate actual processing time
        actual_processing_time = round(time.time() - start_time, 2)
        
        return {
            "prediction": prediction,
            "confidence": round(confidence, 1),
            "risk_level": risk_level,
            "explanation": explanation,
            "analysis_time": f"{actual_processing_time:.1f} seconds",
            "model": self.model_name,
            "features_checked": features_checked,
            "metadata": {
                "model_version": self.model_version,
                "timestamp": datetime.now().isoformat(),
                "processing_time_ms": int(actual_processing_time * 1000)
            }
        }

# Initialize detector
detector = DeepfakeDetector()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "AI Deepfake Detection Service",
        "model": detector.model_name,
        "version": detector.model_version,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Main prediction endpoint"""
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided",
                "message": "Request body is required"
            }), 400
        
        # Validate required fields
        required_fields = ['filename', 'file_size', 'file_type']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                "success": False,
                "error": "Missing required fields",
                "missing_fields": missing_fields
            }), 400
        
        # Extract file information
        file_info = {
            'filename': data.get('filename'),
            'file_size': data.get('file_size'),
            'file_type': data.get('file_type'),
            'original_name': data.get('original_name', data.get('filename'))
        }
        
        # Perform prediction
        result = detector.predict(file_info)
        
        return jsonify({
            "success": True,
            "message": "Prediction completed successfully",
            "data": result
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "message": str(e)
        }), 500

@app.route('/info', methods=['GET'])
def get_info():
    """Get model and service information"""
    return jsonify({
        "success": True,
        "data": {
            "service": "AI Deepfake Detection Service",
            "model": detector.model_name,
            "version": detector.model_version,
            "type": "Convolutional Neural Network",
            "supported_formats": ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/avi", "video/mov"],
            "features": detector.available_features,
            "confidence_range": f"{detector.confidence_range[0]}-{detector.confidence_range[1]}%",
            "endpoints": {
                "health": "GET /health - Service health check",
                "predict": "POST /predict - Deepfake detection prediction",
                "info": "GET /info - Service and model information"
            }
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    print(f"Starting AI Deepfake Detection Service on port {port}")
    print(f"Debug mode: {debug}")
    print(f"Model: {detector.model_name}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)