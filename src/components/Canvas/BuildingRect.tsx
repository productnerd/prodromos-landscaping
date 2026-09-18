import { Group, Rect, Text, Circle, Line } from 'react-konva';
import type { PlacedBuilding } from '../../types/canvas';
import { useGardenStore } from '../../stores/gardenStore';
import { NAME_FONT, BODY_FONT } from './canvasFonts';

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
  const rotateBuilding = useGardenStore((s) => s.rotateBuilding);
  const checkpoint = useGardenStore((s) => s.checkpoint);
  const resizeBuilding = useGardenStore((s) => s.resizeBuilding);
  const isPatio = building.kind === 'patio';

  const w = building.widthM * pixelsPerMeter;
  const h = building.heightM * pixelsPerMeter;
  const rotation = building.rotation ?? 0;
  const fontSize = Math.max(10, 12 / stageScale);
  const handleR = 5 / stageScale;
  const rotateArmLen = 20 / stageScale;

  const dimLabel = `${building.widthM.toFixed(1)}×${building.heightM.toFixed(1)}m`;

  return (
    <Group
      x={building.x}
      y={building.y}
      rotation={rotation}
      draggable
      onDragStart={(e) => {
        if (e.target === e.currentTarget) checkpoint();
      }}
      onDragEnd={(e) => {
        // Ignore drags of the rotate handle bubbling up from inside the group.
        if (e.target !== e.currentTarget) return;
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
        fill={isPatio ? '#8B5E3C' : '#9CA3AF'}
        opacity={isPatio ? 0.55 : 0.6}
        stroke={isSelected ? '#2563EB' : isPatio ? '#5C3D26' : '#4B5563'}
        strokeWidth={isSelected ? 3 / stageScale : 1 / stageScale}
      />
      <Text
        fontFamily={NAME_FONT}
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
          fontFamily={BODY_FONT}
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
      {/* Patio resize handles: right edge sets width, bottom edge sets depth */}
      {isSelected && isPatio &&
        (['width', 'depth'] as const).map((dim) => (
          <Rect
            key={dim}
            x={dim === 'width' ? w / 2 - handleR : -handleR}
            y={dim === 'width' ? -handleR : h / 2 - handleR}
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
              const half = (dim === 'width' ? e.target.x() : e.target.y()) + handleR;
              const sizeM = Math.max(0.5, Math.round(((half * 2) / pixelsPerMeter) * 10) / 10);
              if (dim === 'width') resizeBuilding(building.id, sizeM, building.heightM);
              else resizeBuilding(building.id, building.widthM, sizeM);
            }}
            onDragEnd={(e) => {
              e.cancelBubble = true;
              const half = ((dim === 'width' ? building.widthM : building.heightM) * pixelsPerMeter) / 2;
              e.target.position(dim === 'width' ? { x: half - handleR, y: -handleR } : { x: -handleR, y: half - handleR });
            }}
            onMouseEnter={(e) => {
              const c = e.target.getStage()?.container();
              if (c) c.style.cursor = dim === 'width' ? 'ew-resize' : 'ns-resize';
            }}
            onMouseLeave={(e) => {
              const c = e.target.getStage()?.container();
              if (c) c.style.cursor = 'default';
            }}
          />
        ))}
      {/* Rotation handle — arm + circle above top edge */}
      {isSelected && (
        <>
          <Line
            points={[0, -h / 2, 0, -h / 2 - rotateArmLen]}
            stroke="#2563EB"
            strokeWidth={1.5 / stageScale}
            listening={false}
          />
          <Circle
            x={0}
            y={-h / 2 - rotateArmLen}
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
              const stage = e.target.getStage();
              if (!stage) return;
              const pointer = stage.getPointerPosition();
              if (!pointer) return;
              const groupX = building.x;
              const groupY = building.y;
              const stageTransform = stage.getAbsoluteTransform();
              const inverted = stageTransform.copy().invert();
              const canvasPointer = inverted.point(pointer);
              const angle = Math.atan2(canvasPointer.x - groupX, -(canvasPointer.y - groupY)) * (180 / Math.PI);
              rotateBuilding(building.id, angle);
            }}
            onDragEnd={(e) => {
              e.target.x(0);
              e.target.y(-h / 2 - rotateArmLen);
            }}
            onMouseEnter={(e) => {
              const c = e.target.getStage()?.container();
              if (c) c.style.cursor = 'grab';
            }}
            onMouseLeave={(e) => {
              const c = e.target.getStage()?.container();
              if (c) c.style.cursor = 'default';
            }}
          />
        </>
      )}
    </Group>
  );
}
