'use strict';

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');

const suppliedMessage = process.argv.slice(2).join(' ').trim();
let message = suppliedMessage;
if (!message) {
  try {
    message = execFileSync('git', ['log', '-1', '--pretty=%B'], { encoding: 'utf8' }).trim();
  } catch {
    message = '';
  }
}

const match = message.match(/^test:\s*(calculator|string|user|all)\s*$/im);
const selection = match ? match[1].toLowerCase() : 'all';
const testFile = selection === 'all' ? '' : `tests/${selection}.test.js`;

console.log(`Commit message: ${message || '(unavailable)'}`);
console.log(`Test selection: ${selection === 'all' ? 'complete test suite' : testFile}`);
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `selection=${selection}\ntest_file=${testFile}\n`);
}
