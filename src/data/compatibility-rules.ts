import type { CompatibilityRule } from '../types/compatibility';

export const COMPATIBILITY_RULES: CompatibilityRule[] = [
  // Walnut juglone toxicity — affects most plants within root zone
  {
    plantA: 'walnut',
    plantB: '*',
    type: 'incompatible',
    maxDistanceM: 15,
    reason: 'Walnut roots produce juglone, which inhibits growth of most nearby plants',
    severity: 'critical',
  },
  // Some plants tolerate juglone — override the wildcard
  // (hazelnut, cedar, beans, corn, some grasses are tolerant)

  // Blueberry needs acidic soil — conflicts with alkaline-loving plants
  {
    plantA: 'blueberry',
    plantB: 'lavender',
    type: 'incompatible',
    maxDistanceM: 2,
    reason: 'Blueberry needs very acidic soil (pH 4.5–5.5); lavender prefers alkaline',
    severity: 'warning',
  },
  {
    plantA: 'blueberry',
    plantB: 'lilac',
    type: 'incompatible',
    maxDistanceM: 2,
    reason: 'Blueberry needs very acidic soil; lilac prefers neutral to alkaline',
    severity: 'warning',
  },

  // Mint is invasive — keep away from other herbs
  {
    plantA: 'mint',
    plantB: '*herbs',
    type: 'incompatible',
    maxDistanceM: 1.5,
    reason: 'Mint spreads aggressively via runners and will crowd out other herbs',
    severity: 'warning',
  },
  {
    plantA: 'spearmint',
    plantB: '*herbs',
    type: 'incompatible',
    maxDistanceM: 1.5,
    reason: 'Spearmint spreads aggressively via runners and will crowd out other herbs',
    severity: 'warning',
  },

  // Hydrangea needs acidic soil — conflicts with alkaline lovers
  {
    plantA: 'hydrangea',
    plantB: 'lavender',
    type: 'incompatible',
    maxDistanceM: 2,
    reason: 'Hydrangea needs acidic soil; lavender needs alkaline/neutral',
    severity: 'warning',
  },

  // Grapevine should not be near walnut
  {
    plantA: 'walnut',
    plantB: 'grapevine',
    type: 'incompatible',
    maxDistanceM: 20,
    reason: 'Grapevine is extremely sensitive to walnut juglone',
    severity: 'critical',
  },

  // Cherry is very sensitive to walnut juglone
  {
    plantA: 'walnut',
    plantB: 'cherry',
    type: 'incompatible',
    maxDistanceM: 20,
    reason: 'Cherry is extremely sensitive to walnut juglone',
    severity: 'critical',
  },

  // Apple sensitive to walnut
  {
    plantA: 'walnut',
    plantB: 'apple',
    type: 'incompatible',
    maxDistanceM: 20,
    reason: 'Apple trees are very sensitive to walnut juglone',
    severity: 'critical',
  },

  // Peach sensitive to walnut
  {
    plantA: 'walnut',
    plantB: 'peach',
    type: 'incompatible',
    maxDistanceM: 18,
    reason: 'Peach trees are sensitive to walnut juglone',
    severity: 'critical',
  },

  // Beneficial companions
  {
    plantA: 'lavender',
    plantB: 'wild-roses',
    type: 'beneficial',
    maxDistanceM: 3,
    reason: 'Lavender repels aphids that attack roses',
    severity: 'warning',
  },
  {
    plantA: 'chamomile',
    plantB: 'apple',
    type: 'beneficial',
    maxDistanceM: 3,
    reason: 'Chamomile attracts pollinators and beneficial insects for apple trees',
    severity: 'warning',
  },
  {
    plantA: 'beans',
    plantB: 'pumpkins',
    type: 'beneficial',
    maxDistanceM: 2,
    reason: 'Beans fix nitrogen that pumpkins need; classic companion planting',
    severity: 'warning',
  },
  {
    plantA: 'grapevine',
    plantB: 'lavender',
    type: 'beneficial',
    maxDistanceM: 3,
    reason: 'Lavender repels pests and attracts pollinators for grapevines',
    severity: 'warning',
  },
];

// Plants that tolerate walnut juglone
export const WALNUT_TOLERANT = new Set([
  'cedar', 'hazelnut', 'beans', 'japanese-silver-grass', 'ground-covers',
  'maple-sycamore', 'maple-norway', 'maple-field',
]);
