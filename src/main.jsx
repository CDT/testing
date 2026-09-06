import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, BookOpen, ChevronDown, ChevronLeft, ChevronRight, Check, FlaskConical, Moon, Sun, Search, X, Download } from 'lucide-react';
import './styles.css';
import ChapterOne from './ChapterOne';
import ChapterTwo from './ChapterTwo';

const chapters = [
  {
    title: 'What is software testing?',
    label: 'Software testing',
    path: '/chapters/software-testing/',
    component: ChapterOne,
    status: 'Read',
    description: 'What software testing is, why it matters, and the types of testing.',
    topics: ['What is software testing?', 'Why is software testing important?', 'What types of testing are there?'],
  },
  {
    title: 'Unit testing',
    label: 'Unit testing',
    path: '/chapters/unit-testing/',
    component: ChapterTwo,
    status: 'Read',
    description: 'Test isolated business rules, boundaries, and invalid inputs.',
    topics: [
      'What belongs in a unit test?',
      'Arrange, act, assert: writing your first test',
      'Testing prices, discounts, taxes, and shipping',
      'Boundary cases and invalid inputs',
      'Test doubles and keeping tests independent',
    ],
  },
  {
    title: 'Integration testing',
    label: 'Integration testing',
    description: 'Verify checkout services, payments, and data work together.',
    topics: [
      'Choosing integration boundaries',
      'Testing APIs and database operations',
      'Connecting checkout, inventory, and orders',
      'Testing payment requests and callbacks',
      'Handling failures, retries, and duplicate events',
      'Managing test data and environments',
    ],
  },
  {
    title: 'End-to-end testing',
    label: 'End-to-end testing',
    description: 'Exercise critical customer journeys through the store.',
    topics: [
      'Defining critical customer journeys',
      'Testing product search and the shopping cart',
      'Completing checkout and verifying the order',
      'Testing declined payments and interrupted checkout',
      'Reliable browser tests: selectors, waits, and isolation',
      'Building a small deployment smoke suite',
    ],
  },
  {
    title: 'Security testing',
    label: 'Security testing',
    description: 'Protect accounts, orders, payments, and administrative access.',
    topics: [
      'Identifying threats and setting up a safe test environment',
      'Testing authentication and sessions',
      'Protecting customer orders and admin functions',
      'Testing price, quantity, and coupon manipulation',
      'Testing injection and cross-site scripting',
      'Checking sensitive data exposure and verifying fixes',
    ],
  },
  {
    title: 'Performance and load testing',
    label: 'Performance and load testing',
    description: 'Measure shopping and checkout under realistic traffic.',
    topics: [
      'Defining response-time, throughput, and error targets',
      'Modeling realistic shopping traffic',
      'Load-testing browsing and checkout',
      'Testing sales spikes, system limits, and sustained load',
      'Finding bottlenecks and measuring improvements',
    ],
  },
  {
    title: 'Regression testing',
    label: 'Regression testing',
    description: 'Choose and maintain checks that catch unintended effects.',
    topics: [
      'Confirmation versus regression testing',
      'Selecting tests based on change impact and risk',
      'Combining unit, integration, E2E, security, and performance checks',
      'Running the right checks in CI and before release',
      'Investigating failures and managing flaky tests',
      'Maintaining the suite as the store evolves',
    ],
  },
];
const count = chapters.reduce((total, chapter) => total + chapter.topics.length, 0);
const availableCount = chapters.filter(chapter => chapter.status === 'Read').reduce((total, chapter) => total + chapter.topics.length, 0);

const currentPath = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '');
const activeChapterIndex = chapters.findIndex(chapter => chapter.path?.slice(0, -1) === currentPath);
const ChapterContent = chapters[activeChapterIndex]?.component;

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
  const [tocOpen, setTocOpen] = useState(() => window.matchMedia('(min-width: 1101px)').matches);
  useEffect(() => {
    if (window.location.hash) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
    }
  }, []);
  const filtered = chapters.map((chapter, index) => ({ ...chapter, index })).filter(chapter => `${chapter.title} ${chapter.description} ${chapter.topics.join(' ')}`.toLowerCase().includes(query.toLowerCase().trim()));
  const tocItems = ChapterContent
    ? chapters[activeChapterIndex].topics.map((title, index) => ({ title, id: `lesson-${activeChapterIndex + 1}-${index + 1}` }))
    : [{ title: 'Course outline', id: 'contents' }, ...filtered.map(chapter => ({ title: chapter.title, id: `chapter-${chapter.index}` }))];
  function toggle(index) { setOpen(previous => { const next = new Set(previous); next.has(index) ? next.delete(index) : next.add(index); return next; }); }

  return <div className="min-h-screen">
    <header className="site-header"><div className="header-inner flex items-center justify-between"><a href="/" className="brand flex items-center gap-2.5" aria-label="Testing Notes home"><span className="brand-mark"><Check size={19} strokeWidth={2.8}/></span>testing<span className="brand-light">notes</span><span className="small-tag">a learning guide</span></a><div className="header-actions"><a className="header-link flex items-center gap-2" href="/#contents">Course outline <ArrowUpRight size={15}/></a><button type="button" className="theme-toggle" onClick={() => setTheme(current => current === 'light' ? 'dark' : 'light')} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>{theme === 'light' ? <Moon size={17}/> : <Sun size={17}/>}</button></div></div></header>
    <div className={`page-shell ${tocOpen ? '' : 'toc-collapsed'}`}>
      <aside className="sidebar"><div className="sidebar-sticky"><div className="sidebar-title flex items-center gap-2"><BookOpen size={16}/> The learning path</div><nav aria-label="Chapters">{chapters.map((chapter, index) => <a key={index} href={chapter.path || `/#chapter-${index}`} aria-current={index === activeChapterIndex ? 'page' : undefined} className={`nav-item ${index === activeChapterIndex ? 'active' : ''}`}><span className="nav-number">{String(index + 1).padStart(2, '0')}</span>{chapter.label}</a>)}</nav><a className="sidebar-download" href="/downloads/paper-trail-demo.zip" download><Download size={16}/><span>Download demo app<small>Paper Trail · Node + React · ZIP</small></span></a><div className="sidebar-note"><span className="note-dot"/> Build on your experience.<br/><span className="note-indent">Develop testing judgment.</span></div></div></aside>
      <main>
        <a className="mobile-demo-download" href="/downloads/paper-trail-demo.zip" download><Download size={15}/> Download demo app (ZIP)</a>
        {ChapterContent ? <><a className="lesson-next" href="/#contents">Back to course outline</a><ChapterContent/></> : <>
        <section className="intro"><div className="intro-badge"><span/> For experienced developers</div><h1>From building software<br/>to testing it deeply.</h1><p className="intro-text">A learning path from senior developer to testing specialist. Start with what testing is, why it matters, and the different types. Follow one e-commerce app through unit, integration, end-to-end, security, performance, and regression testing.</p><div className="course-meta flex flex-wrap items-center"><span><BookOpen size={15}/>{chapters.length} chapters</span><span>{count} topics · {availableCount} available</span><span>Development experience assumed</span></div></section>
        <div className="notice flex items-start gap-3"><FlaskConical size={19} className="shrink-0 mt-0.5"/><p><strong>Chapters 01 and 02 are ready.</strong> Download Paper Trail from the sidebar and build its unit tests step by step. All testing chapters use this same demo; Chapters 03–07 are planned.</p></div>
        <section id="contents" className="contents"><div className="contents-heading flex items-center justify-between gap-4"><h2>Table of contents</h2><button className="expand-button" onClick={() => setOpen(open.size === chapters.length ? new Set() : new Set(chapters.map((_, index) => index)))}>{open.size === chapters.length ? 'Collapse all' : 'Expand all'}<ChevronDown size={14} className={open.size === chapters.length ? 'rotated' : ''}/></button></div>
          <div className="search-wrap"><Search size={17}/><input aria-label="Search the course outline" value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a topic..."/>{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={16}/></button>}<span className="search-hint">Explore the outline</span></div>
          <div className="chapter-list">{filtered.map(chapter => { const expanded = open.has(chapter.index) || Boolean(query.trim()); return <article className={`chapter ${expanded ? 'is-open' : ''}`} id={`chapter-${chapter.index}`} key={chapter.index}><h3><button className="chapter-toggle" onClick={() => toggle(chapter.index)} aria-expanded={expanded} aria-controls={`topics-${chapter.index}`}><span className="chapter-number">{String(chapter.index + 1).padStart(2, '0')}</span><span className="chapter-text"><span className="chapter-title">{chapter.title}</span><span className="chapter-description">{chapter.description}</span></span><span className="topic-count">{chapter.topics.length ? `${chapter.topics.length} topics` : 'TBD'}</span><ChevronDown size={17} className={`chapter-chevron ${expanded ? 'rotated' : ''}`}/></button></h3>{expanded && chapter.topics.length > 0 && <ol className="topics" id={`topics-${chapter.index}`}>{chapter.topics.map((topic, index) => <li key={topic}><span className="topic-number">{chapter.index + 1}.{index + 1}</span>{chapter.path ? <a className="topic-link" href={`${chapter.path}#lesson-${chapter.index + 1}-${index + 1}`}>{topic}</a> : <span className="topic-link">{topic}</span>}<span className="planned">{chapter.status || 'Planned'}</span></li>)}</ol>}</article>; })}{filtered.length === 0 && <div className="empty"><Search size={24}/><h3>No topics found</h3><p>Try a broader term, like “bugs”, “web”, or “testing”.</p><button onClick={() => setQuery('')}>Show all chapters</button></div>}</div>
        </section>
        </>}
        <footer className="flex flex-wrap items-center justify-between gap-3"><span>Engineering experience. Testing judgment.</span><span>Built for the curious <span className="footer-spark">✳</span></span></footer>
      </main>
      <aside className="page-toc" aria-label="Current page contents">
        <div className="page-toc-sticky">
          <button type="button" className="page-toc-toggle" aria-label={tocOpen ? 'Collapse table of contents' : 'Expand table of contents'} aria-expanded={tocOpen} aria-controls="page-toc-links" onClick={() => setTocOpen(previous => !previous)}>
            <span>On this page</span>{tocOpen ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
          </button>
          <nav id="page-toc-links" aria-label="On this page" hidden={!tocOpen}>
            <ol>{tocItems.map(item => <li key={item.id}><a href={`#${item.id}`}>{item.title}</a></li>)}</ol>
          </nav>
        </div>
      </aside>
    </div>
  </div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
