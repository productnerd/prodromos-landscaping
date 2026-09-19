import { Group, Rect, Text } from 'react-konva';
import type { PlantDefinition } from '../../types/plant';
import { useGardenStore } from '../../stores/gardenStore';
import { WATER_COLORS, WATER_LABELS, SOIL_COLORS, SUN_COLORS, SUN_LABELS } from './plantColors';
import { BODY_FONT } from './canvasFonts';

/** Water, soil and sun badges stacked under a plant when those overlays are on. */
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
  const overlaySun = useGardenStore((s) => s.overlaySun);
  const badgeFontSize = Math.max(8, 9 / stageScale);
  const badgeH = badgeFontSize * 1.8;

  const badges: { label: string; color: string }[] = [];
  if (overlayWater) badges.push({ label: WATER_LABELS[plant.water] ?? plant.water, color: WATER_COLORS[plant.water] ?? '#999' });
  if (overlaySoil)
    badges.push({
      label: plant.drainage === 'good' ? 'WELL-DR' : plant.drainage === 'moderate' ? 'MOD-DR' : 'POOR-OK',
      color: SOIL_COLORS[plant.drainage] ?? '#999',
    });
  if (overlaySun) badges.push({ label: SUN_LABELS[plant.sun], color: SUN_COLORS[plant.sun] });

  return (
    <>
      {badges.map(({ label, color }, i) => {
        const badgeW = label.length * badgeFontSize * 0.68 + 6 / stageScale;
        return (
          <Group key={label + i} x={0} y={offsetY + 8 / stageScale + i * (badgeH + 3 / stageScale)} listening={false}>
            <Rect x={-badgeW / 2} y={0} width={badgeW} height={badgeH} fill={color} cornerRadius={3 / stageScale} opacity={0.9} />
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
      })}
    </>
  );
}
