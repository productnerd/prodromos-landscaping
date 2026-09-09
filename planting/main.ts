import { PLANTS, PLANTS_MAP } from '../src/data/plants';
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

/** Plants passing the current search and "final picks only" filters. */
function visiblePlants(): PlantDefinition[] {
  const filterOnly = (document.getElementById('filterToggle') as HTMLInputElement).checked;
  const search = (document.getElementById('searchBox') as HTMLInputElement).value.toLowerCase().trim();
  return PLANTS.filter((p) => {
    if (filterOnly && !state.checked[p.id]) return false;
    if (!search) return true;
    return (
      p.name.toLowerCase().includes(search) ||
      p.botanicalName.toLowerCase().includes(search) ||
      p.cyprusNotes.toLowerCase().includes(search) ||
      (state.notes[p.id] || '').toLowerCase().includes(search)
    );
  });
}

function updatePickAllButton(visible: PlantDefinition[]) {
  const btn = document.getElementById('btnPickAll') as HTMLButtonElement;
  const allPicked = visible.length > 0 && visible.every((p) => state.checked[p.id]);
  btn.disabled = visible.length === 0;
  btn.textContent = allPicked ? '✖️ Clear all' : '✅ Pick all';
  btn.title = allPicked
    ? `Unpick the ${visible.length} plant${visible.length !== 1 ? 's' : ''} shown`
    : `Pick all ${visible.length} plant${visible.length !== 1 ? 's' : ''} shown`;
}

function render() {
  const app = document.getElementById('app')!;
  const companions = selectedPlantId ? companionsFor(selectedPlantId) : null;
  const visible = new Set(visiblePlants().map((p) => p.id));
  let html = '';

  for (const { section, plants } of ORDERED) {
    const rows = plants.filter((p) => visible.has(p.id));
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
  updatePickAllButton(visiblePlants());
  renderShoppingList();
  if (isCalendarOpen()) renderCalendar();
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
  const thisMonth = new Date().getMonth() + 1;
  for (const m of SEASON_ORDER) {
    const toBuy = picked.filter((p) => buyMonth.get(p.id) === m);
    const inWindow = byMonth.get(m) ?? [];
    if (toBuy.length === 0 && inWindow.length === 0) continue;
    html += `<div class="shop-month"><h3>${MONTH_ABBR[m - 1]}</h3>`;
    if (toBuy.length) {
      html += `<div class="shop-label">🛒 Buy / order</div><ul>`;
      for (const p of toBuy)
        html += `<li>${p.emoji} ${esc(p.name)}${qty(p)}${deadlinePill(p, thisMonth)} <span class="shop-meta">${esc(p.plantingDepth)} · ${spacing(p)}</span></li>`;
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

// ─── Calendar view ───────────────────────────────────────────────────
let calTab: 'windows' | 'deadlines' = 'windows';

/** Months in planting-season order, September first. */
const SEASON_ORDER = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8];
const seasonRank = (m: number) => SEASON_ORDER.indexOf(m);

/**
 * The last month of the soonest planting window still open to you.
 *
 * A plant like lavender has two separate windows (Sep–Oct and Mar–Apr); if you
 * want it in the ground as early as possible, the date that matters is the end
 * of the nearer window, not the end of the season.
 */
function plantingDeadline(p: PlantDefinition, from: number): number | null {
  if (p.plantingMonths.length === 0) return null;
  const ranks = [...new Set(p.plantingMonths.map(seasonRank))].sort((a, b) => a - b);

  const runs: number[][] = [];
  for (const r of ranks) {
    const last = runs[runs.length - 1];
    if (last && r === last[last.length - 1] + 1) last.push(r);
    else runs.push([r]);
  }
  // A window that wraps the end of the season (e.g. Aug→Sep) is one window.
  if (runs.length > 1) {
    const first = runs[0];
    const last = runs[runs.length - 1];
    if (first[0] === 0 && last[last.length - 1] === SEASON_ORDER.length - 1) {
      runs[runs.length - 1] = [...last, ...first];
      runs.shift();
    }
  }

  const fromRank = seasonRank(from);
  const open = runs.find((run) => run[run.length - 1] >= fromRank);
  const chosen = open ?? runs[0];
  return SEASON_ORDER[chosen[chosen.length - 1] % SEASON_ORDER.length];
}

/** How many months from `from` until `month`, wrapping around the season. */
function monthsUntil(month: number, from: number) {
  const d = seasonRank(month) - seasonRank(from);
  return d < 0 ? d + SEASON_ORDER.length : d;
}

function deadlinePill(p: PlantDefinition, from: number) {
  const dl = plantingDeadline(p, from);
  if (dl === null) return '';
  const away = monthsUntil(dl, from);
  const cls = away === 0 ? 'now' : away <= 1 ? 'soon' : '';
  const label = away === 0 ? `by end of ${MONTH_ABBR[dl - 1]}` : `by ${MONTH_ABBR[dl - 1]}`;
  return ` <span class="pill-deadline ${cls}" title="Last month of the soonest planting window">${label}</span>`;
}

/**
 * Spread the picked plants across their planting windows so no single month
 * carries everything. Plants with the least choice are placed first, and each
 * one goes to its emptiest available month.
 */
function suggestedMonths(plants: PlantDefinition[]): Map<string, number> {
  const load = new Map<number, number>();
  const chosen = new Map<string, number>();
  const byFlexibility = [...plants].sort((a, b) => a.plantingMonths.length - b.plantingMonths.length);

  for (const p of byFlexibility) {
    if (p.plantingMonths.length === 0) continue;
    let best = p.plantingMonths[0];
    for (const m of p.plantingMonths) {
      if ((load.get(m) ?? 0) < (load.get(best) ?? 0)) best = m;
    }
    chosen.set(p.id, best);
    load.set(best, (load.get(best) ?? 0) + 1);
  }
  return chosen;
}

function monthWindowLabel(p: PlantDefinition) {
  if (p.plantingMonths.length === 0) return 'no window';
  const order = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8];
  const sorted = order.filter((m) => p.plantingMonths.includes(m));
  return sorted.map((m) => MONTH_ABBR[m - 1]).join(', ');
}

/** Plants the calendar should show: your picks, or failing that what is on the map. */
function calendarPlants(): PlantDefinition[] {
  const picked = PLANTS.filter((p) => state.checked[p.id]);
  if (picked.length > 0) return picked;
  const onMap = placedCounts();
  return PLANTS.filter((p) => onMap.has(p.id));
}

function renderCalendarWindows(listed: PlantDefinition[], now: number) {
  const onMap = placedCounts();
  const suggested = suggestedMonths(listed);

  let html = `<div class="cal-legend">
    <span><i class="cal-cell cal-yes">\u2713</i> can plant</span>
    <span><i class="cal-cell cal-best">\u2605</i> suggested month</span>
    <span><i class="cal-cell cal-no">\u2715</i> cannot plant this month</span>
    <span>Season runs Sep &rarr; Aug &middot; showing your ${listed.length} selected plant${listed.length !== 1 ? 's' : ''}.</span>
  </div>`;

  html += `<div class="cal-months">`;
  for (const m of SEASON_ORDER) {
    const canCount = listed.filter((p) => p.plantingMonths.includes(m)).length;
    const dueCount = listed.filter((p) => suggested.get(p.id) === m).length;

    html += `<div class="cal-month${m === now ? ' is-now' : ''}">`;
    html += `<h3>${MONTH_ABBR[m - 1]}${m === now ? '<span class="cal-now-tag">this month</span>' : ''}<span class="cal-month-count">${canCount} of ${listed.length}</span></h3>`;
    html += dueCount
      ? `<div class="cal-due">\u2605 ${dueCount} to plant this month</div>`
      : `<div class="cal-due cal-due-none">nothing scheduled</div>`;
    html += `<ul>`;

    for (const p of listed) {
      const can = p.plantingMonths.includes(m);
      const isBest = suggested.get(p.id) === m;
      const cls = isBest ? 'cal-item is-best' : can ? 'cal-item' : 'cal-item cant';
      const mark = isBest ? '\u2605' : can ? '\u2713' : '\u2715';
      const qty = onMap.has(p.id) ? ` <span class="shop-qty">\u00d7${onMap.get(p.id)}</span>` : '';
      html += `<li class="${cls}" data-plant="${p.id}"><i class="cal-mark">${mark}</i><span>${p.emoji} ${esc(p.name)}${qty}</span></li>`;
    }
    html += `</ul></div>`;
  }
  return html + `</div>`;
}

/** Each month, the plants whose soonest planting window closes then. */
function renderCalendarDeadlines(listed: PlantDefinition[], now: number) {
  const byMonth = new Map<number, PlantDefinition[]>();
  for (const p of listed) {
    const dl = plantingDeadline(p, now);
    if (dl === null) continue;
    if (!byMonth.has(dl)) byMonth.set(dl, []);
    byMonth.get(dl)!.push(p);
  }

  let html = `<div class="cal-legend">
    <span>Last call each month \u2014 plant these before the month ends or you miss the window.</span>
  </div><div class="cal-months">`;

  for (const m of SEASON_ORDER) {
    const due = byMonth.get(m) ?? [];
    html += `<div class="cal-month${m === now ? ' is-now' : ''}${due.length === 0 ? ' dl-month is-empty' : ' dl-month'}">`;
    html += `<h3>${MONTH_ABBR[m - 1]}${m === now ? '<span class="cal-now-tag">this month</span>' : ''}<span class="cal-month-count">${due.length || ''}</span></h3>`;
    if (due.length === 0) {
      html += `<div class="dl-none">nothing due</div>`;
    } else {
      html += `<ul>`;
      for (const p of due) {
        const away = monthsUntil(m, now);
        const cls = away === 0 ? 'now' : away <= 1 ? 'soon' : '';
        html += `<li class="dl-item" data-plant="${p.id}"><span>${p.emoji} ${esc(p.name)}</span><span class="dl-win">${monthWindowLabel(p)}</span><span class="pill-deadline ${cls}">${away === 0 ? 'this month' : `${away} mo`}</span></li>`;
      }
      html += `</ul>`;
    }
    html += `</div>`;
  }
  return html + `</div>`;
}

function renderCalendar() {
  const body = document.getElementById('calBody')!;
  const now = new Date().getMonth() + 1;
  const listed = calendarPlants();

  document.getElementById('tabWindows')!.setAttribute('aria-pressed', String(calTab === 'windows'));
  document.getElementById('tabDeadlines')!.setAttribute('aria-pressed', String(calTab === 'deadlines'));

  if (listed.length === 0) {
    body.innerHTML = `<div class="empty-state">Pick some plants in the list \u2014 they will show up here month by month, with the months you cannot plant them crossed off.</div>`;
    return;
  }

  body.innerHTML =
    calTab === 'windows' ? renderCalendarWindows(listed, now) : renderCalendarDeadlines(listed, now);
}

// ─── Hover tooltip: a plant's whole planting year at a glance ────────
const tipEl = document.createElement('div');
tipEl.className = 'plant-tip hidden';
document.body.appendChild(tipEl);

function showPlantTip(p: PlantDefinition, target: Element) {
  const now = new Date().getMonth() + 1;
  const dl = plantingDeadline(p, now);

  const strip = SEASON_ORDER.map((m) => {
    const on = p.plantingMonths.includes(m);
    const classes = ['tip-m', on ? 'on' : 'off', m === now ? 'is-now' : ''].filter(Boolean).join(' ');
    return `<span class="${classes}">${MONTH_ABBR[m - 1]}</span>`;
  }).join('');

  tipEl.innerHTML =
    `<div class="tip-name">${p.emoji} ${esc(p.name)}</div>` +
    `<div class="tip-bot">${esc(p.botanicalName)}</div>` +
    `<div class="tip-strip">${strip}</div>` +
    `<div class="tip-foot">Plant in <strong>${monthWindowLabel(p)}</strong>${dl !== null ? ` &middot; latest <strong>${MONTH_ABBR[dl - 1]}</strong>` : ''}</div>`;

  tipEl.classList.remove('hidden');

  const r = target.getBoundingClientRect();
  const t = tipEl.getBoundingClientRect();
  const top = r.top - t.height - 8;
  tipEl.style.top = `${top < 8 ? r.bottom + 8 : top}px`;
  tipEl.style.left = `${Math.min(Math.max(8, r.left), window.innerWidth - t.width - 8)}px`;
}

function hidePlantTip() {
  tipEl.classList.add('hidden');
}

const calBodyEl = document.getElementById('calBody')!;
calBodyEl.addEventListener('mouseover', (e) => {
  const li = (e.target as HTMLElement).closest<HTMLElement>('[data-plant]');
  if (!li) return;
  const p = PLANTS_MAP[li.dataset.plant!];
  if (p) showPlantTip(p, li);
});
calBodyEl.addEventListener('mouseout', (e) => {
  const to = (e as MouseEvent).relatedTarget as HTMLElement | null;
  if (to?.closest('[data-plant]') === (e.target as HTMLElement).closest('[data-plant]')) return;
  hidePlantTip();
});
calBodyEl.addEventListener('scroll', hidePlantTip, true);

function openCalendar() {
  document.getElementById('calModal')!.classList.remove('hidden');
  renderCalendar();
}

function closeCalendar() {
  document.getElementById('calModal')!.classList.add('hidden');
  hidePlantTip();
}

function isCalendarOpen() {
  return !document.getElementById('calModal')!.classList.contains('hidden');
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
// Ordered so that testing and diagnosis come before any amendment.
const SOIL_PREP: { title: string; items: { id: string; text: string; note?: string }[] }[] = [
  {
    title: '1. Test the soil — before adding anything',
    items: [
      {
        id: 'sample',
        text: 'Take samples now, before manure or lime goes on.',
        note: 'Several cores per area, 0–20 cm — plus a separate 20–40 cm sample where trees will go. Testing after amending measures the amendment, not your soil.',
      },
      {
        id: 'test-what',
        text: 'Ask the lab for pH, salinity (EC), organic matter, P, K, and exchangeable Ca / Mg / Na.',
        note: 'Add nickel and chromium — the Troodos ophiolite can carry both.',
      },
      {
        id: 'ph-expect',
        text: 'Expect roughly pH 6.0–7.5 here, not the alkaline lowland default.',
        note: 'Central Troodos is the one part of Cyprus where topsoil regularly falls below pH 7. Good news for fruit — do not lime on assumption.',
      },
      {
        id: 'ph-correct',
        text: 'If pH needs correcting, apply lime or elemental sulphur now.',
        note: 'Both take months to act, so they must go on well before winter planting — not alongside the manure.',
      },
    ],
  },
  {
    title: '2. Rule out serpentine ground',
    items: [
      {
        id: 'serp-look',
        text: 'Look for greasy blue-green or black stones, rust-red soil, and sparse or stunted native growth.',
        note: 'Prodromos sits a few km from the serpentinite core around Chionistra, so downslope colluvium is possible.',
      },
      {
        id: 'serp-confirm',
        text: 'If suspicious, confirm with a Ca:Mg ratio — below 1 means serpentine.',
      },
      {
        id: 'serp-act',
        text: 'If it is serpentine, build raised beds with imported soil rather than trying to fix it.',
        note: 'Gypsum and compost only partly buffer a hostile Ca:Mg ratio.',
      },
    ],
  },
  {
    title: '3. Clear & assess',
    items: [
      {
        id: 'weeds',
        text: 'Dig perennial weed roots out whole — do not rotavate them.',
        note: 'Chopping bindweed or couch roots with a tractor multiplies them into new plants.',
      },
      {
        id: 'drainage',
        text: 'Drainage test: dig a 50 cm hole and fill it. If water sits over 24 h, plan mounds, raised beds or drainage.',
      },
      {
        id: 'frost-map',
        text: 'Walk the site on a cold morning and mark where cold air pools.',
        note: 'These frost hollows should drive your tree layout more than the soil does.',
      },
    ],
  },
  {
    title: '4. Loosen compaction only where it exists',
    items: [
      {
        id: 'no-deep-till',
        text: 'Do NOT deep-till the whole site or mix subsoil into topsoil.',
        note: 'It destroys soil structure, dilutes the fertile layer, and on a slope invites erosion. Around 40% of trial sites see yields drop after deep tillage.',
      },
      {
        id: 'pits',
        text: 'Dig inspection pits and check whether a compacted pan actually exists.',
      },
      {
        id: 'subsoil',
        text: 'If you find a pan, fracture it locally with a subsoiler tine — without inverting the profile.',
      },
      {
        id: 'shallow',
        text: 'Otherwise work only the top 10–15 cm.',
      },
    ],
  },
  {
    title: '5. Organic matter — spread it, never bury it',
    items: [
      {
        id: 'manure-rate',
        text: 'Spread 3–5 cm of well-rotted manure or mature compost across the whole bed and mix in shallowly.',
        note: 'Let the soil test set the rate rather than applying blind.',
      },
      {
        id: 'no-fresh',
        text: 'Never use fresh manure — it needs 4–6 months to rot down.',
      },
      {
        id: 'salt',
        text: 'Check the salt content, and go easy on poultry manure.',
        note: 'Manure is often salty and alkaline. Winter rain will leach it before spring.',
      },
      {
        id: 'no-hole-amend',
        text: 'Do NOT put manure or compost in the planting holes.',
        note: 'Rich backfill makes roots circle inside the pocket and turns a heavy soil into a sump. Feed the surface instead.',
      },
      { id: 'rest', text: 'Let it settle 3–4 weeks before planting trees.' },
    ],
  },
  {
    title: '6. Plan the layout',
    items: [
      {
        id: 'stakes',
        text: 'Mark tree positions with stakes at full mature spacing (see the table).',
      },
      {
        id: 'contour',
        text: 'Run rows across the contour, not up and down the slope.',
      },
      {
        id: 'frost-place',
        text: 'Put the earliest bloomers — almond, apricot, peach — high on the slope, never in a frost hollow.',
        note: 'At 1,400 m these bloom into frost most years. Late-flowering cultivars and cold-air drainage are the only real defences.',
      },
      {
        id: 'walnut',
        text: 'Keep juglone-sensitive plants clear of the walnut’s eventual dripline.',
        note: 'A mature walnut needs 12–15 m anyway, so correct spacing solves this on its own.',
      },
      { id: 'irrigation', text: 'Plan drip irrigation lines.' },
      {
        id: 'windbreak',
        text: 'Plan a windbreak now — it takes years to grow.',
        note: 'Exposure and desiccation are significant at this altitude.',
      },
    ],
  },
  {
    title: '7. Protect the ground before the rains',
    items: [
      {
        id: 'cover',
        text: 'Sow a winter cover crop or leave residue on any disturbed ground.',
        note: 'Roughly 800 mm/yr falls here, much of it as intense winter rain and snowmelt.',
      },
      { id: 'terraces', text: 'Keep and repair the dry-stone terraces.' },
      {
        id: 'mulch',
        text: 'Mulch 5–8 cm deep and wide — but pull it back 10–15 cm clear of every trunk.',
        note: 'Mulch piled against bark rots it. Never make a volcano around the stem.',
      },
    ],
  },
  {
    title: '8. Order plants & prepare to plant',
    items: [
      {
        id: 'order',
        text: 'Order bare-root stock now for November–December or late February–March.',
        note: 'Skip January here — the ground can be frozen or under snow. This is zone 8, not the coastal zone 10.',
      },
      {
        id: 'rootstock',
        text: 'Choose rootstock for cold hardiness and stony ground.',
        note: 'It matters more to the outcome than the soil prep does.',
      },
      {
        id: 'fence',
        text: 'Fence against goats and sheep, and fit mesh guards against voles.',
        note: 'Rodents girdle young trunks under snow cover; tree tubes alone will not stop a goat.',
      },
      {
        id: 'hole',
        text: 'When planting: dig 2–3× as wide as the root ball but no deeper, and backfill with native soil.',
        note: 'Keep the root flare at or just above grade. Roughen the sides of the hole so roots can escape.',
      },
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

function updateSoilCount() {
  const all = SOIL_PREP.flatMap((s) => s.items);
  const done = all.filter((i) => soilDone[i.id]).length;
  document.getElementById('soilCount')!.textContent = `${done} / ${all.length} done`;
}

function renderSoilPrep() {
  let html = '';
  SOIL_PREP.forEach((step) => {
    html += `<div class="soil-step"><h3>${step.title}</h3>`;
    step.items.forEach((item) => {
      const id = item.id;
      html += `<label class="soil-item${soilDone[id] ? ' done' : ''}"><input type="checkbox" data-soil="${id}" ${soilDone[id] ? 'checked' : ''}><span>${item.text}${item.note ? `<span class="soil-note">${item.note}</span>` : ''}</span></label>`;
    });
    html += `</div>`;
  });
  document.getElementById('soilBody')!.innerHTML = html;
  updateSoilCount();
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
  t.closest('.soil-item')!.classList.toggle('done', t.checked);
  updateSoilCount();
});

document.getElementById('btnPickAll')!.addEventListener('click', () => {
  const visible = visiblePlants();
  if (visible.length === 0) return;
  const allPicked = visible.every((p) => state.checked[p.id]);
  for (const p of visible) state.checked[p.id] = !allPicked;
  saveState();
  render();
  toast(allPicked ? 'Cleared all shown' : `Picked ${visible.length} plants`);
});

document.getElementById('btnViewCalendar')!.addEventListener('click', openCalendar);
document.getElementById('calClose')!.addEventListener('click', closeCalendar);
document.getElementById('calModal')!.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeCalendar();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isCalendarOpen()) closeCalendar();
});
document.getElementById('tabWindows')!.addEventListener('click', () => {
  calTab = 'windows';
  renderCalendar();
});
document.getElementById('tabDeadlines')!.addEventListener('click', () => {
  calTab = 'deadlines';
  renderCalendar();
});

document.getElementById('filterToggle')!.addEventListener('change', render);
document.getElementById('searchBox')!.addEventListener('input', render);
document.getElementById('btnCSV')!.addEventListener('click', exportCSV);

loadState();
renderSoilPrep();
render();
