#!/usr/bin/env python3
"""
GPU Deployment Setup for Production
Configures TensorFlow for GPU acceleration and optimization
"""

import os
import sys
import json
import subprocess
import tensorflow as tf
from datetime import datetime

class GPUDeploymentSetup:
    """Setup and optimize GPU deployment for production"""
    
    def __init__(self):
        self.gpu_available = False
        self.gpu_info = {}
        self.optimization_config = {}
        
    def check_gpu_availability(self):
        """Check GPU availability and configuration"""
        print("🔍 Checking GPU availability...")
        
        # Check TensorFlow GPU support
        gpu_devices = tf.config.list_physical_devices('GPU')
        
        if gpu_devices:
            self.gpu_available = True
            print(f"✅ GPU detected: {len(gpu_devices)} device(s)")
            
            for i, device in enumerate(gpu_devices):
                print(f"   GPU {i}: {device.name}")
                self.gpu_info[f"gpu_{i}"] = {
                    "name": device.name,
                    "device_type": device.device_type
                }
        else:
            print("❌ No GPU devices found")
            print("   TensorFlow will use CPU for inference")
            
            # Check if GPU is available but not detected
            try:
                import nvidia_smi
                print("💡 NVIDIA drivers installed but TensorFlow GPU not configured")
            except ImportError:
                print("💡 Consider installing GPU drivers for better performance")
        
        return self.gpu_available
    
    def setup_gpu_memory_growth(self):
        """Setup GPU memory growth to prevent memory allocation issues"""
        if not self.gpu_available:
            print("⚠️ No GPU available - skipping GPU memory setup")
            return False
        
        print("⚙️ Setting up GPU memory growth...")
        
        try:
            # Enable memory growth for all GPUs
            gpus = tf.config.list_physical_devices('GPU')
            if gpus:
                for gpu in gpus:
                    tf.config.experimental.set_memory_growth(gpu, True)
                    print(f"✅ Memory growth enabled for {gpu.name}")
            
            return True
            
        except Exception as e:
            print(f"❌ GPU memory setup failed: {e}")
            return False
    
    def optimize_tensorflow_settings(self):
        """Optimize TensorFlow settings for production"""
        print("⚡ Optimizing TensorFlow settings...")
        
        optimizations = {}
        
        # Enable mixed precision if GPU available
        if self.gpu_available:
            try:
                from tensorflow.keras.mixed_precision import experimental as mixed_precision
                policy = mixed_precision.Policy('mixed_float16')
                mixed_precision.set_global_policy(policy)
                optimizations["mixed_precision"] = "enabled"
                print("✅ Mixed precision enabled (float16)")
            except:
                optimizations["mixed_precision"] = "disabled"
                print("⚠️ Mixed precision not available")
        
        # Enable XLA compilation
        try:
            tf.config.optimizer.set_jit(True)
            optimizations["xla_compilation"] = "enabled"
            print("✅ XLA compilation enabled")
        except:
            optimizations["xla_compilation"] = "disabled"
            print("⚠️ XLA compilation not available")
        
        # Set thread configuration
        try:
            tf.config.threading.set_intra_op_parallelism_threads(4)
            tf.config.threading.set_inter_op_parallelism_threads(4)
            optimizations["threading"] = "optimized"
            print("✅ Threading optimized")
        except:
            optimizations["threading"] = "default"
        
        self.optimization_config = optimizations
        return True
    
    def create_production_model(self, model_path=None):
        """Create optimized production model"""
        print("🏭 Creating production-optimized model...")
        
        try:
            from deepfake_detector import DeepfakeDetector
            
            # Initialize detector
            detector = DeepfakeDetector(model_path)
            
            if not detector.model:
                print("❌ No model available for optimization")
                return None
            
            # Optimize model for inference
            production_model = self.optimize_model_for_inference(detector.model)
            
            # Save optimized model
            optimized_path = "models/production_optimized"
            os.makedirs(optimized_path, exist_ok=True)
            
            # Save in TensorFlow SavedModel format
            tf.saved_model.save(production_model, optimized_path)
            print(f"✅ Production model saved to: {optimized_path}")
            
            # Also save as H5 for compatibility
            h5_path = os.path.join(optimized_path, "model.h5")
            production_model.save(h5_path)
            
            return production_model
            
        except Exception as e:
            print(f"❌ Production model creation failed: {e}")
            return None
    
    def optimize_model_for_inference(self, model):
        """Optimize model for faster inference"""
        print("⚡ Optimizing model for inference...")
        
        try:
            # Convert to TensorFlow Lite for better performance
            converter = tf.lite.TFLiteConverter.from_keras_model(model)
            
            # Enable optimizations
            converter.optimizations = [tf.lite.Optimize.DEFAULT]
            
            # Specify target platform
            if self.gpu_available:
                converter.target_spec.supported_ops = [
                    tf.lite.OpsSet.TFLITE_BUILTINS,
                    tf.lite.OpsSet.SELECT_TF_OPS
                ]
            
            # Convert model
            tflite_model = converter.convert()
            
            # Save TFLite model
            tflite_path = "models/production_optimized/model.tflite"
            os.makedirs(os.path.dirname(tflite_path), exist_ok=True)
            
            with open(tflite_path, 'wb') as f:
                f.write(tflite_model)
            
            print(f"✅ TFLite model saved: {tflite_path}")
            
            # Also return the original model for comparison
            return model
            
        except Exception as e:
            print(f"⚠️ TFLite conversion failed: {e}")
            print("   Using original model for production")
            return model
    
    def benchmark_performance(self, model_path=None):
        """Benchmark model performance"""
        print("🏃‍♂️ Benchmarking model performance...")
        
        try:
            from deepfake_detector import DeepfakeDetector
            import numpy as np
            import time
            
            # Initialize detector
            detector = DeepfakeDetector(model_path)
            
            # Create dummy test data
            test_images = []
            for i in range(10):
                # Create random test image (299x299x3)
                test_img = np.random.randint(0, 255, (299, 299, 3), dtype=np.uint8)
                test_images.append(test_img)
            
            # Benchmark inference
            times = []
            
            print("   Running inference benchmarks...")
            for i, test_img in enumerate(test_images):
                start_time = time.time()
                
                # Simulate preprocessing
                processed_img = test_img.astype(np.float32) / 255.0
                processed_img = np.expand_dims(processed_img, axis=0)
                
                # Run inference
                prediction = detector.model.predict(processed_img, verbose=0)
                
                end_time = time.time()
                inference_time = end_time - start_time
                times.append(inference_time)
                
                print(f"   Image {i+1}: {inference_time:.3f}s")
            
            # Calculate statistics
            avg_time = np.mean(times)
            min_time = np.min(times)
            max_time = np.max(times)
            std_time = np.std(times)
            
            # Calculate throughput
            throughput = 1.0 / avg_time  # images per second
            
            benchmark_results = {
                "avg_inference_time": avg_time,
                "min_inference_time": min_time,
                "max_inference_time": max_time,
                "std_inference_time": std_time,
                "throughput_ips": throughput,
                "gpu_used": self.gpu_available,
                "test_images": len(test_images),
                "benchmark_date": datetime.now().isoformat()
            }
            
            print(f"\n📊 Benchmark Results:")
            print(f"   Average Time: {avg_time:.3f}s")
            print(f"   Min Time: {min_time:.3f}s")
            print(f"   Max Time: {max_time:.3f}s")
            print(f"   Throughput: {throughput:.1f} images/second")
            print(f"   GPU Used: {self.gpu_available}")
            
            # Save benchmark results
            with open("models/benchmark_results.json", "w") as f:
                json.dump(benchmark_results, f, indent=2)
            
            return benchmark_results
            
        except Exception as e:
            print(f"❌ Benchmark failed: {e}")
            return None
    
    def create_deployment_config(self):
        """Create deployment configuration"""
        print("⚙️ Creating deployment configuration...")
        
        config = {
            "deployment_date": datetime.now().isoformat(),
            "gpu_config": {
                "available": self.gpu_available,
                "devices": self.gpu_info,
                "memory_growth": True
            },
            "optimizations": self.optimization_config,
            "model_config": {
                "input_size": "299x299x3",
                "batch_size": 1,  # For real-time inference
                "precision": "mixed_float16" if self.gpu_available else "float32"
            },
            "performance_targets": {
                "max_inference_time": 0.5,  # seconds
                "min_throughput": 2.0,  # images per second
                "max_memory_usage": "2GB"
            },
            "scaling_config": {
                "auto_scaling": True,
                "min_instances": 1,
                "max_instances": 10,
                "target_cpu_utilization": 70,
                "target_memory_utilization": 80
            },
            "monitoring": {
                "enable_metrics": True,
                "log_level": "INFO",
                "performance_tracking": True
            }
        }
        
        # Save configuration
        with open("models/deployment_config.json", "w") as f:
            json.dump(config, f, indent=2)
        
        print(f"✅ Deployment configuration saved")
        return config
    
    def setup_docker_deployment(self):
        """Create Docker configuration for GPU deployment"""
        print("🐳 Setting up Docker deployment...")
        
        dockerfile_content = """# GPU-optimized Dockerfile for Deepfake Detection
FROM nvidia/cuda:11.8-runtime-ubuntu22.04

# Install Python and system dependencies
RUN apt-get update && apt-get install -y \\
    python3.9 \\
    python3-pip \\
    python3-dev \\
    libopencv-dev \\
    libhdf5-dev \\
    libblas-dev \\
    liblapack-dev \\
    g++ \\
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python packages
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Set environment variables
ENV PYTHONPATH=/app
ENV TF_FORCE_GPU_ALLOW_GROWTH=true
ENV CUDA_VISIBLE_DEVICES=0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \\
  CMD curl -f http://localhost:5000/api/health || exit 1

# Run the application
CMD ["python3", "server.py"]
"""
        
        docker_compose_content = """version: '3.8'

services:
  deepfake-api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - TF_FORCE_GPU_ALLOW_GROWTH=true
      - CUDA_VISIBLE_DEVICES=0
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    volumes:
      - ./models:/app/models
      - ./uploads:/app/uploads
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - deepfake-api
    restart: unless-stopped
"""
        
        # Save Docker files
        with open("Dockerfile", "w") as f:
            f.write(dockerfile_content)
        
        with open("docker-compose.yml", "w") as f:
            f.write(docker_compose_content)
        
        print("✅ Docker configuration created")
        print("   Files: Dockerfile, docker-compose.yml")
    
    def run_complete_setup(self, model_path=None):
        """Run complete GPU deployment setup"""
        print("🚀 Starting Complete GPU Deployment Setup")
        print("=" * 50)
        
        # Check GPU availability
        self.check_gpu_availability()
        
        # Setup GPU memory
        self.setup_gpu_memory_growth()
        
        # Optimize TensorFlow
        self.optimize_tensorflow_settings()
        
        # Create production model
        self.create_production_model(model_path)
        
        # Benchmark performance
        self.benchmark_performance(model_path)
        
        # Create deployment config
        self.create_deployment_config()
        
        # Setup Docker deployment
        self.setup_docker_deployment()
        
        print("\n🎉 GPU deployment setup completed!")
        print("📁 Generated files:")
        print("   - models/production_optimized/")
        print("   - models/deployment_config.json")
        print("   - models/benchmark_results.json")
        print("   - Dockerfile")
        print("   - docker-compose.yml")
        
        if self.gpu_available:
            print("🚀 Ready for GPU-accelerated deployment!")
        else:
            print("⚠️ GPU not available - CPU deployment configured")
        
        return True

def main():
    """Main setup function"""
    print("🚀 GPU Deployment Setup for Production")
    print("=" * 40)
    
    setup = GPUDeploymentSetup()
    setup.run_complete_setup()

if __name__ == "__main__":
    main()
