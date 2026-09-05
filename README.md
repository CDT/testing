# Testing Notes

A minimal software testing course outline for experienced developers transitioning into testing and quality engineering, built with Vite, React, and Tailwind CSS. Includes an introductory chapter with three complete lessons, seven TBD chapters, topic search, and responsive navigation. Chapter 01 covers the purpose, importance, and types of testing using checkout examples and expandable exercises. Chapters 02–08 remain TBD.

## Development

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
npm run preview
```

The home page contains only the course outline. Chapter 01 is a standalone page at `/chapters/software-testing/`; topic links open its individual sections. Both pages are emitted by the production build, so direct links and refreshes do not require an SPA fallback.
