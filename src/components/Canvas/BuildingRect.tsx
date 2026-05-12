import { Group, Rect, Text } from 'react-konva';
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

  const w = building.widthM * pixelsPerMeter;
  const h = building.heightM * pixelsPerMeter;
  const fontSize = Math.max(10, 12 / stageScale);

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
    </Group>
  );
}
