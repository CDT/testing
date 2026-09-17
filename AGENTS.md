# Repository Guidelines

## Project layout

- `tutorial/` contains the Testing Notes course site, built with React, Vite, and Tailwind CSS.
- `work/` contains supporting Markdown notes and documentation.

## Working in `tutorial/`

- Keep application source changes in `tutorial/src/`; lesson components are named `ChapterOne.jsx` through `ChapterSeven.jsx`, with shared sections in `LessonParts.jsx` and styles in `styles.css`.
- Register new standalone chapter entry points in `tutorial/vite.config.js`, and preserve direct chapter URLs and stable lesson IDs.
- Use ES modules and functional React components. Match the existing two-space indentation, single quotes, semicolons, PascalCase component names, camelCase variables/functions, and kebab-case CSS classes.
- Do not edit generated `tutorial/dist/` files or dependency directories.
- For application changes, run `npm run build` from `tutorial/`. For demo-store changes, run the relevant documented tests and build both the demo and course site when appropriate.
- Package course downloads with `python scripts/package-downloads.py`; do not include `node_modules` or `dist` in archives.

## Documentation and commits

- Keep edits focused and preserve existing content unless the task calls for changing it.
- Use concise, imperative commit subjects when creating commits.
