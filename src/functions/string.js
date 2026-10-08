'use strict';

function assertString(value) {
  if (typeof value !== 'string') throw new TypeError('value must be a string');
}

function reverseString(value) {
  assertString(value);
  return Array.from(value).reverse().join('');
}

function capitalize(value) {
  assertString(value);
  if (value.length === 0) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function isPalindrome(value) {
  assertString(value);
  const normalized = value.toLocaleLowerCase().replace(/[\s\p{P}\p{S}]/gu, '');
  return normalized === Array.from(normalized).reverse().join('');
}

module.exports = { reverseString, capitalize, isPalindrome };
