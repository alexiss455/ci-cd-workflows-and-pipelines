'use strict';

const { validateUser, getUserRole, isAdult } = require('../src/functions/user');

const validUser = { name: 'Ada Lovelace', age: 36, role: 'ADMIN' };

test('validates a complete user', () => {
  expect(validateUser(validUser)).toBe(true);
});

test('rejects missing, malformed, and empty users', () => {
  expect(validateUser(null)).toBe(false);
  expect(validateUser([])).toBe(false);
  expect(validateUser({ ...validUser, name: '  ' })).toBe(false);
  expect(validateUser({ ...validUser, age: 2.5 })).toBe(false);
  expect(validateUser({ ...validUser, role: '' })).toBe(false);
});

test('returns a normalized role for a valid user', () => {
  expect(getUserRole(validUser)).toBe('admin');
});

test('throws when getting role from an invalid user', () => {
  expect(() => getUserRole({})).toThrow(TypeError);
});

test('checks adulthood at the age boundary', () => {
  expect(isAdult({ ...validUser, age: 18 })).toBe(true);
  expect(isAdult({ ...validUser, age: 17 })).toBe(false);
});

test('throws when checking adulthood for an invalid user', () => {
  expect(() => isAdult(null)).toThrow(TypeError);
});
