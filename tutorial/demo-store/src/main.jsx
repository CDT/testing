import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const money = cents => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

async function request(url, body) {
  const response = await fetch(url, body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Could not complete the request.');
  return data;
}

function ProductArt({ product }) {
  return <div className="product-art" style={{ background: product.color }}><svg viewBox="0 0 240 160" aria-hidden="true" focusable="false">
    <ellipse cx="125" cy="139" rx="63" ry="7" fill="#263e5a" opacity=".12"/>
    {['notebook', 'planner', 'desk-set'].includes(product.art) && <g transform="rotate(-9 120 80)"><rect x="68" y="22" width="100" height="117" rx="5" fill="#fcfaf4" stroke="#28435d" strokeWidth="2"/><rect x="68" y="22" width="13" height="117" fill="#28435d"/><path d="M96 57h52M96 69h52M96 81h38" stroke="#97abb9" strokeWidth="2"/>{product.art === 'planner' ? <path d="M94 92h57v30H94zM113 92v30M132 92v30M94 107h57" fill="none" stroke="#97abb9"/> : <circle cx="121" cy="107" r="13" fill={product.color}/>}</g>}
    {['pens', 'desk-set'].includes(product.art) && <g transform={product.art === 'desk-set' ? 'translate(70 0) rotate(12 120 80)' : 'rotate(22 120 80)'}>{[0, 1, 2].map((n) => <g key={n} transform={`translate(${n * 22} 0)`}><rect x="88" y="23" width="10" height="101" rx="4" fill={['#28435d', '#f6f2e6', '#886c82'][n]} stroke="#28435d"/><path d="M88 123l5 13 5-13" fill="#c5a64c"/><path d="M91 28v24" stroke="#c5a64c" strokeWidth="2"/></g>)}</g>}
    {product.art === 'pouch' && <g transform="rotate(-7 120 80)"><path d="M46 60q74-19 148 0l-6 68H52z" fill="#fcfaf4" stroke="#28435d" strokeWidth="2"/><path d="M49 62h142M55 70h129" stroke="#28435d" strokeWidth="2"/><rect x="167" y="62" width="10" height="19" rx="2" fill="#c5a64c"/><path d="M99 94h42v19H99z" fill={product.color}/></g>}
    {product.art === 'clips' && [0, 1, 2].map(n => <g key={n} transform={`translate(${n * 48 - 46} ${n % 2 * 15}) rotate(${n * 10 - 10} 120 80)`}><path d="M131 98V48a15 15 0 0 0-30 0v65a21 21 0 0 0 42 0V58M113 58v49a6 6 0 0 0 12 0V54" fill="none" stroke="#937322" strokeWidth="5"/></g>)}
  </svg></div>;
}

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState('');
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const [error, setError] = useState('');
  const [payment, setPayment] = useState('approved');
  const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState([]);
  const [confirmation, setConfirmation] = useState(null);
  const [showOrders, setShowOrders] = useState(false);
  const [loading, setLoading] = useState(true);
  const orderRequest = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const items = await request('/api/products');
        const history = await request('/api/orders');
        setProducts(items);
        setOrders(history);
      } catch (failure) { setError(failure.message); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  useEffect(() => {
    if (!products.length) return;
    let cancelled = false;
    setQuote(null);
    setQuoteError('');
    request('/api/quote', { items: cart, coupon }).then(data => {
      if (!cancelled) setQuote(data);
    }).catch(failure => { if (!cancelled) setQuoteError(failure.message); });
    return () => { cancelled = true; };
  }, [cart, coupon, products]);

  function changeQuantity(id, quantity) {
    setError('');
    setConfirmation(null);
    setQuote(null);
    setCart(previous => quantity === 0 ? previous.filter(item => item.id !== id) : previous.some(item => item.id === id) ? previous.map(item => item.id === id ? { ...item, quantity } : item) : [...previous, { id, quantity }]);
  }

  async function checkout(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const key = JSON.stringify({ items: cart, coupon, payment });
    if (orderRequest.current?.key !== key) orderRequest.current = { key, id: crypto.randomUUID() };
    try {
      const order = await request('/api/orders', { items: cart, coupon, payment, requestId: orderRequest.current.id });
      setOrders(previous => [order, ...previous.filter(entry => entry.id !== order.id)]);
      setConfirmation(order);
      setCart([]);
      setCoupon('');
      setCouponInput('');
      orderRequest.current = null;
      setProducts(await request('/api/products'));
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }

  const filtered = products.filter(product => (category === 'All' || product.category === category) && `${product.name} ${product.description}`.toLowerCase().includes(search.toLowerCase()));
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  return <div>
    <div className="announcement">A little room for your next idea. Free shipping from $100 after discounts.</div>
    <header className="shop-header flex items-center justify-between gap-4"><a className="wordmark" href="/">Paper Trail<span>Stationery for everyday thinking</span></a><button className="quiet-button" onClick={() => setShowOrders(value => !value)} aria-expanded={showOrders} aria-controls="order-history">{showOrders ? 'Hide orders' : `Your orders (${orders.length})`}</button></header>
    <main className="shop-shell">
      <section className="shop-intro"><div><p className="collection-label">The everyday collection</p><h1>Good things begin<br/>on a blank page.</h1><p>Notebooks, favorite pens, and a few small things<br className="desktop-break"/> to make your desk feel like yours.</p></div><div className="intro-stamp">Paper Trail<br/><span>Thoughtfully picked.<br/>Ready for your desk.</span></div></section>
      {showOrders && <section id="order-history" className="order-history"><h2>Your orders</h2>{orders.length === 0 ? <p>No orders yet. Your next idea starts in the collection below.</p> : orders.map(order => <article key={order.id}><div className="flex justify-between gap-3"><strong>{order.status}</strong><strong>{money(order.totals.total)}</strong></div><p>Order {order.id.slice(0, 8)} · {new Date(order.createdAt).toLocaleString()}</p><ul>{order.items.map(item => <li key={item.id}>{item.quantity} × {item.name}</li>)}</ul></article>)}</section>}
      {confirmation && <section className="confirmation" role="status"><h2>Your order is confirmed.</h2><p>Order {confirmation.id.slice(0, 8)} · {money(confirmation.totals.total)} · No real payment was taken.</p><button className="quiet-button" onClick={() => setShowOrders(true)}>View your orders</button></section>}
      {error && <p className="error" role="alert">{error}</p>}
      <div className="store-layout">
        <section aria-label="Product collection">
          <div className="collection-controls"><div className="categories flex flex-wrap gap-2" aria-label="Product categories">{['All', 'Paper', 'Writing', 'Accessories'].map(name => <button key={name} onClick={() => setCategory(name)} aria-pressed={category === name}>{name}</button>)}</div><label className="search-label"><span className="sr-only">Search products</span><input type="search" placeholder="Find something good…" value={search} onChange={event => setSearch(event.target.value)}/></label></div>
          {loading ? <p role="status">Opening the shop…</p> : filtered.length === 0 ? <p>No products match. Try another search or category.</p> : <div className="product-grid">{filtered.map(product => {
            const quantity = cart.find(item => item.id === product.id)?.quantity || 0;
            return <article className="product" key={product.id}><ProductArt product={product}/><div className="product-heading flex justify-between gap-3"><h2>{product.name}</h2><span>{money(product.priceCents)}</span></div><p>{product.description}</p><div className="flex justify-between items-center gap-3"><span className="stock">{product.stock ? `${product.stock} available` : 'Sold out'}</span><button className="add-button" disabled={busy || quantity >= product.stock || quantity >= 99} onClick={() => changeQuantity(product.id, quantity + 1)} aria-label={`Add ${product.name} to bag`}>{quantity >= product.stock ? 'All in bag' : 'Add to bag'} <span aria-hidden="true">+</span></button></div></article>;
          })}</div>}
        </section>
        <aside className="bag" aria-label="Shopping bag"><div className="bag-heading flex justify-between items-center"><h2>Your bag</h2><span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span></div>
          {cart.length === 0 ? <p className="empty-bag">A fresh start.<br/>Add a little inspiration from the collection.</p> : <ul className="bag-items">{cart.map(item => { const product = products.find(entry => entry.id === item.id); return <li key={item.id}><div className="flex justify-between gap-3"><strong>{product?.name}</strong><span>{money((product?.priceCents || 0) * item.quantity)}</span></div><div className="flex justify-between items-center gap-3"><label className="quantity">Qty <input type="number" min="1" max={Math.min(99, product?.stock || 99)} aria-label={`Quantity for ${product?.name}`} value={item.quantity} disabled={busy} onChange={event => { const next = Number(event.target.value); if (Number.isInteger(next) && next >= 1 && next <= Math.min(99, product?.stock || 99)) changeQuantity(item.id, next); }}/></label><button className="remove-button" disabled={busy} onClick={() => changeQuantity(item.id, 0)} aria-label={`Remove ${product?.name}`}>Remove</button></div></li>; })}</ul>}
          <form className="coupon-form" onSubmit={event => { event.preventDefault(); setQuote(null); setCoupon(couponInput.trim().toUpperCase()); }}><label htmlFor="coupon">Have a coupon?</label><div className="flex gap-2"><input id="coupon" value={couponInput} onChange={event => setCouponInput(event.target.value)} placeholder="WELCOME10" disabled={busy}/><button disabled={busy || couponInput.trim().toUpperCase() === coupon}>Apply</button></div><p>Try WELCOME10 for 10% off merchandise.</p>{coupon && <button type="button" className="remove-button" disabled={busy} onClick={() => { setQuote(null); setCoupon(''); setCouponInput(''); }}>Remove coupon {coupon}</button>}</form>
          {quoteError && <p className="error" role="alert">{quoteError}</p>}
          <dl className="totals" aria-live="polite">{[['Subtotal', 'subtotal'], ['Discount', 'discount'], ['Shipping', 'shipping'], ['Demo tax (8%)', 'tax'], ['Total', 'total']].map(([label, key]) => <div key={key} className={`flex justify-between gap-3 ${key === 'total' ? 'grand-total' : ''}`}><dt>{label}</dt><dd>{quote ? (key === 'discount' && quote.totals[key] ? '−' : '') + money(quote.totals[key]) : '—'}</dd></div>)}</dl>
          <form onSubmit={checkout}><label className="payment-label" htmlFor="payment">Demo payment</label><select id="payment" value={payment} onChange={event => { setPayment(event.target.value); setError(''); }} disabled={busy}><option value="approved">Approved payment</option><option value="declined">Declined payment</option></select><button className="checkout-button" disabled={busy || !cart.length || !quote || Boolean(quoteError)}>{busy ? 'Placing your order…' : 'Place demo order'}</button></form><p className="demo-note">A working course demo. Payments are simulated; no card details needed.</p>
        </aside>
      </div>
      <footer className="shop-footer flex flex-wrap justify-between gap-3"><span>Paper Trail · Made for learning, filled with possibilities.</span><span>Prices in USD. Demo tax is illustrative.</span></footer>
    </main>
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
