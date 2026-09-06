# Repository Guidelines

## Project Structure & Module Organization

Testing Notes is a software testing course site built with React 19, Vite 7, and Tailwind CSS 4.

- `src/main.jsx` contains the shared layout, course outline, search, navigation, and theme state.
- `src/ChapterOne.jsx` contains the introductory lessons; `src/styles.css` holds shared styles and responsive/theme rules.
- `index.html` and `chapters/software-testing/index.html` are separate page entry points, both loading `src/main.jsx`.
- `vite.config.js` registers production entry points and the Tailwind plugin.
- `dist/` is generated output; `node_modules/` contains installed dependencies. Both are ignored by Git. There are no dedicated test or asset directories.

## Build, Test, and Development Commands

- `npm ci`: install dependencies from the committed lockfile.
- `npm run dev`: start the development server, listening on all interfaces.
- `npm run build`: generate production pages in `dist/`.
- `npm run preview`: serve the production build locally; run the build first.

## Coding Style & Naming Conventions

Use JavaScript ES modules and functional React components. Follow existing two-space indentation in multiline JavaScript, single-quoted strings, and semicolons. Use PascalCase for component names/files, camelCase for variables and functions, and kebab-case for CSS classes. Combine Tailwind utilities with shared CSS where appropriate. No formatter or linter is configured; keep edits focused and match surrounding code.

## Testing Guidelines

No automated test framework, test script, or coverage threshold is configured. For application changes, run `npm run build`, then check the preview at `/` and `/chapters/software-testing/`. Verify direct navigation, refreshes, lesson anchors, search and clearing, chapter expansion, theme persistence, and mobile layouts. Check keyboard access and accessible labels when modifying controls. If introducing automated tests, document the runner, naming convention, and command.

## Commit & Pull Request Guidelines

The available Git history contains only a `.` subject and establishes no useful convention. Write concise, imperative subjects such as `Fix lesson anchor navigation`. Keep commits focused. Pull requests should explain the change, link relevant issues, report validation, and include screenshots for visual changes.

## Architecture Notes

When adding standalone chapters, register their HTML entries in `vite.config.js` and update page selection and navigation in `src/main.jsx`. Preserve direct URLs and stable lesson IDs. Do not edit generated `dist/` files.

## Course Demo and Testing Chapters

All testing chapters use the runnable Node.js + Vite + React + Tailwind app in `demo-store/`. Each chapter must give sequential instructions with real file paths, complete test code or explicit incremental edits, run commands, and expected outcomes. End each implemented testing chapter with a test-code ZIP download. Keep previous chapters' tests as the baseline; do not substitute unrelated toy apps.

The shared sidebar downloads `public/downloads/paper-trail-demo.zip`. Generate archives from maintained source with `python scripts/package-downloads.py`; never include node_modules or dist. The starter omits tests; the Chapter 02 solution packages `demo-store/tests/unit/*.test.js`. Chapter 02 displays these same files via raw imports.

Run `npm test` in `demo-store` for the 28 unit tests. Verify packaged learner steps with `python scripts/verify-downloads.py` and API behavior with `node scripts/verify-demo-api.mjs` from the course root. Build both the demo and the course site when either changes. Payments and in-memory persistence limitations must be described accurately.
