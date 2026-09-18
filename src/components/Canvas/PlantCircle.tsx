import { Group, Circle, Text, Ring, Shape } from 'react-konva';
import type { PlacedPlant } from '../../types/canvas';
import type { MonthlyState } from '../../types/plant';
import { STATE_COLORS } from '../../types/plant';
import { PLANTS_MAP } from '../../data/plants';
import { useGardenStore } from '../../stores/gardenStore';
import PlantBadges from './PlantBadges';
import { WATER_COLORS, mapFill } from './plantColors';
import { drawPlantTexture } from './textures';
import { NAME_FONT } from './canvasFonts';

interface PlantCircleProps {
  placed: PlacedPlant;
  pixelsPerMeter: number;
  currentMonth: number;
  isSelected: boolean;
  stageScale: number;
}


export default function PlantCircle({
  placed,
  pixelsPerMeter,
  currentMonth,
  isSelected,
  stageScale,
}: PlantCircleProps) {
  const moveElement = useGardenStore((s) => s.moveElement);
  const updatePlant = useGardenStore((s) => s.updatePlant);
  const checkpoint = useGardenStore((s) => s.checkpoint);
  const setSelectedId = useGardenStore((s) => s.setSelectedId);
  const overlayWater = useGardenStore((s) => s.overlayWater);

  const plant = PLANTS_MAP[placed.plantId];
  if (!plant) return null;

  const state: MonthlyState = plant.monthlyStates[currentMonth] ?? 'dormant';
  const radiusPx = (placed.radiusM ?? plant.matureRadiusM) * pixelsPerMeter;
  const fill = mapFill(plant, state, currentMonth);
  const opacity = STATE_COLORS[state].opacity;
  const fontSize = Math.max(10, 12 / stageScale);
  // Small plants get a label wider than their circle rather than one letter per line.
  const labelW = radiusPx * 2 < fontSize * 6 ? Math.max(radiusPx * 2, plant.name.length * fontSize * 0.62) : radiusPx * 2;

  return (
    <Group
      x={placed.x}
      y={placed.y}
      draggable
      onDragStart={(e) => {
        if (e.target === e.currentTarget) checkpoint();
      }}
      onDragEnd={(e) => {
        // Ignore drags of the resize handle bubbling up from inside the group.
        if (e.target !== e.currentTarget) return;
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
      <Shape
        listening={false}
        opacity={0.75}
        sceneFunc={(ctx) => drawPlantTexture(ctx._context, plant, state, fill, radiusPx, placed.id)}
      />
      <Text
        fontFamily={NAME_FONT}
        text={plant.name}
        fontSize={fontSize}
        fill="#1F2937"
        fontStyle="bold"
        align="center"
        verticalAlign="middle"
        offsetX={labelW / 2}
        offsetY={fontSize / 2}
        width={labelW}
        listening={false}
      />
      <PlantBadges plant={plant} stageScale={stageScale} offsetY={radiusPx} />
      {/* Resize handle on the circle's edge */}
      {isSelected && (
        <Circle
          x={radiusPx}
          y={0}
          radius={6 / stageScale}
          fill="#2563EB"
          stroke="white"
          strokeWidth={2 / stageScale}
          draggable
          onDragStart={(e) => {
            e.cancelBubble = true;
            checkpoint();
          }}
          onDragMove={(e) => {
            e.cancelBubble = true;
            const r = Math.hypot(e.target.x(), e.target.y()) / pixelsPerMeter;
            updatePlant(placed.id, { radiusM: Math.max(0.1, Math.round(r * 10) / 10) });
            e.target.position({ x: Math.max(0.1, r) * pixelsPerMeter, y: 0 });
          }}
          onDragEnd={(e) => {
            e.cancelBubble = true;
          }}
          onMouseEnter={(e) => {
            const c = e.target.getStage()?.container();
            if (c) c.style.cursor = 'ew-resize';
          }}
          onMouseLeave={(e) => {
            const c = e.target.getStage()?.container();
            if (c) c.style.cursor = 'default';
          }}
        />
      )}
    </Group>
  );
}
