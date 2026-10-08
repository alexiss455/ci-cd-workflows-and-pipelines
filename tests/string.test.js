'use strict';

const { reverseString, capitalize, isPalindrome } = require('../src/functions/string');

test('reverses ordinary strings and Unicode code points', () => {
  expect(reverseString('hello')).toBe('olleh');
  expect(reverseString('🙂a')).toBe('a🙂');
});

test('returns an empty string when reversing empty input', () => {
  expect(reverseString('')).toBe('');
});

test('capitalizes only the first character', () => {
  expect(capitalize('hello WORLD')).toBe('Hello WORLD');
  expect(capitalize('')).toBe('');
});

test('rejects non-string values', () => {
  expect(() => capitalize(null)).toThrow(TypeError);
  expect(() => reverseString(12)).toThrow(TypeError);
});

test('identifies palindromes case-insensitively and ignores punctuation', () => {
  expect(isPalindrome('A man, a plan, a canal: Panama!')).toBe(true);
  expect(isPalindrome('race a car')).toBe(false);
});

test('handles empty input as a palindrome', () => {
  expect(isPalindrome('')).toBe(true);
});
