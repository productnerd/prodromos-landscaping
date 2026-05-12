import { Group, Rect, Text, Circle, Line } from 'react-konva';
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
  const rotateBuilding = useGardenStore((s) => s.rotateBuilding);

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
      {/* Right edge handle — width only */}
      {isSelected && (
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
          onDragMove={(e) => {
            const newW = Math.max(0.5, (e.target.x() + handleR) * 2 / pixelsPerMeter);
            resizeBuilding(building.id, newW, building.heightM);
          }}
          onDragEnd={(e) => {
            e.target.x(w / 2 - handleR);
            e.target.y(-handleR);
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
      {/* Bottom edge handle — height only */}
      {isSelected && (
        <Rect
          x={-handleR}
          y={h / 2 - handleR}
          width={handleR * 2}
          height={handleR * 2}
          fill="#2563EB"
          stroke="white"
          strokeWidth={2 / stageScale}
          cornerRadius={2 / stageScale}
          draggable
          onDragMove={(e) => {
            const newH = Math.max(0.5, (e.target.y() + handleR) * 2 / pixelsPerMeter);
            resizeBuilding(building.id, building.widthM, newH);
          }}
          onDragEnd={(e) => {
            e.target.x(-handleR);
            e.target.y(h / 2 - handleR);
          }}
          onMouseEnter={(e) => {
            const c = e.target.getStage()?.container();
            if (c) c.style.cursor = 'ns-resize';
          }}
          onMouseLeave={(e) => {
            const c = e.target.getStage()?.container();
            if (c) c.style.cursor = 'default';
          }}
        />
      )}
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
