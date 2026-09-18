import { Group, Rect, Text } from 'react-konva';
import type { PlantDefinition } from '../../types/plant';
import { useGardenStore } from '../../stores/gardenStore';
import { WATER_COLORS, WATER_LABELS, SOIL_COLORS } from './plantColors';
import { BODY_FONT } from './canvasFonts';

/** Water and soil badges shown under a plant when those overlays are on. */
export default function PlantBadges({
  plant,
  stageScale,
  offsetY,
}: {
  plant: PlantDefinition;
  stageScale: number;
  /** Distance from the plant's centre down to its lower edge, in px. */
  offsetY: number;
}) {
  const overlayWater = useGardenStore((s) => s.overlayWater);
  const overlaySoil = useGardenStore((s) => s.overlaySoil);
  const badgeFontSize = Math.max(8, 9 / stageScale);
  const badgeH = badgeFontSize * 1.8;

  return (
    <>
      {/* Water badge */}
      {overlayWater && (() => {
        const label = WATER_LABELS[plant.water] ?? plant.water;
        const badgeW = label.length * badgeFontSize * 0.7 + 6 / stageScale;
        const color = WATER_COLORS[plant.water] ?? '#999';
        return (
          <Group x={0} y={offsetY + 8 / stageScale} listening={false}>
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
              fontFamily={BODY_FONT}
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
        const yOff = overlayWater ? offsetY + 8 / stageScale + badgeH + 3 / stageScale : offsetY + 8 / stageScale;
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
              fontFamily={BODY_FONT}
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
    </>
  );
}
