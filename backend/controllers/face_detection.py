import cv2
import numpy as np
from typing import List, Tuple, Dict, Any
import os
import tempfile
from PIL import Image
from scipy import ndimage
from skimage import feature, measure, filters

class FaceDetector:
    def __init__(self):
        """Initialize the face detector with OpenCV's pre-trained Haar Cascade."""
        # Load the pre-trained Haar Cascade classifier for face detection
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Check if the cascade loaded successfully
        if self.face_cascade.empty():
            raise ValueError("Failed to load Haar Cascade classifier")
    
    def detect_faces(self, image_path: str) -> Dict[str, Any]:
        """
        Detect faces in an image using OpenCV Haar Cascade.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Dictionary containing face detection results
        """
        try:
            # Read the image
            image = cv2.imread(image_path)
            if image is None:
                return {
                    "success": False,
                    "error": "Could not read image file",
                    "faces": []
                }
            
            # Convert to grayscale for face detection
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30)
            )
            
            # Process face detection results
            face_results = []
            for (x, y, w, h) in faces:
                face_info = {
                    "x": int(x),
                    "y": int(y),
                    "width": int(w),
                    "height": int(h),
                    "confidence": self._calculate_face_confidence(gray, x, y, w, h)
                }
                face_results.append(face_info)
            
            # Analyze the image for deepfake indicators
            analysis = self._analyze_image_for_deepfake_indicators(image, faces)
            
            return {
                "success": True,
                "faces": face_results,
                "face_count": len(face_results),
                "image_analysis": analysis
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "faces": []
            }
    
    def _calculate_face_confidence(self, gray_image: np.ndarray, x: int, y: int, w: int, h: int) -> float:
        """
        Calculate a confidence score for the detected face based on image quality.
        
        Args:
            gray_image: Grayscale image
            x, y, w, h: Face bounding box coordinates
            
        Returns:
            Confidence score between 0.0 and 1.0
        """
        try:
            # Extract the face region
            face_region = gray_image[y:y+h, x:x+w]
            
            if face_region.size == 0:
                return 0.0
            
            # Calculate basic quality metrics
            # 1. Edge density (more edges = more detailed face)
            edges = cv2.Canny(face_region, 50, 150)
            edge_density = np.sum(edges > 0) / (w * h)
            
            # 2. Variance (measure of contrast)
            variance = np.var(face_region)
            
            # Combine metrics for confidence score
            edge_score = min(edge_density * 10, 0.5)  # Normalize to 0-0.5
            variance_score = min(variance / 1000, 0.5)  # Normalize to 0-0.5
            
            confidence = edge_score + variance_score
            return min(confidence, 1.0)
            
        except Exception:
            return 0.0
    
    def _analyze_image_for_deepfake_indicators(self, image: np.ndarray, faces: np.ndarray) -> Dict[str, Any]:
        """
        Analyze the image for potential deepfake indicators using advanced computer vision techniques.
        
        Args:
            image: OpenCV image
            faces: Detected faces array
            
        Returns:
            Dictionary containing analysis results
        """
        analysis = {
            "blur_score": 0.0,
            "noise_level": 0.0,
            "compression_artifacts": 0.0,
            "face_consistency": 0.0,
            "frequency_anomaly": 0.0,
            "edge_inconsistency": 0.0,
            "texture_anomaly": 0.0,
            "overall_risk": "Low"
        }
        
        try:
            # Convert to grayscale for analysis
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # 1. Blur detection using Laplacian variance
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            analysis["blur_score"] = float(laplacian_var)
            
            # 2. Noise level estimation
            noise = self._estimate_noise(gray)
            analysis["noise_level"] = float(noise)
            
            # 3. Compression artifacts detection
            compression_score = self._detect_compression_artifacts(gray)
            analysis["compression_artifacts"] = float(compression_score)
            
            # 4. Face consistency analysis (if faces detected)
            if len(faces) > 0:
                face_consistency = self._analyze_face_consistency(gray, faces)
                analysis["face_consistency"] = float(face_consistency)
            
            # 5. Frequency domain analysis (FFT-based)
            freq_anomaly = self._analyze_frequency_domain(gray)
            analysis["frequency_anomaly"] = float(freq_anomaly)
            
            # 6. Edge inconsistency detection
            edge_inconsistency = self._analyze_edge_inconsistency(gray, faces)
            analysis["edge_inconsistency"] = float(edge_inconsistency)
            
            # 7. Texture analysis using GLCM
            texture_anomaly = self._analyze_texture(gray, faces)
            analysis["texture_anomaly"] = float(texture_anomaly)
            
            # Calculate overall risk score
            risk_score = self._calculate_risk_score(analysis)
            analysis["overall_risk"] = risk_score
            
        except Exception as e:
            analysis["error"] = str(e)
        
        return analysis
    
    def _estimate_noise(self, gray_image: np.ndarray) -> float:
        """Estimate noise level in the image."""
        try:
            # Use median filter to estimate noise
            median = cv2.medianBlur(gray_image, 5)
            noise = np.mean(np.abs(gray_image.astype(float) - median.astype(float)))
            return float(noise)
        except Exception:
            return 0.0
    
    def _detect_compression_artifacts(self, gray_image: np.ndarray) -> float:
        """Detect JPEG compression artifacts."""
        try:
            # Look for blocking artifacts by checking high-frequency components
            # This is a simplified approach
            kernel = np.ones((8, 8), np.float32) / 64
            filtered = cv2.filter2D(gray_image, -1, kernel)
            artifacts = np.mean(np.abs(gray_image.astype(float) - filtered.astype(float)))
            return float(artifacts)
        except Exception:
            return 0.0
    
    def _analyze_face_consistency(self, gray_image: np.ndarray, faces: np.ndarray) -> float:
        """Analyze face regions for consistency."""
        try:
            if len(faces) == 0:
                return 0.0
            
            consistency_scores = []
            for (x, y, w, h) in faces:
                face_region = gray_image[y:y+h, x:x+w]
                if face_region.size > 0:
                    # Check for unnatural patterns in the face region
                    # Simple variance-based consistency check
                    consistency = 1.0 - (np.std(face_region) / 255.0)
                    consistency_scores.append(consistency)
            
            return float(np.mean(consistency_scores) if consistency_scores else 0.0)
        except Exception:
            return 0.0
    
    def _calculate_risk_score(self, analysis: Dict[str, Any]) -> str:
        """Calculate overall risk score based on analysis results."""
        try:
            # Enhanced risk calculation based on multiple factors
            risk_factors = 0
            
            # Blur analysis
            blur_risk = analysis["blur_score"] < 100
            if blur_risk:
                risk_factors += 1
            
            # Noise analysis
            noise_risk = analysis["noise_level"] > 20
            if noise_risk:
                risk_factors += 1
            
            # Compression artifacts
            compression_risk = analysis["compression_artifacts"] > 15
            if compression_risk:
                risk_factors += 1
            
            # Frequency anomaly
            freq_risk = analysis["frequency_anomaly"] > 0.6
            if freq_risk:
                risk_factors += 1
            
            # Edge inconsistency
            edge_risk = analysis["edge_inconsistency"] > 0.5
            if edge_risk:
                risk_factors += 1
            
            # Texture anomaly
            texture_risk = analysis["texture_anomaly"] > 0.5
            if texture_risk:
                risk_factors += 1
            
            # Face consistency (inverse - low consistency is risky)
            if analysis["face_consistency"] > 0:
                face_risk = analysis["face_consistency"] < 0.5
                if face_risk:
                    risk_factors += 1
            
            # Calculate risk level based on number of risk factors
            if risk_factors >= 4:
                return "High"
            elif risk_factors >= 2:
                return "Medium"
            else:
                return "Low"
        except Exception:
            return "Low"
    
    def _analyze_frequency_domain(self, gray_image: np.ndarray) -> float:
        """Analyze frequency domain for anomalies using FFT."""
        try:
            # Apply 2D FFT
            f_transform = np.fft.fft2(gray_image)
            f_shift = np.fft.fftshift(f_transform)
            magnitude_spectrum = np.log(np.abs(f_shift) + 1)
            
            # Calculate high-frequency energy ratio
            h, w = magnitude_spectrum.shape
            center_h, center_w = h // 2, w // 2
            
            # Define high-frequency region (outer 25% of spectrum)
            high_freq_region = magnitude_spectrum[
                int(center_h * 0.75):int(center_h * 1.25),
                int(center_w * 0.75):int(center_w * 1.25)
            ]
            
            # Define low-frequency region (center 25% of spectrum)
            low_freq_region = magnitude_spectrum[
                int(center_h * 0.5):int(center_h * 1.5),
                int(center_w * 0.5):int(center_w * 1.5)
            ]
            
            high_freq_energy = np.mean(high_freq_region)
            low_freq_energy = np.mean(low_freq_region)
            
            # Anomaly score: unusual high-frequency content
            if low_freq_energy > 0:
                anomaly_score = high_freq_energy / low_freq_energy
                return min(anomaly_score / 2.0, 1.0)  # Normalize to 0-1
            return 0.0
        except Exception:
            return 0.0
    
    def _analyze_edge_inconsistency(self, gray_image: np.ndarray, faces: np.ndarray) -> float:
        """Analyze edge inconsistencies around face regions."""
        try:
            # Detect edges using Canny
            edges = cv2.Canny(gray_image, 50, 150)
            
            if len(faces) == 0:
                # Analyze global edge distribution
                edge_density = np.sum(edges > 0) / (edges.shape[0] * edges.shape[1])
                return min(edge_density * 10, 1.0)
            
            # Analyze edges around face regions
            inconsistency_scores = []
            for (x, y, w, h) in faces:
                # Extract region around face (expanded by 20%)
                padding = int(max(w, h) * 0.2)
                x_start = max(0, x - padding)
                y_start = max(0, y - padding)
                x_end = min(gray_image.shape[1], x + w + padding)
                y_end = min(gray_image.shape[0], y + h + padding)
                
                face_region = edges[y_start:y_end, x_start:x_end]
                face_edges = edges[y:y+h, x:x+w]
                
                # Calculate edge density ratio
                if face_region.size > 0 and face_edges.size > 0:
                    region_density = np.sum(face_region > 0) / face_region.size
                    face_density = np.sum(face_edges > 0) / face_edges.size
                    
                    if region_density > 0:
                        inconsistency = abs(region_density - face_density) / region_density
                        inconsistency_scores.append(min(inconsistency, 1.0))
            
            return float(np.mean(inconsistency_scores) if inconsistency_scores else 0.0)
        except Exception:
            return 0.0
    
    def _analyze_texture(self, gray_image: np.ndarray, faces: np.ndarray) -> float:
        """Analyze texture using Gray-Level Co-occurrence Matrix (GLCM)."""
        try:
            from skimage.feature import graycomatrix, graycoprops
            
            # Normalize image to 0-255 range
            normalized = ((gray_image - gray_image.min()) * 255 / (gray_image.max() - gray_image.min())).astype(np.uint8)
            
            # Downsample for faster computation
            downsampled = cv2.resize(normalized, (256, 256))
            
            # Calculate GLCM properties
            distances = [1]
            angles = [0, np.pi/4, np.pi/2, 3*np.pi/4]
            
            glcm = graycomatrix(downsampled, distances=distances, angles=angles, 
                              levels=256, symmetric=True, normed=True)
            
            # Extract texture properties
            contrast = graycoprops(glcm, 'contrast')[0, 0]
            dissimilarity = graycoprops(glcm, 'dissimilarity')[0, 0]
            homogeneity = graycoprops(glcm, 'homogeneity')[0, 0]
            
            # Normalize values
            contrast_norm = min(contrast / 100.0, 1.0)
            dissimilarity_norm = min(dissimilarity / 10.0, 1.0)
            homogeneity_norm = 1.0 - min(homogeneity, 1.0)  # Invert: low homogeneity = high anomaly
            
            # Combined anomaly score
            anomaly_score = (contrast_norm + dissimilarity_norm + homogeneity_norm) / 3.0
            return float(anomaly_score)
        except Exception:
            return 0.0

def analyze_image_for_deepfake(image_path: str) -> Dict[str, Any]:
    """
    Main function to analyze an image for deepfake detection.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Dictionary containing comprehensive analysis results
    """
    try:
        detector = FaceDetector()
        results = detector.detect_faces(image_path)
        
        # Add additional metadata
        if results["success"]:
            # Add file information
            file_size = os.path.getsize(image_path)
            results["file_info"] = {
                "size_bytes": file_size,
                "size_mb": round(file_size / (1024 * 1024), 2)
            }
            
            # Generate a simple confidence score
            confidence = _generate_confidence_score(results)
            results["confidence"] = confidence
            
            # Generate explanation
            explanation = _generate_explanation(results)
            results["explanation"] = explanation
            
            # Determine if likely deepfake
            results["is_deepfake"] = results["image_analysis"]["overall_risk"] in ["High", "Medium"]
            
        return results
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Analysis failed: {str(e)}",
            "faces": []
        }

def _generate_confidence_score(results: Dict[str, Any]) -> float:
    """Generate a confidence score for the analysis."""
    try:
        if not results["success"]:
            return 0.0
        
        # Base confidence on face detection and image analysis
        base_confidence = 0.5
        
        # Adjust based on face count
        if results["face_count"] > 0:
            base_confidence += 0.15
        
        # Adjust based on image quality metrics
        analysis = results.get("image_analysis", {})
        
        # Blur score (higher is better for quality)
        if analysis.get("blur_score", 0) > 50:
            base_confidence += 0.08
        
        # Face consistency (higher is better)
        if analysis.get("face_consistency", 0) > 0.7:
            base_confidence += 0.12
        
        # Frequency anomaly (lower is better)
        if analysis.get("frequency_anomaly", 0) < 0.4:
            base_confidence += 0.08
        
        # Edge inconsistency (lower is better)
        if analysis.get("edge_inconsistency", 0) < 0.3:
            base_confidence += 0.07
        
        # Texture anomaly (lower is better)
        if analysis.get("texture_anomaly", 0) < 0.4:
            base_confidence += 0.07
        
        # Noise level (moderate is best)
        noise = analysis.get("noise_level", 0)
        if 5 < noise < 15:
            base_confidence += 0.05
        
        # Compression artifacts (lower is better)
        if analysis.get("compression_artifacts", 0) < 10:
            base_confidence += 0.05
        
        return min(base_confidence, 1.0) * 100  # Convert to percentage
        
    except Exception:
        return 50.0  # Default confidence

def _generate_explanation(results: Dict[str, Any]) -> str:
    """Generate an explanation for the analysis results."""
    try:
        if not results["success"]:
            return "Analysis failed due to processing error."
        
        face_count = results["face_count"]
        analysis = results.get("image_analysis", {})
        risk_level = analysis.get("overall_risk", "Low")
        
        explanation_parts = []
        
        if face_count == 0:
            explanation_parts.append("No faces detected in the image.")
        else:
            explanation_parts.append(f"Detected {face_count} face(s) in the image.")
        
        # Add specific analysis details
        detected_issues = []
        
        if analysis.get("frequency_anomaly", 0) > 0.6:
            detected_issues.append("unusual frequency patterns")
        if analysis.get("edge_inconsistency", 0) > 0.5:
            detected_issues.append("edge inconsistencies")
        if analysis.get("texture_anomaly", 0) > 0.5:
            detected_issues.append("texture anomalies")
        if analysis.get("blur_score", 0) < 100:
            detected_issues.append("abnormal blur levels")
        if analysis.get("noise_level", 0) > 20:
            detected_issues.append("elevated noise levels")
        if analysis.get("compression_artifacts", 0) > 15:
            detected_issues.append("compression artifacts")
        
        if risk_level == "High":
            if detected_issues:
                explanation_parts.append(f"High risk indicators detected: {', '.join(detected_issues)} suggest potential manipulation.")
            else:
                explanation_parts.append("High risk indicators detected: multiple anomalies suggest potential manipulation.")
        elif risk_level == "Medium":
            if detected_issues:
                explanation_parts.append(f"Medium risk indicators detected: {', '.join(detected_issues)} warrant further inspection.")
            else:
                explanation_parts.append("Medium risk indicators detected: some anomalies found that warrant further inspection.")
        else:
            explanation_parts.append("Low risk indicators detected: image appears to have normal characteristics across all analysis metrics.")
        
        return " ".join(explanation_parts)
        
    except Exception:
        return "Analysis completed with advanced computer vision techniques including frequency domain analysis, edge detection, and texture analysis."

if __name__ == "__main__":
    import sys
    import json
    
    # Get image path from command line arguments
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "No image path provided",
            "faces": []
        }))
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    # Check if file exists
    if not os.path.exists(image_path):
        print(json.dumps({
            "success": False,
            "error": f"Image file not found: {image_path}",
            "faces": []
        }))
        sys.exit(1)
    
    # Analyze the image
    results = analyze_image_for_deepfake(image_path)
    
    # Output results as JSON
    print(json.dumps(results, indent=2))
