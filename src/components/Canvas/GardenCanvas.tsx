import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Stage, Layer, Line, Circle, Text, Rect, Group } from 'react-konva';
import type Konva from 'konva';
import { useGardenStore } from '../../stores/gardenStore';
import { checkCompatibility } from '../../utils/compatibility-checker';
import PlantCircle from './PlantCircle';
import BuildingRect from './BuildingRect';
import SurveyPlot from './SurveyPlot';
import { SURVEY_BOUNDARY_M } from '../../data/survey-plot';
import { STAGING_LEFT_M } from '../../utils/staging';

interface GardenCanvasProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

const SCALE_BY = 1.05;

export default function GardenCanvas({ stageRef }: GardenCanvasProps) {
  const {
    placedPlants,
    placedBuildings,
    pixelsPerMeter,
    currentMonth,
    selectedId,
    measureMode,
    measurePoints,
    addMeasurePoint,
    clearMeasure,
    setMeasureMode,
    addPlant,
    setSelectedId,
  } = useGardenStore();

  const undo = useGardenStore((s) => s.undo);
  const removeElement = useGardenStore((s) => s.removeElement);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredWarning, setHoveredWarning] = useState<number | null>(null);

  // Escape key cancels drawing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape backs out of whatever is in progress, one step at a time.
      if (e.key === 'Escape') {
        if (measureMode && measurePoints.length > 0) clearMeasure();
        else if (measureMode) setMeasureMode(false);
        else setSelectedId(null);
      }
      if (e.key === 'z' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedId) {
          e.preventDefault();
          removeElement(selectedId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [measureMode, measurePoints.length, clearMeasure, setMeasureMode, undo, selectedId, removeElement, setSelectedId]);

  // Measure container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let fitted = false;
    const measure = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      setDimensions({ width, height });

      // Open with the whole plot, and the waiting column beside it, in view.
      if (!fitted && width > 0 && height > 0) {
        fitted = true;
        const ppm = useGardenStore.getState().pixelsPerMeter;
        // Include the column to the right where new items wait.
        const xs = [...SURVEY_BOUNDARY_M.map((v) => v.x * ppm), (STAGING_LEFT_M + 6) * ppm];
        const ys = SURVEY_BOUNDARY_M.map((v) => v.y * ppm);
        const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
        const scale = Math.min((width * 0.85) / (maxX - minX), (height * 0.85) / (maxY - minY));
        setStageScale(scale);
        setStagePos({
          x: width / 2 - ((minX + maxX) / 2) * scale,
          y: height / 2 - ((minY + maxY) / 2) * scale,
        });
      }
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

  // Get canvas coordinates from pointer
  const getCanvasPos = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pointer = stage.getPointerPosition();
    if (!pointer) return null;
    return {
      x: (pointer.x - stage.x()) / stageScale,
      y: (pointer.y - stage.y()) / stageScale,
    };
  }, [stageRef, stageScale]);

  // Click on stage: draw plot / building mode / deselect
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const pos = getCanvasPos();
      if (!pos) return;

      if (measureMode) {
        addMeasurePoint(pos.x, pos.y);
        return;
      }

      // Only deselect on clicks on empty ground, not on a plant.
      if (e.target !== e.target.getStage()) return;

      setSelectedId(null);
    },
    [measureMode, addMeasurePoint, getCanvasPos, setSelectedId],
  );

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    if (e.target !== e.target.getStage()) return;
    setStagePos({ x: e.target.x(), y: e.target.y() });
  }, []);

  const handleMouseMove = useCallback(() => {
    if (!measureMode || measurePoints.length !== 1) {
      setCursorPos(null);
      return;
    }
    const pos = getCanvasPos();
    if (pos) setCursorPos(pos);
  }, [measureMode, measurePoints.length, getCanvasPos]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden bg-[var(--cream)]"
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
        draggable={!measureMode}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onDragEnd={handleDragEnd}
        onMouseMove={handleMouseMove}
        style={{ cursor: measureMode ? 'crosshair' : undefined }}
      >
        {/* Layer 1: grid */}
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

        </Layer>

        {/* Layer 2: plot boundary, building and plants */}
        <Layer>
          <SurveyPlot pixelsPerMeter={pixelsPerMeter} stageScale={stageScale} />
          {placedBuildings.map((b) => (
            <BuildingRect
              key={b.id}
              building={b}
              pixelsPerMeter={pixelsPerMeter}
              isSelected={selectedId === b.id}
              stageScale={stageScale}
            />
          ))}
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
        </Layer>

        {/* Layer 3: measurement + compatibility warning lines */}
        <Layer>
          {/* Measurement: fixed first point, live second point until the click lands */}
          {measureMode && measurePoints.length > 0 && (() => {
            const from = measurePoints[0];
            const to = measurePoints[1] ?? cursorPos;
            if (!to) return null;

            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const lengthM = Math.sqrt(dx * dx + dy * dy) / pixelsPerMeter;
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            const angle = Math.atan2(dy, dx);
            const offsetX = -Math.sin(angle) * (16 / stageScale);
            const offsetY = Math.cos(angle) * (16 / stageScale);
            const fontSize = 12 / stageScale;
            const label = `${lengthM.toFixed(2)} m`;
            const labelW = label.length * fontSize * 0.66;
            const labelH = fontSize * 1.7;
            const tick = 5 / stageScale;

            return (
              <Group listening={false}>
                <Line
                  points={[from.x, from.y, to.x, to.y]}
                  stroke="#C17849"
                  strokeWidth={2 / stageScale}
                />
                {[from, to].map((pt, i) => (
                  <Circle
                    key={`mp-${i}`}
                    x={pt.x}
                    y={pt.y}
                    radius={tick}
                    fill="#C17849"
                    stroke="#FAF7F2"
                    strokeWidth={1.5 / stageScale}
                  />
                ))}
                <Rect
                  x={midX + offsetX - labelW / 2}
                  y={midY + offsetY - labelH / 2}
                  width={labelW}
                  height={labelH}
                  fill="#FAF7F2"
                  cornerRadius={3 / stageScale}
                  stroke="#C17849"
                  strokeWidth={1 / stageScale}
                />
                <Text
                  x={midX + offsetX}
                  y={midY + offsetY}
                  text={label}
                  fontSize={fontSize}
                  fontStyle="bold"
                  fill="#C17849"
                  align="center"
                  verticalAlign="middle"
                  offsetX={labelW / 2}
                  offsetY={labelH / 2}
                  width={labelW}
                  height={labelH}
                />
              </Group>
            );
          })()}

          {warnings.map((w, idx) => {
            const posA = plantPosMap.get(w.plantAInstanceId);
            const posB = plantPosMap.get(w.plantBInstanceId);
            if (!posA || !posB) return null;
            const lineColor = w.rule.type === 'beneficial' ? '#16A34A' : (w.rule.severity === 'critical' ? '#DC2626' : '#F59E0B');
            return (
              <Line
                key={`warn-${idx}`}
                points={[posA.x, posA.y, posB.x, posB.y]}
                stroke={lineColor}
                strokeWidth={(hoveredWarning === idx ? 4 : 2) / stageScale}
                dash={[6, 4]}
                hitStrokeWidth={12 / stageScale}
                listening
                onMouseEnter={(e) => {
                  setHoveredWarning(idx);
                  const c = e.target.getStage()?.container();
                  if (c) c.style.cursor = 'help';
                }}
                onMouseLeave={(e) => {
                  setHoveredWarning(null);
                  const c = e.target.getStage()?.container();
                  if (c) c.style.cursor = 'default';
                }}
              />
            );
          })}
          {hoveredWarning !== null && (() => {
            const w = warnings[hoveredWarning];
            if (!w) return null;
            const posA = plantPosMap.get(w.plantAInstanceId);
            const posB = plantPosMap.get(w.plantBInstanceId);
            if (!posA || !posB) return null;
            const midX = (posA.x + posB.x) / 2;
            const midY = (posA.y + posB.y) / 2;
            const fontSize = 11 / stageScale;
            const text = w.rule.reason;
            const tooltipW = Math.min(text.length * fontSize * 0.52, 250 / stageScale);
            const lines = Math.ceil(text.length * fontSize * 0.52 / tooltipW);
            const tooltipH = fontSize * 1.4 * lines + 8 / stageScale;
            const bgColor = w.rule.type === 'beneficial' ? '#16A34A' : (w.rule.severity === 'critical' ? '#DC2626' : '#F59E0B');
            return (
              <Group listening={false}>
                <Rect
                  x={midX - tooltipW / 2 - 6 / stageScale}
                  y={midY - tooltipH - 10 / stageScale}
                  width={tooltipW + 12 / stageScale}
                  height={tooltipH}
                  fill={bgColor}
                  cornerRadius={4 / stageScale}
                  opacity={0.95}
                />
                <Text
                  x={midX - tooltipW / 2}
                  y={midY - tooltipH - 10 / stageScale + 4 / stageScale}
                  text={text}
                  fontSize={fontSize}
                  fill="white"
                  fontStyle="bold"
                  width={tooltipW}
                  wrap="word"
                />
              </Group>
            );
          })()}
        </Layer>
      </Stage>
    </div>
  );
}
