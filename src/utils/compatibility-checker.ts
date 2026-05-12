import type { PlacedPlant } from '../types/canvas';
import type { CompatibilityWarning } from '../types/compatibility';
import { COMPATIBILITY_RULES, WALNUT_TOLERANT } from '../data/compatibility-rules';
import { PLANTS_MAP } from '../data/plants';
import { distance } from './geometry';

export function checkCompatibility(
  placedPlants: PlacedPlant[],
  pixelsPerMeter: number,
): CompatibilityWarning[] {
  const warnings: CompatibilityWarning[] = [];

  for (let i = 0; i < placedPlants.length; i++) {
    for (let j = i + 1; j < placedPlants.length; j++) {
      const a = placedPlants[i];
      const b = placedPlants[j];
      const distPx = distance(a, b);
      const distM = distPx / pixelsPerMeter;

      const rules = findApplicableRules(a.plantId, b.plantId);
      for (const rule of rules) {
        if (distM <= rule.maxDistanceM) {
          warnings.push({
            plantAInstanceId: a.id,
            plantBInstanceId: b.id,
            rule,
            distanceM: Math.round(distM * 10) / 10,
          });
        }
      }
    }
  }

  return warnings;
}

function findApplicableRules(idA: string, idB: string) {
  const plantA = PLANTS_MAP[idA];
  const plantB = PLANTS_MAP[idB];
  if (!plantA || !plantB) return [];

  return COMPATIBILITY_RULES.filter((rule) => {
    const matchForward = matchesPlant(rule.plantA, idA, plantA.category) &&
      matchesPlant(rule.plantB, idB, plantB.category);
    const matchReverse = matchesPlant(rule.plantA, idB, plantB.category) &&
      matchesPlant(rule.plantB, idA, plantA.category);

    if (!matchForward && !matchReverse) return false;

    // Walnut wildcard: skip if the other plant is walnut-tolerant
    if (rule.plantA === 'walnut' && rule.plantB === '*') {
      const otherPlantId = idA === 'walnut' ? idB : idA;
      if (WALNUT_TOLERANT.has(otherPlantId)) return false;
    }

    return true;
  });
}

function matchesPlant(ruleTarget: string, plantId: string, category: string): boolean {
  if (ruleTarget === '*') return true;
  if (ruleTarget === '*herbs') return category === 'herb';
  return ruleTarget === plantId;
}
