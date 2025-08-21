/**
 * Job text normalization utilities for consistent display
 */

/**
 * Parse and normalize requirements/preferred text fields
 * Handles various formats and ensures consistent display
 */
export const parseJobRequirements = (text: string | any): string[] => {
  // Handle null/undefined
  if (!text) {
    return [];
  }

  // Handle array input (sometimes LLM returns array)
  if (Array.isArray(text)) {
    return text
      .map(item => normalizeLineItem(String(item)))
      .filter(line => line.length > 0);
  }

  // Convert to string
  let normalized = String(text);

  // Remove various dash/bullet characters (including Unicode variants)
  const dashPattern = /^[\s\-•․∙※▶▷◆◇○●▪▫■□★☆→⇒➜➤»›]/gm;
  normalized = normalized.replace(dashPattern, '');

  // Remove numbering patterns (1. 2. 1) 2) etc.)
  normalized = normalized.replace(/^\s*\d+[\.)]\s*/gm, '');

  // Check if text has newlines
  if (!normalized.includes('\n')) {
    // No newlines - try to intelligently split
    normalized = splitLongText(normalized);
  }

  // Split by newlines and clean each line
  const lines = normalized
    .split('\n')
    .map(line => normalizeLineItem(line))
    .filter(line => line.length > 0);

  // Additional validation: if we still have very long lines, split them
  const finalLines: string[] = [];
  lines.forEach(line => {
    if (line.length > 150) {
      // Try to split long lines
      const subLines = splitLongText(line).split('\n');
      finalLines.push(...subLines.filter(l => l.length > 0));
    } else {
      finalLines.push(line);
    }
  });

  return finalLines;
};

/**
 * Normalize a single line item
 */
const normalizeLineItem = (line: string): string => {
  // Trim whitespace
  line = line.trim();
  
  // Remove leading dashes/bullets again (safety check)
  line = line.replace(/^[\s\-•․∙※▶▷◆◇○●▪▫■□★☆→⇒➜➤»›]+/, '');
  
  // Remove numbering
  line = line.replace(/^\d+[\.)]\s*/, '');
  
  return line.trim();
};

/**
 * Intelligently split long text without newlines
 */
const splitLongText = (text: string): string => {
  // Try various splitting strategies
  
  // 1. Split by sentence endings (. ! ?)
  let result = text.replace(/([.!?])\s+([A-Z가-힣])/g, '$1\n$2');
  
  // 2. Split by Korean sentence patterns
  // After particles like 을/를/이/가 followed by space and significant text
  result = result.replace(/([가-힣][을를이가])\s+([가-힣A-Z0-9]{2,})/g, '$1\n$2');
  
  // 3. Split by semicolons or commas with significant text after
  result = result.replace(/[;,]\s+([A-Z가-힣0-9]{3,})/g, '\n$1');
  
  // 4. Split by common conjunction patterns
  result = result.replace(/\s+(및|또는|그리고|혹은)\s+/g, '\n');
  
  // 5. Split very long segments by finding natural break points
  const lines = result.split('\n');
  const finalLines: string[] = [];
  
  lines.forEach(line => {
    if (line.length > 150) {
      // Find natural break points (spaces near the middle)
      const midPoint = Math.floor(line.length / 2);
      let breakPoint = line.indexOf(' ', midPoint);
      
      if (breakPoint === -1) {
        // No space found, try comma or other punctuation
        breakPoint = line.indexOf(',', midPoint);
      }
      
      if (breakPoint !== -1 && breakPoint < line.length - 20) {
        finalLines.push(line.substring(0, breakPoint).trim());
        finalLines.push(line.substring(breakPoint + 1).trim());
      } else {
        finalLines.push(line);
      }
    } else {
      finalLines.push(line);
    }
  });
  
  return finalLines.join('\n');
};

/**
 * Validate if text needs normalization
 */
export const needsNormalization = (text: string): boolean => {
  if (!text) return false;
  
  // Check for dash/bullet characters
  if (/^[\s\-•․∙※▶▷◆◇○●]/m.test(text)) {
    return true;
  }
  
  // Check for very long lines without breaks
  const lines = text.split('\n');
  if (lines.some(line => line.length > 150)) {
    return true;
  }
  
  // Check if it's an array (stringified)
  if (text.startsWith('[') && text.endsWith(']')) {
    return true;
  }
  
  return false;
};

/**
 * Format requirements/preferred for display
 * This is the main function to use in components
 */
export const formatJobRequirements = (text: string | any): string[] => {
  try {
    return parseJobRequirements(text);
  } catch (error) {
    console.error('Error parsing job requirements:', error);
    // Fallback: return as single item if parsing fails
    return text ? [String(text)] : [];
  }
};