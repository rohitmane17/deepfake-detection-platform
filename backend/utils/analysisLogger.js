const fs = require('fs');
const path = require('path');

/**
 * Simple logging system for analysis history
 * Stores data in memory and persists to JSON file
 */
class AnalysisLogger {
  constructor() {
    this.logFile = path.join(__dirname, '../logs/analysis_history.json');
    this.memoryStore = [];
    this.maxMemoryEntries = 100; // Limit memory storage to 100 entries
    this.init();
  }

  /**
   * Initialize the logging system
   */
  init() {
    // Ensure logs directory exists
    const logsDir = path.dirname(this.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Load existing history from file
    this.loadFromFile();
  }

  /**
   * Load analysis history from JSON file
   */
  loadFromFile() {
    try {
      if (fs.existsSync(this.logFile)) {
        const data = fs.readFileSync(this.logFile, 'utf8');
        const history = JSON.parse(data);
        this.memoryStore = Array.isArray(history) ? history : [];
        console.log(`Loaded ${this.memoryStore.length} analysis records from file`);
      }
    } catch (error) {
      console.error('Error loading analysis history:', error);
      this.memoryStore = [];
    }
  }

  /**
   * Save analysis history to JSON file
   */
  saveToFile() {
    try {
      fs.writeFileSync(this.logFile, JSON.stringify(this.memoryStore, null, 2));
    } catch (error) {
      console.error('Error saving analysis history:', error);
    }
  }

  /**
   * Log a new analysis result
   * @param {string} filename - Original filename
   * @param {object} result - Analysis result
   * @param {string} timestamp - Analysis timestamp
   */
  logAnalysis(filename, result, timestamp) {
    const logEntry = {
      id: this.generateId(),
      filename: filename,
      originalName: filename,
      prediction: result.prediction,
      confidence: result.confidence,
      risk_level: result.risk || result.risk_level,
      explanation: result.explanation,
      processing_time: result.processing_time || 'N/A',
      timestamp: timestamp || new Date().toISOString(),
      file_size: result.fileSize || result.metadata?.file_size || 'N/A',
      file_type: result.fileType || result.metadata?.file_type || 'N/A'
    };

    // Add to memory store
    this.memoryStore.unshift(logEntry); // Add to beginning (most recent first)

    // Limit memory store size
    if (this.memoryStore.length > this.maxMemoryEntries) {
      this.memoryStore = this.memoryStore.slice(0, this.maxMemoryEntries);
    }

    // Save to file
    this.saveToFile();

    console.log(`Analysis logged: ${filename} - ${result.prediction} (${result.confidence}%)`);
    return logEntry;
  }

  /**
   * Get analysis history
   * @param {number} limit - Maximum number of entries to return
   * @returns {array} Array of analysis entries
   */
  getHistory(limit = 50) {
    return this.memoryStore.slice(0, limit);
  }

  /**
   * Get analysis history by prediction type
   * @param {string} prediction - "Real" or "AI Generated"
   * @param {number} limit - Maximum number of entries to return
   * @returns {array} Filtered analysis entries
   */
  getHistoryByPrediction(prediction, limit = 50) {
    return this.memoryStore
      .filter(entry => entry.prediction === prediction)
      .slice(0, limit);
  }

  /**
   * Get analysis statistics
   * @returns {object} Analysis statistics
   */
  getStatistics() {
    const total = this.memoryStore.length;
    const aiGenerated = this.memoryStore.filter(entry => entry.prediction === 'AI Generated').length;
    const real = this.memoryStore.filter(entry => entry.prediction === 'Real').length;
    const highRisk = this.memoryStore.filter(entry => entry.risk_level === 'High').length;
    const mediumRisk = this.memoryStore.filter(entry => entry.risk_level === 'Medium').length;
    const lowRisk = this.memoryStore.filter(entry => entry.risk_level === 'Low').length;

    return {
      total_analyses: total,
      ai_generated: aiGenerated,
      real: real,
      ai_generated_percentage: total > 0 ? Math.round((aiGenerated / total) * 100) : 0,
      risk_levels: {
        high: highRisk,
        medium: mediumRisk,
        low: lowRisk
      },
      average_confidence: total > 0 
        ? Math.round(this.memoryStore.reduce((sum, entry) => sum + entry.confidence, 0) / total)
        : 0
    };
  }

  /**
   * Clear analysis history
   */
  clearHistory() {
    this.memoryStore = [];
    this.saveToFile();
    console.log('Analysis history cleared');
  }

  /**
   * Generate unique ID for log entries
   * @returns {string} Unique ID
   */
  generateId() {
    return 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get analysis by ID
   * @param {string} id - Analysis ID
   * @returns {object|null} Analysis entry or null if not found
   */
  getAnalysisById(id) {
    return this.memoryStore.find(entry => entry.id === id) || null;
  }

  /**
   * Delete analysis by ID
   * @param {string} id - Analysis ID
   * @returns {boolean} True if deleted, false if not found
   */
  deleteAnalysis(id) {
    const index = this.memoryStore.findIndex(entry => entry.id === id);
    if (index !== -1) {
      this.memoryStore.splice(index, 1);
      this.saveToFile();
      return true;
    }
    return false;
  }
}

module.exports = AnalysisLogger;
