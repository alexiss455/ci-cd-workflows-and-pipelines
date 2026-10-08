'use strict';

function validateUser(user) {
  if (user === null || typeof user !== 'object' || Array.isArray(user)) return false;
  if (typeof user.name !== 'string' || user.name.trim().length === 0) return false;
  if (!Number.isInteger(user.age) || user.age < 0) return false;
  if (typeof user.role !== 'string' || user.role.trim().length === 0) return false;
  return true;
}

function getUserRole(user) {
  if (!validateUser(user)) throw new TypeError('user must be a valid user object');
  return user.role.trim().toLowerCase();
}

function isAdult(user) {
  if (!validateUser(user)) throw new TypeError('user must be a valid user object');
  return user.age >= 18;
}

module.exports = { validateUser, getUserRole, isAdult };
