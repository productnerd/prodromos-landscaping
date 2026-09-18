import { useGardenStore } from '../../stores/gardenStore';
import { PLANTS_MAP } from '../../data/plants';
import { isClimber, climberLengthM, CLIMBER_DEPTH_M } from '../../utils/staging';
import { STATE_LABELS, STATE_COLORS } from '../../types/plant';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function PlantInfoPanel() {
  const selectedId = useGardenStore((s) => s.selectedId);
  const placedPlants = useGardenStore((s) => s.placedPlants);
  const currentMonth = useGardenStore((s) => s.currentMonth);

  const setSelectedId = useGardenStore((s) => s.setSelectedId);
  const updatePlant = useGardenStore((s) => s.updatePlant);
  const checkpoint = useGardenStore((s) => s.checkpoint);

  const placed = placedPlants.find((p) => p.id === selectedId);
  if (!placed) return null;

  const plant = PLANTS_MAP[placed.plantId];
  if (!plant) return null;

  const state = plant.monthlyStates[currentMonth];
  const stateColor = state ? STATE_COLORS[state] : null;

  return (
    <div className="absolute bottom-3 left-3 z-20 w-80 max-h-[60%] overflow-y-auto rounded-md border border-[var(--divider)] bg-[var(--paper)] shadow-[0_8px_28px_rgba(42,63,43,0.22)] p-4">
      <button
        onClick={() => setSelectedId(null)}
        aria-label="Close details"
        className="absolute top-2 right-2 w-6 h-6 rounded-[4px] border border-[var(--divider)] bg-[var(--paper)] text-[var(--ink-light)] hover:bg-[var(--cream)] leading-none"
      >
        &times;
      </button>
      {/* Name */}
      <h3 className="font-[Fraunces,Georgia,serif] font-medium text-[var(--forest-deep)]">{plant.name}</h3>
      <p className="text-sm italic text-[var(--ink-light)] mb-2">{plant.botanicalName}</p>

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
      <div className="text-sm text-[var(--ink-light)] mb-3">
        {isClimber(plant) ? (
          <div>
            Along the wall: {climberLengthM(plant, placed).toFixed(1)}m × {CLIMBER_DEPTH_M}m deep
            {placed.lengthM !== undefined && placed.lengthM !== plant.matureRadiusM * 2 && (
              <>
                {' '}
                <button
                  className="underline text-[var(--forest)]"
                  onClick={() => {
                    checkpoint();
                    updatePlant(placed.id, { lengthM: undefined });
                  }}
                >
                  reset
                </button>
              </>
            )}
          </div>
        ) : (
          <div>
            Spread: {((placed.radiusM ?? plant.matureRadiusM) * 2).toFixed(1)}m diameter
            {placed.radiusM !== undefined && placed.radiusM !== plant.matureRadiusM && (
              <>
                {' '}
                <span className="text-[var(--warm-gray)]">(mature {(plant.matureRadiusM * 2).toFixed(1)}m)</span>{' '}
                <button
                  className="underline text-[var(--forest)]"
                  onClick={() => {
                    checkpoint();
                    updatePlant(placed.id, { radiusM: undefined });
                  }}
                >
                  reset
                </button>
              </>
            )}
          </div>
        )}
        <div className="text-xs italic text-[var(--warm-gray)]">
          {isClimber(plant)
            ? 'Drag the blue square to change the length, the green dot to turn it to a wall.'
            : "Drag the blue dot on the circle's edge to resize."}{' '}
          Cmd+C / Cmd+V to copy.
        </div>
        <div>Height: {plant.heightM}m</div>
      </div>

      {/* Planting months */}
      <div className="mb-3">
        {plant.leafColors && (
          <div className="mb-3">
            <div className="text-xs font-medium text-[var(--ink-light)] mb-1">Leaf colour</div>
            <div className="flex gap-1 flex-wrap">
              {MONTH_NAMES.map((name, i) => {
                const color = plant.leafColors?.[i + 1];
                return (
                  <span
                    key={name}
                    title={color ? name : `${name}: bare`}
                    className={`text-[10px] w-7 text-center py-0.5 rounded-[4px] ${
                      color ? 'text-white font-medium' : 'text-[var(--warm-gray)] border border-dashed border-[var(--divider)]'
                    } ${i + 1 === currentMonth ? 'ring-2 ring-[var(--terracotta)]' : ''}`}
                    style={color ? { backgroundColor: color, textShadow: '0 0 2px rgba(0,0,0,0.5)' } : undefined}
                  >
                    {name}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        <div className="text-xs font-medium text-[var(--ink-light)] mb-1">Best planting months</div>
        <div className="flex gap-1 flex-wrap">
          {MONTH_NAMES.map((name, i) => {
            const month = i + 1;
            const isPlanting = plant.plantingMonths.includes(month);
            return (
              <span
                key={month}
                className={`text-[10px] w-7 text-center py-0.5 rounded-[4px] ${
                  isPlanting
                    ? 'bg-[var(--forest)] text-[var(--paper)] font-medium'
                    : 'bg-[var(--paper)] text-[var(--warm-gray)]'
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
        <p className="text-xs italic text-[var(--ink-light)] mb-3">{plant.cyprusNotes}</p>
      )}

    </div>
  );
}
