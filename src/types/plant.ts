export type PlantCategory =
  | 'tree'
  | 'bush'
  | 'climber'
  | 'groundcover'
  | 'herb'
  | 'flower'
  | 'grass'
  | 'vegetable'
  | 'bulb';

export type PlantTag =
  | 'herb'
  | 'fruit'
  | 'flower'
  | 'fence'
  | 'ornamental'
  | 'evergreen'
  | 'deciduous'
  | 'edible';

export type MonthlyState =
  | 'dormant'
  | 'sprouting'
  | 'leafing'
  | 'flowering'
  | 'fruiting'
  | 'fruit-ripe'
  | 'autumn-color'
  | 'evergreen-foliage';

export interface PlantDefinition {
  id: string;
  name: string;
  botanicalName: string;
  category: PlantCategory;
  tags: PlantTag[];
  matureRadiusM: number;
  heightM: number;
  sun: 'full' | 'partial' | 'shade';
  water: 'low' | 'medium' | 'high';
  soil: string;
  drainage: 'good' | 'moderate' | 'poor-tolerant';
  monthlyStates: Record<number, MonthlyState>;
  plantingMonths: number[];
  flowerColor: string;
  fruitColor: string;
  foliageColor: string;
  cyprusNotes: string;
}

export const STATE_COLORS: Record<MonthlyState, { fill: string; opacity: number }> = {
  'dormant': { fill: '#8B7355', opacity: 0.25 },
  'sprouting': { fill: '#90EE90', opacity: 0.5 },
  'leafing': { fill: '#228B22', opacity: 0.5 },
  'flowering': { fill: '#FF69B4', opacity: 0.6 },
  'fruiting': { fill: '#FF8C00', opacity: 0.6 },
  'fruit-ripe': { fill: '#DC143C', opacity: 0.65 },
  'autumn-color': { fill: '#DAA520', opacity: 0.5 },
  'evergreen-foliage': { fill: '#006400', opacity: 0.45 },
};

export const STATE_LABELS: Record<MonthlyState, string> = {
  'dormant': 'Dormant',
  'sprouting': 'Sprouting',
  'leafing': 'In leaf',
  'flowering': 'Flowering',
  'fruiting': 'Fruiting',
  'fruit-ripe': 'Fruit ripe',
  'autumn-color': 'Autumn color',
  'evergreen-foliage': 'Evergreen',
};

export const CATEGORY_LABELS: Record<PlantCategory, string> = {
  tree: 'Trees',
  bush: 'Bushes',
  climber: 'Climbers',
  groundcover: 'Ground Cover',
  herb: 'Herbs',
  flower: 'Flowers',
  grass: 'Grasses',
  vegetable: 'Vegetables',
  bulb: 'Bulbs',
};
