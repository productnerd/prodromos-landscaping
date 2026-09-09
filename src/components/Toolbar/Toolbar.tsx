import { useRef } from 'react';
import type Konva from 'konva';
import { useGardenStore } from '../../stores/gardenStore';
import { dxfToKonvaShapes } from '../../utils/dxf-to-konva';

import * as dxfModule from 'dxf';
const parseDxf = (dxfModule as any).default || (dxfModule as any).parse || dxfModule;

interface ToolbarProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  onShowPlantingPlan: () => void;
}

const BTN =
  'px-3 py-1 text-xs rounded-[4px] border border-[var(--divider)] bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--cream)] hover:border-[var(--warm-gray)] transition-colors';
const BTN_ACTIVE =
  'px-3 py-1 text-xs rounded-[4px] border border-[var(--forest)] bg-[var(--forest)] text-[var(--paper)] transition-colors';

export default function Toolbar({ stageRef, onShowPlantingPlan }: ToolbarProps) {
  const {
    selectedId,
    buildingMode,
    drawPlotMode,
    drawingPlotId,
    pixelsPerMeter,
    undoStack,
    overlayWater,
    overlaySoil,
    importDxf,
    removeElement,
    setBuildingMode,
    setDrawPlotMode,
    cancelPlot,
    setPixelsPerMeter,
    undo,
    setOverlayWater,
    setOverlaySoil,
  } = useGardenStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.toLowerCase().endsWith('.dwg')) {
      alert('DWG files are not supported directly. Please export your drawing as a DXF file from your CAD software, then import that instead.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        const parsed = parseDxf(text);
        const shapes = dxfToKonvaShapes(parsed);
        importDxf(shapes);
      } catch (err) {
        console.error('Failed to parse DXF:', err);
        alert('Failed to parse the DXF file. Make sure it is a valid DXF.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportPng = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const uri = stage.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = 'garden-plan.png';
    link.href = uri;
    link.click();
  };

  return (
    <div className="h-12 bg-[var(--paper)] text-[var(--ink)] border-b border-[var(--divider)] flex items-center px-4 gap-3 shrink-0">
      <span className="font-[Fraunces,Georgia,serif] font-medium text-[15px] text-[var(--forest-deep)] mr-auto whitespace-nowrap">
        Garden Planner &mdash; Prodromos, Cyprus
      </span>

      <input
        ref={fileInputRef}
        type="file"
        accept=".dxf,.dwg"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        className={BTN}
        onClick={() => fileInputRef.current?.click()}
      >
        Import DXF
      </button>

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

      <button
        className={buildingMode ? BTN_ACTIVE : BTN}
        onClick={() => setBuildingMode(!buildingMode)}
      >
        Add Building
      </button>

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

      <button
        className={BTN}
        onClick={handleExportPng}
      >
        Export PNG
      </button>

      <button
        className={BTN}
        onClick={onShowPlantingPlan}
      >
        Planting Plan
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
