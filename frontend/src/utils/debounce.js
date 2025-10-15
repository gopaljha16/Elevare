/**
 * Debounce utility function for optimizing performance by limiting function calls
 * @param {Function} func - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} - The debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  
  const debouncedFunction = (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
  
  // Add cancel method to clear pending executions
  debouncedFunction.cancel = () => {
    clearTimeout(timeoutId);
  };
  
  return debouncedFunction;
};

/**
 * Throttle utility function for limiting function execution frequency
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} - The throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Deep comparison utility for detecting meaningful state changes
 * @param {any} obj1 - First object to compare
 * @param {any} obj2 - Second object to compare
 * @returns {boolean} - True if objects are deeply equal
 */
export const deepEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return false;
  
  if (typeof obj1 !== typeof obj2) return false;
  
  if (typeof obj1 !== 'object') return obj1 === obj2;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (let key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
};

/**
 * Creates a debounced state updater that only triggers on meaningful changes
 * @param {Function} updateFunction - The function to call when state should update
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} - Debounced update function
 */
export const createDebouncedUpdater = (updateFunction, delay = 300) => {
  let lastValue = null;
  
  const debouncedUpdate = debounce((newValue) => {
    if (!deepEqual(lastValue, newValue)) {
      lastValue = structuredClone ? structuredClone(newValue) : JSON.parse(JSON.stringify(newValue));
      updateFunction(newValue);
    }
  }, delay);
  
  return debouncedUpdate;
};