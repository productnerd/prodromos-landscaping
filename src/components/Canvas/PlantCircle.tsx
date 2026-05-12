import { Group, Circle, Text, Rect, Ring } from 'react-konva';
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

const WATER_COLORS: Record<string, string> = {
  low: '#F59E0B',
  medium: '#3B82F6',
  high: '#1D4ED8',
};

const WATER_LABELS: Record<string, string> = {
  low: 'LOW',
  medium: 'MED',
  high: 'HIGH',
};

const SOIL_COLORS: Record<string, string> = {
  'good': '#10B981',
  'moderate': '#F59E0B',
  'poor-tolerant': '#EF4444',
};

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
  const overlayWater = useGardenStore((s) => s.overlayWater);
  const overlaySoil = useGardenStore((s) => s.overlaySoil);

  const plant = PLANTS_MAP[placed.plantId];
  if (!plant) return null;

  const state: MonthlyState = plant.monthlyStates[currentMonth] ?? 'dormant';
  const radiusPx = plant.matureRadiusM * pixelsPerMeter;
  const fill = getFillColor(plant, state);
  const opacity = STATE_COLORS[state].opacity;
  const fontSize = Math.max(10, 12 / stageScale);
  const badgeFontSize = Math.max(8, 9 / stageScale);
  const badgeH = badgeFontSize * 1.8;

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
      {/* Water overlay ring */}
      {overlayWater && (
        <Ring
          innerRadius={radiusPx + 1 / stageScale}
          outerRadius={radiusPx + 5 / stageScale}
          fill={WATER_COLORS[plant.water] ?? '#999'}
          opacity={0.8}
          listening={false}
        />
      )}
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
      {/* Water badge */}
      {overlayWater && (() => {
        const label = WATER_LABELS[plant.water] ?? plant.water;
        const badgeW = label.length * badgeFontSize * 0.7 + 6 / stageScale;
        const color = WATER_COLORS[plant.water] ?? '#999';
        return (
          <Group x={0} y={radiusPx + 8 / stageScale} listening={false}>
            <Rect
              x={-badgeW / 2}
              y={0}
              width={badgeW}
              height={badgeH}
              fill={color}
              cornerRadius={3 / stageScale}
              opacity={0.9}
            />
            <Text
              text={label}
              fontSize={badgeFontSize}
              fontStyle="bold"
              fill="white"
              align="center"
              verticalAlign="middle"
              offsetX={badgeW / 2}
              width={badgeW}
              height={badgeH}
            />
          </Group>
        );
      })()}
      {/* Soil badge */}
      {overlaySoil && (() => {
        const label = plant.drainage === 'good' ? 'WELL-DR' : plant.drainage === 'moderate' ? 'MOD-DR' : 'POOR-OK';
        const badgeW = label.length * badgeFontSize * 0.65 + 6 / stageScale;
        const color = SOIL_COLORS[plant.drainage] ?? '#999';
        const yOff = overlayWater ? radiusPx + 8 / stageScale + badgeH + 3 / stageScale : radiusPx + 8 / stageScale;
        return (
          <Group x={0} y={yOff} listening={false}>
            <Rect
              x={-badgeW / 2}
              y={0}
              width={badgeW}
              height={badgeH}
              fill={color}
              cornerRadius={3 / stageScale}
              opacity={0.9}
            />
            <Text
              text={label}
              fontSize={badgeFontSize}
              fontStyle="bold"
              fill="white"
              align="center"
              verticalAlign="middle"
              offsetX={badgeW / 2}
              width={badgeW}
              height={badgeH}
            />
          </Group>
        );
      })()}
    </Group>
  );
}
