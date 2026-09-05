import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, BookOpen, ChevronDown, Check, FlaskConical, Moon, Sun, Search, X } from 'lucide-react';
import './styles.css';
import ChapterOne from './ChapterOne';

const chapters = [
  {
    title: 'What is software testing?',
    label: 'Software testing',
    description: 'What software testing is, why it matters, and the types of testing.',
    topics: ['What is software testing?', 'Why is software testing important?', 'What types of testing are there?'],
  },
  ...Array.from({ length: 7 }, () => ({
    title: 'TBD',
    label: 'TBD',
    description: 'Chapter outline to be determined.',
    topics: [],
  })),
];
const count = chapters.reduce((total, chapter) => total + chapter.topics.length, 0);

const chapterPath = '/chapters/software-testing/';
const isChapterPage = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') === chapterPath.slice(0, -1);

function App() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('testing-notes-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* Theme switching still works when storage is unavailable. */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#17201d' : '#fbfcfc');
    try { localStorage.setItem('testing-notes-theme', theme); } catch { /* Storage may be disabled. */ }
  }, [theme]);
  const [open, setOpen] = useState(new Set([0]));
  const [query, setQuery] = useState('');
  useEffect(() => {
    if (window.location.hash) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
    }
  }, []);
  const filtered = chapters.map((chapter, index) => ({ ...chapter, index })).filter(chapter => `${chapter.title} ${chapter.description} ${chapter.topics.join(' ')}`.toLowerCase().includes(query.toLowerCase().trim()));
  function toggle(index) { setOpen(previous => { const next = new Set(previous); next.has(index) ? next.delete(index) : next.add(index); return next; }); }

  return <div className="min-h-screen">
    <header className="site-header"><div className="header-inner flex items-center justify-between"><a href="/" className="brand flex items-center gap-2.5" aria-label="Testing Notes home"><span className="brand-mark"><Check size={19} strokeWidth={2.8}/></span>testing<span className="brand-light">notes</span><span className="small-tag">a learning guide</span></a><div className="header-actions"><a className="header-link flex items-center gap-2" href="/#contents">Course outline <ArrowUpRight size={15}/></a><button type="button" className="theme-toggle" onClick={() => setTheme(current => current === 'light' ? 'dark' : 'light')} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>{theme === 'light' ? <Moon size={17}/> : <Sun size={17}/>}</button></div></div></header>
    <div className="page-shell">
      <aside className="sidebar"><div className="sidebar-sticky"><div className="sidebar-title flex items-center gap-2"><BookOpen size={16}/> The learning path</div><nav aria-label="Chapters">{chapters.map((chapter, index) => <a key={index} href={index === 0 ? chapterPath : `/#chapter-${index}`} aria-current={isChapterPage && index === 0 ? 'page' : undefined} className={`nav-item ${index === 0 ? 'active' : ''}`}><span className="nav-number">{String(index + 1).padStart(2, '0')}</span>{chapter.label}</a>)}</nav><div className="sidebar-note"><span className="note-dot"/> Build on your experience.<br/><span className="note-indent">Develop testing judgment.</span></div></div></aside>
      <main>
        {isChapterPage ? <><a className="lesson-next" href="/#contents">Back to course outline</a><ChapterOne/></> : <>
        <section className="intro"><div className="intro-badge"><span/> For experienced developers</div><h1>From building software<br/>to testing it deeply.</h1><p className="intro-text">A learning path from senior developer to testing specialist. Start with what testing is, why it matters, and the different types. The remaining chapters are to be determined.</p><div className="course-meta flex flex-wrap items-center"><span><BookOpen size={15}/>{chapters.length} chapters</span><span>{count} available topics</span><span>Development experience assumed</span></div></section>
        <div className="notice flex items-start gap-3"><FlaskConical size={19} className="shrink-0 mt-0.5"/><p><strong>Chapter 01 is ready.</strong> Explore the three topics below, with checkout examples and short exercises. Chapters 02–08 are still to be determined.</p></div>
        <section id="contents" className="contents"><div className="contents-heading flex items-center justify-between gap-4"><h2>Table of contents</h2><button className="expand-button" onClick={() => setOpen(open.size === chapters.length ? new Set() : new Set(chapters.map((_, index) => index)))}>{open.size === chapters.length ? 'Collapse all' : 'Expand all'}<ChevronDown size={14} className={open.size === chapters.length ? 'rotated' : ''}/></button></div>
          <div className="search-wrap"><Search size={17}/><input aria-label="Search the course outline" value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a topic..."/>{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={16}/></button>}<span className="search-hint">Explore the outline</span></div>
          <div className="chapter-list">{filtered.map(chapter => { const expanded = open.has(chapter.index) || Boolean(query.trim()); return <article className={`chapter ${expanded ? 'is-open' : ''}`} id={`chapter-${chapter.index}`} key={chapter.index}><h3><button className="chapter-toggle" onClick={() => toggle(chapter.index)} aria-expanded={expanded} aria-controls={`topics-${chapter.index}`}><span className="chapter-number">{String(chapter.index + 1).padStart(2, '0')}</span><span className="chapter-text"><span className="chapter-title">{chapter.title}</span><span className="chapter-description">{chapter.description}</span></span><span className="topic-count">{chapter.topics.length ? `${chapter.topics.length} topics` : 'TBD'}</span><ChevronDown size={17} className={`chapter-chevron ${expanded ? 'rotated' : ''}`}/></button></h3>{expanded && chapter.topics.length > 0 && <ol className="topics" id={`topics-${chapter.index}`}>{chapter.topics.map((topic, index) => <li key={topic}><span className="topic-number">{chapter.index + 1}.{index + 1}</span><a className="topic-link" href={`${chapterPath}#lesson-1-${index + 1}`}>{topic}</a><span className="planned">Read</span></li>)}</ol>}</article>; })}{filtered.length === 0 && <div className="empty"><Search size={24}/><h3>No topics found</h3><p>Try a broader term, like “bugs”, “web”, or “testing”.</p><button onClick={() => setQuery('')}>Show all chapters</button></div>}</div>
        </section>
        </>}
        <footer className="flex flex-wrap items-center justify-between gap-3"><span>Engineering experience. Testing judgment.</span><span>Built for the curious <span className="footer-spark">✳</span></span></footer>
      </main>
    </div>
  </div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
