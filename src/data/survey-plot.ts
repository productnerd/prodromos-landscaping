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

/**
 * Existing building: fixed size, starting where it was placed against the
 * boundary. Centre in metres on the same axes; rotation in degrees clockwise.
 */
/** Two patios to start with, waiting just outside the plot's right-hand edge. */
export const DEFAULT_PATIOS = [
  { label: 'Patio', x: 29, y: 2.5, widthM: 4, depthM: 3, rotation: 0 },
  { label: 'Patio', x: 29, y: 6.5, widthM: 4, depthM: 3, rotation: 0 },
];

/** Where v1 first put the patios (px at 50 px/m), inside the plot among the trees. */
export const OLD_PATIO_SPOTS_PX = [
  { x: 800, y: 1000 },
  { x: 700, y: 1500 },
];

export const DEFAULT_BUILDING = { label: 'Building', x: 21.212, y: 13.044, widthM: 7.475, depthM: 3, rotation: 106.33 };
