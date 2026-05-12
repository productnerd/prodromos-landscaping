import { Group, Rect, Text, Circle } from 'react-konva';
import type { PlacedBuilding } from '../../types/canvas';
import { useGardenStore } from '../../stores/gardenStore';

interface BuildingRectProps {
  building: PlacedBuilding;
  pixelsPerMeter: number;
  isSelected: boolean;
  stageScale: number;
}

export default function BuildingRect({
  building,
  pixelsPerMeter,
  isSelected,
  stageScale,
}: BuildingRectProps) {
  const moveElement = useGardenStore((s) => s.moveElement);
  const setSelectedId = useGardenStore((s) => s.setSelectedId);
  const resizeBuilding = useGardenStore((s) => s.resizeBuilding);

  const w = building.widthM * pixelsPerMeter;
  const h = building.heightM * pixelsPerMeter;
  const fontSize = Math.max(10, 12 / stageScale);
  const handleR = 5 / stageScale;

  const dimLabel = `${building.widthM.toFixed(1)}×${building.heightM.toFixed(1)}m`;

  return (
    <Group
      x={building.x}
      y={building.y}
      draggable
      onDragEnd={(e) => {
        moveElement(building.id, e.target.x(), e.target.y());
      }}
      onClick={(e) => {
        e.cancelBubble = true;
        setSelectedId(building.id);
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        setSelectedId(building.id);
      }}
    >
      <Rect
        width={w}
        height={h}
        offsetX={w / 2}
        offsetY={h / 2}
        fill="#9CA3AF"
        opacity={0.6}
        stroke={isSelected ? '#2563EB' : '#4B5563'}
        strokeWidth={isSelected ? 3 / stageScale : 1 / stageScale}
      />
      <Text
        text={building.label}
        fontSize={fontSize}
        fill="#1F2937"
        fontStyle="bold"
        align="center"
        verticalAlign="middle"
        offsetX={w / 2}
        offsetY={fontSize / 2}
        width={w}
        listening={false}
      />
      {isSelected && (
        <Text
          text={dimLabel}
          fontSize={fontSize * 0.85}
          fill="#2563EB"
          align="center"
          offsetX={w / 2}
          y={h / 2 + 4 / stageScale}
          width={w}
          listening={false}
        />
      )}
      {isSelected && (
        <Circle
          x={w / 2}
          y={h / 2}
          radius={handleR}
          fill="#2563EB"
          stroke="white"
          strokeWidth={2 / stageScale}
          draggable
          onDragMove={(e) => {
            const nx = e.target.x();
            const ny = e.target.y();
            const newW = Math.max(0.5, (nx * 2) / pixelsPerMeter);
            const newH = Math.max(0.5, (ny * 2) / pixelsPerMeter);
            resizeBuilding(building.id, newW, newH);
          }}
          onDragEnd={(e) => {
            e.target.x(w / 2);
            e.target.y(h / 2);
          }}
          onMouseEnter={(e) => {
            const container = e.target.getStage()?.container();
            if (container) container.style.cursor = 'nwse-resize';
          }}
          onMouseLeave={(e) => {
            const container = e.target.getStage()?.container();
            if (container) container.style.cursor = 'default';
          }}
        />
      )}
    </Group>
  );
}
