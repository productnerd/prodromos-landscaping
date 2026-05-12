import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Stage, Layer, Line, Circle, Arc, Text, Rect, Group } from 'react-konva';
import type Konva from 'konva';
import { useGardenStore } from '../../stores/gardenStore';
import { checkCompatibility } from '../../utils/compatibility-checker';
import PlantCircle from './PlantCircle';
import BuildingRect from './BuildingRect';
import PlotShape from './PlotShape';

interface GardenCanvasProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

const SCALE_BY = 1.05;

export default function GardenCanvas({ stageRef }: GardenCanvasProps) {
  const {
    dxfShapes,
    placedPlants,
    placedBuildings,
    plotPolygons,
    drawingPlotId,
    pixelsPerMeter,
    currentMonth,
    selectedId,
    buildingMode,
    drawPlotMode,
    addPlant,
    addBuilding,
    setSelectedId,
    startPlot,
    addPlotVertex,
    closePlot,
  } = useGardenStore();

  const cancelPlot = useGardenStore.getState().cancelPlot;
  const undo = useGardenStore((s) => s.undo);
  const selectedVertex = useGardenStore((s) => s.selectedVertex);
  const removeVertex = useGardenStore((s) => s.removeVertex);
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
      if (e.key === 'Escape' && drawPlotMode) {
        cancelPlot();
      }
      if (e.key === 'z' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedVertex) {
          e.preventDefault();
          removeVertex(selectedVertex.plotId, selectedVertex.index);
        } else if (selectedId) {
          e.preventDefault();
          removeElement(selectedId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawPlotMode, cancelPlot, undo, selectedVertex, removeVertex, selectedId, removeElement]);

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

      if (drawPlotMode) {
        if (!drawingPlotId) {
          startPlot();
          setTimeout(() => addPlotVertex(pos.x, pos.y), 0);
        } else {
          const currentPlot = plotPolygons.find((p) => p.id === drawingPlotId);
          if (currentPlot && currentPlot.vertices.length >= 3) {
            const first = currentPlot.vertices[0];
            const dx = pos.x - first.x;
            const dy = pos.y - first.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const closeThreshold = 15 / stageScale;
            if (dist < closeThreshold) {
              closePlot();
              return;
            }
          }
          addPlotVertex(pos.x, pos.y);
        }
        return;
      }

      // Non-drawing modes: only fire on clicks directly on the stage (empty area)
      if (e.target !== e.target.getStage()) return;

      if (buildingMode) {
        addBuilding(pos.x, pos.y, 5, 3, 'Building');
      } else {
        setSelectedId(null);
      }
    },
    [drawPlotMode, buildingMode, drawingPlotId, plotPolygons, stageScale, getCanvasPos, startPlot, addPlotVertex, closePlot, addBuilding, setSelectedId],
  );

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    if (e.target !== e.target.getStage()) return;
    setStagePos({ x: e.target.x(), y: e.target.y() });
  }, []);

  const handleMouseMove = useCallback(() => {
    if (!drawPlotMode || !drawingPlotId) {
      setCursorPos(null);
      return;
    }
    const pos = getCanvasPos();
    if (pos) setCursorPos(pos);
  }, [drawPlotMode, drawingPlotId, getCanvasPos]);

  const previewLine = useMemo(() => {
    if (!cursorPos || !drawingPlotId) return null;
    const plot = plotPolygons.find((p) => p.id === drawingPlotId);
    if (!plot || plot.vertices.length === 0) return null;
    const last = plot.vertices[plot.vertices.length - 1];
    const dx = cursorPos.x - last.x;
    const dy = cursorPos.y - last.y;
    const lengthPx = Math.sqrt(dx * dx + dy * dy);
    const lengthM = lengthPx / pixelsPerMeter;
    return { from: last, to: cursorPos, lengthM };
  }, [cursorPos, drawingPlotId, plotPolygons, pixelsPerMeter]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden bg-gray-100"
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
        draggable={!drawPlotMode}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onDragEnd={handleDragEnd}
        onMouseMove={handleMouseMove}
        style={{ cursor: drawPlotMode ? 'crosshair' : undefined }}
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

        {/* Layer 2: Interactive plots, plants, and buildings */}
        <Layer>
          {plotPolygons.map((plot) => (
            <PlotShape
              key={plot.id}
              plot={plot}
              pixelsPerMeter={pixelsPerMeter}
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

        {/* Layer 3: Preview line + compatibility warning lines */}
        <Layer>
          {previewLine && previewLine.lengthM > 0.05 && (() => {
            const { from, to, lengthM } = previewLine;
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            const angle = Math.atan2(to.y - from.y, to.x - from.x);
            const offsetX = -Math.sin(angle) * (16 / stageScale);
            const offsetY = Math.cos(angle) * (16 / stageScale);
            const fontSize = 11 / stageScale;
            const label = `${lengthM.toFixed(1)}m`;
            const labelW = label.length * fontSize * 0.65;
            const labelH = fontSize * 1.6;
            return (
              <Group>
                <Line
                  points={[from.x, from.y, to.x, to.y]}
                  stroke="#2563EB"
                  strokeWidth={2 / stageScale}
                  dash={[6 / stageScale, 4 / stageScale]}
                />
                <Rect
                  x={midX + offsetX - labelW / 2}
                  y={midY + offsetY - labelH / 2}
                  width={labelW}
                  height={labelH}
                  fill="white"
                  cornerRadius={3 / stageScale}
                  stroke="#2563EB"
                  strokeWidth={1 / stageScale}
                  opacity={0.9}
                />
                <Text
                  x={midX + offsetX}
                  y={midY + offsetY}
                  text={label}
                  fontSize={fontSize}
                  fontStyle="bold"
                  fill="#1E40AF"
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
