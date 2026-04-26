#!/usr/bin/env python3
"""
Test script for CNN Deepfake Detector
Tests the model functionality and provides demonstration
"""

import os
import sys
import json
import numpy as np
from PIL import Image
import cv2

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from deepfake_detector import DeepfakeDetector
    print("✅ Successfully imported DeepfakeDetector")
except ImportError as e:
    print(f"❌ Failed to import DeepfakeDetector: {e}")
    print("Please run setup_ml_environment.py first")
    sys.exit(1)

def create_test_image():
    """Create a simple test image for testing"""
    try:
        # Create a simple test image (300x300 RGB)
        img_array = np.random.randint(0, 255, (300, 300, 3), dtype=np.uint8)
        
        # Add some "face-like" features (simple rectangles)
        cv2.rectangle(img_array, (100, 100), (200, 150), (255, 200, 150), -1)  # Face
        cv2.rectangle(img_array, (120, 110), (140, 130), (0, 0, 0), -1)      # Left eye
        cv2.rectangle(img_array, (160, 110), (180, 130), (0, 0, 0), -1)      # Right eye
        cv2.rectangle(img_array, (140, 140), (160, 150), (255, 100, 100), -1)  # Mouth
        
        # Save the test image
        test_image_path = "test_image.jpg"
        cv2.imwrite(test_image_path, img_array)
        
        print(f"✅ Created test image: {test_image_path}")
        return test_image_path
        
    except Exception as e:
        print(f"❌ Failed to create test image: {e}")
        return None

def test_model_initialization():
    """Test CNN model initialization"""
    print("\n🧪 Testing CNN Model Initialization...")
    
    try:
        detector = DeepfakeDetector()
        
        if detector.model is not None:
            print("✅ CNN model initialized successfully")
            print(f"   Input size: {detector.input_size}")
            print(f"   Confidence threshold: {detector.confidence_threshold}")
            
            # Test model summary
            try:
                detector.model.summary()
                print("✅ Model summary displayed successfully")
            except:
                print("⚠️ Could not display model summary (normal in some environments)")
            
            return detector
        else:
            print("❌ CNN model initialization failed")
            return None
            
    except Exception as e:
        print(f"❌ Model initialization error: {e}")
        return None

def test_image_preprocessing(detector, image_path):
    """Test image preprocessing"""
    print("\n🧪 Testing Image Preprocessing...")
    
    try:
        processed_img = detector.preprocess_image(image_path)
        
        if processed_img is not None:
            print("✅ Image preprocessing successful")
            print(f"   Processed image shape: {processed_img.shape}")
            print(f"   Data type: {processed_img.dtype}")
            print(f"   Value range: [{np.min(processed_img):.3f}, {np.max(processed_img):.3f}]")
            return True
        else:
            print("❌ Image preprocessing failed")
            return False
            
    except Exception as e:
        print(f"❌ Preprocessing error: {e}")
        return False

def test_prediction(detector, image_path):
    """Test model prediction"""
    print("\n🧪 Testing Model Prediction...")
    
    try:
        result = detector.analyze_image(image_path)
        
        if result and result.get("prediction") != "Error":
            print("✅ Model prediction successful")
            print(f"   Prediction: {result.get('prediction')}")
            print(f"   Confidence: {result.get('confidence')}%")
            print(f"   Risk Level: {result.get('risk_level')}")
            print(f"   Model Used: {result.get('model_used')}")
            print(f"   Explanation: {result.get('explanation')}")
            
            # Test facial analysis
            facial_analysis = result.get('facial_analysis', {})
            if facial_analysis:
                print(f"   Face Count: {facial_analysis.get('face_count')}")
                print(f"   Faces Detected: {facial_analysis.get('faces_detected')}")
            
            return True
        else:
            print("❌ Model prediction failed")
            error = result.get('error', 'Unknown error')
            print(f"   Error: {error}")
            return False
            
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return False

def test_model_capabilities(detector):
    """Test various model capabilities"""
    print("\n🧪 Testing Model Capabilities...")
    
    try:
        # Test model properties
        print(f"✅ Model input shape: {detector.input_size}")
        print(f"✅ Confidence threshold: {detector.confidence_threshold}")
        
        # Test risk level calculation
        risk_levels = [
            detector._calculate_risk_level(0.1),
            detector._calculate_risk_level(0.5),
            detector._calculate_risk_level(0.9)
        ]
        print(f"✅ Risk level calculation: {risk_levels}")
        
        # Test explanation generation
        explanations = [
            detector._generate_explanation(0.1, False),
            detector._generate_explanation(0.8, True)
        ]
        print(f"✅ Explanation generation working")
        
        return True
        
    except Exception as e:
        print(f"❌ Capability test error: {e}")
        return False

def cleanup_test_files():
    """Clean up test files"""
    test_files = ["test_image.jpg"]
    
    for file in test_files:
        if os.path.exists(file):
            try:
                os.remove(file)
                print(f"🧹 Cleaned up: {file}")
            except:
                print(f"⚠️ Could not clean up: {file}")

def generate_test_report(results):
    """Generate a test report"""
    report = {
        "test_date": "2026-04-26",
        "python_version": sys.version,
        "test_results": results,
        "model_status": "Ready for training",
        "next_steps": [
            "Train model on real deepfake dataset",
            "Download pre-trained weights",
            "Test with real images",
            "Deploy to production"
        ]
    }
    
    with open("cnn_test_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"📊 Test report saved to: cnn_test_report.json")

def main():
    """Main test function"""
    print("🚀 CNN Deepfake Detector Test Suite")
    print("=" * 50)
    
    results = {}
    
    # Test 1: Model Initialization
    detector = test_model_initialization()
    results["model_initialization"] = detector is not None
    
    if not detector:
        print("\n❌ Cannot continue tests - model initialization failed")
        return False
    
    # Test 2: Create test image
    test_image_path = create_test_image()
    results["test_image_creation"] = test_image_path is not None
    
    if not test_image_path:
        print("\n❌ Cannot continue tests - test image creation failed")
        return False
    
    # Test 3: Image Preprocessing
    preprocessing_ok = test_image_preprocessing(detector, test_image_path)
    results["image_preprocessing"] = preprocessing_ok
    
    # Test 4: Model Prediction
    prediction_ok = test_prediction(detector, test_image_path)
    results["model_prediction"] = prediction_ok
    
    # Test 5: Model Capabilities
    capabilities_ok = test_model_capabilities(detector)
    results["model_capabilities"] = capabilities_ok
    
    # Clean up
    cleanup_test_files()
    
    # Generate report
    generate_test_report(results)
    
    # Summary
    print("\n📊 Test Summary:")
    print("=" * 30)
    
    total_tests = len(results)
    passed_tests = sum(results.values())
    
    for test_name, result in results.items():
        status = "✅" if result else "❌"
        print(f"{status} {test_name.replace('_', ' ').title()}")
    
    print(f"\nOverall: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 All tests passed! CNN model is ready for training.")
        return True
    else:
        print("⚠️ Some tests failed. Please check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
