import type { PlantDefinition, MonthlyState } from '../../types/plant';
import { STATE_COLORS } from '../../types/plant';

export const WATER_COLORS: Record<string, string> = {
  low: '#F59E0B',
  medium: '#3B82F6',
  high: '#1D4ED8',
};

export const WATER_LABELS: Record<string, string> = {
  low: 'LOW',
  medium: 'MED',
  high: 'HIGH',
};

export const SOIL_COLORS: Record<string, string> = {
  'good': '#10B981',
  'moderate': '#F59E0B',
  'poor-tolerant': '#EF4444',
};

/** Colour on the map for a month: a fixed colour, the real leaf colour, or the season's. */
export function mapFill(plant: PlantDefinition, state: MonthlyState, month: number): string {
  return plant.mapColor ?? plant.leafColors?.[month] ?? getFillColor(plant, state);
}

export function getFillColor(plant: PlantDefinition, state: MonthlyState): string {
  switch (state) {
    case 'flowering':
      return plant.flowerColor || STATE_COLORS.flowering.fill;
    case 'fruiting':
    case 'fruit-ripe':
      return plant.fruitColor || STATE_COLORS[state].fill;
    case 'leafing':
    case 'sprouting':
      return plant.foliageColor || STATE_COLORS[state].fill;
    default:
      return STATE_COLORS[state].fill;
  }
}
