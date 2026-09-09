import { PLANTS } from '../src/data/plants';
import { COMPATIBILITY_RULES } from '../src/data/compatibility-rules';
import type { PlantDefinition, PlantCategory } from '../src/types/plant';

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SECTIONS: { key: string; label: string; categories: PlantCategory[] }[] = [
  { key: 'trees', label: '🌳 TREES (fruit, nut & ornamental)', categories: ['tree'] },
  { key: 'shrubs', label: '🌿 SHRUBS & WOODY PERENNIALS', categories: ['bush'] },
  { key: 'climbers', label: '🍇 CLIMBERS & VINES', categories: ['climber'] },
  { key: 'perennials', label: '🌼 PERENNIALS & HERBS', categories: ['herb', 'flower'] },
  { key: 'bulbs', label: '🌷 BULBS (perennial, return each year)', categories: ['bulb'] },
  { key: 'grasses', label: '🌾 GRASSES, FERNS & GROUND COVER', categories: ['grass', 'groundcover'] },
  { key: 'seasonal', label: '🍂 SEASONAL (annuals — resow each year)', categories: ['vegetable'] },
];

const GROWTH_LABEL = { fast: '🚀 Fast', medium: '🌱 Medium', slow: '🐢 Slow' } as const;
const SUN_LABEL = { full: '☀️ Full Sun', partial: '🌤 Partial Shade', shade: '🌑 Shade' } as const;
const WATER_LABEL = { low: 'Every 10-14 days', medium: 'Weekly', high: '2x weekly' } as const;

function isAnnual(p: PlantDefinition) {
  return p.category === 'vegetable' || p.id === 'chamomile';
}

function spacing(p: PlantDefinition) {
  const d = p.matureRadiusM * 2;
  return d >= 1 ? `${d % 1 === 0 ? d : d.toFixed(1)} m` : `${Math.round(d * 100)} cm`;
}

function seasonMark(p: PlantDefinition, months: number[]) {
  const hits = months.filter((m) => p.plantingMonths.includes(m)).length;
  return hits === 0 ? '' : hits >= 2 ? '✔✔' : '✔';
}

const AUTUMN = [9, 10, 11];
const WINTER = [12, 1, 2];
const SPRING = [3, 4, 5];

/** Companions derived from the planner's compatibility rules. */
function companionsFor(id: string) {
  const good = new Set<string>();
  const bad = new Set<string>();
  for (const r of COMPATIBILITY_RULES) {
    const other = r.plantA === id ? r.plantB : r.plantB === id ? r.plantA : null;
    if (!other || other === '*') continue;
    (r.type === 'incompatible' ? bad : good).add(other);
  }
  return { good, bad };
}

const SECTION_OF = new Map<string, string>();
const ORDERED: { section: (typeof SECTIONS)[number]; plants: PlantDefinition[] }[] = SECTIONS.map((section) => {
  const plants = PLANTS.filter((p) => section.categories.includes(p.category));
  for (const p of plants) SECTION_OF.set(p.id, section.label);
  return { section, plants };
}).filter((s) => s.plants.length > 0);

const COLUMNS = [
  { key: 'growth', label: '📈 Growth' },
  { key: 'autumn', label: '🌦 Autumn' },
  { key: 'winter', label: '❄️ Winter' },
  { key: 'spring', label: '🌸 Spring' },
  { key: 'sun', label: '☀️ Sun / Shade' },
  { key: 'spacing', label: '↔️ Spacing' },
  { key: 'depth', label: '⬇️ Depth' },
  { key: 'watering', label: '💧 Watering' },
  { key: 'tips', label: '📝 Tips' },
];

const SECTION_COLORS: Record<string, string> = {
  trees: 'var(--section-trees)',
  shrubs: 'var(--section-shrubs)',
  climbers: 'var(--section-climbers)',
  perennials: 'var(--section-perennials)',
  bulbs: 'var(--section-bulbs)',
  grasses: 'var(--section-grasses)',
  seasonal: 'var(--section-seasonal)',
};

// ─── State ───────────────────────────────────────────────────────────
interface State {
  notes: Record<string, string>;
  checked: Record<string, boolean>;
}
const STORAGE_KEY = 'prodromos-planting';
const state: State = { notes: {}, checked: {} };

/** Ids changed when the two pages merged onto one plant list. */
const ID_MIGRATIONS: Record<string, string> = {
  mulberry: 'mulberry-vavatsinia',
  plum: 'damaskina-plum',
  lotus: 'lotus-fruit',
  hortensia: 'hydrangea',
  wildroses: 'wild-roses',
  japanesemaple: 'japanese-maple',
  silktree: 'silk-tree',
  climbingmaple: 'climbing-maple',
  climbingrose: 'climbing-rose',
  silvergrass: 'japanese-silver-grass',
  groundcover: 'ground-covers',
  lemonbalm: 'lemon-balm',
  maple: 'maple-sycamore',
  iris: 'iris',
};

function migrate<T>(rec: Record<string, T>): Record<string, T> {
  const out: Record<string, T> = {};
  for (const [k, v] of Object.entries(rec)) out[ID_MIGRATIONS[k] ?? k] = v;
  return out;
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved);
    if (parsed.notes) state.notes = migrate(parsed.notes);
    if (parsed.checked) state.checked = migrate(parsed.checked);
  } catch {
    /* first run, or storage blocked */
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage blocked */
  }
}

let selectedPlantId: string | null = null;

/** How many of each plant are placed on the garden map (same-origin zustand store). */
function placedCounts(): Map<string, number> {
  const counts = new Map<string, number>();
  try {
    const raw = localStorage.getItem('garden-planner-state');
    if (!raw) return counts;
    const placed = JSON.parse(raw)?.state?.placedPlants ?? [];
    for (const p of placed) counts.set(p.plantId, (counts.get(p.plantId) ?? 0) + 1);
  } catch {
    /* no map saved yet */
  }
  return counts;
}

// ─── Render ──────────────────────────────────────────────────────────
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

function updateCounter() {
  const checked = Object.values(state.checked).filter(Boolean).length;
  document.getElementById('counter')!.textContent = String(checked);
  document.getElementById('total')!.textContent = String(PLANTS.length);
}

function render() {
  const app = document.getElementById('app')!;
  const filterOnly = (document.getElementById('filterToggle') as HTMLInputElement).checked;
  const search = (document.getElementById('searchBox') as HTMLInputElement).value.toLowerCase().trim();
  const companions = selectedPlantId ? companionsFor(selectedPlantId) : null;
  let html = '';

  for (const { section, plants } of ORDERED) {
    let rows = plants;
    if (filterOnly) rows = rows.filter((p) => state.checked[p.id]);
    if (search)
      rows = rows.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.botanicalName.toLowerCase().includes(search) ||
          p.cyprusNotes.toLowerCase().includes(search) ||
          (state.notes[p.id] || '').toLowerCase().includes(search),
      );
    if (rows.length === 0) continue;

    html += `<div class="section-group">`;
    html += `<div class="section-banner" style="background:${SECTION_COLORS[section.key]}">${section.label}<span class="section-count">${rows.length} plant${rows.length !== 1 ? 's' : ''}</span></div>`;
    html += `<table class="plant-table"><thead><tr><th>📝 Notes</th><th style="width:40px">✅ Pick</th><th>🌱 Plant</th>`;
    for (const col of COLUMNS) {
      const cls = col.key === 'autumn' ? ' class="season-first"' : col.key === 'spring' ? ' class="season-last"' : '';
      html += `<th${cls}>${col.label}</th>`;
    }
    html += `</tr></thead><tbody>`;

    for (const p of rows) {
      const annual = isAnnual(p);
      const rowCls = [
        annual ? 'is-annual' : '',
        selectedPlantId === p.id ? 'row-selected' : '',
        companions?.good.has(p.id) ? 'row-good' : '',
        companions?.bad.has(p.id) ? 'row-bad' : '',
      ]
        .filter(Boolean)
        .join(' ');

      html += `<tr class="${rowCls}" data-plant-id="${p.id}">`;
      html += `<td class="cell-notes" data-label="Notes"><textarea data-id="${p.id}" placeholder="Add notes...">${esc(state.notes[p.id] || '')}</textarea></td>`;
      html += `<td class="cell-check" data-label="Final pick"><input type="checkbox" data-id="${p.id}" ${state.checked[p.id] ? 'checked' : ''}></td>`;
      html += `<td class="cell-plant" data-label="Plant" style="cursor:pointer">${p.emoji} ${esc(p.name)}<span class="botanical">${esc(p.botanicalName)}</span>${annual ? '<span class="annual-badge">Annual</span>' : ''}</td>`;
      html += `<td data-label="Growth">${GROWTH_LABEL[p.growth]}</td>`;
      html += `<td data-label="Autumn" class="season-dot season-first">${seasonMark(p, AUTUMN)}</td>`;
      html += `<td data-label="Winter" class="season-dot">${seasonMark(p, WINTER)}</td>`;
      html += `<td data-label="Spring" class="season-dot season-last">${seasonMark(p, SPRING)}</td>`;
      html += `<td data-label="Sun / Shade">${SUN_LABEL[p.sun]}</td>`;
      html += `<td data-label="Spacing">${spacing(p)}</td>`;
      html += `<td data-label="Depth">${esc(p.plantingDepth)}</td>`;
      html += `<td data-label="Watering">${WATER_LABEL[p.water]}</td>`;
      html += `<td data-label="Tips">${esc(p.cyprusNotes)}</td>`;
      html += `</tr>`;
    }
    html += `</tbody></table></div>`;
  }

  app.innerHTML = html || '<div class="empty-state">No plants match your current filters.</div>';
  updateCounter();
  renderShoppingList();
}

// ─── Shopping / planting schedule from the current picks ─────────────
/** Anything ticked in the table, plus anything already placed on the garden map. */
function pickedPlants(): PlantDefinition[] {
  const onMap = placedCounts();
  return PLANTS.filter((p) => state.checked[p.id] || onMap.has(p.id));
}

function renderShoppingList() {
  const picked = pickedPlants();
  const onMap = placedCounts();
  const qty = (p: PlantDefinition) => (onMap.has(p.id) ? ` <span class="shop-qty">×${onMap.get(p.id)}</span>` : '');
  const wrap = document.getElementById('shopping')!;
  const body = document.getElementById('shoppingBody')!;
  const count = document.getElementById('shoppingCount')!;

  if (picked.length === 0) {
    wrap.classList.add('hidden');
    return;
  }
  wrap.classList.remove('hidden');
  const mapTotal = [...onMap.values()].reduce((a, b) => a + b, 0);
  count.textContent =
    `${picked.length} plant${picked.length !== 1 ? 's' : ''} picked` +
    (mapTotal ? ` · ${mapTotal} placed on map` : '');

  const byMonth = new Map<number, PlantDefinition[]>();
  for (const p of picked)
    for (const m of p.plantingMonths) {
      if (!byMonth.has(m)) byMonth.set(m, []);
      byMonth.get(m)!.push(p);
    }

  // Each plant's own earliest planting month, so nothing is listed twice as "buy".
  const buyMonth = new Map<string, number>();
  for (const p of picked) {
    const ordered = [...p.plantingMonths].sort((a, b) => {
      const rank = (m: number) => (m >= 9 ? m - 9 : m + 3); // season starts in Sept
      return rank(a) - rank(b);
    });
    buyMonth.set(p.id, ordered[0] ?? 1);
  }

  let html = '<div class="shop-grid">';
  const seasonOrder = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8];
  for (const m of seasonOrder) {
    const toBuy = picked.filter((p) => buyMonth.get(p.id) === m);
    const inWindow = byMonth.get(m) ?? [];
    if (toBuy.length === 0 && inWindow.length === 0) continue;
    html += `<div class="shop-month"><h3>${MONTH_ABBR[m - 1]}</h3>`;
    if (toBuy.length) {
      html += `<div class="shop-label">🛒 Buy / order</div><ul>`;
      for (const p of toBuy) html += `<li>${p.emoji} ${esc(p.name)}${qty(p)} <span class="shop-meta">${esc(p.plantingDepth)} · ${spacing(p)}</span></li>`;
      html += `</ul>`;
    }
    if (inWindow.length) {
      html += `<div class="shop-label">🌱 Can plant</div><ul class="shop-plant">`;
      for (const p of inWindow) html += `<li>${p.emoji} ${esc(p.name)}${qty(p)}</li>`;
      html += `</ul>`;
    }
    html += `</div>`;
  }
  html += '</div>';
  body.innerHTML = html;
}

function toast(msg: string) {
  const el = document.getElementById('toast')!;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

function exportCSV() {
  const picked = pickedPlants();
  if (picked.length === 0) {
    toast('No plants selected for export');
    return;
  }
  const headers = ['Section', 'Notes', 'Plant', 'Botanical', 'Growth Rate', 'Autumn', 'Winter', 'Spring', 'Sun / Shade', 'Spacing', 'Planting Depth', 'Watering', 'Planting Months', 'Tips'];
  const q = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  let csv = headers.map(q).join(',') + '\n';
  for (const p of picked) {
    csv +=
      [
        SECTION_OF.get(p.id) ?? '',
        state.notes[p.id] || '',
        `${p.emoji} ${p.name}`,
        p.botanicalName,
        GROWTH_LABEL[p.growth],
        seasonMark(p, AUTUMN),
        seasonMark(p, WINTER),
        seasonMark(p, SPRING),
        SUN_LABEL[p.sun],
        spacing(p),
        p.plantingDepth,
        WATER_LABEL[p.water],
        p.plantingMonths.map((m) => MONTH_ABBR[m - 1]).join(' '),
        p.cyprusNotes,
      ]
        .map(q)
        .join(',') + '\n';
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = 'prodromos-planting-final.csv';
  a.click();
  toast('CSV exported');
}

// ─── Soil preparation checklist ──────────────────────────────────────
const SOIL_PREP: { title: string; items: { text: string; note?: string }[] }[] = [
  {
    title: '1. Clear & Assess',
    items: [
      { text: 'Remove weeds, roots, and any stones or rubble.' },
      { text: 'Mark where trees and shrubs will go (leave space for tractor access later).' },
      { text: 'Check drainage: dig a 50 cm test hole — if water sits >24 h, improve drainage with gravel or raised beds.' },
    ],
  },
  {
    title: '2. Deep Tilling / Ploughing',
    items: [
      { text: 'Use the tractor to till 30–40 cm deep (50 cm for tree zones).' },
      { text: 'Break compacted layers so roots can spread.' },
      { text: 'Mix the topsoil and subsoil lightly to avoid creating a hard barrier.' },
    ],
  },
  {
    title: '3. Organic Matter Boost',
    items: [
      { text: 'Add manure or compost.', note: 'Best: well-rotted animal manure (goat, cow, or horse) or mature compost.' },
      { text: 'Spread 3–5 cm thick over the surface, then mix it in with the tractor.' },
      { text: 'Do not use fresh manure — it “burns” roots and adds too much nitrogen.' },
      { text: 'Let it rest 3–4 weeks before planting trees.' },
      { text: 'Optional: add fertile soil or compost from a healthy garden to inoculate microbes.', note: 'Helpful but not essential if you’re adding manure.' },
    ],
  },
  {
    title: '4. Soil Testing (if possible)',
    items: [
      { text: 'Quick pH check with a €10 kit.', note: 'Ideal for fruit trees: 6.0–7.0 · Hortensias: slightly acidic 5.0–6.0' },
      { text: 'If too acidic → add agricultural lime.' },
      { text: 'If too alkaline → add peat moss or pine mulch.' },
    ],
  },
  {
    title: '5. Layout Planning',
    items: [
      { text: 'Mark tree positions with stakes (respect spacing from the table below).' },
      { text: 'Plan irrigation lines (drip system preferred).' },
      { text: 'Think water flow — sloped land can drain too fast; contour planting helps retain moisture.' },
    ],
  },
  {
    title: '6. Mulch & Rest',
    items: [
      { text: 'Cover bare areas with straw, dry leaves, or wood chips.', note: 'Prevents weeds · Retains moisture · Slowly adds humus over winter' },
      { text: 'Let the soil rest until your first winter planting (Dec–Feb).' },
    ],
  },
];

const SOIL_KEY = 'prodromos-soil-prep';
let soilDone: Record<string, boolean> = {};
try {
  soilDone = JSON.parse(localStorage.getItem(SOIL_KEY) || '{}');
} catch {
  /* storage blocked */
}

function renderSoilPrep() {
  let html = '';
  let total = 0;
  let done = 0;
  SOIL_PREP.forEach((step, si) => {
    html += `<div class="soil-step"><h3>${step.title}</h3>`;
    step.items.forEach((item, ii) => {
      const id = `${si}-${ii}`;
      total++;
      if (soilDone[id]) done++;
      html += `<label class="soil-item${soilDone[id] ? ' done' : ''}"><input type="checkbox" data-soil="${id}" ${soilDone[id] ? 'checked' : ''}><span>${item.text}${item.note ? `<span class="soil-note">${item.note}</span>` : ''}</span></label>`;
    });
    html += `</div>`;
  });
  document.getElementById('soilBody')!.innerHTML = html;
  document.getElementById('soilCount')!.textContent = `${done} / ${total} done`;
}

// ─── Wiring ──────────────────────────────────────────────────────────
const app = document.getElementById('app')!;

app.addEventListener('input', (e) => {
  const t = e.target as HTMLElement;
  if (t instanceof HTMLTextAreaElement && t.dataset.id) {
    state.notes[t.dataset.id] = t.value;
    saveState();
  }
});

app.addEventListener('change', (e) => {
  const t = e.target as HTMLElement;
  if (t instanceof HTMLInputElement && t.type === 'checkbox' && t.dataset.id) {
    state.checked[t.dataset.id] = t.checked;
    saveState();
    updateCounter();
    renderShoppingList();
    if ((document.getElementById('filterToggle') as HTMLInputElement).checked) render();
  }
});

app.addEventListener('click', (e) => {
  const cell = (e.target as HTMLElement).closest('.cell-plant');
  if (!cell) return;
  const id = cell.closest('tr')?.getAttribute('data-plant-id');
  if (!id) return;
  selectedPlantId = selectedPlantId === id ? null : id;
  render();
});

document.getElementById('soilBody')!.addEventListener('change', (e) => {
  const t = e.target as HTMLElement;
  if (!(t instanceof HTMLInputElement) || !t.dataset.soil) return;
  soilDone[t.dataset.soil] = t.checked;
  try {
    localStorage.setItem(SOIL_KEY, JSON.stringify(soilDone));
  } catch {
    /* storage blocked */
  }
  renderSoilPrep();
});

document.getElementById('filterToggle')!.addEventListener('change', render);
document.getElementById('searchBox')!.addEventListener('input', render);
document.getElementById('btnCSV')!.addEventListener('click', exportCSV);
document.getElementById('btnPrint')!.addEventListener('click', () => {
  document.querySelectorAll('tbody tr').forEach((tr) => {
    const cb = tr.querySelector<HTMLInputElement>('input[type="checkbox"][data-id]');
    if (cb && !cb.checked) tr.classList.add('print-hide');
  });
  document.querySelectorAll('.section-group').forEach((sg) => {
    if (sg.querySelectorAll('tbody tr:not(.print-hide)').length === 0) sg.classList.add('print-hide');
  });
  window.print();
  document.querySelectorAll('.print-hide').forEach((el) => el.classList.remove('print-hide'));
});

loadState();
renderSoilPrep();
render();
