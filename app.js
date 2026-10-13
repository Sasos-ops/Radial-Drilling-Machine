const CATEGORIES = [
  ['operating-manuals', 'Operating Manuals'],
  ['maintenance-procedures', 'Maintenance Procedures'],
  ['preventive-maintenance-records', 'Preventive Maintenance Records'],
  ['inspection-checklists', 'Inspection Checklists'],
  ['risk-assessment', 'Risk Assessment']
];
const $ = id => document.getElementById(id);
let docs = [];

function el(tag, props, ...kids) {
  const e = Object.assign(document.createElement(tag), props || {});
  kids.forEach(k => e.append(k));
  return e;
}

function render() {
  const q = $('search').value.trim().toLowerCase();
  const root = $('sections');
  root.replaceChildren();
  let total = 0;
  CATEGORIES.forEach(([id, name]) => {
    const list = docs.filter(d => d.category === id && [d.title, d.description, name]
      .join(' ').toLowerCase().includes(q));
    total += list.length;
    const sec = el('section', { id, className: 'cat' }, el('h2', { textContent: name }));
    if (!list.length) sec.append(el('p', { className: 'muted', textContent: q ? 'No matching documents.' : 'No documents yet.' }));
    list.forEach(d => {
      const btn = el('button', { className: 'view', textContent: 'View PDF' });
      btn.onclick = () => openViewer(d);
      sec.append(el('div', { className: 'doc' },
        el('div', {}, el('strong', { textContent: d.title }),
          el('p', { className: 'muted', textContent: [d.date, d.description].filter(Boolean).join(' – ') })),
        btn));
    });
    root.append(sec);
  });
  $('search-info').hidden = !q;
  $('search-info').textContent = `${total} document(s) found for "${$('search').value.trim()}"`;
}

function openViewer(d) {
  $('viewer-title').textContent = d.title;
  $('viewer-open').href = d.file;
  $('viewer-frame').src = d.file;
  $('viewer').hidden = false;
}
function closeViewer() { $('viewer').hidden = true; $('viewer-frame').src = 'about:blank'; }

$('viewer-close').onclick = closeViewer;
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeViewer(); });
$('search').addEventListener('input', render);
$('menu-toggle').onclick = () => {
  const open = $('nav').classList.toggle('open');
  $('menu-toggle').setAttribute('aria-expanded', open);
};
$('nav').addEventListener('click', () => $('nav').classList.remove('open'));

fetch('documents.json').then(r => r.json()).then(j => { docs = j.documents || []; render(); })
  .catch(() => { render(); $('search-info').hidden = false; $('search-info').textContent = 'Could not load documents.json'; });
