const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { AppError } = require('../middleware/errorHandler');

/**
 * Extract text content from uploaded file based on file type
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} - Extracted text content
 */
const extractTextFromFile = async (file) => {
  const { buffer, mimetype, originalname } = file;

  try {
    switch (mimetype) {
      case 'application/pdf':
        return await extractFromPDF(buffer);
      
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await extractFromWord(buffer);
      
      case 'text/plain':
        return buffer.toString('utf-8');
      
      default:
        throw new AppError(`Unsupported file type: ${mimetype}`, 400);
    }
  } catch (error) {
    console.error(`Error extracting text from ${originalname}:`, error);
    throw new AppError(`Failed to extract text from ${originalname}. Please ensure the file is not corrupted and try again.`, 400);
  }
};

/**
 * Extract text from PDF file
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} - Extracted text
 */
const extractFromPDF = async (buffer) => {
  try {
    const data = await pdf(buffer);
    const text = data.text;
    
    if (!text || text.trim().length === 0) {
      throw new AppError('PDF appears to be empty or contains only images. Please use a text-based PDF.', 400);
    }
    
    return cleanExtractedText(text);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to parse PDF file. The file may be corrupted or password-protected.', 400);
  }
};

/**
 * Extract text from Word document (.doc or .docx)
 * @param {Buffer} buffer - Word document buffer
 * @returns {Promise<string>} - Extracted text
 */
const extractFromWord = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    
    if (!text || text.trim().length === 0) {
      throw new AppError('Word document appears to be empty.', 400);
    }
    
    // Log any conversion messages/warnings
    if (result.messages && result.messages.length > 0) {
      console.log('Word document conversion messages:', result.messages);
    }
    
    return cleanExtractedText(text);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to parse Word document. The file may be corrupted or in an unsupported format.', 400);
  }
};

/**
 * Clean and normalize extracted text
 * @param {string} text - Raw extracted text
 * @returns {string} - Cleaned text
 */
const cleanExtractedText = (text) => {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove special characters that might interfere with analysis
    .replace(/[^\w\s@.-]/g, ' ')
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove multiple consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace
    .trim();
};

/**
 * Validate file before processing
 * @param {Object} file - Multer file object
 * @returns {boolean} - Whether file is valid
 */
const validateFile = (file) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.mimetype)) {
    throw new AppError('Invalid file type. Only PDF, DOC, DOCX, and TXT files are supported.', 400);
  }

  if (file.size > maxSize) {
    throw new AppError('File size too large. Maximum size is 10MB.', 400);
  }

  return true;
};

/**
 * Get file type information
 * @param {string} mimetype - File MIME type
 * @returns {Object} - File type info
 */
const getFileTypeInfo = (mimetype) => {
  const typeMap = {
    'application/pdf': { extension: 'pdf', name: 'PDF Document' },
    'application/msword': { extension: 'doc', name: 'Word Document' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { extension: 'docx', name: 'Word Document' },
    'text/plain': { extension: 'txt', name: 'Text File' }
  };

  return typeMap[mimetype] || { extension: 'unknown', name: 'Unknown' };
};

module.exports = {
  extractTextFromFile,
  extractFromPDF,
  extractFromWord,
  cleanExtractedText,
  validateFile,
  getFileTypeInfo
};