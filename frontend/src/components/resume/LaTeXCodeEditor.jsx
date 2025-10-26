import React, { forwardRef, useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';

/**
 * LaTeX Code Editor with Syntax Highlighting
 * Mimics Overleaf's code editor experience
 */
const LaTeXCodeEditor = forwardRef(({ 
  code, 
  onChange, 
  theme = 'light', 
  fontSize = 14,
  className 
}, ref) => {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);

  // Sync scroll between textarea and highlight layer
  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Handle tab key for indentation
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      onChange(newValue);
      
      // Set cursor position after tab
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Syntax highlighting for LaTeX
  const highlightLatex = (text) => {
    return text
      // Commands
      .replace(/\\([a-zA-Z]+)(\*?)/g, '<span class="latex-command">\\$1$2</span>')
      // Environments
      .replace(/\\(begin|end)\{([^}]+)\}/g, '<span class="latex-environment">\\$1</span><span class="latex-brace">{</span><span class="latex-env-name">$2</span><span class="latex-brace">}</span>')
      // Comments
      .replace(/%.*/g, '<span class="latex-comment">$&</span>')
      // Braces
      .replace(/[{}]/g, '<span class="latex-brace">$&</span>')
      // Math mode
      .replace(/\$([^$]+)\$/g, '<span class="latex-math">$$1$</span>')
      // Options in square brackets
      .replace(/\[([^\]]+)\]/g, '<span class="latex-option">[$1]</span>')
      // Line breaks
      .replace(/\n/g, '<br>');
  };

  return (
    <div className={cn("relative flex-1 flex flex-col", className)}>
      {/* Editor Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">main.tex</span>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>LaTeX</span>
            <span>•</span>
            <span>UTF-8</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="text-xs text-gray-500 hover:text-gray-700">
            Font Size: {fontSize}px
          </button>
          <button className="text-xs text-gray-500 hover:text-gray-700">
            Theme: {theme}
          </button>
        </div>
      </div>

      {/* Code Editor Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Line Numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-50 border-r border-gray-200 z-10">
          <div className="p-2 text-xs text-gray-500 font-mono leading-relaxed">
            {code.split('\n').map((_, index) => (
              <div key={index} className="text-right pr-2">
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Syntax Highlighting Layer */}
        <div 
          ref={highlightRef}
          className="absolute left-12 top-0 right-0 bottom-0 overflow-auto pointer-events-none z-5"
          style={{ fontSize: `${fontSize}px` }}
        >
          <div 
            className="p-4 font-mono leading-relaxed whitespace-pre-wrap text-transparent"
            dangerouslySetInnerHTML={{ __html: highlightLatex(code) }}
          />
        </div>

        {/* Actual Textarea */}
        <textarea
          ref={(el) => {
            textareaRef.current = el;
            if (ref) ref.current = el;
          }}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          className={cn(
            "absolute left-12 top-0 right-0 bottom-0 w-full h-full",
            "p-4 font-mono leading-relaxed resize-none border-none outline-none",
            "bg-transparent text-transparent caret-gray-900 z-10",
            "selection:bg-blue-200"
          )}
          style={{ fontSize: `${fontSize}px` }}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />

        {/* Overlay for actual text rendering */}
        <div 
          className="absolute left-12 top-0 right-0 bottom-0 overflow-auto pointer-events-none z-15"
          style={{ fontSize: `${fontSize}px` }}
        >
          <div className="p-4 font-mono leading-relaxed whitespace-pre-wrap">
            <LatexSyntaxHighlight code={code} />
          </div>
        </div>
      </div>

      {/* LaTeX Syntax Styles */}
      <style jsx>{`
        .latex-command {
          color: #0066cc;
          font-weight: 600;
        }
        .latex-environment {
          color: #cc6600;
          font-weight: 600;
        }
        .latex-env-name {
          color: #009900;
          font-weight: 500;
        }
        .latex-brace {
          color: #666666;
          font-weight: bold;
        }
        .latex-comment {
          color: #999999;
          font-style: italic;
        }
        .latex-math {
          color: #cc0066;
          background-color: #fff5f5;
          padding: 1px 2px;
          border-radius: 2px;
        }
        .latex-option {
          color: #6600cc;
        }
      `}</style>
    </div>
  );
});

/**
 * LaTeX Syntax Highlighting Component
 */
const LatexSyntaxHighlight = ({ code }) => {
  const highlightedCode = code
    // Commands
    .replace(/\\([a-zA-Z]+)(\*?)/g, '<span class="latex-command">\\$1$2</span>')
    // Environments
    .replace(/\\(begin|end)\{([^}]+)\}/g, '<span class="latex-environment">\\$1</span><span class="latex-brace">{</span><span class="latex-env-name">$2</span><span class="latex-brace">}</span>')
    // Comments
    .replace(/%.*/g, '<span class="latex-comment">$&</span>')
    // Braces
    .replace(/([{}])/g, '<span class="latex-brace">$1</span>')
    // Math mode
    .replace(/\$([^$]+)\$/g, '<span class="latex-math">$$1$</span>')
    // Options in square brackets
    .replace(/\[([^\]]+)\]/g, '<span class="latex-option">[$1]</span>');

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  );
};

LaTeXCodeEditor.displayName = 'LaTeXCodeEditor';

export default LaTeXCodeEditor;