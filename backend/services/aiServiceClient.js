/**
 * AI Service Client - Connects to Flask microservice for AI processing
 */

const axios = require('axios');

class AIServiceClient {
  constructor() {
    this.baseURL = process.env.AI_SERVICE_URL || 'http://localhost:5001';
    this.timeout = parseInt(process.env.AI_SERVICE_TIMEOUT) || 30000; // 30 seconds
    this.retries = parseInt(process.env.AI_SERVICE_RETRIES) || 3;
    
    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NeuroX-Backend/1.0'
      }
    });
    
    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[AI Service] Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[AI Service] Request Error:', error.message);
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[AI Service] Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('[AI Service] Response Error:', error.message);
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Check if AI service is healthy
   * @returns {Promise<boolean>} Health status
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.status === 200 && response.data.status === 'healthy';
    } catch (error) {
      console.error('[AI Service] Health check failed:', error.message);
      return false;
    }
  }
  
  /**
   * Get AI service information
   * @returns {Promise<object>} Service information
   */
  async getInfo() {
    try {
      const response = await this.client.get('/info');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to get service info');
    } catch (error) {
      console.error('[AI Service] Get info failed:', error.message);
      throw error;
    }
  }
  
  /**
   * Make prediction request to AI service
   * @param {object} fileInfo - File information for analysis
   * @returns {Promise<object>} Prediction result
   */
  async predict(fileInfo) {
    const maxRetries = this.retries;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[AI Service] Prediction attempt ${attempt}/${maxRetries}`);
        
        const payload = {
          filename: fileInfo.filename,
          file_size: fileInfo.fileSize,
          file_type: fileInfo.fileType,
          original_name: fileInfo.originalName || fileInfo.filename
        };
        
        const response = await this.client.post('/predict', payload);
        
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.error || 'Prediction failed');
        }
        
      } catch (error) {
        lastError = error;
        console.error(`[AI Service] Prediction attempt ${attempt} failed:`, error.message);
        
        // Don't retry on client errors (4xx)
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`[AI Service] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All retries failed
    throw lastError;
  }
  
  /**
   * Test connection to AI service
   * @returns {Promise<object>} Connection test result
   */
  async testConnection() {
    try {
      const startTime = Date.now();
      const isHealthy = await this.healthCheck();
      const responseTime = Date.now() - startTime;
      
      let serviceInfo = null;
      if (isHealthy) {
        try {
          serviceInfo = await this.getInfo();
        } catch (infoError) {
          console.warn('[AI Service] Could not fetch service info:', infoError.message);
        }
      }
      
      return {
        connected: isHealthy,
        responseTime: responseTime,
        serviceInfo: serviceInfo,
        url: this.baseURL,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        url: this.baseURL,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = AIServiceClient;
