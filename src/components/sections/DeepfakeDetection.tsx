'use client';

import React, { useState, useEffect, useCallback } from 'react';

type ResultType = {
  prediction?: string;
  confidence?: number;
  riskLevel?: string;
  explanation?: string;
  processingTime?: string;
  isDeepfake?: boolean;
  metadata?: any;
  error?: boolean;
  message?: string;
  features_checked?: string[];
  model?: string;
  analysis_time?: string;
};

const DeepfakeDetection = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ResultType | null>(null);
  const [disclaimer, setDisclaimer] = useState<string>('');

  useEffect(() => {
    const fetchDisclaimer = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/disclaimer`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setDisclaimer(data.data.disclaimer);
          }
        }
      } catch (error) {
        console.error('Failed to fetch disclaimer:', error);
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

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setProgress(0);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const analyzeFile = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setProgress(0);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/analyze`, {
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
          features_checked: data.data.features_checked,
          model: data.data.model,
          analysis_time: data.data.analysis_time,
        });
      } else {
        throw new Error(data.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setResult({
        error: true,
        message: error instanceof Error ? error.message : 'Unknown error',
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

    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deepfake-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="deepfake-detection" className="deepfake-detection">
      <div className="container">
        <h2 className="section-title">Deepfake Detection Demo</h2>
        <p className="section-subtitle">
          Upload your media files to analyze them for potential deepfake manipulation.
          Our AI-powered detection system provides confidence scores and risk assessments.
        </p>

        <div className="detection-container">
          {/* Upload Section */}
          {!result && !isAnalyzing && (
            <div className="upload-section">
              <div 
                className="upload-area"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="upload-icon">
                  <i className="fas fa-cloud-upload-alt"></i>
                </div>
                <h3>Drag & Drop your file here</h3>
                <p>or click to browse</p>
                <div className="file-input-wrapper">
                  <input 
                    type="file" 
                    className="file-input"
                    onChange={handleFileSelect}
                    accept="image/*,video/*"
                  />
                  <div className="file-input-area">
                    <i className="fas fa-folder-open"></i>
                    <span>Choose File</span>
                  </div>
                </div>
                {selectedFile && (
                  <div className="selected-file">
                    <div className="file-icon">
                      <i className="fas fa-file"></i>
                    </div>
                    <div className="file-name">{selectedFile.name}</div>
                    <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <div className="analyze-button-container">
                      <button 
                        className="analyze-btn"
                        onClick={analyzeFile}
                      >
                        <i className="fas fa-search"></i>
                        Analyze
                      </button>
                    </div>
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
                <h3>Analyzing your file...</h3>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p>{progress}% Complete</p>
              </div>
            </div>
          )}

          {/* Result Section */}
          {result && (
            <div className="result-section">
              {result.error ? (
                <div className="error-display">
                  <div className="error-icon">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <h3>Analysis Failed</h3>
                  <p>{result.message}</p>
                  <button className="try-again-btn" onClick={resetAnalysis}>
                    <i className="fas fa-redo"></i>
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <div className="result-header">
                    <h3 className="result-title">{result.prediction}</h3>
                    <div className={`confidence-badge ${result.isDeepfake ? 'high-risk' : 'low-risk'}`}>
                      {result.confidence}% Confidence
                    </div>
                  </div>
                  
                  <div className="result-details">
                    <p className="explanation">{result.explanation}</p>
                    
                    {result.riskLevel && (
                      <div className="risk-level">
                        <span className="risk-label">Risk Level:</span>
                        <span className={`risk-value ${result.riskLevel.toLowerCase()}`}>
                          {result.riskLevel}
                        </span>
                      </div>
                    )}

                    {result.features_checked && result.features_checked.length > 0 && (
                      <div className="features-checked">
                        <h4>Features Analyzed:</h4>
                        <div className="features-list">
                          {result.features_checked.map((f, i) => (
                            <span key={i} className="feature-tag">{f}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.metadata && (
                      <div className="metadata">
                        <h4>File Information:</h4>
                        <p>Filename: {result.metadata.filename}</p>
                        <p>File Type: {result.metadata.file_type}</p>
                        <p>File Size: {result.metadata.file_size}</p>
                        <p>Analyzed: {result.metadata.analyzed_at}</p>
                      </div>
                    )}
                  </div>

                  <div className="action-buttons">
                    <button className="download-btn" onClick={downloadReport}>
                      <i className="fas fa-download"></i>
                      Download Report
                    </button>
                    <button className="reset-btn" onClick={resetAnalysis}>
                      <i className="fas fa-redo"></i>
                      Analyze Another
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <div className="disclaimer">
            <p>{disclaimer}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeepfakeDetection;