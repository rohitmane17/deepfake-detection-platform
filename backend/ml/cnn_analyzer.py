#!/usr/bin/env python3
"""
CNN-based Deepfake Analyzer
Uses XceptionNet model for real deepfake detection
"""

import sys
import json
import os
import traceback
from deepfake_detector import DeepfakeDetector

def main():
    """Main function to analyze image using CNN"""
    if len(sys.argv) != 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: python cnn_analyzer.py <image_path>"
        }))
        return
    
    image_path = sys.argv[1]
    
    try:
        # Check if image exists
        if not os.path.exists(image_path):
            print(json.dumps({
                "success": False,
                "error": "Image file not found"
            }))
            return
        
        # Initialize CNN detector
        detector = DeepfakeDetector()
        
        # Analyze image
        result = detector.analyze_image(image_path)
        
        # Add success flag
        result["success"] = True
        
        # Output result as JSON
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        error_info = {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        print(json.dumps(error_info, indent=2))

if __name__ == "__main__":
    main()
