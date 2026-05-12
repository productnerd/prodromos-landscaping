import { Group, Circle, Text } from 'react-konva';
import type { PlacedPlant } from '../../types/canvas';
import type { PlantDefinition, MonthlyState } from '../../types/plant';
import { STATE_COLORS } from '../../types/plant';
import { PLANTS_MAP } from '../../data/plants';
import { useGardenStore } from '../../stores/gardenStore';

interface PlantCircleProps {
  placed: PlacedPlant;
  pixelsPerMeter: number;
  currentMonth: number;
  isSelected: boolean;
  stageScale: number;
}

function getFillColor(plant: PlantDefinition, state: MonthlyState): string {
  switch (state) {
    case 'flowering':
      return plant.flowerColor || STATE_COLORS.flowering.fill;
    case 'fruiting':
    case 'fruit-ripe':
      return plant.fruitColor || STATE_COLORS[state].fill;
    case 'leafing':
    case 'sprouting':
      return plant.foliageColor || STATE_COLORS[state].fill;
    default:
      return STATE_COLORS[state].fill;
  }
}

export default function PlantCircle({
  placed,
  pixelsPerMeter,
  currentMonth,
  isSelected,
  stageScale,
}: PlantCircleProps) {
  const moveElement = useGardenStore((s) => s.moveElement);
  const setSelectedId = useGardenStore((s) => s.setSelectedId);

  const plant = PLANTS_MAP[placed.plantId];
  if (!plant) return null;

  const state: MonthlyState = plant.monthlyStates[currentMonth] ?? 'dormant';
  const radiusPx = plant.matureRadiusM * pixelsPerMeter;
  const fill = getFillColor(plant, state);
  const opacity = STATE_COLORS[state].opacity;
  const fontSize = Math.max(10, 12 / stageScale);

  return (
    <Group
      x={placed.x}
      y={placed.y}
      draggable
      onDragEnd={(e) => {
        moveElement(placed.id, e.target.x(), e.target.y());
      }}
      onClick={(e) => {
        e.cancelBubble = true;
        setSelectedId(placed.id);
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        setSelectedId(placed.id);
      }}
    >
      <Circle
        radius={radiusPx}
        fill={fill}
        opacity={opacity}
        stroke={isSelected ? '#2563EB' : '#374151'}
        strokeWidth={isSelected ? 3 / stageScale : 1 / stageScale}
        dash={state === 'dormant' && isSelected ? [6, 3] : undefined}
      />
      <Text
        text={plant.name}
        fontSize={fontSize}
        fill="#1F2937"
        fontStyle="bold"
        align="center"
        verticalAlign="middle"
        offsetX={radiusPx}
        offsetY={fontSize / 2}
        width={radiusPx * 2}
        listening={false}
      />
    </Group>
  );
}
