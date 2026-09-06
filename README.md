# Testing Notes

A seven-chapter software testing course built with React, Vite, and Tailwind. All 37 topics are implemented. Chapters 02–07 build on Paper Trail, the runnable Node.js + React store in `demo-store/`.

## Course development

```sh
npm ci
npm run dev
npm run build
npm run preview
```

The production build emits the home page and all seven standalone entries under `/chapters/`: `software-testing`, `unit-testing`, `integration-testing`, `end-to-end-testing`, `security-testing`, `performance-testing`, and `regression-testing`. Each preserves `lesson-N-M` anchors and supports direct navigation and refresh.

`src/ChapterOne.jsx` through `src/ChapterSeven.jsx` contain the lessons. `src/LessonParts.jsx` renders shared sections and imports maintained test/configuration files as raw text, so the displayed code and downloads stay aligned. `src/main.jsx` owns navigation, search, and themes.

## Demo and test commands

Use Node.js 22.12+ and run these from `demo-store`:

```sh
npm ci
npm run dev
```

Open http://localhost:5174. For production mode, run `npm run build` then `npm start`. Payments are simulated. Sessions, stock, orders, and retry IDs live in memory and reset on server restart. Accounts, durable storage, admin roles, and provider callbacks are not implemented.

```sh
npm test                     # 28 unit cases
npm run test:integration     # 6 real HTTP integration cases
npm run test:security        # 7 API security cases
npm run test:regression      # 3 regression cases
npm run test:api             # all 44 deterministic cases
npx playwright install chromium
npm run test:e2e             # 6 browser cases; builds and starts the app
npm run test:smoke           # 2 tagged browser cases
npm run test:performance -- baseline
```

Node suites use `tests/{unit,integration,security,regression}/*.test.js`. The explicit file-discovery script keeps `npm test` scoped to the 28-unit baseline. Playwright uses `tests/e2e/*.spec.js`, a fresh built server on port 5175, one worker, and no retries. Leave that port free. Run `npx playwright show-report` to inspect results and failure traces.

Performance profiles are `baseline`, `load`, `spike`, and `soak`. They write ignored `performance-PROFILE.json` files and check per-endpoint p95 below the local exercise budget of 500 ms with zero unexpected errors. They are bounded loopback experiments, not production capacity claims.

## Downloads and verification

Run from the course root:

```sh
python scripts/package-downloads.py
python scripts/verify-downloads.py
node scripts/verify-demo-api.mjs
npm run build
```

The sidebar starter ZIP includes source and locked dependencies, but omits tests, browser configuration, workflows, generated reports, node_modules, and dist. Chapter 02 includes its four unit files. Chapters 03–07 provide cumulative test-code ZIPs with prerequisites and commands in `course/{integration,e2e,security,performance,regression}/README.md`. Extract solutions into the existing demo app; do not replace application source.

The verifier installs and builds a freshly extracted starter, checks incremental unit counts and the intentional shipping defect/fix, applies every cumulative solution, verifies its raw source, runs each applicable suite, and checks the smoke tests and baseline load profile. It prints the retained temporary directory. Browser verification requires Chromium; the verifier installs it if needed.

The root `.github/workflows/testing.yml` builds the course and checks the nested demo on pushes and pull requests. The Chapter 07 workflow under `demo-store/.github/` is for learners whose extracted app is a standalone repository. Performance runs only on manual workflow dispatch. Neither workflow deploys.

For UI changes, also inspect direct chapter links, anchors, search/clearing, expansion, theme persistence, keyboard access, and mobile layouts in the production preview. Rebuild downloads whenever maintained test or demo source changes.
