import { useGardenStore } from '../../stores/gardenStore';
import PlanFile from './PlanFile';

const BTN =
  'px-3 py-1 text-xs rounded-[4px] border border-[var(--divider)] bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--cream)] hover:border-[var(--warm-gray)] transition-colors';
const BTN_ACTIVE =
  'px-3 py-1 text-xs rounded-[4px] border border-[var(--forest)] bg-[var(--forest)] text-[var(--paper)] transition-colors';

const NAV =
  'px-2.5 py-1 text-xs rounded-[4px] text-[var(--ink-light)] hover:bg-[var(--cream)] hover:text-[var(--forest-deep)] transition-colors whitespace-nowrap';
const NAV_ACTIVE =
  'px-2.5 py-1 text-xs rounded-[4px] bg-[var(--sage-light)] text-[var(--forest-deep)] font-medium whitespace-nowrap';

const PAGES = [
  { href: '.', label: '\u{1F5FA}\uFE0F Garden Map', current: true },
  { href: 'planting/', label: '\u{1F4CB} Plant List', current: false },
  { href: 'planting/?view=calendar', label: '\u{1F4C5} Calendar', current: false },
  { href: 'planting/?view=shopping', label: '\u{1F6D2} Shopping List', current: false },
];

export default function Toolbar() {
  const {
    selectedId,
    placedPlants,
    history,
    overlayWater,
    overlaySoil,
    overlaySun,
    removeElement,
    measureMode,
    setMeasureMode,
    clearMeasure,
    undo,
    setOverlayWater,
    setOverlaySoil,
    setOverlaySun,
  } = useGardenStore();

  // Only plants can be deleted; the building is part of the setup.
  const selectedPlant = placedPlants.find((p) => p.id === selectedId);

  return (
    <div className="h-12 bg-[var(--paper)] text-[var(--ink)] border-b border-[var(--divider)] flex items-center px-4 gap-3 shrink-0">
      <span className="font-[Fraunces,Georgia,serif] font-medium text-[15px] text-[var(--forest-deep)] whitespace-nowrap">
        Garden Planner &mdash; Prodromos, Cyprus
      </span>

      {/* Same four links as the top of the plant list, so the two pages feel like one app. */}
      <nav className="flex items-center gap-1 mr-auto border-l border-[var(--divider)] pl-3">
        {PAGES.map(({ href, label, current }) => (
          <a
            key={label}
            className={current ? NAV_ACTIVE : NAV}
            href={href}
            aria-current={current ? 'page' : undefined}
          >
            {label}
          </a>
        ))}
      </nav>

      <button
        className={measureMode ? BTN_ACTIVE : BTN}
        onClick={() => setMeasureMode(!measureMode)}
        title="Measure a distance between two points"
      >
        Measure 📏
      </button>

      {measureMode && (
        <span className="text-[10px] italic text-[var(--ink-light)] max-w-40">
          Click two points to measure.{' '}
          <button className="underline" onClick={clearMeasure}>
            Clear
          </button>
        </span>
      )}

      <button
        className={`${BTN} disabled:opacity-40`}
        disabled={!selectedPlant}
        onClick={() => selectedPlant && removeElement(selectedPlant.id)}
      >
        Delete Selected
      </button>

      <button
        className={`${BTN} disabled:opacity-40`}
        disabled={history.length === 0}
        onClick={undo}
        title="Undo (⌘Z)"
      >
        Undo
      </button>

      <PlanFile />

      <div className="flex items-center gap-1 text-xs ml-2 border-l border-[var(--divider)] pl-3">
        <button
          className={`px-2 py-1 rounded-[4px] border text-[10px] transition-colors ${
            overlayWater
              ? 'border-[var(--forest)] bg-[var(--forest)] text-[var(--paper)]'
              : 'border-[var(--divider)] bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--cream)]'
          }`}
          onClick={() => setOverlayWater(!overlayWater)}
          title="Show water requirements"
        >
          Water
        </button>
        <button
          className={`px-2 py-1 rounded-[4px] border text-[10px] transition-colors ${
            overlaySoil
              ? 'border-[var(--terracotta)] bg-[var(--terracotta)] text-[var(--paper)]'
              : 'border-[var(--divider)] bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--cream)]'
          }`}
          onClick={() => setOverlaySoil(!overlaySoil)}
          title="Show soil drainage"
        >
          Soil
        </button>
        <button
          className={`px-2 py-1 rounded-[4px] border text-[10px] transition-colors ${
            overlaySun
              ? 'border-[#D98E04] bg-[#D98E04] text-[var(--paper)]'
              : 'border-[var(--divider)] bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--cream)]'
          }`}
          onClick={() => setOverlaySun(!overlaySun)}
          title="Show sun needs"
        >
          Sun
        </button>
      </div>
    </div>
  );
}
