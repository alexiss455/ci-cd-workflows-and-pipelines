'use strict';

const fs = require('node:fs');
const path = require('node:path');

const resultsPath = path.resolve(process.argv[2] || 'test-results.json');
const threshold = Number(process.env.MINIMUM_SCORE || 80);

function fail(message) {
  console.error(`Unable to calculate test score: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(resultsPath)) fail(`results file not found: ${resultsPath}`);
let report;
try {
  report = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
} catch (error) {
  fail(error.message);
}

const tests = (report.testResults || []).flatMap((suite) => suite.assertionResults || []);
const total = tests.length;
const passed = tests.filter((test) => test.status === 'passed').length;
const failed = tests.filter((test) => test.status === 'failed').length;
const skipped = tests.filter((test) => ['pending', 'skipped', 'todo'].includes(test.status)).length;
const score = total === 0 ? 0 : Math.round((passed / total) * 100);
const grade = score >= 90 ? 'EXCELLENT' : score >= 80 ? 'PASS' : score >= 70 ? 'NEEDS IMPROVEMENT' : 'FAIL';
const status = score >= threshold ? 'PASS' : 'FAIL';

let coverageRows = '';
const coveragePath = path.resolve('coverage/coverage-summary.json');
let coveragePass = false;
if (fs.existsSync(coveragePath)) {
  const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8')).total;
  const limits = { statements: 80, branches: 80, functions: 80, lines: 80 };
  coveragePass = Object.entries(limits).every(([key, limit]) => coverage[key].pct >= limit);
  coverageRows = Object.entries(limits)
    .map(([key]) => `| ${key[0].toUpperCase()}${key.slice(1)} | ${coverage[key].pct}% |`)
    .join('\n');
}

const output = [
  '====================================',
  '        AUTOMATED TEST SCORE',
  '====================================',
  '',
  `Total Tests : ${total}`,
  `Passed      : ${passed}`,
  `Failed      : ${failed}`,
  `Skipped     : ${skipped}`,
  '',
  `Score       : ${score}/100`,
  `Grade       : ${grade}`,
  `Status      : ${status}`,
  '',
  `Minimum Score Required: ${threshold}`,
  '====================================',
].join('\n');
console.log(output);

if (process.env.GITHUB_STEP_SUMMARY) {
  const summary = [
    '# 🧪 Automated Test Results', '',
    '| Metric | Result |', '|---|---:|',
    `| Total Tests | ${total} |`, `| Passed | ${passed} |`, `| Failed | ${failed} |`,
    `| Skipped | ${skipped} |`, `| Score | ${score}/100 |`, `| Grade | ${grade} |`,
    `| Status | ${status} |`, '', '## Coverage', '',
    '| Metric | Percentage |', '|---|---:|',
    coverageRows || '| Coverage report | Not available |', '',
    `Coverage thresholds (80% each): ${coveragePass ? 'PASS' : 'FAIL / NOT GENERATED'}`,
    `Minimum score: ${threshold}/100`,
  ].join('\n');
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
}

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `score=${score}\nstatus=${status}\ncoverage_pass=${coveragePass}\n`);
}
if (status !== 'PASS' || (fs.existsSync(coveragePath) && !coveragePass)) process.exitCode = 1;
