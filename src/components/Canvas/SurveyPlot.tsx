import { Group, Line, Rect, Text } from 'react-konva';
import { SURVEY_BOUNDARY_M, SURVEY_AREA_M2 } from '../../data/survey-plot';

interface Props {
  pixelsPerMeter: number;
  stageScale: number;
}

/** The plot's registered boundary: fixed, with each edge's surveyed length. */
export default function SurveyPlot({ pixelsPerMeter, stageScale }: Props) {
  const verts = SURVEY_BOUNDARY_M.map((v) => ({ x: v.x * pixelsPerMeter, y: v.y * pixelsPerMeter }));
  const fontSize = 11 / stageScale;
  const peg = 6 / stageScale;

  const cx = verts.reduce((s, v) => s + v.x, 0) / verts.length;
  const cy = verts.reduce((s, v) => s + v.y, 0) / verts.length;

  return (
    <Group listening={false}>
      <Line
        points={verts.flatMap((v) => [v.x, v.y])}
        closed
        stroke="#2563EB"
        strokeWidth={2 / stageScale}
        fill="rgba(37, 99, 235, 0.06)"
      />

      {SURVEY_BOUNDARY_M.map((a, i) => {
        const b = SURVEY_BOUNDARY_M[(i + 1) % SURVEY_BOUNDARY_M.length];
        const from = verts[i];
        const to = verts[(i + 1) % verts.length];
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const midX = (from.x + to.x) / 2 - Math.sin(angle) * (16 / stageScale);
        const midY = (from.y + to.y) / 2 + Math.cos(angle) * (16 / stageScale);
        const label = `${Math.hypot(b.x - a.x, b.y - a.y).toFixed(2)} m`;
        const w = label.length * fontSize * 0.62;
        const h = fontSize * 1.6;
        return (
          <Group key={`edge-${i}`}>
            <Rect
              x={midX - w / 2}
              y={midY - h / 2}
              width={w}
              height={h}
              fill="white"
              cornerRadius={3 / stageScale}
              stroke="#2563EB"
              strokeWidth={1 / stageScale}
              opacity={0.9}
            />
            <Text
              x={midX - w / 2}
              y={midY - h / 2}
              width={w}
              height={h}
              text={label}
              fontSize={fontSize}
              fontStyle="bold"
              fill="#1E40AF"
              align="center"
              verticalAlign="middle"
            />
          </Group>
        );
      })}

      {/* Survey pegs at the corners */}
      {verts.map((v, i) => (
        <Rect
          key={`peg-${i}`}
          x={v.x - peg / 2}
          y={v.y - peg / 2}
          width={peg}
          height={peg}
          fill="#1E40AF"
          stroke="white"
          strokeWidth={1.5 / stageScale}
        />
      ))}

      <Text
        x={cx - 60 / stageScale}
        y={cy - fontSize}
        width={120 / stageScale}
        text={`${SURVEY_AREA_M2} m²`}
        fontSize={fontSize * 1.3}
        fill="#1E40AF"
        opacity={0.55}
        align="center"
      />
    </Group>
  );
}
