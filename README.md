# Node.js Testing Pipeline

A production-style example of a JavaScript project using Jest, ESLint, commit-aware test selection, a dynamic test score, coverage thresholds, and GitHub Actions artifacts. All tooling is free and open source.

## Requirements

- Node.js 20 or newer
- npm (bundled with Node.js)
- Git; GitHub Actions runs the CI workflows when pushed to GitHub

## Architecture

- `src/functions/` contains calculator, string, and user-domain functions.
- `src/index.js` exports the function groups for consumers.
- `tests/` contains Jest unit tests; each Jest `test()` declaration counts as one case.
- `scripts/determine-test.js` supports choosing a test file from a message; the GitHub workflows enforce the required submission message and run the complete suite.
- `scripts/calculate-score.js` consumes Jest's JSON output, calculates the score, writes the workflow summary, and enforces score and coverage requirements.
- `.github/workflows/` contains separate test, lint, and combined scoring pipelines.

## Install and run locally

```bash
npm install
npm test
npm run test:coverage
npm run lint
npm run ci
```

`npm run test:coverage` creates `coverage/`, including an HTML report at `coverage/lcov-report/index.html`. Jest is configured with global minimums of 80% for branches, functions, lines, and statements. `npm run ci` runs lint and the full test suite.

## Commit-message test selection

All three workflows require the exact message `submit-technical-exam`. On a push, this must be the commit message; on a pull request, it must be the PR title. A different message causes that workflow to fail before installing dependencies or running tests. With the required message, the combined pipeline runs the complete Jest suite. Pull requests always run the complete suite.

Example:

```bash
git add .
git commit -m "test: calculator"
git push
```

To run all test cases and pass the required message check, use:

```bash
git add .
git commit -m "submit-technical-exam"
git push
```

Do not use other commit messages for submissions: messages such as `test: string` or `test: all` will fail the workflow message check. The `determine-test.js` script can still be run locally to preview per-file selection, but GitHub Actions requires `submit-technical-exam` and runs all tests.

On push, GitHub Actions validates `github.event.head_commit.message` against `submit-technical-exam`, then executes the full suite using Jest with coverage and `--json --outputFile=test-results.json`. Jest's assertion results provide the actual test count; no test count is hardcoded. The score is printed in the Actions log and included in `$GITHUB_STEP_SUMMARY`.

> For multiple commits in one push, the head commit message must be exactly `submit-technical-exam`. Pull request titles must also exactly match this message.

## Scoring and pass/fail policy

Each passed test is worth 10 points and a failed test is worth zero. The percentage score is `round((passedTests / totalTests) * 100)`. Pending/skipped cases are reported separately and do not count as passed; they remain in the total, so they do not earn points. An empty test run scores zero.

Grades are `EXCELLENT` (90–100), `PASS` (80–89), `NEEDS IMPROVEMENT` (70–79), and `FAIL` (0–69). The required score is 80/100. The Jest step is allowed to finish even when tests fail, so the score is still generated and displayed; the score step and a final Jest-result enforcement step ensure the workflow cannot pass with failing tests or a score below the threshold. Coverage must also meet each configured 80% minimum.

Run `node scripts/determine-test.js "test: calculator"` to preview selection. To score an existing JSON report, run `node scripts/calculate-score.js test-results.json`.

## GitHub Actions and artifacts

- `pipeline.yml` is the end-to-end pipeline: checkout, Node setup, `npm ci`, selection, lint, Jest JSON/coverage generation, scoring, summary, and artifact upload.
- `test.yml` runs the full Jest suite as a dedicated test check.
- `lint.yml` runs ESLint as a dedicated lint check.
- All workflow definitions are YAML and use read-only repository permissions.
- The combined pipeline uploads the `coverage/` directory as the **`jest-coverage`** artifact for 14 days. Download it from the workflow run's Artifacts section.
- The Actions summary presents test counts, score, grade, status, and coverage percentages.

All three workflows are separate checks and trigger on pushes and pull requests. Each rejects the run unless the push commit message or pull request title is exactly `submit-technical-exam`. The combined pipeline runs the full test suite for accepted submissions.

## Expanding the pipeline

Keep the stages explicit and add test suites in increasing scope, promoting only after each required stage succeeds:

```text
Unit Tests
    ↓
Integration Tests
    ↓
API Tests
    ↓
E2E Tests
    ↓
Docker
    ↓
Deployment
```

Additional test stages can get separate Jest projects or scripts and independent scores/artifacts. Docker image creation can follow successful E2E checks, with deployment gated on the default branch and protected GitHub environment approvals. Secrets should be stored in GitHub Actions secrets, never committed to the repository.
