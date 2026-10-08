'use strict';

const { add, subtract, multiply, divide } = require('../src/functions/calculator');

test('adds positive and negative numbers', () => {
  expect(add(2, 3)).toBe(5);
  expect(add(-2, 3)).toBe(1);
});

test('subtracts values and supports negative results', () => {
  expect(subtract(5, 3)).toBe(2);
  expect(subtract(0, 1)).toBe(-1);
});

test('multiplies values including zero', () => {
  expect(multiply(-2, 3)).toBe(-6);
  expect(multiply(9, 0)).toBe(0);
});

test('divides values', () => {
  expect(divide(8, 2)).toBe(4);
});

test('rejects division by zero', () => {
  expect(() => divide(4, 0)).toThrow(RangeError);
});

test('rejects non-finite or non-numeric operands', () => {
  expect(() => add('2', 2)).toThrow(TypeError);
  expect(() => multiply(Infinity, 2)).toThrow(TypeError);
});
