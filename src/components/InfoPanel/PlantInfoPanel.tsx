import { useGardenStore } from '../../stores/gardenStore';
import { PLANTS_MAP } from '../../data/plants';
import { STATE_LABELS, STATE_COLORS } from '../../types/plant';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function PlantInfoPanel() {
  const selectedId = useGardenStore((s) => s.selectedId);
  const placedPlants = useGardenStore((s) => s.placedPlants);
  const currentMonth = useGardenStore((s) => s.currentMonth);
  const removeElement = useGardenStore((s) => s.removeElement);

  const placed = placedPlants.find((p) => p.id === selectedId);
  if (!placed) return null;

  const plant = PLANTS_MAP[placed.plantId];
  if (!plant) return null;

  const state = plant.monthlyStates[currentMonth];
  const stateColor = state ? STATE_COLORS[state] : null;

  return (
    <div className="p-4 border-t border-gray-200 bg-gray-50 max-h-80 overflow-y-auto">
      {/* Name */}
      <h3 className="font-bold text-gray-900">{plant.name}</h3>
      <p className="text-sm italic text-gray-500 mb-2">{plant.botanicalName}</p>

      {/* Current state badge */}
      {state && (
        <span
          className="inline-block text-xs px-2 py-1 rounded-full mb-3 font-medium"
          style={{
            backgroundColor: stateColor?.fill,
            color: '#fff',
            opacity: stateColor?.opacity ? Math.max(stateColor.opacity, 0.8) : 1,
          }}
        >
          {STATE_LABELS[state]}
        </span>
      )}

      {/* Requirements */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm mb-3">
        <div>☀️ {plant.sun}</div>
        <div>💧 {plant.water}</div>
        <div>🌱 {plant.soil}</div>
        <div>🚿 {plant.drainage}</div>
      </div>

      {/* Dimensions */}
      <div className="text-sm text-gray-700 mb-3">
        <div>Spread: {(plant.matureRadiusM * 2).toFixed(1)}m diameter</div>
        <div>Height: {plant.heightM}m</div>
      </div>

      {/* Planting months */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-600 mb-1">Best planting months</div>
        <div className="flex gap-1 flex-wrap">
          {MONTH_NAMES.map((name, i) => {
            const month = i + 1;
            const isPlanting = plant.plantingMonths.includes(month);
            return (
              <span
                key={month}
                className={`text-[10px] w-7 text-center py-0.5 rounded ${
                  isPlanting
                    ? 'bg-green-500 text-white font-medium'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {name}
              </span>
            );
          })}
        </div>
      </div>

      {/* Cyprus notes */}
      {plant.cyprusNotes && (
        <p className="text-xs text-gray-600 mb-3">{plant.cyprusNotes}</p>
      )}

      {/* Remove button */}
      <button
        onClick={() => removeElement(placed.id)}
        className="w-full py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        Remove
      </button>
    </div>
  );
}
