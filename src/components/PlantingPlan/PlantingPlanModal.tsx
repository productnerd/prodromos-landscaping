import { useMemo } from 'react';
import { useGardenStore } from '../../stores/gardenStore';
import { PLANTS_MAP } from '../../data/plants';
import type { PlantDefinition } from '../../types/plant';

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface PlantingPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlantingPlanModal({ isOpen, onClose }: PlantingPlanModalProps) {
  const placedPlants = useGardenStore((s) => s.placedPlants);
  const currentMonth = useGardenStore((s) => s.currentMonth);

  // Deduplicate by plantId, sorted by earliest planting month
  const uniquePlants = useMemo(() => {
    const seen = new Set<string>();
    const plants: PlantDefinition[] = [];
    for (const placed of placedPlants) {
      if (!seen.has(placed.plantId)) {
        seen.add(placed.plantId);
        const def = PLANTS_MAP[placed.plantId];
        if (def) plants.push(def);
      }
    }
    plants.sort((a, b) => {
      const aMin = a.plantingMonths.length > 0 ? Math.min(...a.plantingMonths) : 13;
      const bMin = b.plantingMonths.length > 0 ? Math.min(...b.plantingMonths) : 13;
      return aMin - bMin;
    });
    return plants;
  }, [placedPlants]);

  const plantThisMonth = useMemo(
    () => uniquePlants.filter((p) => p.plantingMonths.includes(currentMonth)),
    [uniquePlants, currentMonth],
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--forest-deep)]/50"
      onClick={onClose}
    >
      <div
        className="bg-[var(--paper)] text-[var(--ink)] border border-[var(--divider)] rounded-[4px] shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--cream)] text-[var(--ink-light)] text-lg"
          aria-label="Close"
        >
          &times;
        </button>

        <div className="p-6">
          <h2 className="font-[Fraunces,Georgia,serif] text-xl font-medium text-[var(--forest-deep)] mb-4">
            Planting Plan &mdash; Prodromos, Cyprus
          </h2>

          {uniquePlants.length === 0 ? (
            <p className="text-[var(--ink-light)] italic text-sm">No plants placed in the garden yet.</p>
          ) : (
            <>
              {/* Calendar table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left py-2 pr-4 font-medium text-[var(--ink-light)] border-b border-[var(--divider)]">
                        Plant
                      </th>
                      {MONTH_ABBR.map((m, i) => (
                        <th
                          key={i}
                          className={`text-center py-2 px-1 font-medium border-b border-[var(--divider)] ${
                            i + 1 === currentMonth
                              ? 'text-[var(--forest)]'
                              : 'text-[var(--warm-gray)]'
                          }`}
                        >
                          {m}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uniquePlants.map((plant) => (
                      <tr key={plant.id} className="border-b border-[var(--divider)]">
                        <td className="py-2 pr-4 font-medium text-[var(--ink)] whitespace-nowrap">
                          {plant.name}
                        </td>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = i + 1;
                          const isPlanting = plant.plantingMonths.includes(month);
                          return (
                            <td key={month} className="p-0.5">
                              <div
                                className={`w-full h-6 rounded-[4px] ${
                                  isPlanting ? 'bg-[var(--forest)]' : 'bg-[var(--cream)]'
                                }`}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Plant this month */}
              <div>
                <h3 className="font-[Fraunces,Georgia,serif] font-medium text-[var(--forest-deep)] mb-2">
                  Plant This Month ({MONTH_ABBR[currentMonth - 1]})
                </h3>
                {plantThisMonth.length === 0 ? (
                  <p className="text-sm italic text-[var(--ink-light)]">
                    No plants to plant this month.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {plantThisMonth.map((plant) => (
                      <span
                        key={plant.id}
                        className="text-sm px-3 py-1 bg-[var(--sage-light)] text-[var(--forest-deep)] rounded-full"
                      >
                        {plant.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
