import { SURVEY_BOUNDARY_M } from '../data/survey-plot';
import { PLANTS_MAP } from '../data/plants';
import type { PlacedPlant, PlacedBuilding } from '../types/canvas';

/** New items wait in a column just outside the plot's right-hand edge. */
export const PLOT_RIGHT_M = Math.max(...SURVEY_BOUNDARY_M.map((v) => v.x));
export const STAGING_LEFT_M = PLOT_RIGHT_M + 1.5;
const TOP_M = 1;
const GAP_M = 1;

/**
 * Centre (in px) for a new item of the given half-size: in the staging column,
 * below whatever is already waiting there, so nothing lands on the layout.
 */
export function stagingSpot(
  halfWidthM: number,
  halfHeightM: number,
  plants: PlacedPlant[],
  buildings: PlacedBuilding[],
  ppm: number,
): { x: number; y: number } {
  let bottom = -Infinity;
  for (const p of plants) {
    if (p.x / ppm <= PLOT_RIGHT_M) continue;
    const r = p.radiusM ?? PLANTS_MAP[p.plantId]?.matureRadiusM ?? 1;
    bottom = Math.max(bottom, p.y / ppm + r);
  }
  for (const b of buildings) {
    if (b.x / ppm <= PLOT_RIGHT_M) continue;
    // Rotation can swing either side outwards, so allow for the longer one.
    bottom = Math.max(bottom, b.y / ppm + Math.max(b.widthM, b.heightM) / 2);
  }
  const top = bottom === -Infinity ? TOP_M : bottom + GAP_M;
  return { x: (STAGING_LEFT_M + halfWidthM) * ppm, y: (top + halfHeightM) * ppm };
}
