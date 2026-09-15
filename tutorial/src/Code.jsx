import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function Code({ children }) {
  const [status, setStatus] = useState('');
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(children);
      setStatus('Copied!');
    } catch {
      setStatus('Unable to copy. Select the code and copy manually.');
    }
    timer.current = setTimeout(() => setStatus(''), 3000);
  }

  return <div className="code-block">
    <div className="code-toolbar">
      <span role="status">{status}</span>
      <button type="button" onClick={copy} aria-label="Copy code">
        {status === 'Copied!' ? <Check size={14}/> : <Copy size={14}/>}Copy
      </button>
    </div>
    <pre><code>{children}</code></pre>
  </div>;
}
