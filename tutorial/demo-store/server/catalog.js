export const catalog = [
  { id: 'notebook', name: 'Field notebook', category: 'Paper', description: 'Dot-grid pages for ideas in progress.', priceCents: 2500, stock: 40, art: 'notebook', color: '#b7c9df' },
  { id: 'pens', name: 'Everyday pen set', category: 'Writing', description: 'Three smooth writers. One good starting point.', priceCents: 1500, stock: 30, art: 'pens', color: '#d9bdc8' },
  { id: 'planner', name: 'Weekly planner', category: 'Paper', description: 'A little structure for the week ahead.', priceCents: 3500, stock: 20, art: 'planner', color: '#b8d3c9' },
  { id: 'pouch', name: 'Canvas pencil pouch', category: 'Accessories', description: 'Keep your favorite tools close.', priceCents: 2000, stock: 25, art: 'pouch', color: '#e3d099' },
  { id: 'clips', name: 'Brass page clips', category: 'Accessories', description: 'Small things that hold everything together.', priceCents: 999, stock: 50, art: 'clips', color: '#d2c5de' },
  { id: 'desk-set', name: 'The desk set', category: 'Accessories', description: 'A considered collection for a fresh workspace.', priceCents: 10000, stock: 10, art: 'desk-set', color: '#bacdd0' },
];

export const coupons = new Map([
  ['WELCOME10', { percent: 10, expiresAt: Date.UTC(2099, 0, 1) }],
  ['EXPIRED10', { percent: 10, expiresAt: Date.UTC(2020, 0, 1) }],
]);
