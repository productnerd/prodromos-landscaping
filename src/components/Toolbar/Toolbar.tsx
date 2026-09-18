import { useRef } from 'react';
import { useGardenStore } from '../../stores/gardenStore';
import { svgToPlotOutline } from '../../utils/svg-to-plot';

const BTN =
  'px-3 py-1 text-xs rounded-[4px] border border-[var(--divider)] bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--cream)] hover:border-[var(--warm-gray)] transition-colors';
const BTN_ACTIVE =
  'px-3 py-1 text-xs rounded-[4px] border border-[var(--forest)] bg-[var(--forest)] text-[var(--paper)] transition-colors';

export default function Toolbar() {
  const {
    selectedId,
    buildingMode,
    drawPlotMode,
    drawingPlotId,
    pixelsPerMeter,
    undoStack,
    overlayWater,
    overlaySoil,
    removeElement,
    setBuildingMode,
    measureMode,
    setMeasureMode,
    clearMeasure,
    setDrawPlotMode,
    cancelPlot,
    setPixelsPerMeter,
    undo,
    setOverlayWater,
    setOverlaySoil,
    requestImportPlot,
  } = useGardenStore();

  const svgInputRef = useRef<HTMLInputElement>(null);

  const handleSvgFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const outline = svgToPlotOutline(await file.text());
    if (!outline || outline.width === 0) {
      alert('Could not find a shape in that SVG. It needs at least one path, polygon or rectangle.');
      return;
    }

    // SVG units rarely match real distances, so ask for the true size.
    const answer = prompt(
      `How wide is this plot in metres (left to right)?\nThe drawing is ${outline.width.toFixed(1)} × ${outline.height.toFixed(1)} units.`,
      outline.width.toFixed(1),
    );
    const widthM = Number(answer?.replace(',', '.'));
    if (!answer || !(widthM > 0)) return;

    const scale = widthM / outline.width;
    const xs = outline.points.map((p) => p.x);
    const ys = outline.points.map((p) => p.y);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    requestImportPlot(outline.points.map((p) => ({ x: (p.x - cx) * scale, y: (p.y - cy) * scale })));
  };

  return (
    <div className="h-12 bg-[var(--paper)] text-[var(--ink)] border-b border-[var(--divider)] flex items-center px-4 gap-3 shrink-0">
      <span className="font-[Fraunces,Georgia,serif] font-medium text-[15px] text-[var(--forest-deep)] mr-auto whitespace-nowrap">
        Garden Planner &mdash; Prodromos, Cyprus
      </span>

      <button
        className={drawPlotMode ? BTN_ACTIVE : BTN}
        onClick={() => {
          if (drawPlotMode) {
            cancelPlot();
          } else {
            setDrawPlotMode(true);
          }
        }}
      >
        {drawPlotMode ? (drawingPlotId ? 'Cancel Drawing' : 'Draw Plot ✏️') : 'Draw Plot ✏️'}
      </button>

      {drawPlotMode && (
        <span className="text-[10px] italic text-[var(--ink-light)] max-w-32">
          Click to place vertices. Click first point to close.
        </span>
      )}

      <input
        ref={svgInputRef}
        type="file"
        accept=".svg,image/svg+xml"
        className="hidden"
        onChange={handleSvgFile}
      />
      <button
        className={BTN}
        onClick={() => svgInputRef.current?.click()}
        title="Import the outline of your plot from an SVG file"
      >
        Import Plot SVG
      </button>

      <button
        className={buildingMode ? BTN_ACTIVE : BTN}
        onClick={() => setBuildingMode(!buildingMode)}
      >
        Add Building
      </button>

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
        disabled={!selectedId}
        onClick={() => selectedId && removeElement(selectedId)}
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
