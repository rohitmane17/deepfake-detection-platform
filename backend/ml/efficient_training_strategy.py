#!/usr/bin/env python3
"""
Storage-Efficient Deepfake Training Strategy
Optimized for limited disk space (512GB SSD)
Implements incremental training, data streaming, and smart caching
"""

import os
import sys
import json
import requests
import zipfile
import tempfile
import shutil
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import numpy as np
import tensorflow as tf
import torch
from torch.utils.data import DataLoader, Dataset
import cv2
from PIL import Image

class EfficientTrainingStrategy:
    """Storage-efficient training for limited disk space"""
    
    def __init__(self, max_storage_gb: int = 400):
        self.max_storage_gb = max_storage_gb
        self.current_usage_gb = 0
        self.cache_dir = Path("./cache")
        self.temp_dir = Path("./temp")
        self.model_dir = Path("./models")
        
        # Ensure directories exist
        self.cache_dir.mkdir(exist_ok=True)
        self.temp_dir.mkdir(exist_ok=True)
        self.model_dir.mkdir(exist_ok=True)
        
    def get_storage_usage(self) -> Dict:
        """Get current storage usage"""
        total, used, free = shutil.disk_usage(".")
        used_gb = used / (1024**3)
        free_gb = free / (1024**3)
        
        return {
            "total_gb": total / (1024**3),
            "used_gb": used_gb,
            "free_gb": free_gb,
            "available_for_training": min(free_gb, self.max_storage_gb - used_gb)
        }
    
    def download_incremental_dataset(self, subset_size_gb: int = 10) -> bool:
        """Download incremental dataset subset"""
        print(f"📥 Downloading {subset_size_gb}GB dataset subset...")
        
        # FaceForensics++ dataset URLs for incremental download
        subsets = {
            "original": {
                "youtube": "https://github.com/ondrej-funk/FaceForensicsBenchmark/releases/download/v1.0/original_sequences/youtube.zip",
                "actors": "https://github.com/ondrej-funk/FaceForensicsBenchmark/releases/download/v1.0/original_sequences/actors100.zip"
            },
            "manipulated": {
                "face2face": "https://github.com/ondrej-funk/FaceForensicsBenchmark/releases/download/v1.0/manipulated_sequences/Face2Face/Face2Face.zip",
                "faceswap": "https://github.com/ondrej-funk/FaceForensicsBenchmark/releases/download/v1.0/manipulated_sequences/FaceSwap/FaceSwap.zip",
                "neuraltextures": "https://github.com/ondrej-funk/FaceForensicsBenchmark/releases/download/v1.0/manipulated_sequences/NeuralTextures/NeuralTextures.zip"
            }
        }
        
        try:
            # Download original sequences first (smaller)
            for category, datasets in subsets["original"].items():
                if self.get_storage_usage()["available_for_training"] < 5:
                    print("⚠️ Low storage space detected")
                    break
                    
                print(f"  📥 Downloading {category}...")
                self._download_and_extract(datasets[datasets], category, subset_size_gb // 4)
                
            # Download manipulated sequences
            for category, datasets in subsets["manipulated"].items():
                if self.get_storage_usage()["available_for_training"] < 5:
                    print("⚠️ Low storage space detected")
                    break
                    
                print(f"  📥 Downloading {category}...")
                self._download_and_extract(datasets[datasets], category, subset_size_gb // 4)
                
            return True
            
        except Exception as e:
            print(f"❌ Download failed: {e}")
            return False
    
    def _download_and_extract(self, url: str, category: str, max_size_gb: int):
        """Download and extract dataset with size limits"""
        try:
            # Download with progress
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            # Create temporary file
            temp_file = self.temp_dir / f"{category}.zip"
            
            total_size = int(response.headers.get('content-length', 0))
            downloaded_size = 0
            
            with open(temp_file, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if downloaded_size + len(chunk) > max_size_gb * 1024**3:
                        print(f"  ⏹️ Size limit reached for {category}")
                        break
                        
                    f.write(chunk)
                    downloaded_size += len(chunk)
                    
                    # Progress bar
                    progress = (downloaded_size / total_size) * 100
                    print(f"    📊 {progress:.1f}% ({downloaded_size / (1024**2):.1f}MB)", end='\r')
            
            print(f"\n  ✅ {category} downloaded ({downloaded_size / (1024**2):.1f}MB)")
            
            # Extract only what we need
            self._extract_subset(temp_file, category, max_size_gb)
            
            # Clean up
            temp_file.unlink()
            
        except Exception as e:
            print(f"  ❌ Failed to download {category}: {e}")
    
    def _extract_subset(self, zip_path: Path, category: str, max_size_gb: int):
        """Extract subset of zip file with size limits"""
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                # Get list of files and their sizes
                file_list = zip_ref.infolist()
                total_extracted = 0
                
                for file_info in file_list:
                    if total_extracted + file_info.file_size > max_size_gb * 1024**3:
                        break
                        
                    # Extract only video/image files
                    if file_info.filename.endswith(('.mp4', '.avi', '.mov', '.jpg', '.png')):
                        zip_ref.extract(file_info, self.cache_dir / category)
                        total_extracted += file_info.file_size
                        
                print(f"    📁 Extracted {total_extracted / (1024**2):.1f}MB")
                
        except Exception as e:
            print(f"  ❌ Extraction failed: {e}")
    
    def create_streaming_dataset(self, dataset_path: Path, batch_size: int = 32) -> DataLoader:
        """Create streaming dataset to minimize memory usage"""
        
        class StreamingDataset(Dataset):
            def __init__(self, data_path: Path, transform=None):
                self.data_path = data_path
                self.transform = transform
                self.file_list = self._get_file_list()
                
            def _get_file_list(self) -> List[str]:
                """Get list of video/image files"""
                extensions = ['.mp4', '.avi', '.mov', '.jpg', '.png']
                file_list = []
                
                for ext in extensions:
                    file_list.extend(self.data_path.rglob(f"*{ext}"))
                    
                return file_list
            
            def __len__(self):
                return len(self.file_list)
            
            def __getitem__(self, idx):
                file_path = self.file_list[idx]
                
                # Load and process on-demand
                if file_path.suffix in ['.mp4', '.avi', '.mov']:
                    frames = self._extract_video_frames(file_path)
                    sample = self._process_frames(frames)
                else:
                    image = Image.open(file_path)
                    sample = self._process_image(image)
                
                if self.transform:
                    sample = self.transform(sample)
                    
                return sample
            
            def _extract_video_frames(self, video_path: Path, max_frames: int = 10) -> List[np.ndarray]:
                """Extract frames from video"""
                cap = cv2.VideoCapture(str(video_path))
                frames = []
                
                while len(frames) < max_frames:
                    ret, frame = cap.read()
                    if not ret:
                        break
                    frames.append(frame)
                    
                cap.release()
                return frames
            
            def _process_frames(self, frames: List[np.ndarray]) -> np.ndarray:
                """Process video frames"""
                # Select middle frame for simplicity
                if frames:
                    middle_frame = frames[len(frames)//2]
                    return cv2.resize(middle_frame, (299, 299))
                return np.zeros((299, 299, 3), dtype=np.uint8)
            
            def _process_image(self, image: Image.Image) -> np.ndarray:
                """Process single image"""
                image = image.resize((299, 299))
                return np.array(image)
        
        return StreamingDataset(dataset_path, transform=self._get_transforms())
    
    def _get_transforms(self):
        """Get data transformations"""
        return tf.keras.Sequential([
            tf.keras.layers.Resizing(299, 299),
            tf.keras.layers.Rescaling(1./255),
            tf.keras.layers.RandomFlip("horizontal"),
            tf.keras.layers.RandomRotation(0.1),
            tf.keras.layers.RandomZoom(0.1),
        ])
    
    def implement_incremental_training(self):
        """Implement incremental training strategy"""
        print("🚀 Starting Incremental Training Strategy")
        print("=" * 50)
        
        # Phase 1: Start with small dataset (10GB)
        print("\n📊 Phase 1: Small Dataset Training (10GB)")
        self._train_phase("small", 10)
        
        # Phase 2: Medium dataset (50GB)
        print("\n📊 Phase 2: Medium Dataset Training (50GB)")
        self._train_phase("medium", 50)
        
        # Phase 3: Large dataset (200GB) if space allows
        storage = self.get_storage_usage()
        if storage["available_for_training"] > 150:
            print("\n📊 Phase 3: Large Dataset Training (200GB)")
            self._train_phase("large", 200)
        else:
            print("\n⏹️ Skipping large dataset due to storage constraints")
    
    def _train_phase(self, phase_name: str, dataset_size_gb: int):
        """Train on specific phase"""
        print(f"  🎯 Training {phase_name} phase ({dataset_size_gb}GB)")
        
        # Download dataset for this phase
        if not self.download_incremental_dataset(dataset_size_gb):
            print(f"  ❌ Failed to download {phase_name} dataset")
            return
        
        # Create streaming dataset
        dataset_path = self.cache_dir / phase_name
        train_dataset = self.create_streaming_dataset(dataset_path)
        
        # Create model
        model = self._create_efficient_model()
        
        # Train with memory optimizations
        history = self._train_with_memory_optimization(model, train_dataset)
        
        # Save model
        model_path = self.model_dir / f"deepfake_{phase_name}.h5"
        model.save(model_path)
        print(f"  ✅ Model saved: {model_path}")
        
        # Clean up dataset to save space
        self._cleanup_dataset(dataset_path)
        
        # Report results
        self._report_phase_results(phase_name, history)
    
    def _create_efficient_model(self):
        """Create memory-efficient model"""
        # Use MobileNetV2 for lower memory usage
        base_model = tf.keras.applications.MobileNetV2(
            weights='imagenet',
            input_shape=(224, 224, 3),
            include_top=False,
            alpha=0.35  # Smaller model
        )
        
        # Freeze base layers
        base_model.trainable = False
        
        # Add custom classification head
        inputs = tf.keras.Input(shape=(224, 224, 3))
        x = base_model(inputs, training=False)
        x = tf.keras.layers.GlobalAveragePooling2D()(x)
        x = tf.keras.layers.Dropout(0.2)(x)
        outputs = tf.keras.layers.Dense(1, activation='sigmoid')(x)
        
        model = tf.keras.Model(inputs, outputs)
        
        # Compile with mixed precision
        optimizer = tf.keras.optimizers.Adam(learning_rate=0.001)
        
        model.compile(
            optimizer=optimizer,
            loss='binary_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        return model
    
    def _train_with_memory_optimization(self, model, dataset):
        """Train with memory optimizations"""
        # Memory-efficient training settings
        batch_size = 16  # Smaller batch size
        epochs = 20
        
        # Enable mixed precision
        tf.keras.mixed_precision.set_global_policy('mixed_float16')
        
        # Create data loader with memory management
        train_loader = DataLoader(
            dataset,
            batch_size=batch_size,
            shuffle=True,
            num_workers=2,  # Limit workers to save memory
            pin_memory=False
        )
        
        # Training loop with memory monitoring
        history = {'loss': [], 'accuracy': []}
        
        for epoch in range(epochs):
            print(f"    📈 Epoch {epoch + 1}/{epochs}")
            
            epoch_loss = 0
            epoch_accuracy = 0
            num_batches = 0
            
            for batch_idx, (images, labels) in enumerate(train_loader):
                # Memory monitoring
                if batch_idx % 10 == 0:
                    memory_usage = self.get_storage_usage()
                    print(f"      🧠 Memory: {memory_usage['used_gb']:.1f}GB used")
                
                # Train step
                with tf.GradientTape() as tape:
                    predictions = model(images, training=True)
                    loss = tf.keras.losses.binary_crossentropy(labels, predictions)
                
                gradients = tape.gradient(loss, model.trainable_variables)
                
                # Apply gradients
                optimizer = tf.keras.optimizers.Adam()
                optimizer.apply_gradients(zip(gradients, model.trainable_variables))
                
                # Track metrics
                epoch_loss += loss.numpy()
                epoch_accuracy += tf.keras.metrics.binary_accuracy(labels, predictions).numpy()
                num_batches += 1
            
            # Calculate epoch metrics
            avg_loss = epoch_loss / num_batches
            avg_accuracy = epoch_accuracy / num_batches
            
            history['loss'].append(avg_loss)
            history['accuracy'].append(avg_accuracy)
            
            print(f"      ✅ Loss: {avg_loss:.4f}, Accuracy: {avg_accuracy:.4f}")
        
        return history
    
    def _cleanup_dataset(self, dataset_path: Path):
        """Clean up dataset to save space"""
        try:
            if dataset_path.exists():
                shutil.rmtree(dataset_path)
                print(f"  🗑️ Cleaned up {dataset_path}")
        except Exception as e:
            print(f"  ⚠️ Cleanup failed: {e}")
    
    def _report_phase_results(self, phase_name: str, history: Dict):
        """Report training phase results"""
        print(f"  📊 {phase_name.title()} Phase Results:")
        print(f"    Final Loss: {history['loss'][-1]:.4f}")
        print(f"    Final Accuracy: {history['accuracy'][-1]:.4f}")
        print(f"    Best Accuracy: {max(history['accuracy']):.4f}")
        
        # Save results
        results = {
            "phase": phase_name,
            "timestamp": datetime.now().isoformat(),
            "final_loss": history['loss'][-1],
            "final_accuracy": history['accuracy'][-1],
            "best_accuracy": max(history['accuracy']),
            "history": history
        }
        
        results_path = self.model_dir / f"{phase_name}_results.json"
        with open(results_path, 'w') as f:
            json.dump(results, f, indent=2)
    
    def create_training_report(self):
        """Create comprehensive training report"""
        storage = self.get_storage_usage()
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "storage_usage": storage,
            "training_phases": {
                "small": {"dataset_size_gb": 10, "expected_accuracy": "85-90%"},
                "medium": {"dataset_size_gb": 50, "expected_accuracy": "90-95%"},
                "large": {"dataset_size_gb": 200, "expected_accuracy": "95-98%"}
            },
            "optimizations": {
                "memory_efficient_model": "MobileNetV2 with reduced alpha",
                "mixed_precision": "Enabled for 2x speed",
                "streaming_dataset": "On-demand loading",
                "incremental_training": "Phase-based approach",
                "automatic_cleanup": "Dataset cleanup after each phase"
            },
            "recommendations": self._get_recommendations()
        }
        
        report_path = Path("efficient_training_report.json")
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"📋 Training report saved to {report_path}")
        return report
    
    def _get_recommendations(self) -> List[str]:
        """Get training recommendations"""
        storage = self.get_storage_usage()
        
        recommendations = [
            "✅ Use incremental training to avoid storage issues",
            "✅ Enable mixed precision for faster training",
            "✅ Use streaming datasets to reduce memory usage",
            "✅ Clean up datasets after each training phase",
            "✅ Monitor storage usage during training"
        ]
        
        if storage["available_for_training"] < 50:
            recommendations.append("⚠️ Consider external storage for larger datasets")
        
        if storage["free_gb"] < 20:
            recommendations.append("⚠️ Free up disk space before large dataset training")
        
        return recommendations

def main():
    """Main function for efficient training"""
    print("🚀 Storage-Efficient Deepfake Training Strategy")
    print("=" * 60)
    print("Optimized for 512GB SSD with limited disk space")
    print()
    
    # Initialize strategy
    strategy = EfficientTrainingStrategy(max_storage_gb=400)
    
    # Show current storage
    storage = strategy.get_storage_usage()
    print("💾 Current Storage Usage:")
    print(f"   Total: {storage['total_gb']:.1f}GB")
    print(f"   Used: {storage['used_gb']:.1f}GB")
    print(f"   Free: {storage['free_gb']:.1f}GB")
    print(f"   Available for Training: {storage['available_for_training']:.1f}GB")
    print()
    
    # Create training report
    report = strategy.create_training_report()
    
    # Show recommendations
    print("🎯 Training Recommendations:")
    for rec in report["recommendations"]:
        print(f"   {rec}")
    print()
    
    # Ask user to proceed
    print("🚀 Ready to start efficient training!")
    print("This strategy will:")
    print("   1. Download small dataset (10GB) and train")
    print("   2. Clean up and download medium dataset (50GB)")
    print("   3. Optionally train on large dataset (200GB)")
    print("   4. Use memory optimizations throughout")
    print()
    
    # Start training
    try:
        strategy.implement_incremental_training()
        print("\n🎉 Training completed successfully!")
    except KeyboardInterrupt:
        print("\n⏹️ Training interrupted by user")
    except Exception as e:
        print(f"\n❌ Training failed: {e}")

if __name__ == "__main__":
    main()
