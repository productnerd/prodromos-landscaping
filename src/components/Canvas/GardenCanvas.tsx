import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Stage, Layer, Line, Circle, Arc, Text } from 'react-konva';
import type Konva from 'konva';
import { useGardenStore } from '../../stores/gardenStore';
import { checkCompatibility } from '../../utils/compatibility-checker';
import PlantCircle from './PlantCircle';
import BuildingRect from './BuildingRect';

interface GardenCanvasProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

const SCALE_BY = 1.05;

export default function GardenCanvas({ stageRef }: GardenCanvasProps) {
  const {
    dxfShapes,
    placedPlants,
    placedBuildings,
    pixelsPerMeter,
    currentMonth,
    selectedId,
    buildingMode,
    addPlant,
    addBuilding,
    setSelectedId,
  } = useGardenStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  // Measure container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      setDimensions({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Compatibility warnings
  const warnings = useMemo(
    () => checkCompatibility(placedPlants, pixelsPerMeter),
    [placedPlants, pixelsPerMeter],
  );

  // Build a lookup from instance id -> position for warning lines
  const plantPosMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    for (const p of placedPlants) map.set(p.id, { x: p.x, y: p.y });
    return map;
  }, [placedPlants]);

  // Zoom to cursor
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * SCALE_BY : oldScale / SCALE_BY;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    setStageScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  }, [stageRef]);

  // Drop plant from sidebar
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const plantId = e.dataTransfer.getData('plantId');
      if (!plantId) return;

      const stage = stageRef.current;
      if (!stage) return;

      const rect = (e.target as HTMLElement).closest('div')!.getBoundingClientRect();
      const x = (e.clientX - rect.left - stagePos.x) / stageScale;
      const y = (e.clientY - rect.top - stagePos.y) / stageScale;
      addPlant(plantId, x, y);
    },
    [stageRef, stagePos, stageScale, addPlant],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  // Click on stage: building mode -> add building, else deselect
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Only fire on clicks directly on the stage (empty area)
      if (e.target !== e.target.getStage()) return;

      if (buildingMode) {
        const stage = stageRef.current;
        if (!stage) return;
        const pointer = stage.getPointerPosition();
        if (!pointer) return;
        const x = (pointer.x - stage.x()) / stageScale;
        const y = (pointer.y - stage.y()) / stageScale;
        addBuilding(x, y, 5, 3, 'Building');
      } else {
        setSelectedId(null);
      }
    },
    [buildingMode, stageRef, stageScale, addBuilding, setSelectedId],
  );

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    setStagePos({ x: e.target.x(), y: e.target.y() });
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden bg-gray-100"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        draggable
        onWheel={handleWheel}
        onClick={handleStageClick}
        onDragEnd={handleDragEnd}
      >
        {/* Layer 1: DXF base shapes + grid */}
        <Layer listening={false}>
          {/* Grid */}
          {Array.from({ length: Math.ceil(dimensions.width / stageScale / pixelsPerMeter) + 20 }, (_, i) => (
            <Line
              key={`gv-${i}`}
              points={[i * pixelsPerMeter, -1000, i * pixelsPerMeter, 5000]}
              stroke="#E5E7EB"
              strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: Math.ceil(dimensions.height / stageScale / pixelsPerMeter) + 20 }, (_, i) => (
            <Line
              key={`gh-${i}`}
              points={[-1000, i * pixelsPerMeter, 5000, i * pixelsPerMeter]}
              stroke="#E5E7EB"
              strokeWidth={0.5}
            />
          ))}

          {/* DXF shapes */}
          {dxfShapes.map((shape, idx) => {
            switch (shape.type) {
              case 'line':
              case 'polyline':
                return (
                  <Line
                    key={`dxf-${idx}`}
                    points={shape.points ?? []}
                    stroke={shape.color ?? '#666'}
                    strokeWidth={1}
                    closed={shape.closed}
                  />
                );
              case 'circle':
                return (
                  <Circle
                    key={`dxf-${idx}`}
                    x={shape.x ?? 0}
                    y={shape.y ?? 0}
                    radius={shape.radius ?? 0}
                    stroke={shape.color ?? '#666'}
                    strokeWidth={1}
                  />
                );
              case 'arc':
                return (
                  <Arc
                    key={`dxf-${idx}`}
                    x={shape.x ?? 0}
                    y={shape.y ?? 0}
                    innerRadius={shape.radius ?? 0}
                    outerRadius={shape.radius ?? 0}
                    angle={(shape.endAngle ?? 360) - (shape.startAngle ?? 0)}
                    rotation={shape.startAngle ?? 0}
                    stroke={shape.color ?? '#666'}
                    strokeWidth={1}
                  />
                );
              case 'text':
                return (
                  <Text
                    key={`dxf-${idx}`}
                    x={shape.x ?? 0}
                    y={shape.y ?? 0}
                    text={shape.text ?? ''}
                    fontSize={12}
                    fill={shape.color ?? '#444'}
                  />
                );
              default:
                return null;
            }
          })}
        </Layer>

        {/* Layer 2: Interactive plants and buildings */}
        <Layer>
          {placedPlants.map((p) => (
            <PlantCircle
              key={p.id}
              placed={p}
              pixelsPerMeter={pixelsPerMeter}
              currentMonth={currentMonth}
              isSelected={selectedId === p.id}
              stageScale={stageScale}
            />
          ))}
          {placedBuildings.map((b) => (
            <BuildingRect
              key={b.id}
              building={b}
              pixelsPerMeter={pixelsPerMeter}
              isSelected={selectedId === b.id}
              stageScale={stageScale}
            />
          ))}
        </Layer>

        {/* Layer 3: Compatibility warning lines */}
        <Layer listening={false}>
          {warnings.map((w, idx) => {
            const posA = plantPosMap.get(w.plantAInstanceId);
            const posB = plantPosMap.get(w.plantBInstanceId);
            if (!posA || !posB) return null;
            return (
              <Line
                key={`warn-${idx}`}
                points={[posA.x, posA.y, posB.x, posB.y]}
                stroke={w.rule.severity === 'critical' ? '#DC2626' : '#F59E0B'}
                strokeWidth={2 / stageScale}
                dash={[6, 4]}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
