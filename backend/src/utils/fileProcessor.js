const mammoth = require('mammoth');
const { AppError } = require('../middleware/errorHandler');

// Lazy load pdf-parse to avoid startup errors if native dependencies are missing
let pdfParse = null;
let pdfParseAttempted = false;

const loadPdfParse = () => {
  if (pdfParseAttempted) {
    return pdfParse;
  }
  
  pdfParseAttempted = true;
  
  try {
    pdfParse = require('pdf-parse');
    console.log('✅ pdf-parse loaded successfully');
  } catch (error) {
    console.warn('⚠️ pdf-parse not available - PDF parsing will use fallback');
    console.warn('Error:', error.message);
    pdfParse = null;
  }
  
  return pdfParse;
};

// Try to load pdf-parse on module load
loadPdfParse();

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
  const pdf = loadPdfParse();
  
  if (!pdf) {
    throw new AppError(
      'PDF parsing is currently unavailable on this server. Please upload a Word document (.docx) or text file (.txt) instead.',
      503
    );
  }
  
  try {
    console.log('📄 Starting PDF extraction, buffer size:', buffer.length);
    
    // pdf-parse options for better extraction
    const options = {
      // Limit pages to prevent timeout on large documents
      max: 10,
      // Custom page render function for better text extraction
      pagerender: function(pageData) {
        return pageData.getTextContent()
          .then(function(textContent) {
            let lastY, text = '';
            for (let item of textContent.items) {
              if (lastY == item.transform[5] || !lastY) {
                text += item.str;
              } else {
                text += '\n' + item.str;
              }
              lastY = item.transform[5];
            }
            return text;
          });
      }
    };
    
    const data = await pdf(buffer, options);
    let text = data.text;
    
    console.log('📄 PDF extraction result:', {
      pages: data.numpages,
      textLength: text?.length || 0,
      info: data.info?.Title || 'No title'
    });
    
    if (!text || text.trim().length === 0) {
      throw new AppError('PDF appears to be empty or contains only images. Please use a text-based PDF or try uploading a DOCX file.', 400);
    }
    
    // If text is very short, it might be a scanned PDF
    if (text.trim().length < 50) {
      throw new AppError('PDF contains very little text. It may be a scanned document. Please use a text-based PDF or upload a DOCX/TXT file.', 400);
    }
    
    return cleanExtractedText(text);
  } catch (error) {
    console.error('PDF extraction error:', error);
    if (error instanceof AppError) throw error;
    
    // Provide more specific error messages
    if (error.message?.includes('password')) {
      throw new AppError('PDF is password-protected. Please remove the password and try again.', 400);
    }
    if (error.message?.includes('Invalid')) {
      throw new AppError('PDF file appears to be corrupted or invalid. Please try a different file.', 400);
    }
    
    throw new AppError('Failed to parse PDF file. Please try uploading a DOCX or TXT file instead.', 400);
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
    // Normalize line breaks first
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove null bytes and other control characters (except newlines and tabs)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Replace multiple spaces with single space (but preserve newlines)
    .replace(/[^\S\n]+/g, ' ')
    // Remove multiple consecutive newlines (more than 2)
    .replace(/\n{3,}/g, '\n\n')
    // Trim each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Final trim
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
  const minSize = 100; // Minimum 100 bytes

  if (!file) {
    throw new AppError('No file provided.', 400);
  }

  if (!allowedTypes.includes(file.mimetype)) {
    throw new AppError(`Invalid file type: ${file.mimetype}. Only PDF, DOC, DOCX, and TXT files are supported.`, 400);
  }

  if (file.size > maxSize) {
    throw new AppError(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of 10MB.`, 400);
  }

  if (file.size < minSize) {
    throw new AppError('File appears to be empty or too small.', 400);
  }

  // Check if PDF parsing is available for PDF files
  if (file.mimetype === 'application/pdf') {
    const pdf = loadPdfParse();
    if (!pdf) {
      console.warn('⚠️ PDF parsing unavailable, user should upload DOCX/TXT');
      throw new AppError(
        'PDF parsing is currently unavailable on this server. Please upload a Word document (.docx) or text file (.txt) instead.',
        503
      );
    }
  }

  console.log('✅ File validation passed:', {
    name: file.originalname,
    type: file.mimetype,
    size: `${(file.size / 1024).toFixed(2)}KB`
  });

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