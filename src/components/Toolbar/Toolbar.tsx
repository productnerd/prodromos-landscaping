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

export default function Toolbar({ stageRef, onShowPlantingPlan }: ToolbarProps) {
  const {
    selectedId,
    buildingMode,
    pixelsPerMeter,
    importDxf,
    removeElement,
    setBuildingMode,
    setPixelsPerMeter,
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
    <div className="h-12 bg-gray-800 text-white flex items-center px-4 gap-3 shrink-0">
      <span className="font-semibold text-sm mr-auto whitespace-nowrap">
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
        className="px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600"
        onClick={() => fileInputRef.current?.click()}
      >
        Import DXF
      </button>

      <button
        className={`px-3 py-1 text-xs rounded ${
          buildingMode ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
        }`}
        onClick={() => setBuildingMode(!buildingMode)}
      >
        Add Building
      </button>

      <button
        className="px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40"
        disabled={!selectedId}
        onClick={() => selectedId && removeElement(selectedId)}
      >
        Delete Selected
      </button>

      <button
        className="px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600"
        onClick={handleExportPng}
      >
        Export PNG
      </button>

      <button
        className="px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600"
        onClick={onShowPlantingPlan}
      >
        Planting Plan
      </button>

      <div className="flex items-center gap-1 text-xs ml-2">
        <button
          className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 flex items-center justify-center"
          onClick={() => setPixelsPerMeter(Math.max(10, pixelsPerMeter - 5))}
        >
          -
        </button>
        <span className="w-16 text-center">{pixelsPerMeter} px/m</span>
        <button
          className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 flex items-center justify-center"
          onClick={() => setPixelsPerMeter(pixelsPerMeter + 5)}
        >
          +
        </button>
      </div>
    </div>
  );
}
