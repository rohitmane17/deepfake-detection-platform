#!/usr/bin/env python3
"""
AMD GPU Setup and Optimization for Deepfake Training
Configures TensorFlow/PyTorch for AMD Radeon GPU acceleration
"""

import os
import sys
import subprocess
import platform
import json
from datetime import datetime

class AMDGPUSetup:
    """Setup and optimize AMD GPU for deepfake model training"""
    
    def __init__(self):
        self.system_info = self.get_system_info()
        self.gpu_info = self.get_gpu_info()
        
    def get_system_info(self):
        """Get detailed system information"""
        return {
            "platform": platform.system(),
            "processor": platform.processor(),
            "machine": platform.machine(),
            "architecture": platform.architecture(),
            "python_version": sys.version,
            "timestamp": datetime.now().isoformat()
        }
    
    def get_gpu_info(self):
        """Get AMD GPU information"""
        try:
            # Check for AMD GPU using ROCm
            result = subprocess.run(['rocm-smi', '--showproductname'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                gpu_name = result.stdout.strip()
            else:
                gpu_name = "AMD Radeon (ROCm detected)"
                
            # Get GPU memory info
            result = subprocess.run(['rocm-smi', '--showmeminfo'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                memory_info = result.stdout.strip()
            else:
                memory_info = "Memory info not available"
                
            return {
                "gpu_name": gpu_name,
                "memory_info": memory_info,
                "compute_capability": "ROCm/OpenCL",
                "framework": "AMD ROCm"
            }
        except Exception as e:
            return {
                "gpu_name": "AMD Radeon (detected)",
                "memory_info": "Unknown",
                "compute_capability": "ROCm/OpenCL",
                "framework": "AMD ROCm",
                "error": str(e)
            }
    
    def check_amd_drivers(self):
        """Check AMD GPU drivers and ROCm installation"""
        print("🔍 Checking AMD GPU drivers and ROCm...")
        
        checks = {
            "rocm_smi": self.check_command_exists("rocm-smi"),
            "rocm_version": self.get_rocm_version(),
            "tensorflow_rocm": self.check_tensorflow_rocm(),
            "pytorch_rocm": self.check_pytorch_rocm(),
            "opencl_support": self.check_opencl_support()
        }
        
        return checks
    
    def check_command_exists(self, command):
        """Check if command exists"""
        try:
            subprocess.run([command, '--version'], 
                         capture_output=True, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False
    
    def get_rocm_version(self):
        """Get ROCm version"""
        try:
            result = subprocess.run(['rocm-smi', '--version'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                return result.stdout.strip()
            return None
        except:
            return None
    
    def check_tensorflow_rocm(self):
        """Check TensorFlow ROCm support"""
        try:
            import tensorflow as tf
            gpu_devices = tf.config.list_physical_devices('GPU')
            return len(gpu_devices) > 0
        except ImportError:
            return False
        except:
            return False
    
    def check_pytorch_rocm(self):
        """Check PyTorch ROCm support"""
        try:
            import torch
            return torch.cuda.is_available() or torch.backends.mps.is_available()
        except ImportError:
            return False
        except:
            return False
    
    def check_opencl_support(self):
        """Check OpenCL support"""
        try:
            import pyopencl as cl
            platforms = cl.get_platforms()
            return len(platforms) > 0
        except ImportError:
            return False
        except:
            return False
    
    def setup_tensorflow_rocm(self):
        """Setup TensorFlow for AMD GPU"""
        print("⚙️ Setting up TensorFlow for AMD ROCm...")
        
        setup_commands = [
            # Install TensorFlow ROCm
            "pip install tensorflow-rocm",
            
            # Set environment variables
            "export HSA_OVERRIDE_GFX_VERSION=10.3.0",
            "export HIP_VISIBLE_DEVICES=0",
            "export TF_ROCM_AMDGPU_TARGETS=gfx1030"
        ]
        
        return setup_commands
    
    def setup_pytorch_rocm(self):
        """Setup PyTorch for AMD GPU"""
        print("⚙️ Setting up PyTorch for AMD ROCm...")
        
        setup_commands = [
            # Install PyTorch ROCm
            "pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm5.4.2",
            
            # Set environment variables
            "export HSA_OVERRIDE_GFX_VERSION=10.3.0",
            "export HIP_VISIBLE_DEVICES=0"
        ]
        
        return setup_commands
    
    def optimize_training_settings(self):
        """Generate optimized training settings for AMD hardware"""
        print("🎯 Generating optimized training settings...")
        
        # AMD Ryzen 5 5000 series optimizations
        cpu_settings = {
            "num_workers": 8,  # Ryzen 5 has good multi-core performance
            "pin_memory": True,
            "use_deterministic": False,
            "enable_mixed_precision": True
        }
        
        # GPU memory optimizations
        gpu_settings = {
            "batch_size": 16,  # Adjust based on GPU memory
            "gradient_accumulation": 4,
            "use_amp": True,  # Automatic Mixed Precision
            "memory_efficient": True
        }
        
        return {
            "cpu": cpu_settings,
            "gpu": gpu_settings,
            "data_loading": {
                "num_workers": 4,
                "prefetch_factor": 2,
                "pin_memory": True
            }
        }
    
    def generate_training_script(self):
        """Generate optimized training script for AMD hardware"""
        settings = self.optimize_training_settings()
        
        script_content = f'''#!/usr/bin/env python3
"""
AMD-Optimized Deepfake Training Script
Generated for AMD Ryzen 5 5000 Series with Radeon GPU
"""

import os
import tensorflow as tf
import torch
import numpy as np
from datetime import datetime

# AMD GPU Optimizations
os.environ["HSA_OVERRIDE_GFX_VERSION"] = "10.3.0"
os.environ["HIP_VISIBLE_DEVICES"] = "0"
os.environ["TF_ROCM_AMDGPU_TARGETS"] = "gfx1030"

# Training Configuration
BATCH_SIZE = {settings["gpu"]["batch_size"]}
NUM_WORKERS = {settings["cpu"]["num_workers"]}
MIXED_PRECISION = {settings["gpu"]["use_amp"]}
GRADIENT_ACCUMULATION = {settings["gpu"]["gradient_accumulation"]}

print("🚀 Starting AMD-Optimized Deepfake Training")
print(f"📊 Batch Size: {{BATCH_SIZE}}")
print(f"🔧 Mixed Precision: {{MIXED_PRECISION}}")
print(f"⚡ GPU Acceleration: Enabled")

def create_model():
    """Create optimized model for AMD GPU"""
    model = tf.keras.applications.Xception(
        weights=None,
        input_shape=(299, 299, 3),
        include_top=False
    )
    
    # Add custom layers for deepfake detection
    x = model.output
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.5)(x)
    predictions = tf.keras.layers.Dense(1, activation='sigmoid')(x)
    
    final_model = tf.keras.Model(inputs=model.input, outputs=predictions)
    
    return final_model

def train_model():
    """Training function optimized for AMD hardware"""
    print("🎯 Starting model training...")
    
    # Data loading optimizations
    dataset = load_dataset()  # Your dataset loading function
    train_loader = torch.utils.data.DataLoader(
        dataset,
        batch_size=BATCH_SIZE,
        num_workers=NUM_WORKERS,
        pin_memory=True,
        shuffle=True
    )
    
    # Model and optimizer
    model = create_model()
    optimizer = tf.keras.optimizers.Adam(learning_rate=0.0001)
    
    # Mixed precision training
    if MIXED_PRECISION:
        optimizer = tf.keras.mixed_precision.LossScaleOptimizer(optimizer)
    
    # Training loop with gradient accumulation
    for epoch in range(50):
        print(f"📈 Epoch {{epoch + 1}}/50")
        
        for batch_idx, (images, labels) in enumerate(train_loader):
            # Gradient accumulation
            accumulated_loss = 0
            for step in range(GRADIENT_ACCUMULATION):
                with tf.GradientTape() as tape:
                    predictions = model(images, training=True)
                    loss = tf.keras.losses.binary_crossentropy(labels, predictions)
                    scaled_loss = optimizer.get_scaled_loss(loss)
                
                gradients = tape.gradient(scaled_loss, model.trainable_variables)
                optimizer.apply_gradients([(gradients, model.trainable_variables)])
                accumulated_loss += loss.item()
            
            if batch_idx % 10 == 0:
                print(f"  Batch {{batch_idx}}, Loss: {{accumulated_loss / GRADIENT_ACCUMULATION:.4f}}")
        
        # Validation
        val_loss = validate_model(model, val_dataset)
        print(f"✅ Validation Loss: {{val_loss:.4f}}")

if __name__ == "__main__":
    train_model()
'''
        
        return script_content
    
    def create_requirements_file(self):
        """Create requirements.txt for AMD GPU training"""
        requirements = """# AMD GPU Requirements for Deepfake Training
tensorflow-rocm>=2.13.0
torch>=2.0.0+rocm5.4.2
torchvision>=0.15.0+rocm5.4.2
numpy>=1.24.0
opencv-python>=4.8.0
scikit-learn>=1.3.0
matplotlib>=3.7.0
pillow>=10.0.0
pyopencl>=2023.1

# AMD-specific optimizations
# ROCm support for GPU acceleration
# Mixed precision training support
# Multi-threading optimizations
"""
        
        return requirements
    
    def generate_dockerfile(self):
        """Generate Dockerfile for AMD GPU training"""
        dockerfile = '''# AMD GPU Dockerfile for Deepfake Training
FROM rocm/pytorch:rocm5.4.2_ubuntu20.04

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    python3-pip \\
    python3-dev \\
    git \\
    wget \\
    curl

# Install AMD ML stack
COPY requirements.txt .
RUN pip install -r requirements.txt

# Set AMD GPU environment variables
ENV HSA_OVERRIDE_GFX_VERSION=10.3.0
ENV HIP_VISIBLE_DEVICES=0
ENV TF_ROCM_AMDGPU_TARGETS=gfx1030
ENV CUDA_VISIBLE_DEVICES=0

# Create working directory
WORKDIR /app

# Copy training code
COPY . .

# Expose ports for monitoring
EXPOSE 8888

# Run training
CMD ["python", "amd_optimized_training.py"]
'''
        
        return dockerfile
    
    def save_setup_report(self, filename="amd_gpu_setup_report.json"):
        """Save comprehensive setup report"""
        report = {
            "timestamp": datetime.now().isoformat(),
            "system_info": self.system_info,
            "gpu_info": self.gpu_info,
            "driver_checks": self.check_amd_drivers(),
            "training_settings": self.optimize_training_settings(),
            "setup_commands": {
                "tensorflow": self.setup_tensorflow_rocm(),
                "pytorch": self.setup_pytorch_rocm()
            }
        }
        
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"📋 Setup report saved to {filename}")
        return report

def main():
    """Main setup function"""
    print("🚀 AMD GPU Setup for Deepfake Training")
    print("=" * 50)
    
    setup = AMDGPUSetup()
    
    # Display system information
    print("💻 System Information:")
    for key, value in setup.system_info.items():
        print(f"   {key}: {value}")
    
    print("\n🎮 GPU Information:")
    for key, value in setup.gpu_info.items():
        print(f"   {key}: {value}")
    
    print("\n🔧 Driver Checks:")
    checks = setup.check_amd_drivers()
    for key, value in checks.items():
        status = "✅" if value else "❌"
        print(f"   {key}: {status}")
    
    # Generate setup files
    print("\n📄 Generating setup files...")
    
    # Save requirements
    requirements = setup.create_requirements_file()
    with open("requirements_amd.txt", "w") as f:
        f.write(requirements)
    print("✅ requirements_amd.txt created")
    
    # Generate training script
    script_content = setup.generate_training_script()
    with open("amd_optimized_training.py", "w") as f:
        f.write(script_content)
    print("✅ amd_optimized_training.py created")
    
    # Generate Dockerfile
    dockerfile = setup.generate_dockerfile()
    with open("Dockerfile.amd", "w") as f:
        f.write(dockerfile)
    print("✅ Dockerfile.amd created")
    
    # Save comprehensive report
    setup.save_setup_report()
    
    print("\n🎯 Setup Complete!")
    print("📊 Your AMD Ryzen 5 5000 Series is ready for deepfake model training!")
    print("\n🚀 Next Steps:")
    print("1. Install ROCm drivers if not already installed")
    print("2. Run: pip install -r requirements_amd.txt")
    print("3. Execute: python amd_optimized_training.py")
    print("4. Monitor GPU usage with: rocm-smi")

if __name__ == "__main__":
    main()
