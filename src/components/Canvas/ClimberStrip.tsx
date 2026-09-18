import { Group, Rect, Text, Line, Circle, Shape } from 'react-konva';
import type { PlacedPlant } from '../../types/canvas';
import type { MonthlyState } from '../../types/plant';
import { STATE_COLORS } from '../../types/plant';
import { PLANTS_MAP } from '../../data/plants';
import { useGardenStore } from '../../stores/gardenStore';
import { CLIMBER_DEPTH_M, climberLengthM } from '../../utils/staging';
import { mapFill } from './plantColors';
import { drawVineTexture } from './textures';
import PlantBadges from './PlantBadges';
import { NAME_FONT } from './canvasFonts';

interface Props {
  placed: PlacedPlant;
  pixelsPerMeter: number;
  currentMonth: number;
  isSelected: boolean;
  stageScale: number;
}

/** A climber drawn as a fixed-depth strip along a wall: adjustable length, rotatable. */
export default function ClimberStrip({ placed, pixelsPerMeter, currentMonth, isSelected, stageScale }: Props) {
  const moveElement = useGardenStore((s) => s.moveElement);
  const updatePlant = useGardenStore((s) => s.updatePlant);
  const checkpoint = useGardenStore((s) => s.checkpoint);
  const setSelectedId = useGardenStore((s) => s.setSelectedId);

  const plant = PLANTS_MAP[placed.plantId];
  if (!plant) return null;

  const state: MonthlyState = plant.monthlyStates[currentMonth] ?? 'dormant';
  const fill = mapFill(plant, state, currentMonth);
  const w = climberLengthM(plant, placed) * pixelsPerMeter;
  const h = CLIMBER_DEPTH_M * pixelsPerMeter;
  const handleR = 5 / stageScale;
  const armLen = 20 / stageScale;
  const fontSize = Math.max(10, 12 / stageScale);

  const cursor = (value: string) => (e: { target: { getStage: () => { container: () => HTMLElement } | null } }) => {
    const c = e.target.getStage()?.container();
    if (c) c.style.cursor = value;
  };

  return (
    <Group
      x={placed.x}
      y={placed.y}
      rotation={placed.rotation ?? 0}
      draggable
      onDragStart={(e) => {
        if (e.target === e.currentTarget) checkpoint();
      }}
      onDragEnd={(e) => {
        // Ignore handle drags bubbling up from inside the group.
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
      <Rect
        width={w}
        height={h}
        offsetX={w / 2}
        offsetY={h / 2}
        fill={fill}
        opacity={Math.max(STATE_COLORS[state].opacity, 0.45)}
        cornerRadius={h / 2}
        stroke={isSelected ? '#2563EB' : '#374151'}
        strokeWidth={isSelected ? 3 / stageScale : 1 / stageScale}
      />
      <Shape
        listening={false}
        opacity={0.8}
        sceneFunc={(ctx) => drawVineTexture(ctx._context, plant, state, fill, w, h, placed.id)}
      />
      <Text
        fontFamily={NAME_FONT}
        text={plant.name}
        fontSize={fontSize}
        fill="#FFFFFF"
        shadowColor="#1F2937"
        shadowBlur={3 / stageScale}
        shadowOpacity={0.9}
        fontStyle="bold"
        align="center"
        offsetX={w / 2}
        y={-h / 2 - fontSize * 1.3}
        width={w}
        listening={false}
      />
      <PlantBadges plant={plant} stageScale={stageScale} offsetY={h / 2} />

      {isSelected && (
        <>
          {/* Length handle at the right end; the strip grows from its centre */}
          <Rect
            x={w / 2 - handleR}
            y={-handleR}
            width={handleR * 2}
            height={handleR * 2}
            fill="#2563EB"
            stroke="white"
            strokeWidth={2 / stageScale}
            cornerRadius={2 / stageScale}
            draggable
            onDragStart={(e) => {
              e.cancelBubble = true;
              checkpoint();
            }}
            onDragMove={(e) => {
              e.cancelBubble = true;
              const lengthM = Math.max(0.5, Math.round((((e.target.x() + handleR) * 2) / pixelsPerMeter) * 10) / 10);
              updatePlant(placed.id, { lengthM });
              e.target.y(-handleR);
            }}
            onDragEnd={(e) => {
              e.cancelBubble = true;
              e.target.position({ x: w / 2 - handleR, y: -handleR });
            }}
            onMouseEnter={cursor('ew-resize')}
            onMouseLeave={cursor('default')}
          />

          {/* Rotate handle, to line the strip up with a wall */}
          <Line points={[0, -h / 2, 0, -h / 2 - armLen]} stroke="#2563EB" strokeWidth={1.5 / stageScale} listening={false} />
          <Circle
            x={0}
            y={-h / 2 - armLen}
            radius={handleR}
            fill="#10B981"
            stroke="white"
            strokeWidth={2 / stageScale}
            draggable
            onDragStart={(e) => {
              e.cancelBubble = true;
              checkpoint();
            }}
            onDragMove={(e) => {
              e.cancelBubble = true;
              const stage = e.target.getStage();
              const pointer = stage?.getPointerPosition();
              if (!stage || !pointer) return;
              const p = stage.getAbsoluteTransform().copy().invert().point(pointer);
              const angle = (Math.atan2(p.x - placed.x, -(p.y - placed.y)) * 180) / Math.PI;
              // Snap to whole degrees; walls are rarely at fractions.
              updatePlant(placed.id, { rotation: Math.round(angle) });
            }}
            onDragEnd={(e) => {
              e.cancelBubble = true;
              e.target.position({ x: 0, y: -h / 2 - armLen });
            }}
            onMouseEnter={cursor('grab')}
            onMouseLeave={cursor('default')}
          />
        </>
      )}
    </Group>
  );
}
