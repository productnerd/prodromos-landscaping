import { useGardenStore } from '../../stores/gardenStore';

const BTN =
  'px-3 py-1 text-xs rounded-[4px] border border-[var(--divider)] bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--cream)] hover:border-[var(--warm-gray)] transition-colors';
const BTN_ACTIVE =
  'px-3 py-1 text-xs rounded-[4px] border border-[var(--forest)] bg-[var(--forest)] text-[var(--paper)] transition-colors';

export default function Toolbar() {
  const {
    selectedId,
    placedPlants,
    pixelsPerMeter,
    undoStack,
    overlayWater,
    overlaySoil,
    removeElement,
    measureMode,
    setMeasureMode,
    clearMeasure,
    setPixelsPerMeter,
    undo,
    setOverlayWater,
    setOverlaySoil,
  } = useGardenStore();

  // Only plants can be deleted; the building is part of the setup.
  const selectedPlant = placedPlants.find((p) => p.id === selectedId);

  return (
    <div className="h-12 bg-[var(--paper)] text-[var(--ink)] border-b border-[var(--divider)] flex items-center px-4 gap-3 shrink-0">
      <span className="font-[Fraunces,Georgia,serif] font-medium text-[15px] text-[var(--forest-deep)] mr-auto whitespace-nowrap">
        Garden Planner &mdash; Prodromos, Cyprus
      </span>

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
        disabled={undoStack.length === 0}
        onClick={undo}
        title="Undo (⌘Z)"
      >
        Undo
      </button>

      <a
        className={BTN}
        href="planting/"
      >
        List View
      </a>

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
      </div>

      <div className="flex items-center gap-1 text-xs ml-2">
        <button
          className="w-6 h-6 rounded-[4px] border border-[var(--divider)] bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--cream)] flex items-center justify-center transition-colors"
          onClick={() => setPixelsPerMeter(Math.max(10, pixelsPerMeter - 5))}
        >
          -
        </button>
        <span className="w-16 text-center text-[var(--ink-light)]">{pixelsPerMeter} px/m</span>
        <button
          className="w-6 h-6 rounded-[4px] border border-[var(--divider)] bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--cream)] flex items-center justify-center transition-colors"
          onClick={() => setPixelsPerMeter(pixelsPerMeter + 5)}
        >
          +
        </button>
      </div>
    </div>
  );
}
