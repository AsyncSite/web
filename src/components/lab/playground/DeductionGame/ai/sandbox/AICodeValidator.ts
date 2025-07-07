export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ComplexityMetrics {
  lines: number;
  loops: number;
  functions: number;
  complexity: number;
}

export class AICodeValidator {
  private static readonly FORBIDDEN_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
    { pattern: /eval\s*\(/g, message: 'eval() is not allowed' },
    { pattern: /Function\s*\(/g, message: 'Function constructor is not allowed' },
    { pattern: /setTimeout/g, message: 'setTimeout is not allowed' },
    { pattern: /setInterval/g, message: 'setInterval is not allowed' },
    { pattern: /setImmediate/g, message: 'setImmediate is not allowed' },
    { pattern: /fetch\s*\(/g, message: 'fetch() is not allowed' },
    { pattern: /XMLHttpRequest/g, message: 'XMLHttpRequest is not allowed' },
    { pattern: /import\s+/g, message: 'import statements are not allowed' },
    { pattern: /require\s*\(/g, message: 'require() is not allowed' },
    { pattern: /process\./g, message: 'process object is not allowed' },
    { pattern: /global\./g, message: 'global object is not allowed' },
    { pattern: /window\./g, message: 'window object is not allowed' },
    { pattern: /document\./g, message: 'document object is not allowed' },
    { pattern: /self\./g, message: 'self object is not allowed' },
    { pattern: /__proto__/g, message: '__proto__ is not allowed' },
    { pattern: /constructor\s*\[/g, message: 'constructor property access is not allowed' },
    { pattern: /\.constructor/g, message: 'constructor property is not allowed' },
    { pattern: /new\s+Worker/g, message: 'Worker is not allowed' },
    { pattern: /postMessage/g, message: 'postMessage is not allowed' },
    { pattern: /localStorage/g, message: 'localStorage is not allowed' },
    { pattern: /sessionStorage/g, message: 'sessionStorage is not allowed' },
    { pattern: /indexedDB/g, message: 'indexedDB is not allowed' },
    { pattern: /crypto\./g, message: 'crypto object is not allowed' },
    { pattern: /WebAssembly/g, message: 'WebAssembly is not allowed' },
    { pattern: /SharedArrayBuffer/g, message: 'SharedArrayBuffer is not allowed' },
    { pattern: /Atomics/g, message: 'Atomics is not allowed' },
  ];

  private static readonly MAX_CODE_LENGTH = 10000;
  private static readonly MAX_LINES = 500;
  private static readonly MAX_LOOP_DEPTH = 5;
  private static readonly MAX_FUNCTION_DEPTH = 10;

  static validate(code: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Check code length
    if (code.length > this.MAX_CODE_LENGTH) {
      errors.push(
        `Code exceeds maximum length (${code.length}/${this.MAX_CODE_LENGTH} characters)`,
      );
    }

    // 2. Check line count
    const lines = code.split('\n');
    if (lines.length > this.MAX_LINES) {
      errors.push(`Code exceeds maximum lines (${lines.length}/${this.MAX_LINES} lines)`);
    }

    // 3. Check for forbidden patterns
    for (const { pattern, message } of this.FORBIDDEN_PATTERNS) {
      if (pattern.test(code)) {
        errors.push(message);
      }
    }

    // 4. Check syntax
    try {
      // Use Function constructor to check syntax (in real implementation, this would be in a sandbox)
      new Function(code);
    } catch (e: any) {
      errors.push(`Syntax error: ${e.message}`);
    }

    // 5. Check for makeGuess function
    if (!code.includes('function makeGuess') && !code.includes('makeGuess =')) {
      errors.push('makeGuess function not found');
    }

    // 6. Check for infinite loops (basic heuristic)
    const loopPatterns = [
      /while\s*\(\s*true\s*\)/g,
      /while\s*\(\s*1\s*\)/g,
      /for\s*\(\s*;\s*;\s*\)/g,
    ];

    for (const pattern of loopPatterns) {
      if (pattern.test(code)) {
        warnings.push('Potential infinite loop detected');
      }
    }

    // 7. Check complexity
    const complexity = this.analyzeComplexity(code);
    if (complexity.complexity > 100) {
      warnings.push(`High code complexity detected (score: ${complexity.complexity})`);
    }

    // 8. Check for suspicious patterns
    const suspiciousPatterns = [
      { pattern: /\bthis\b/g, message: 'Use of "this" keyword may cause issues' },
      { pattern: /\barguments\b/g, message: 'Use of "arguments" object is discouraged' },
      { pattern: /\.call\s*\(/g, message: 'Use of .call() is suspicious' },
      { pattern: /\.apply\s*\(/g, message: 'Use of .apply() is suspicious' },
      { pattern: /\.bind\s*\(/g, message: 'Use of .bind() may affect performance' },
    ];

    for (const { pattern, message } of suspiciousPatterns) {
      if (pattern.test(code)) {
        warnings.push(message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  private static analyzeComplexity(code: string): ComplexityMetrics {
    const lines = code.split('\n').length;
    const loops = (code.match(/\b(for|while|do)\b/g) || []).length;
    const functions = (code.match(/\bfunction\b/g) || []).length;
    const conditionals = (code.match(/\b(if|else|switch|case)\b/g) || []).length;

    // Simple cyclomatic complexity estimation
    const complexity = 1 + conditionals + loops;

    return {
      lines,
      loops,
      functions,
      complexity,
    };
  }

  static preprocessCode(code: string): string {
    // Remove comments
    let processed = code
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, ''); // Remove line comments

    // Trim whitespace
    processed = processed.trim();

    // Ensure code ends with the makeGuess function being accessible
    if (!processed.includes('return makeGuess') && processed.includes('function makeGuess')) {
      processed +=
        '\n\n// Auto-added by preprocessor\nif (typeof makeGuess === "function") { makeGuess; }';
    }

    return processed;
  }
}
