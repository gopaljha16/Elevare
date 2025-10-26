/**
 * Sanitize LaTeX content to prevent security issues
 * @param {string} content - Raw LaTeX content
 * @returns {string} - Sanitized LaTeX content
 */
function sanitizeLatex(content) {
    if (typeof content !== 'string') {
        throw new Error('LaTeX content must be a string');
    }

    // List of allowed LaTeX commands
    const allowedCommands = [
        'documentclass',
        'usepackage',
        'begin',
        'end',
        'section',
        'subsection',
        'textbf',
        'textit',
        'underline',
        'item',
        'name',
        'title',
        'address',
        'phone',
        'email',
        'homepage',
        'social',
        'cventry',
        'cvitem',
        'makecvtitle',
        'moderncvstyle',
        'moderncvcolor'
    ];

    // Create a regex pattern for allowed commands
    const allowedPattern = new RegExp(
        `\\\\(${allowedCommands.join('|')})(\\[.*?\\])?(\\{.*?\\})*`,
        'g'
    );

    // Remove potentially dangerous commands
    const sanitized = content
        // Remove write commands
        .replace(/\\write\d*{.*?}/g, '')
        // Remove input/include commands
        .replace(/\\(input|include|includeonly|includegraphics)(\[.*?\])?{.*?}/g, '')
        // Remove verbatim environments
        .replace(/\\begin{verbatim}.*?\\end{verbatim}/gs, '')
        // Remove shell escape commands
        .replace(/\\immediate\s*\\write18{.*?}/g, '')
        // Remove custom definitions
        .replace(/\\def\\.*?{.*?}/g, '')
        // Remove raw TeX commands
        .replace(/\\catcode.*?=/g, '');

    // Keep only allowed commands and basic text
    let safeContent = '';
    let currentPos = 0;

    const matches = [...sanitized.matchAll(allowedPattern)];
    matches.forEach(match => {
        const startPos = match.index;
        // Add text before the command
        safeContent += sanitized.slice(currentPos, startPos);
        // Add the allowed command
        safeContent += match[0];
        currentPos = startPos + match[0].length;
    });

    // Add remaining text
    safeContent += sanitized.slice(currentPos);

    // Final safety checks
    if (safeContent.includes('\\input') ||
        safeContent.includes('\\write') ||
        safeContent.includes('\\catcode')) {
        throw new Error('Potentially unsafe LaTeX content detected');
    }

    return safeContent;
}

module.exports = sanitizeLatex;