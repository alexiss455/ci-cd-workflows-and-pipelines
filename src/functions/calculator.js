'use strict';

function assertFiniteNumber(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
}

function add(a, b) {
  assertFiniteNumber(a, 'a');
  assertFiniteNumber(b, 'b');
  return a + b;
}

function subtract(a, b) {
  assertFiniteNumber(a, 'a');
  assertFiniteNumber(b, 'b');
  return a - b;
}

function multiply(a, b) {
  assertFiniteNumber(a, 'a');
  assertFiniteNumber(b, 'b');
  return a * b;
}

function divide(a, b) {
  assertFiniteNumber(a, 'a');
  assertFiniteNumber(b, 'b');
  if (b === 0) throw new RangeError('Cannot divide by zero');
  return a / b;
}

module.exports = { add, subtract, multiply, divide };
