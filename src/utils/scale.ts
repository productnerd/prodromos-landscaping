export const DEFAULT_PIXELS_PER_METER = 50;

export function metersToPixels(meters: number, ppm: number): number {
  return meters * ppm;
}

export function pixelsToMeters(pixels: number, ppm: number): number {
  return pixels / ppm;
}
