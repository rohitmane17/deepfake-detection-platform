#!/usr/bin/env python3
"""
Validation Framework for Deepfake Detection
Comprehensive testing and accuracy validation system
"""

import os
import sys
import json
import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, roc_curve
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
from PIL import Image
import cv2
from deepfake_detector import DeepfakeDetector
from pretrained_weights_manager import PretrainedWeightsManager

class ValidationFramework:
    """Comprehensive validation framework for deepfake detection"""
    
    def __init__(self, test_data_dir="test_data", results_dir="validation_results"):
        self.test_data_dir = test_data_dir
        self.results_dir = results_dir
        self.detector = None
        self.results = {}
        
        # Create results directory
        os.makedirs(results_dir, exist_ok=True)
        
    def setup_detector(self, model_id=None, model_path=None):
        """Setup detector with pre-trained weights"""
        print("🤖 Setting up detector...")
        
        # Initialize detector
        self.detector = DeepfakeDetector(model_path)
        
        # Load pre-trained weights if specified
        if model_id:
            weights_manager = PretrainedWeightsManager()
            if not weights_manager.load_pretrained_weights(model_id, self.detector):
                print(f"❌ Failed to load weights for {model_id}")
                return False
        
        print("✅ Detector setup complete")
        return True
    
    def prepare_test_dataset(self):
        """Prepare test dataset with ground truth labels"""
        print("📂 Preparing test dataset...")
        
        test_images = []
        ground_truth = []
        
        # Expected structure:
        # test_data/
        # ├── real/
        # │   ├── image1.jpg
        # │   └── image2.jpg
        # └── fake/
        #     ├── fake1.jpg
        #     └── fake2.jpg
        
        for class_name in ["real", "fake"]:
            class_dir = os.path.join(self.test_data_dir, class_name)
            if not os.path.exists(class_dir):
                print(f"⚠️ Directory not found: {class_dir}")
                continue
            
            label = 0 if class_name == "real" else 1
            
            for filename in os.listdir(class_dir):
                if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp')):
                    image_path = os.path.join(class_dir, filename)
                    test_images.append(image_path)
                    ground_truth.append(label)
        
        print(f"📊 Test dataset prepared:")
        print(f"   Total images: {len(test_images)}")
        print(f"   Real images: {sum(1 for label in ground_truth if label == 0)}")
        print(f"   Fake images: {sum(1 for label in ground_truth if label == 1)}")
        
        return test_images, ground_truth
    
    def run_validation(self, test_images, ground_truth):
        """Run validation on test dataset"""
        print("🧪 Running validation tests...")
        
        predictions = []
        confidences = []
        processing_times = []
        errors = []
        
        for i, image_path in enumerate(test_images):
            try:
                start_time = datetime.now()
                
                # Analyze image
                result = self.detector.analyze_image(image_path)
                end_time = datetime.now()
                
                processing_time = (end_time - start_time).total_seconds()
                processing_times.append(processing_time)
                
                if result.get("prediction") == "Error":
                    print(f"❌ Error analyzing {image_path}: {result.get('error')}")
                    errors.append((image_path, result.get('error')))
                    predictions.append(-1)  # Error indicator
                    confidences.append(0.0)
                else:
                    prediction = 1 if result.get("prediction") == "AI Generated" else 0
                    confidence = result.get("confidence", 0) / 100.0
                    
                    predictions.append(prediction)
                    confidences.append(confidence)
                
                # Progress update
                if (i + 1) % 10 == 0:
                    print(f"   Processed {i + 1}/{len(test_images)} images")
                
            except Exception as e:
                print(f"❌ Exception analyzing {image_path}: {e}")
                errors.append((image_path, str(e)))
                predictions.append(-1)
                confidences.append(0.0)
                processing_times.append(0.0)
        
        print(f"✅ Validation completed")
        print(f"   Successful: {len([p for p in predictions if p != -1])}")
        print(f"   Errors: {len(errors)}")
        print(f"   Avg processing time: {np.mean(processing_times):.3f}s")
        
        return predictions, confidences, processing_times, errors
    
    def calculate_metrics(self, predictions, confidences, ground_truth):
        """Calculate comprehensive metrics"""
        print("📊 Calculating metrics...")
        
        # Filter out errors
        valid_indices = [i for i, p in enumerate(predictions) if p != -1]
        valid_predictions = [predictions[i] for i in valid_indices]
        valid_confidences = [confidences[i] for i in valid_indices]
        valid_ground_truth = [ground_truth[i] for i in valid_indices]
        
        if not valid_predictions:
            print("❌ No valid predictions to evaluate")
            return {}
        
        # Basic metrics
        accuracy = np.mean(np.array(valid_predictions) == np.array(valid_ground_truth))
        
        # Detailed classification report
        class_report = classification_report(
            valid_ground_truth, 
            valid_predictions, 
            target_names=["Real", "Fake"],
            output_dict=True
        )
        
        # Confusion matrix
        cm = confusion_matrix(valid_ground_truth, valid_predictions)
        
        # ROC AUC
        try:
            auc = roc_auc_score(valid_ground_truth, valid_confidences)
            fpr, tpr, thresholds = roc_curve(valid_ground_truth, valid_confidences)
        except:
            auc = 0.0
            fpr, tpr, thresholds = [], [], []
        
        # Additional metrics
        precision = class_report["weighted avg"]["precision"]
        recall = class_report["weighted avg"]["recall"]
        f1_score = class_report["weighted avg"]["f1-score"]
        
        metrics = {
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1_score": f1_score,
            "auc": auc,
            "confusion_matrix": cm.tolist(),
            "classification_report": class_report,
            "roc_curve": {
                "fpr": fpr.tolist(),
                "tpr": tpr.tolist(),
                "thresholds": thresholds.tolist()
            },
            "total_samples": len(ground_truth),
            "valid_samples": len(valid_predictions),
            "error_samples": len(ground_truth) - len(valid_predictions)
        }
        
        print(f"📈 Validation Metrics:")
        print(f"   Accuracy: {accuracy:.4f}")
        print(f"   Precision: {precision:.4f}")
        print(f"   Recall: {recall:.4f}")
        print(f"   F1-Score: {f1_score:.4f}")
        print(f"   AUC: {auc:.4f}")
        
        return metrics
    
    def create_visualizations(self, metrics, processing_times):
        """Create validation visualizations"""
        print("📈 Creating visualizations...")
        
        # 1. Confusion Matrix
        plt.figure(figsize=(15, 10))
        
        plt.subplot(2, 3, 1)
        cm = np.array(metrics["confusion_matrix"])
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=['Real', 'Fake'], yticklabels=['Real', 'Fake'])
        plt.title('Confusion Matrix')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        
        # 2. ROC Curve
        if metrics["roc_curve"]["fpr"]:
            plt.subplot(2, 3, 2)
            fpr, tpr = metrics["roc_curve"]["fpr"], metrics["roc_curve"]["tpr"]
            auc = metrics["auc"]
            plt.plot(fpr, tpr, color='blue', lw=2, label=f'ROC curve (AUC = {auc:.2f})')
            plt.plot([0, 1], [0, 1], color='red', lw=2, linestyle='--')
            plt.xlim([0.0, 1.0])
            plt.ylim([0.0, 1.05])
            plt.xlabel('False Positive Rate')
            plt.ylabel('True Positive Rate')
            plt.title('ROC Curve')
            plt.legend(loc="lower right")
            plt.grid(True)
        
        # 3. Processing Time Distribution
        plt.subplot(2, 3, 3)
        plt.hist(processing_times, bins=20, alpha=0.7, color='green')
        plt.xlabel('Processing Time (seconds)')
        plt.ylabel('Frequency')
        plt.title('Processing Time Distribution')
        plt.grid(True)
        
        # 4. Metrics Bar Chart
        plt.subplot(2, 3, 4)
        metric_names = ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'AUC']
        metric_values = [
            metrics["accuracy"],
            metrics["precision"],
            metrics["recall"],
            metrics["f1_score"],
            metrics["auc"]
        ]
        colors = ['blue', 'green', 'orange', 'red', 'purple']
        bars = plt.bar(metric_names, metric_values, color=colors, alpha=0.7)
        plt.ylabel('Score')
        plt.title('Performance Metrics')
        plt.ylim(0, 1)
        plt.xticks(rotation=45)
        
        # Add value labels on bars
        for bar, value in zip(bars, metric_values):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                    f'{value:.3f}', ha='center', va='bottom')
        
        # 5. Class-wise Performance
        plt.subplot(2, 3, 5)
        class_report = metrics["classification_report"]
        classes = ['Real', 'Fake']
        precision_scores = [class_report[c]["precision"] for c in classes]
        recall_scores = [class_report[c]["recall"] for c in classes]
        
        x = np.arange(len(classes))
        width = 0.35
        
        plt.bar(x - width/2, precision_scores, width, label='Precision', alpha=0.7)
        plt.bar(x + width/2, recall_scores, width, label='Recall', alpha=0.7)
        plt.xlabel('Class')
        plt.ylabel('Score')
        plt.title('Class-wise Performance')
        plt.xticks(x, classes)
        plt.legend()
        plt.ylim(0, 1)
        
        # 6. Confidence Distribution
        plt.subplot(2, 3, 6)
        valid_confidences = [c for c in self.results.get("confidences", []) if c > 0]
        if valid_confidences:
            plt.hist(valid_confidences, bins=20, alpha=0.7, color='purple')
            plt.xlabel('Confidence Score')
            plt.ylabel('Frequency')
            plt.title('Confidence Distribution')
            plt.grid(True)
        
        plt.tight_layout()
        plt.savefig(os.path.join(self.results_dir, "validation_plots.png"), 
                   dpi=300, bbox_inches='tight')
        plt.close()
        
        print("✅ Visualizations saved")
    
    def generate_report(self, metrics, processing_times, errors):
        """Generate comprehensive validation report"""
        print("📋 Generating validation report...")
        
        report = {
            "validation_date": datetime.now().isoformat(),
            "model_info": {
                "model_type": "XceptionNet-based CNN",
                "input_size": self.detector.input_size if self.detector else "Unknown",
                "confidence_threshold": self.detector.confidence_threshold if self.detector else 0.5
            },
            "dataset_info": {
                "total_samples": metrics["total_samples"],
                "valid_samples": metrics["valid_samples"],
                "error_samples": metrics["error_samples"],
                "real_samples": len([gt for gt in self.results.get("ground_truth", []) if gt == 0]),
                "fake_samples": len([gt for gt in self.results.get("ground_truth", []) if gt == 1])
            },
            "performance_metrics": {
                "accuracy": metrics["accuracy"],
                "precision": metrics["precision"],
                "recall": metrics["recall"],
                "f1_score": metrics["f1_score"],
                "auc": metrics["auc"]
            },
            "processing_stats": {
                "avg_time": np.mean(processing_times),
                "min_time": np.min(processing_times),
                "max_time": np.max(processing_times),
                "std_time": np.std(processing_times)
            },
            "confusion_matrix": metrics["confusion_matrix"],
            "classification_report": metrics["classification_report"],
            "errors": [{"image": img, "error": err} for img, err in errors] if errors else [],
            "recommendations": self.generate_recommendations(metrics)
        }
        
        # Save report
        report_path = os.path.join(self.results_dir, "validation_report.json")
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        # Create summary text report
        self.create_text_report(report)
        
        print(f"✅ Validation report saved: {report_path}")
        return report
    
    def generate_recommendations(self, metrics):
        """Generate recommendations based on metrics"""
        recommendations = []
        
        accuracy = metrics["accuracy"]
        precision = metrics["precision"]
        recall = metrics["recall"]
        f1_score = metrics["f1_score"]
        
        if accuracy < 0.8:
            recommendations.append("Consider training on larger dataset")
            recommendations.append("Try different model architecture")
        
        if precision < 0.8:
            recommendations.append("Adjust confidence threshold to reduce false positives")
        
        if recall < 0.8:
            recommendations.append("Increase model sensitivity to catch more deepfakes")
        
        if f1_score < 0.8:
            recommendations.append("Balance precision and recall through threshold tuning")
        
        if not recommendations:
            recommendations.append("Model performance is excellent - ready for production")
        
        return recommendations
    
    def create_text_report(self, report):
        """Create human-readable text report"""
        report_path = os.path.join(self.results_dir, "validation_summary.txt")
        
        with open(report_path, 'w') as f:
            f.write("Deepfake Detection Validation Report\n")
            f.write("=" * 50 + "\n\n")
            
            f.write(f"Date: {report['validation_date']}\n")
            f.write(f"Model: {report['model_info']['model_type']}\n")
            f.write(f"Input Size: {report['model_info']['input_size']}\n\n")
            
            f.write("Dataset Information:\n")
            f.write(f"  Total Samples: {report['dataset_info']['total_samples']}\n")
            f.write(f"  Valid Samples: {report['dataset_info']['valid_samples']}\n")
            f.write(f"  Error Samples: {report['dataset_info']['error_samples']}\n")
            f.write(f"  Real Images: {report['dataset_info']['real_samples']}\n")
            f.write(f"  Fake Images: {report['dataset_info']['fake_samples']}\n\n")
            
            f.write("Performance Metrics:\n")
            f.write(f"  Accuracy: {report['performance_metrics']['accuracy']:.4f}\n")
            f.write(f"  Precision: {report['performance_metrics']['precision']:.4f}\n")
            f.write(f"  Recall: {report['performance_metrics']['recall']:.4f}\n")
            f.write(f"  F1-Score: {report['performance_metrics']['f1_score']:.4f}\n")
            f.write(f"  AUC: {report['performance_metrics']['auc']:.4f}\n\n")
            
            f.write("Processing Statistics:\n")
            f.write(f"  Average Time: {report['processing_stats']['avg_time']:.3f}s\n")
            f.write(f"  Min Time: {report['processing_stats']['min_time']:.3f}s\n")
            f.write(f"  Max Time: {report['processing_stats']['max_time']:.3f}s\n")
            f.write(f"  Std Dev: {report['processing_stats']['std_time']:.3f}s\n\n")
            
            f.write("Recommendations:\n")
            for i, rec in enumerate(report['recommendations'], 1):
                f.write(f"  {i}. {rec}\n")
    
    def run_complete_validation(self, model_id=None, model_path=None):
        """Run complete validation pipeline"""
        print("🚀 Starting Complete Validation Pipeline")
        print("=" * 50)
        
        # Setup detector
        if not self.setup_detector(model_id, model_path):
            return False
        
        # Prepare test dataset
        test_images, ground_truth = self.prepare_test_dataset()
        if not test_images:
            print("❌ No test images found")
            return False
        
        # Run validation
        predictions, confidences, processing_times, errors = self.run_validation(
            test_images, ground_truth
        )
        
        # Store results
        self.results = {
            "predictions": predictions,
            "confidences": confidences,
            "processing_times": processing_times,
            "errors": errors,
            "ground_truth": ground_truth
        }
        
        # Calculate metrics
        metrics = self.calculate_metrics(predictions, confidences, ground_truth)
        
        # Create visualizations
        self.create_visualizations(metrics, processing_times)
        
        # Generate report
        report = self.generate_report(metrics, processing_times, errors)
        
        print("\n🎉 Validation completed successfully!")
        print(f"📁 Results saved to: {self.results_dir}")
        print(f"📊 Overall accuracy: {metrics['accuracy']:.4f}")
        
        return True

def main():
    """Main validation function"""
    print("🧪 Deepfake Detection Validation Framework")
    print("=" * 50)
    
    validator = ValidationFramework()
    
    # Run validation with pre-trained weights
    validator.run_complete_validation(model_id="faceforensics_xception")

if __name__ == "__main__":
    main()
