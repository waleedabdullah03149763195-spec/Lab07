'use strict';

const calculator = require('./calculator');

// Demonstrate each calculator operation.
console.log('Addition:', calculator.add(12, 4));
console.log('Subtraction:', calculator.subtract(12, 4));
console.log('Multiplication:', calculator.multiply(12, 4));

try {
  console.log('Division:', calculator.divide(12, 4));
  // Uncomment to demonstrate the division-by-zero error handling:
  // calculator.divide(12, 0);
} catch (error) {
  console.error('Division error:', error.message);
}
