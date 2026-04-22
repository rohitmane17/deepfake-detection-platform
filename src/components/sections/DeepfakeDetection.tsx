'use client';

import { useState, useEffect } from 'react';

const DeepfakeDetection = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [disclaimer, setDisclaimer] = useState<string>('');

  // Fetch disclaimer from API on component mount
  useEffect(() => {
    const fetchDisclaimer = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/disclaimer');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setDisclaimer(data.data.disclaimer);
          }
        }
      } catch (error) {
        console.error('Failed to fetch disclaimer:', error);
        // Fallback disclaimer
        setDisclaimer('This platform is for educational purposes only and does not perform real deepfake detection.');
      }
    };

    fetchDisclaimer();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const analyzeFile = async () => {
    if (!selectedFile) return;
    
    setIsAnalyzing(true);
    setProgress(0);
    setResult(null);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Simulate progress during upload and analysis
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      // Call the backend API
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setResult({
          prediction: data.data.prediction,
          confidence: data.data.confidence,
          riskLevel: data.data.risk_level,
          explanation: data.data.explanation,
          processingTime: data.data.processing_time,
          isDeepfake: data.data.prediction === 'AI Generated',
          metadata: data.data.metadata,
        });
      } else {
        throw new Error(data.message || 'Analysis failed');
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      setResult({
        error: true,
        message: error instanceof Error ? error.message : 'An unknown error occurred during analysis',
      });
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setResult(null);
    setProgress(0);
  };

  const downloadReport = () => {
    if (!result || result.error) return;
    
    const reportData = {
      timestamp: result.metadata?.analyzed_at || new Date().toISOString(),
      filename: selectedFile?.name || result.metadata?.filename,
      prediction: result.prediction,
      confidence: result.confidence,
      risk_level: result.riskLevel,
      explanation: result.explanation,
      processing_time: result.processingTime,
      file_type: result.metadata?.file_type,
      file_size: result.metadata?.file_size,
      analyzed_at: result.metadata?.analyzed_at,
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deepfake-analysis-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="deepfake-detection" className="deepfake-detection">
      <div className="container">
        {/* Section Header */}
        <h2 className="section-title">Deepfake Detection Demo</h2>
        <p className="section-subtitle">
          Upload your media files to analyze them for potential deepfake manipulation.
          Our AI-powered detection system provides confidence scores and risk assessments.
        </p>

        <div className="detection-container">
          {/* Upload Section */}
          {!result && (
            <div className="upload-section">
              <div className="upload-area">
                <div className="upload-icon">
                  <i className="fas fa-upload"></i>
                </div>
                <h3>Upload Media for Analysis</h3>
                <p>Drag and drop your file here or click to browse</p>
                
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="file-input-wrapper"
                >
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept="image/*,video/*"
                    className="file-input"
                  />
                  <div className="file-input-area">
                    {selectedFile ? (
                      <div className="selected-file">
                        <div className="file-icon">
                          <i className="fas fa-check-circle"></i>
                        </div>
                        <p className="file-name">
                          {selectedFile.name}
                          </p>
                          <p className="file-size">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="supported-formats">
                            Supported formats: JPG, PNG, MP4, MOV
                          </p>
                          <p className="max-size">
                            Maximum file size: 50MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {selectedFile && (
                  <div className="analyze-button-container">
                    <button
                      onClick={analyzeFile}
                      disabled={isAnalyzing}
                      className="analyze-btn"
                    >
                      {isAnalyzing ? (
                        <i className="fas fa-sync-alt fa-spin"></i>
                      ) : (
                        <i className="fas fa-search"></i>
                      )}
                      {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading Section */}
          {isAnalyzing && (
            <div className="loading-section">
              <div className="loading-content">
                <div className="loading-icon">
                  <i className="fas fa-sync-alt fa-spin"></i>
                </div>
                <h3>Analyzing Media...</h3>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p>{progress}% Complete</p>
              </div>
            </div>
          )}

          {/* Result Section */}
          {result && (
            <div className={`result-section ${result.error ? 'error' : result.isDeepfake ? 'deepfake' : 'authentic'}`}>
              <div className="result-content">
                {result.error ? (
                  // Error State
                  <div className="error-result">
                    <div className="result-icon error-icon">
                      <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <div className="result-details">
                      <h3>Analysis Failed
                      </h3>
                      <p className="text-text-secondary">
                        {result.message}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Success State
                  <>
                    <div className="success-result">
                      <div className={`result-icon ${result.isDeepfake ? 'deepfake-icon' : 'authentic-icon'}`}>
                        {result.isDeepfake ? (
                          <i className="fas fa-exclamation-triangle"></i>
                        ) : (
                          <i className="fas fa-check-circle"></i>
                        )}
                      </div>
                      <div className="result-details">
                        <h3 className={result.isDeepfake ? 'deepfake-title' : 'authentic-title'}>
                          {result.prediction === 'AI Generated' ? 'AI Generated Content' : 'Authentic Media'}
                        </h3>
                        <p className="result-explanation">
                          {result.explanation}
                        </p>
                        
                        {/* Confidence Bar */}
                        <div className="confidence-section">
                          <div className="confidence-header">
                            <span className="confidence-label">Confidence:</span>
                            <span className="confidence-value">{result.confidence}%</span>
                          </div>
                          <div className="confidence-bar">
                            <div 
                              className={`confidence-fill ${result.confidence > 80 ? 'high-risk' : result.confidence > 60 ? 'medium-risk' : 'low-risk'}`}
                              style={{ width: `${result.confidence}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Risk Level Badge */}
                        <div className="risk-level">
                          <span className={`risk-badge ${result.riskLevel === 'High' ? 'high-risk-badge' :
                            result.riskLevel === 'Medium' ? 'medium-risk-badge' :
                            'low-risk-badge'
                          }`}>
                            Risk Level: {result.riskLevel}
                          </span>
                          <span className="processing-time">
                            Processing time: {result.processingTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Analysis Details */}
                    <div className="analysis-details">
                      <h4 className="analysis-title">
                        Analysis Details
                      </h4>
                      
                      {/* AI Model Information */}
                      <div className="model-info">
                        <div className="info-row">
                          <span className="info-label">AI Model:</span>
                          <span className="info-value model-name">{result.model || 'N/A'}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Analysis Time:</span>
                          <span className="info-value">{result.analysis_time || result.processingTime || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Features Checked */}
                      <div className="features-section">
                        <h5 className="features-title">Features Checked:</h5>
                        <div className="features-list">
                          {result.features_checked?.map((feature: string, index: number) => (
                            <span 
                              key={index}
                              className="feature-tag"
                            >
                              {feature}
                            </span>
                          )) || (
                            <span className="no-data">No features data available</span>
                          )}
                        </div>
                      </div>

                      {/* File Information */}
                      <div className="file-info-grid">
                        <div className="file-info-column">
                          <div className="info-row">
                            <span className="info-label">File Type:</span>
                            <span className="info-value">
                              {result.metadata?.file_type || 'N/A'}
                            </span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">File Size:</span>
                            <span className="info-value">
                              {result.metadata?.file_size ? `${(result.metadata.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                            </span>
                          </div>
                        </div>
                        <div className="file-info-column">
                          <div className="info-row">
                            <span className="info-label">Analyzed At:</span>
                            <span className="info-value">
                              {result.metadata?.analyzed_at ? new Date(result.metadata.analyzed_at).toLocaleString() : 'N/A'}
                            </span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Processing Time:</span>
                            <span className="info-value">
                              {result.processingTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                      <button
                        onClick={downloadReport}
                        className="action-btn download-btn"
                      >
                        <i className="fas fa-download"></i>
                        Download Report
                      </button>
                      <button
                        onClick={resetAnalysis}
                        className="action-btn reset-btn"
                      >
                        <i className="fas fa-redo"></i>
                        Analyze Another File
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* API Status */}
        <div className="disclaimer-section">
          <div className="disclaimer-content">
            <div className="disclaimer-icon">
              <i className="fas fa-info-circle"></i>
            </div>
            <div className="disclaimer-text">
              <h3>Educational Disclaimer</h3>
              <p>
                {disclaimer || 'Loading disclaimer...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeepfakeDetection;
