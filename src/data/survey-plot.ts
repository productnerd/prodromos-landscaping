import type { PlotVertex } from '../types/canvas';

/**
 * Registered boundary of the Prodromos plot, from the land survey drawing
 * (layer ΕΓΓΕΓΡΑΜΜΕΝΟ ΣΥΝΟΡΟ). Metres from the north-west corner of its
 * bounding box, with y increasing southwards so north is at the top.
 */
export const SURVEY_BOUNDARY_M: PlotVertex[] = [
  { x: 0.0, y: 45.363 },
  { x: 17.531, y: 3.21 },
  { x: 25.503, y: 0.0 },
  { x: 20.587, y: 20.716 },
  { x: 20.525, y: 46.382 },
];

export const SURVEY_AREA_M2 = 556;
