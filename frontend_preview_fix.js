// FIXED updatePreview function for frontend/src/pages/AIPortfolioBuilder.jsx
// Replace the existing updatePreview function with this one

const updatePreview = () => {
  if (!iframeRef.current) {
    console.warn('⚠️ Preview iframe not ready');
    return;
  }

  try {
    const iframe = iframeRef.current;
    
    // Check if we have actual generated code
    const hasGeneratedCode = htmlCode && htmlCode.trim().length > 50;
    
    console.log('🔄 Updating preview:', {
      hasCode: hasGeneratedCode,
      htmlLength: htmlCode?.length || 0,
      cssLength: cssCode?.length || 0,
      jsLength: jsCode?.length || 0
    });

    // Create complete HTML document
    const fullCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio Preview</title>
  <style>
    /* Reset and base styles */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow-x: hidden;
    }

    ${hasGeneratedCode ? cssCode : `
    /* Default preview styles */
    body {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
    }
    .preview-placeholder {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      padding: 3rem;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      max-width: 500px;
    }
    .preview-placeholder h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
      background: linear-gradient(45deg, #fff, #f0f0f0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .preview-placeholder p {
      opacity: 0.8;
      line-height: 1.6;
    }
    `}
  </style>
</head>
<body>
  ${hasGeneratedCode ? htmlCode : `
    <div class="preview-placeholder">
      <h2>✨ Portfolio Preview</h2>
      <p>Your stunning portfolio will appear here once generated. Describe what you'd like to create in the chat!</p>
    </div>
  `}

  <script>
    try {
      ${hasGeneratedCode ? jsCode : `
        console.log('Portfolio preview ready - waiting for generation...');

        document.addEventListener('DOMContentLoaded', function() {
          console.log('Preview placeholder loaded');
          
          document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
              e.preventDefault();
              const target = document.querySelector(this.getAttribute('href'));
              if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
              }
            });
          });
        });
      `}
    } catch (error) {
      console.error('Preview JS Error:', error);
    }
  </script>
</body>
</html>`;

    // Force complete refresh of iframe
    iframe.srcdoc = '';
    
    // Use double RAF for smoother update
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        iframe.srcdoc = fullCode;
        console.log('✅ Preview updated successfully');
      });
    });

  } catch (error) {
    console.error('❌ Preview update error:', error);
  }
};
