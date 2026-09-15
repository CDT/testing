import React from 'react';
import Code from './Code';

const sources = import.meta.glob('../demo-store/tests/**/*.{js,mjs}', { query: '?raw', import: 'default', eager: true });
const configs = import.meta.glob('../demo-store/{playwright.config.js,.github/workflows/testing.yml}', { query: '?raw', import: 'default', eager: true });

export function FileCode({ path }) {
  const source = sources[`../demo-store/${path}`] ?? configs[`../demo-store/${path}`];
  if (source === undefined) throw new Error(`Missing lesson source: ${path}`);
  return <><h3>Create <code>{path}</code></h3><p>Save this complete file relative to your existing <code>demo-store</code> folder. Create any missing parent folders.</p><Code>{source}</Code></>;
}

export function Section({ id, title, children }) {
  return <section id={`lesson-${id.replace('.', '-')}`} className="lesson-section"><span className="lesson-number">{id}</span><h2>{title}</h2>{children}</section>;
}

export function Chapter({ number, title, intro, children }) {
  return <article className="lesson" aria-label={`Chapter ${number}: ${title}`}><header className="lesson-header"><span>Chapter {number} · Paper Trail demo v1.0</span><h1>{title}</h1><p>{intro}</p><blockquote>Continue in the same Paper Trail project. Keep the Chapter 02 unit tests and every later test you have added. All commands on this page run from <code>demo-store</code>, beside <code>package.json</code>.</blockquote></header>{children}</article>;
}

export function Download({ number, slug, next, nextTitle }) {
  return <><h3>Download the completed test code</h3><p><a className="lesson-download" href={`/downloads/chapter-${number}-${slug}-tests.zip`} download>Download Chapter {number} test code (ZIP)</a></p><p>This cumulative solution includes the tests from earlier chapters, supporting configuration, and a chapter README. Extract it into your existing <code>demo-store</code> folder; merge folders and compare files you edited. It does not contain another app or replace production source. Follow the README’s setup commands and keep the previous tests.</p><a className="lesson-next" href={next}>{nextTitle}</a></>;
}
