#!/usr/bin/env python3
"""
Training Pipeline for FaceForensics++ Dataset
Comprehensive training script for CNN deepfake detection
"""

import os
import sys
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from deepfake_detector import DeepfakeDetector
import matplotlib.pyplot as plt
from datetime import datetime

class FaceForensicsTrainer:
    """Training pipeline for FaceForensics++ dataset"""
    
    def __init__(self, dataset_path, output_dir="models"):
        self.dataset_path = dataset_path
        self.output_dir = output_dir
        self.detector = DeepfakeDetector()
        self.training_history = {}
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
    def prepare_dataset_structure(self):
        """Prepare FaceForensics++ dataset structure"""
        print("🗂️ Preparing dataset structure...")
        
        # Expected structure:
        # dataset/
        # ├── train/
        # │   ├── real/
        # │   └── fake/
        # ├── validation/
        # │   ├── real/
        # │   └── fake/
        # └── test/
        #     ├── real/
        #     └── fake/
        
        train_dir = os.path.join(self.dataset_path, "train")
        val_dir = os.path.join(self.dataset_path, "validation")
        test_dir = os.path.join(self.dataset_path, "test")
        
        # Check if directories exist
        for dir_path in [train_dir, val_dir, test_dir]:
            if not os.path.exists(dir_path):
                print(f"❌ Directory not found: {dir_path}")
                return False
        
        # Count images in each directory
        splits = {
            "train": {"real": 0, "fake": 0},
            "validation": {"real": 0, "fake": 0},
            "test": {"real": 0, "fake": 0}
        }
        
        for split_name, split_path in [("train", train_dir), ("validation", val_dir), ("test", test_dir)]:
            for class_name in ["real", "fake"]:
                class_path = os.path.join(split_path, class_name)
                if os.path.exists(class_path):
                    splits[split_name][class_name] = len([f for f in os.listdir(class_path) 
                                                          if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
        
        print("📊 Dataset Statistics:")
        for split_name, counts in splits.items():
            total = sum(counts.values())
            print(f"   {split_name}: {total} images (real: {counts['real']}, fake: {counts['fake']})")
        
        return True
    
    def setup_data_generators(self):
        """Setup data generators with augmentation"""
        print("🔄 Setting up data generators...")
        
        # Training data generator with augmentation
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            rotation_range=20,
            width_shift_range=0.2,
            height_shift_range=0.2,
            horizontal_flip=True,
            zoom_range=0.2,
            shear_range=0.2,
            brightness_range=[0.8, 1.2],
            fill_mode='nearest'
        )
        
        # Validation and test generators (no augmentation)
        test_datagen = ImageDataGenerator(rescale=1./255)
        
        # Load data
        train_generator = train_datagen.flow_from_directory(
            os.path.join(self.dataset_path, "train"),
            target_size=self.detector.input_size,
            batch_size=32,
            class_mode='binary',
            shuffle=True
        )
        
        validation_generator = test_datagen.flow_from_directory(
            os.path.join(self.dataset_path, "validation"),
            target_size=self.detector.input_size,
            batch_size=32,
            class_mode='binary',
            shuffle=False
        )
        
        test_generator = test_datagen.flow_from_directory(
            os.path.join(self.dataset_path, "test"),
            target_size=self.detector.input_size,
            batch_size=32,
            class_mode='binary',
            shuffle=False
        )
        
        print(f"✅ Data generators ready")
        print(f"   Training batches: {len(train_generator)}")
        print(f"   Validation batches: {len(validation_generator)}")
        print(f"   Test batches: {len(test_generator)}")
        
        return train_generator, validation_generator, test_generator
    
    def setup_callbacks(self):
        """Setup training callbacks"""
        print("⚙️ Setting up training callbacks...")
        
        callbacks = [
            # Model checkpoint
            ModelCheckpoint(
                filepath=os.path.join(self.output_dir, "best_model.h5"),
                monitor='val_accuracy',
                save_best_only=True,
                save_weights_only=False,
                verbose=1
            ),
            
            # Early stopping
            EarlyStopping(
                monitor='val_accuracy',
                patience=10,
                restore_best_weights=True,
                verbose=1
            ),
            
            # Learning rate reduction
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7,
                verbose=1
            ),
            
            # Custom callback for logging
            TrainingLogger(self.output_dir)
        ]
        
        return callbacks
    
    def train_model(self, epochs=50):
        """Train the CNN model"""
        print("🚀 Starting model training...")
        
        # Prepare dataset
        if not self.prepare_dataset_structure():
            raise ValueError("Dataset structure not valid")
        
        # Setup data generators
        train_gen, val_gen, test_gen = self.setup_data_generators()
        
        # Setup callbacks
        callbacks = self.setup_callbacks()
        
        # Calculate steps
        steps_per_epoch = len(train_gen)
        validation_steps = len(val_gen)
        
        print(f"📋 Training Configuration:")
        print(f"   Epochs: {epochs}")
        print(f"   Steps per epoch: {steps_per_epoch}")
        print(f"   Validation steps: {validation_steps}")
        print(f"   Batch size: 32")
        print(f"   Input size: {self.detector.input_size}")
        
        # Train the model
        history = self.detector.model.fit(
            train_gen,
            steps_per_epoch=steps_per_epoch,
            validation_data=val_gen,
            validation_steps=validation_steps,
            epochs=epochs,
            callbacks=callbacks,
            verbose=1
        )
        
        # Save training history
        self.training_history = history.history
        self.save_training_history()
        
        # Evaluate on test set
        print("\n🧪 Evaluating on test set...")
        test_results = self.detector.model.evaluate(test_gen, verbose=1)
        
        test_metrics = {
            "test_loss": test_results[0],
            "test_accuracy": test_results[1],
            "test_precision": test_results[2] if len(test_results) > 2 else None,
            "test_recall": test_results[3] if len(test_results) > 3 else None
        }
        
        print(f"📊 Test Results:")
        for metric, value in test_metrics.items():
            if value is not None:
                print(f"   {metric}: {value:.4f}")
        
        # Save final model
        final_model_path = os.path.join(self.output_dir, "final_model.h5")
        self.detector.model.save(final_model_path)
        print(f"💾 Final model saved to: {final_model_path}")
        
        # Save test results
        with open(os.path.join(self.output_dir, "test_results.json"), "w") as f:
            json.dump(test_metrics, f, indent=2)
        
        return history, test_metrics
    
    def save_training_history(self):
        """Save training history and plots"""
        if not self.training_history:
            return
        
        # Save history as JSON
        with open(os.path.join(self.output_dir, "training_history.json"), "w") as f:
            json.dump(self.training_history, f, indent=2)
        
        # Create plots
        self.create_training_plots()
        
        print("💾 Training history saved")
    
    def create_training_plots(self):
        """Create training visualization plots"""
        if not self.training_history:
            return
        
        # Plot accuracy
        plt.figure(figsize=(12, 4))
        
        plt.subplot(1, 2, 1)
        plt.plot(self.training_history['accuracy'], label='Training Accuracy')
        plt.plot(self.training_history['val_accuracy'], label='Validation Accuracy')
        plt.title('Model Accuracy')
        plt.xlabel('Epoch')
        plt.ylabel('Accuracy')
        plt.legend()
        plt.grid(True)
        
        # Plot loss
        plt.subplot(1, 2, 2)
        plt.plot(self.training_history['loss'], label='Training Loss')
        plt.plot(self.training_history['val_loss'], label='Validation Loss')
        plt.title('Model Loss')
        plt.xlabel('Epoch')
        plt.ylabel('Loss')
        plt.legend()
        plt.grid(True)
        
        plt.tight_layout()
        plt.savefig(os.path.join(self.output_dir, "training_plots.png"), dpi=300, bbox_inches='tight')
        plt.close()
        
        print("📊 Training plots saved")

class TrainingLogger(tf.keras.callbacks.Callback):
    """Custom callback for training logging"""
    
    def __init__(self, output_dir):
        super().__init__()
        self.output_dir = output_dir
        self.log_file = os.path.join(output_dir, "training.log")
        
    def on_train_begin(self, logs=None):
        with open(self.log_file, "w") as f:
            f.write(f"Training started at {datetime.now()}\n")
            f.write(f"Model: {self.model.name}\n")
            f.write(f"Parameters: {self.model.count_params()}\n\n")
    
    def on_epoch_end(self, epoch, logs=None):
        with open(self.log_file, "a") as f:
            log_str = f"Epoch {epoch + 1}: "
            for key, value in logs.items():
                log_str += f"{key}={value:.4f}, "
            f.write(log_str + "\n")
    
    def on_train_end(self, logs=None):
        with open(self.log_file, "a") as f:
            f.write(f"\nTraining completed at {datetime.now()}\n")

def main():
    """Main training function"""
    print("🚀 FaceForensics++ Training Pipeline")
    print("=" * 50)
    
    # Configuration
    dataset_path = "dataset/faceforensics++"
    output_dir = "models/faceforensics_trained"
    epochs = 50
    
    # Check dataset path
    if not os.path.exists(dataset_path):
        print(f"❌ Dataset path not found: {dataset_path}")
        print("Please download and extract FaceForensics++ dataset")
        return False
    
    # Initialize trainer
    trainer = FaceForensicsTrainer(dataset_path, output_dir)
    
    try:
        # Start training
        history, test_results = trainer.train_model(epochs=epochs)
        
        print("\n🎉 Training completed successfully!")
        print(f"📁 Models saved to: {output_dir}")
        print(f"📊 Best test accuracy: {test_results['test_accuracy']:.4f}")
        
        return True
        
    except Exception as e:
        print(f"❌ Training failed: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
