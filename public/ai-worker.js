// AI Code Execution Worker
// This worker runs in an isolated context to safely execute user-provided AI code

// Helper function to validate guess result
function validateGuessResult(result, gameState) {
  // Check if result is an array
  if (!Array.isArray(result)) {
    return false;
  }
  
  // Check if length matches answerCount
  if (result.length !== gameState.answerCount) {
    return false;
  }
  
  // Check if all elements are valid indices
  const keywordCount = gameState.keywords.length;
  for (const idx of result) {
    if (typeof idx !== 'number' || idx < 0 || idx >= keywordCount || !Number.isInteger(idx)) {
      return false;
    }
  }
  
  // Check for duplicates
  const uniqueIndices = new Set(result);
  if (uniqueIndices.size !== result.length) {
    return false;
  }
  
  // Check if any hints are included
  for (const hint of gameState.myHints) {
    if (result.includes(hint)) {
      return false;
    }
  }
  
  return true;
}

// Safe Math object with only allowed methods
const safeMath = {
  abs: Math.abs,
  acos: Math.acos,
  asin: Math.asin,
  atan: Math.atan,
  atan2: Math.atan2,
  ceil: Math.ceil,
  cos: Math.cos,
  exp: Math.exp,
  floor: Math.floor,
  log: Math.log,
  max: Math.max,
  min: Math.min,
  pow: Math.pow,
  random: Math.random,
  round: Math.round,
  sin: Math.sin,
  sqrt: Math.sqrt,
  tan: Math.tan,
  PI: Math.PI,
  E: Math.E
};

// Message handler
self.addEventListener('message', function(event) {
  const { code, gameState, executionId } = event.data;
  
  try {
    // Set up execution timeout
    const timeoutId = setTimeout(function() {
      self.postMessage({
        executionId: executionId,
        error: 'Execution timeout (2 seconds exceeded)'
      });
      self.close();
    }, 2000);
    
    // Create sandbox environment
    const sandbox = {
      // Safe console that posts messages
      console: {
        log: function() {
          const args = Array.prototype.slice.call(arguments);
          self.postMessage({
            type: 'log',
            executionId: executionId,
            data: args
          });
        }
      },
      // Safe Math object
      Math: safeMath,
      // Array constructor
      Array: Array,
      // Other safe constructors
      Set: Set,
      Map: Map,
      Object: Object,
      Number: Number,
      String: String,
      Boolean: Boolean,
      // Iteration protocol
      Symbol: {
        iterator: Symbol.iterator
      }
    };
    
    // Execute the code in sandbox
    const executeCode = new Function(
      'sandbox',
      'gameState',
      'with (sandbox) {' +
        // Disable dangerous globals
        'var window = undefined;' +
        'var self = undefined;' +
        'var global = undefined;' +
        'var globalThis = undefined;' +
        'var process = undefined;' +
        'var require = undefined;' +
        'var module = undefined;' +
        'var exports = undefined;' +
        'var eval = undefined;' +
        'var Function = undefined;' +
        'var setTimeout = undefined;' +
        'var setInterval = undefined;' +
        'var setImmediate = undefined;' +
        'var clearTimeout = undefined;' +
        'var clearInterval = undefined;' +
        'var clearImmediate = undefined;' +
        'var XMLHttpRequest = undefined;' +
        'var fetch = undefined;' +
        'var WebSocket = undefined;' +
        'var Worker = undefined;' +
        'var importScripts = undefined;' +
        'var postMessage = undefined;' +
        'var close = undefined;' +
        'var __proto__ = undefined;' +
        'var constructor = undefined;' +
        // User code
        code + ';' +
        // Return makeGuess function
        'if (typeof makeGuess !== "function") {' +
          'throw new Error("makeGuess function is not defined");' +
        '}' +
        'return makeGuess;' +
      '}'
    );
    
    // Get the makeGuess function
    const makeGuess = executeCode(sandbox, gameState);
    
    // Execute makeGuess with gameState
    const result = makeGuess(gameState);
    
    // Clear timeout
    clearTimeout(timeoutId);
    
    // Validate result
    if (!validateGuessResult(result, gameState)) {
      throw new Error('Invalid guess format: must be an array of ' + gameState.answerCount + ' unique valid indices');
    }
    
    // Send result
    self.postMessage({
      executionId: executionId,
      result: result
    });
    
  } catch (error) {
    self.postMessage({
      executionId: executionId,
      error: error.message || 'Unknown error occurred'
    });
  }
  
  // Close worker
  self.close();
});