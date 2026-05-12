import { Group, Line, Circle, Text, Rect } from 'react-konva';
import type { PlotPolygon } from '../../types/canvas';
import { useGardenStore } from '../../stores/gardenStore';

interface Props {
  plot: PlotPolygon;
  pixelsPerMeter: number;
  stageScale: number;
}

export default function PlotShape({ plot, pixelsPerMeter, stageScale }: Props) {
  const moveVertex = useGardenStore((s) => s.moveVertex);
  const drawingPlotId = useGardenStore((s) => s.drawingPlotId);
  const selectedVertex = useGardenStore((s) => s.selectedVertex);
  const setSelectedVertex = useGardenStore((s) => s.setSelectedVertex);
  const verts = plot.vertices;
  if (verts.length === 0) return null;

  const flatPoints = verts.flatMap((v) => [v.x, v.y]);
  const handleSize = 6 / stageScale;
  const fontSize = 11 / stageScale;
  const isDrawing = plot.id === drawingPlotId;

  return (
    <Group>
      {/* Fill + outline */}
      {verts.length >= 2 && (
        <Line
          points={flatPoints}
          closed={plot.closed}
          stroke="#2563EB"
          strokeWidth={2 / stageScale}
          fill={plot.closed ? 'rgba(37, 99, 235, 0.08)' : undefined}
          dash={plot.closed ? undefined : [8 / stageScale, 4 / stageScale]}
          listening={false}
        />
      )}

      {/* Edge dimension labels */}
      {verts.length >= 2 &&
        verts.map((v, i) => {
          const next = plot.closed
            ? verts[(i + 1) % verts.length]
            : verts[i + 1];
          if (!next) return null;

          const dx = next.x - v.x;
          const dy = next.y - v.y;
          const lengthPx = Math.sqrt(dx * dx + dy * dy);
          const lengthM = lengthPx / pixelsPerMeter;
          if (lengthM < 0.1) return null;

          const midX = (v.x + next.x) / 2;
          const midY = (v.y + next.y) / 2;

          const angle = Math.atan2(dy, dx);
          const offsetX = -Math.sin(angle) * (16 / stageScale);
          const offsetY = Math.cos(angle) * (16 / stageScale);

          const label = `${lengthM.toFixed(1)}m`;
          const labelW = label.length * fontSize * 0.65;
          const labelH = fontSize * 1.6;

          return (
            <Group key={`dim-${plot.id}-${i}`} listening={false}>
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
        })}

      {/* Draggable vertex handles */}
      {verts.map((v, i) => {
        const isFirst = i === 0 && isDrawing && verts.length >= 3;
        const isSelected = selectedVertex?.plotId === plot.id && selectedVertex?.index === i;
        return (
          <Circle
            key={`vh-${plot.id}-${i}`}
            x={v.x}
            y={v.y}
            radius={isFirst ? handleSize * 2 : (isSelected ? handleSize * 1.5 : handleSize)}
            fill={isFirst ? '#10B981' : (isSelected ? '#DC2626' : '#2563EB')}
            stroke="white"
            strokeWidth={2 / stageScale}
            draggable={plot.closed}
            onDragMove={(e) => {
              moveVertex(plot.id, i, e.target.x(), e.target.y());
            }}
            onClick={(e) => {
              if (plot.closed) {
                e.cancelBubble = true;
                setSelectedVertex(isSelected ? null : { plotId: plot.id, index: i });
              }
            }}
            onMouseEnter={(e) => {
              const container = e.target.getStage()?.container();
              if (container) container.style.cursor = plot.closed ? 'grab' : (isFirst ? 'pointer' : 'default');
            }}
            onMouseLeave={(e) => {
              const container = e.target.getStage()?.container();
              if (container) container.style.cursor = plot.closed ? 'default' : 'crosshair';
            }}
          />
        );
      })}
    </Group>
  );
}
