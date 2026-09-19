import { SURVEY_BOUNDARY_M } from '../data/survey-plot';
import { PLANTS_MAP } from '../data/plants';
import type { PlacedPlant, PlacedBuilding } from '../types/canvas';
import type { PlantDefinition } from '../types/plant';

/** New items wait in a column just outside the plot's right-hand edge. */
export const PLOT_RIGHT_M = Math.max(...SURVEY_BOUNDARY_M.map((v) => v.x));
export const STAGING_LEFT_M = PLOT_RIGHT_M + 1.5;
const TOP_M = 1;

/** Climbers sit against a wall as a strip this deep. */
export const CLIMBER_DEPTH_M = 0.6;

export const isClimber = (plant: PlantDefinition) => plant.category === 'climber';

/** A climber's length along its wall: set by hand, or its spread. */
export const climberLengthM = (plant: PlantDefinition, placed?: PlacedPlant) =>
  placed?.lengthM ?? plant.matureRadiusM * 2;

const GAP_M = 1;

/**
 * Centre (in px) for a new item of the given half-size: the first free gap
 * from the top of the column beside the plot, so it lands in view and never
 * on the layout.
 */
export function stagingSpot(
  halfWidthM: number,
  halfHeightM: number,
  plants: PlacedPlant[],
  buildings: PlacedBuilding[],
  ppm: number,
): { x: number; y: number } {
  // Footprints (in metres) of everything already waiting beside the plot.
  const boxes: { x0: number; x1: number; y0: number; y1: number }[] = [];
  const add = (x: number, y: number, half: number) => boxes.push({ x0: x - half, x1: x + half, y0: y - half, y1: y + half });
  for (const p of plants) {
    if (p.x / ppm <= PLOT_RIGHT_M) continue;
    const plant = PLANTS_MAP[p.plantId];
    // A rotated climber can swing its length any way, so allow for half of it.
    add(p.x / ppm, p.y / ppm, plant && isClimber(plant) ? climberLengthM(plant, p) / 2 : (p.radiusM ?? plant?.matureRadiusM ?? 1));
  }
  for (const b of buildings) {
    if (b.x / ppm <= PLOT_RIGHT_M) continue;
    add(b.x / ppm, b.y / ppm, Math.max(b.widthM, b.heightM) / 2);
  }

  const x0 = STAGING_LEFT_M;
  const x1 = x0 + halfWidthM * 2;
  for (let top = TOP_M; ; top += 0.5) {
    const y1 = top + halfHeightM * 2;
    const clash = boxes.some((b) => b.x0 < x1 + GAP_M && b.x1 > x0 - GAP_M && b.y0 < y1 + GAP_M && b.y1 > top - GAP_M);
    if (!clash) return { x: (x0 + halfWidthM) * ppm, y: (top + halfHeightM) * ppm };
  }
}
