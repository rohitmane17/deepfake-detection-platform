#!/usr/bin/env python3
"""
Setup script for ML environment
Installs required packages and tests the CNN model
"""

import subprocess
import sys
import os
import json

def install_package(package):
    """Install a Python package using pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ Successfully installed {package}")
        return True
    except subprocess.CalledProcessError:
        print(f"❌ Failed to install {package}")
        return False

def test_tensorflow():
    """Test if TensorFlow is properly installed"""
    try:
        import tensorflow as tf
        print(f"✅ TensorFlow {tf.__version__} installed successfully")
        
        # Test basic TensorFlow operation
        hello = tf.constant('Hello, TensorFlow!')
        tf.print(hello)
        
        return True
    except ImportError:
        print("❌ TensorFlow not installed or import failed")
        return False
    except Exception as e:
        print(f"❌ TensorFlow test failed: {e}")
        return False

def test_opencv():
    """Test if OpenCV is properly installed"""
    try:
        import cv2
        print(f"✅ OpenCV {cv2.__version__} installed successfully")
        return True
    except ImportError:
        print("❌ OpenCV not installed or import failed")
        return False
    except Exception as e:
        print(f"❌ OpenCV test failed: {e}")
        return False

def test_cnn_model():
    """Test the CNN deepfake detector"""
    try:
        from deepfake_detector import DeepfakeDetector
        
        # Initialize detector
        detector = DeepfakeDetector()
        print("✅ CNN Deepfake Detector initialized successfully")
        
        # Test model creation
        if detector.model is not None:
            print("✅ CNN model created successfully")
            print(f"   Model input shape: {detector.input_size}")
            print(f"   Confidence threshold: {detector.confidence_threshold}")
            return True
        else:
            print("❌ CNN model creation failed")
            return False
            
    except ImportError as e:
        print(f"❌ Failed to import CNN detector: {e}")
        return False
    except Exception as e:
        print(f"❌ CNN detector test failed: {e}")
        return False

def create_requirements_file():
    """Create requirements.txt file for ML dependencies"""
    requirements = [
        "tensorflow==2.13.0",
        "keras==2.13.1",
        "opencv-python==4.8.1.78",
        "numpy==1.24.3",
        "Pillow==10.0.1",
        "scipy==1.11.3",
        "scikit-image==0.21.0",
        "matplotlib==3.7.2",
        "scikit-learn==1.3.0"
    ]
    
    with open('ml_requirements.txt', 'w') as f:
        f.write('\n'.join(requirements))
    
    print("✅ Created ml_requirements.txt file")

def main():
    """Main setup function"""
    print("🚀 Setting up ML Environment for Deepfake Detection")
    print("=" * 50)
    
    # Check Python version
    python_version = sys.version
    print(f"📋 Python version: {python_version}")
    
    if sys.version_info < (3, 7):
        print("❌ Python 3.7+ is required for TensorFlow")
        return False
    
    # Create requirements file
    create_requirements_file()
    
    # Install required packages
    print("\n📦 Installing required packages...")
    packages = [
        "tensorflow==2.13.0",
        "keras==2.13.1",
        "opencv-python==4.8.1.78",
        "numpy==1.24.3",
        "Pillow==10.0.1",
        "scipy==1.11.3",
        "scikit-image==0.21.0",
        "matplotlib==3.7.2",
        "scikit-learn==1.3.0"
    ]
    
    failed_packages = []
    for package in packages:
        if not install_package(package):
            failed_packages.append(package)
    
    if failed_packages:
        print(f"\n❌ Failed to install packages: {failed_packages}")
        print("Please install them manually using: pip install -r ml_requirements.txt")
    
    # Test installations
    print("\n🧪 Testing installations...")
    
    tensorflow_ok = test_tensorflow()
    opencv_ok = test_opencv()
    cnn_model_ok = test_cnn_model()
    
    # Summary
    print("\n📊 Setup Summary:")
    print("=" * 30)
    print(f"TensorFlow: {'✅' if tensorflow_ok else '❌'}")
    print(f"OpenCV: {'✅' if opencv_ok else '❌'}")
    print(f"CNN Model: {'✅' if cnn_model_ok else '❌'}")
    
    if tensorflow_ok and opencv_ok and cnn_model_ok:
        print("\n🎉 ML Environment setup completed successfully!")
        print("\n📝 Next steps:")
        print("1. Train the model on real deepfake dataset")
        print("2. Download pre-trained weights")
        print("3. Test with sample images")
        print("4. Deploy to production")
        
        # Create status file
        status = {
            "setup_complete": True,
            "tensorflow_installed": True,
            "opencv_installed": True,
            "cnn_model_ready": True,
            "setup_date": "2026-04-26",
            "python_version": python_version,
            "next_steps": [
                "Train model on FaceForensics++ dataset",
                "Download pre-trained weights",
                "Test with sample images",
                "Deploy to production"
            ]
        }
        
        with open('ml_setup_status.json', 'w') as f:
            json.dump(status, f, indent=2)
        
        return True
    else:
        print("\n❌ ML Environment setup incomplete")
        print("Please check the error messages above and fix the issues")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
