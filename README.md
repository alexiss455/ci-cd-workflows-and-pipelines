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
- `scripts/determine-test.js` reads a commit message and selects a test file (unrecognized messages select all tests).
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

The combined `pipeline.yml` examines the pushed commit's subject/message. These exact formats select an individual test file:

| Commit message | Jest selection |
|---|---|
| `test: calculator` | `tests/calculator.test.js` |
| `test: string` | `tests/string.test.js` |
| `test: user` | `tests/user.test.js` |
| `test: all` | Entire Jest suite |
| `submit-techinical-exam` | Entire Jest suite |

The submission message `submit-techinical-exam` (including this exact spelling) is not a specific `test:` selector, so it uses the default behavior and runs the entire Jest suite. Any other unrecognized push message (for example, `feat: add calculator`) also runs all tests. Pull requests always run all tests, regardless of commit message. ESLint always checks the complete project.

Example:

```bash
git add .
git commit -m "test: calculator"
git push
```

To run all test cases for the technical exam submission, use:

```bash
git add .
git commit -m "submit-techinical-exam"
git push
```

The other examples work the same way:

```bash
git add .
git commit -m "test: string"
git push
```

```bash
git add .
git commit -m "test: all"
git push
```

On push, GitHub Actions reads `github.event.head_commit.message`, selects `tests/calculator.test.js`, and executes that file using Jest with coverage and `--json --outputFile=test-results.json`. Jest's assertion results provide the actual test count; no test count is hardcoded. The score is printed in the Actions log and included in `$GITHUB_STEP_SUMMARY`.

> For multiple commits in one push, selection is based on the head commit only. Use `test: all`, `submit-techinical-exam`, or any non-specific `test:` message to run every test. Pull requests always run every test.

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

All three workflows are separate checks and trigger on pushes and pull requests. The combined pipeline has commit-aware selection only for push events; PR runs always execute all tests.

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
