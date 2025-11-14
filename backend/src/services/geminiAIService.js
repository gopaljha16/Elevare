const { GoogleGenerativeAI } = require('@google/generative-ai');
const { AppError } = require('../middleware/errorHandler');
const { cacheService } = require('./cacheService');

/**
 * API Key Manager - Handles multi-key rotation and health tracking
 */
class APIKeyManager {
  constructor(apiKeys) {
    if (!Array.isArray(apiKeys) || apiKeys.length === 0) {
      throw new Error('At least one API key is required');
    }
    
    this.apiKeys = apiKeys;
    this.currentKeyIndex = 0;
    this.keyStats = apiKeys.map((key, index) => ({
      keyIndex: index,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      lastUsed: null,
      lastError: null,
      isHealthy: true,
      failureRate: 0
    }));
    
    console.log(`✅ APIKeyManager initialized with ${apiKeys.length} key(s)`);
  }

  getCurrentKey() {
    return this.apiKeys[this.currentKeyIndex];
  }

  getCurrentKeyIndex() {
    return this.currentKeyIndex;
  }

  getNextKey() {
    const startIndex = this.currentKeyIndex;
    let attempts = 0;
    
    // Try to find a healthy key
    while (attempts < this.apiKeys.length) {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
      
      const stats = this.keyStats[this.currentKeyIndex];
      if (stats.isHealthy || stats.failureRate < 0.8) {
        console.log(`🔄 Rotated to API key ${this.currentKeyIndex + 1}/${this.apiKeys.length}`);
        return this.apiKeys[this.currentKeyIndex];
      }
      
      attempts++;
    }
    
    // All keys are unhealthy, reset to start and try anyway
    this.currentKeyIndex = (startIndex + 1) % this.apiKeys.length;
    console.warn(`⚠️ All keys unhealthy, using key ${this.currentKeyIndex + 1} anyway`);
    return this.apiKeys[this.currentKeyIndex];
  }

  rotateKey(reason) {
    const oldIndex = this.currentKeyIndex;
    this.getNextKey();
    console.log(`🔄 Key rotation: ${oldIndex + 1} → ${this.currentKeyIndex + 1} (Reason: ${reason})`);
  }

  recordSuccess(keyIndex = this.currentKeyIndex) {
    const stats = this.keyStats[keyIndex];
    stats.totalRequests++;
    stats.successfulRequests++;
    stats.lastUsed = new Date();
    stats.isHealthy = true;
    stats.failureRate = stats.failedRequests / stats.totalRequests;
  }

  recordFailure(keyIndex = this.currentKeyIndex, error) {
    const stats = this.keyStats[keyIndex];
    stats.totalRequests++;
    stats.failedRequests++;
    stats.lastUsed = new Date();
    stats.lastError = error.message;
    stats.failureRate = stats.failedRequests / stats.totalRequests;
    
    // Mark as unhealthy if failure rate is too high
    if (stats.failureRate > 0.5 && stats.totalRequests > 5) {
      stats.isHealthy = false;
    }
  }

  getKeyHealth(keyIndex) {
    return this.keyStats[keyIndex];
  }

  getUsageStats() {
    return this.keyStats.map(stat => ({
      ...stat,
      successRate: stat.totalRequests > 0 
        ? (stat.successfulRequests / stat.totalRequests * 100).toFixed(2) + '%'
        : 'N/A'
    }));
  }

  resetStats() {
    this.keyStats.forEach(stat => {
      stat.totalRequests = 0;
      stat.successfulRequests = 0;
      stat.failedRequests = 0;
      stat.lastError = null;
      stat.isHealthy = true;
      stat.failureRate = 0;
    });
    console.log('📊 Key statistics reset');
  }

  async validateKey(key) {
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: this.model || 'gemini-1.5-pro' });
      
      const result = await Promise.race([
        model.generateContent({
          contents: [{ role: 'user', parts: [{ text: 'Test' }] }],
          generationConfig: { maxOutputTokens: 10 }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Validation timeout')), 10000)
        )
      ]);
      
      return true;
    } catch (error) {
      console.error(`❌ Key validation failed: ${error.message}`);
      return false;
    }
  }

  async validateAllKeys() {
    console.log('🔍 Validating all API keys...');
    const results = await Promise.all(
      this.apiKeys.map(async (key, index) => ({
        keyIndex: index,
        isValid: await this.validateKey(key)
      }))
    );
    
    const validCount = results.filter(r => r.isValid).length;
    console.log(`✅ ${validCount}/${this.apiKeys.length} keys are valid`);
    
    return results;
  }
}

/**
 * Unified Gemini AI Service - Handles all AI operations with multi-key rotation
 */
class GeminiAIService {
  constructor() {
    console.log('🚀 Initializing Gemini AI Service...');
    
    // Parse API keys from environment
    const apiKeysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
    if (!apiKeysString) {
      console.error('❌ No Gemini API keys found in environment');
      this.isConfigured = false;
      return;
    }
    
    // Support both comma-separated and single key
    const apiKeys = apiKeysString.includes(',') 
      ? apiKeysString.split(',').map(k => k.trim()).filter(k => k)
      : [apiKeysString.trim()];
    
    // Initialize API Key Manager
    try {
      this.keyManager = new APIKeyManager(apiKeys);
      this.isConfigured = true;
    } catch (error) {
      console.error('❌ Failed to initialize API Key Manager:', error.message);
      this.isConfigured = false;
      return;
    }
    
    // Model configuration
    // Available models: gemini-1.5-pro (recommended), gemini-1.5-flash (faster), gemini-2.0-flash-exp (experimental)
    // Note: gemini-1.5-pro is production-ready and most reliable
    this.model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
    console.log(`🎯 Using model: ${this.model}`);
    
    // Generation configurations
    this.defaultConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096,
    };
    
    // Feature-specific configurations
    this.featureConfigs = {
      resume: { temperature: 0.4, maxOutputTokens: 2048 },
      portfolio: { temperature: 0.7, maxOutputTokens: 8192 },
      interview: { temperature: 0.6, maxOutputTokens: 1024 },
      coverLetter: { temperature: 0.5, maxOutputTokens: 1500 },
      chat: { temperature: 0.8, maxOutputTokens: 1024 },
      ats: { temperature: 0.4, maxOutputTokens: 3000 },
      content: { temperature: 0.5, maxOutputTokens: 2048 },
    };
    
    // Retry configuration
    this.retryConfig = {
      attempts: 3,
      delay: 1000,
      timeout: 30000
    };
    
    console.log('✅ Gemini AI Service initialized successfully');
  }

  /**
   * Check if service is available
   */
  isAvailable() {
    return this.isConfigured && this.keyManager;
  }

  /**
   * Get health status
   */
  getHealthStatus() {
    if (!this.isAvailable()) {
      return {
        status: 'unavailable',
        message: 'Service not configured',
        keys: []
      };
    }
    
    return {
      status: 'healthy',
      model: this.model,
      totalKeys: this.keyManager.apiKeys.length,
      currentKeyIndex: this.keyManager.getCurrentKeyIndex(),
      keyStats: this.keyManager.getUsageStats()
    };
  }

  /**
   * Classify error type for appropriate handling
   */
  classifyError(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('quota') || message.includes('exceeded')) {
      return 'quota_exceeded';
    }
    if (message.includes('rate limit') || message.includes('429')) {
      return 'rate_limit';
    }
    if (message.includes('invalid') && message.includes('key')) {
      return 'invalid_key';
    }
    if (message.includes('billing') || message.includes('payment')) {
      return 'billing_error';
    }
    if (message.includes('timeout')) {
      return 'timeout';
    }
    if (message.includes('network') || message.includes('connection')) {
      return 'connection_error';
    }
    
    return 'unknown';
  }

  /**
   * Check if error is retryable
   */
  isRetryable(errorType) {
    return ['quota_exceeded', 'rate_limit', 'connection_error', 'timeout'].includes(errorType);
  }

  /**
   * Check if error should trigger key rotation
   */
  shouldRotateKey(errorType) {
    return ['quota_exceeded', 'rate_limit', 'invalid_key', 'billing_error'].includes(errorType);
  }

  /**
   * Make AI request with retry logic and key rotation
   */
  async _makeRequest(prompt, config = {}) {
    if (!this.isAvailable()) {
      throw new AppError('AI service not configured', 503);
    }
    
    const finalConfig = { ...this.defaultConfig, ...config };
    let lastError;
    let attemptCount = 0;
    
    while (attemptCount < this.retryConfig.attempts) {
      const currentKeyIndex = this.keyManager.getCurrentKeyIndex();
      
      try {
        const startTime = Date.now();
        
        // Initialize Gemini with current key
        const genAI = new GoogleGenerativeAI(this.keyManager.getCurrentKey());
        const model = genAI.getGenerativeModel({ model: this.model });
        
        console.log(`🤖 AI Request (attempt ${attemptCount + 1}, key ${currentKeyIndex + 1})`);
        
        // Make request with timeout
        const result = await Promise.race([
          model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: finalConfig,
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), this.retryConfig.timeout)
          )
        ]);
        
        const response = await result.response;
        const text = response.text();
        
        const processingTime = Date.now() - startTime;
        
        // Record success
        this.keyManager.recordSuccess(currentKeyIndex);
        
        console.log(`✅ AI Request successful (${processingTime}ms, key ${currentKeyIndex + 1})`);
        
        return text;
        
      } catch (error) {
        lastError = error;
        attemptCount++;
        
        // Record failure
        this.keyManager.recordFailure(currentKeyIndex, error);
        
        // Classify error
        const errorType = this.classifyError(error);
        console.warn(`⚠️ AI Request failed (attempt ${attemptCount}, key ${currentKeyIndex + 1}): ${errorType}`);
        
        // Rotate key if needed
        if (this.shouldRotateKey(errorType)) {
          this.keyManager.rotateKey(errorType);
        }
        
        // Don't retry if not retryable or out of attempts
        if (!this.isRetryable(errorType) || attemptCount >= this.retryConfig.attempts) {
          break;
        }
        
        // Wait before retry with exponential backoff
        const delay = this.retryConfig.delay * Math.pow(2, attemptCount - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // All attempts failed
    console.error(`❌ All AI request attempts failed after ${attemptCount} tries`);
    
    // Check if all keys are exhausted
    const allKeysUnhealthy = this.keyManager.keyStats.every(stat => !stat.isHealthy);
    if (allKeysUnhealthy) {
      throw new AppError('All Gemini API keys exhausted. Please add new API keys.', 503);
    }
    
    throw new AppError(`AI service temporarily unavailable: ${lastError.message}`, 503);
  }

  /**
   * Generate content with caching support
   */
  async generateContent(prompt, config = {}, cacheOptions = null) {
    if (cacheOptions) {
      const cacheKey = cacheService.generateKey(cacheOptions.feature, cacheOptions.input);
      
      return await cacheService.getOrSet(
        cacheKey,
        async () => {
          const text = await this._makeRequest(prompt, config);
          return { text, cached: false };
        },
        {
          memoryTTL: cacheOptions.memoryTTL || 300,
          redisTTL: cacheOptions.redisTTL || 3600
        }
      );
    }
    
    const text = await this._makeRequest(prompt, config);
    return { text, cached: false };
  }

  /**
   * Get current key index (for monitoring)
   */
  getCurrentKeyIndex() {
    return this.keyManager ? this.keyManager.getCurrentKeyIndex() : -1;
  }

  /**
   * Get key statistics (for monitoring)
   */
  getKeyStatistics() {
    return this.keyManager ? this.keyManager.getUsageStats() : [];
  }
}

// Create singleton instance
const geminiAIService = new GeminiAIService();

module.exports = geminiAIService;

// Import prompt builder and response parser
const PromptBuilder = require('./promptBuilder');
const ResponseParser = require('./responseParser');

/**
 * Feature-Specific AI Methods
 * All methods use gemini-2.5-pro model exclusively
 */

// Resume Builder Methods
geminiAIService.generateResumeContent = async function(resumeData, context = '') {
  if (!this.isAvailable()) {
    throw new AppError('AI service not available', 503);
  }

  const prompt = PromptBuilder.buildResumePrompt(resumeData, context);
  const config = this.featureConfigs.resume;

  try {
    const result = await this.generateContent(prompt, config, {
      feature: 'resume_generation',
      input: resumeData,
      memoryTTL: 300,
      redisTTL: 1800
    });

    return ResponseParser.parseResumeContent(result.text);
  } catch (error) {
    console.error('Resume generation failed:', error);
    throw error;
  }
};

geminiAIService.analyzeATSScore = async function(resumeText) {
  if (!this.isAvailable()) {
    throw new AppError('AI service not available', 503);
  }

  const prompt = PromptBuilder.buildATSAnalysisPrompt(resumeText);
  const config = this.featureConfigs.ats;

  try {
    const result = await this.generateContent(prompt, config, {
      feature: 'ats_analysis',
      input: resumeText,
      memoryTTL: 300,
      redisTTL: 1800
    });

    return ResponseParser.parseATSAnalysis(result.text);
  } catch (error) {
    console.error('ATS analysis failed:', error);
    throw error;
  }
};

geminiAIService.optimizeResumeContent = async function(resumeData, jobDescription) {
  if (!this.isAvailable()) {
    throw new AppError('AI service not available', 503);
  }

  const prompt = PromptBuilder.buildResumeOptimizationPrompt(resumeData, jobDescription);
  const config = this.featureConfigs.resume;

  try {
    const result = await this.generateContent(prompt, config);
    return ResponseParser.parseJSON(result.text);
  } catch (error) {
    console.error('Resume optimization failed:', error);
    throw error;
  }
};

// Portfolio Builder Methods
geminiAIService.generatePortfolioCode = async function(description, userName, currentCode = null, isImprovement = false) {
  if (!this.isAvailable()) {
    throw new AppError('AI service not available', 503);
  }

  const prompt = isImprovement && currentCode
    ? PromptBuilder.buildPortfolioImprovementPrompt(currentCode, description)
    : PromptBuilder.buildPortfolioPrompt(description, userName);
  
  const config = this.featureConfigs.portfolio;

  try {
    const result = await this.generateContent(prompt, config, {
      feature: 'portfolio_generation',
      input: { description, userName, isImprovement },
      memoryTTL: 600,
      redisTTL: 3600
    });

    return ResponseParser.parsePortfolioCode(result.text);
  } catch (error) {
    console.error('Portfolio generation failed:', error);
    throw error;
  }
};

// Interview Prep Methods
geminiAIService.generateInterviewQuestions = async function(params) {
  if (!this.isAvailable()) {
    throw new AppError('AI service not available', 503);
  }

  const prompt = PromptBuilder.buildQuestionGenerationPrompt(params);
  const config = this.featureConfigs.interview;

  try {
    const result = await this.generateContent(prompt, config, {
      feature: 'interview_questions',
      input: params,
      memoryTTL: 3600,
      redisTTL: 86400
    });

    return ResponseParser.parseInterviewQuestions(result.text);
  } catch (error) {
    console.error('Interview question generation failed:', error);
    throw error;
  }
};

geminiAIService.evaluateInterviewAnswer = async function(question, userAnswer, questionType) {
  if (!this.isAvailable()) {
    throw new AppError('AI service not available', 503);
  }

  const prompt = PromptBuilder.buildAnswerEvaluationPrompt(question, userAnswer, questionType);
  const config = this.featureConfigs.interview;

  try {
    const result = await this.generateContent(prompt, config);
    return ResponseParser.parseAnswerEvaluation(result.text);
  } catch (error) {
    console.error('Answer evaluation failed:', error);
    throw error;
  }
};

// Cover Letter Methods
geminiAIService.generateCoverLetter = async function(resumeData, jobDescription, companyInfo = '') {
  if (!this.isAvailable()) {
    throw new AppError('AI service not available', 503);
  }

  const prompt = PromptBuilder.buildCoverLetterPrompt(resumeData, jobDescription, companyInfo);
  const config = this.featureConfigs.coverLetter;

  try {
    const result = await this.generateContent(prompt, config);
    return ResponseParser.parseCoverLetter(result.text);
  } catch (error) {
    console.error('Cover letter generation failed:', error);
    throw error;
  }
};

// Content Enhancement Methods
geminiAIService.polishContent = async function(content, type = 'general') {
  if (!this.isAvailable()) {
    throw new AppError('AI service not available', 503);
  }

  const prompt = PromptBuilder.buildContentPolishPrompt(content, type);
  const config = this.featureConfigs.content;

  try {
    const result = await this.generateContent(prompt, config, {
      feature: 'content_polish',
      input: content,
      memoryTTL: 300,
      redisTTL: 1800
    });

    return ResponseParser.parsePolishedContent(result.text);
  } catch (error) {
    console.error('Content polishing failed:', error);
    throw error;
  }
};

geminiAIService.generateSkills = async function(role, experienceLevel) {
  if (!this.isAvailable()) {
    throw new AppError('AI service not available', 503);
  }

  const prompt = PromptBuilder.buildSkillGenerationPrompt(role, experienceLevel);
  const config = this.featureConfigs.content;

  try {
    const result = await this.generateContent(prompt, config, {
      feature: 'skill_generation',
      input: { role, experienceLevel },
      memoryTTL: 1800,
      redisTTL: 3600
    });

    return ResponseParser.parseSkills(result.text);
  } catch (error) {
    console.error('Skill generation failed:', error);
    throw error;
  }
};

geminiAIService.createLearningRoadmap = async function(currentSkills, targetRole, targetCompany = '') {
  if (!this.isAvailable()) {
    throw new AppError('AI service not available', 503);
  }

  const prompt = PromptBuilder.buildRoadmapPrompt(currentSkills, targetRole, targetCompany);
  const config = this.featureConfigs.content;

  try {
    const result = await this.generateContent(prompt, config, {
      feature: 'learning_roadmap',
      input: { currentSkills, targetRole, targetCompany },
      memoryTTL: 1800,
      redisTTL: 3600
    });

    return ResponseParser.parseRoadmap(result.text);
  } catch (error) {
    console.error('Roadmap creation failed:', error);
    throw error;
  }
};

geminiAIService.generateProjectDescription = async function(project) {
  if (!this.isAvailable()) {
    throw new AppError('AI service not available', 503);
  }

  const prompt = PromptBuilder.buildProjectDescriptionPrompt(project);
  const config = this.featureConfigs.content;

  try {
    const result = await this.generateContent(prompt, config);
    return ResponseParser.parseProjectDescription(result.text);
  } catch (error) {
    console.error('Project description generation failed:', error);
    throw error;
  }
};

geminiAIService.analyzeSkillGaps = async function(userSkills, targetRole, targetCompany = '') {
  if (!this.isAvailable()) {
    throw new AppError('AI service not available', 503);
  }

  const prompt = PromptBuilder.buildSkillGapAnalysisPrompt(userSkills, targetRole, targetCompany);
  const config = this.featureConfigs.content;

  try {
    const result = await this.generateContent(prompt, config);
    return ResponseParser.parseSkillGapAnalysis(result.text);
  } catch (error) {
    console.error('Skill gap analysis failed:', error);
    throw error;
  }
};

// Chat Methods
geminiAIService.chatResponse = async function(message, context = {}, history = []) {
  if (!this.isAvailable()) {
    throw new AppError('AI service not available', 503);
  }

  const prompt = PromptBuilder.buildChatPrompt(message, context, history);
  const config = this.featureConfigs.chat;

  try {
    const result = await this.generateContent(prompt, config);
    return ResponseParser.parseChatResponse(result.text);
  } catch (error) {
    console.error('Chat response generation failed:', error);
    throw error;
  }
};

module.exports = geminiAIService;
