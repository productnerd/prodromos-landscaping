import { useState, useMemo } from 'react';
import { useGardenStore } from '../../stores/gardenStore';
import { PLANTS, PLANTS_MAP } from '../../data/plants';
import { CATEGORY_LABELS } from '../../types/plant';
import type { PlantCategory, PlantTag, PlantDefinition } from '../../types/plant';
import { PlantInfoPanel } from '../InfoPanel/PlantInfoPanel';

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as PlantCategory[];
const ALL_TAGS: PlantTag[] = ['herb', 'fruit', 'flower', 'fence', 'ornamental', 'evergreen', 'deciduous', 'edible'];

function PlantCard({ plant }: { plant: PlantDefinition }) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('plantId', plant.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable="true"
      onDragStart={handleDragStart}
      className="flex items-start gap-3 py-2 px-3 border-b border-gray-100 cursor-grab hover:bg-gray-50"
    >
      <div
        className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
        style={{ backgroundColor: plant.foliageColor }}
      />
      <div className="min-w-0 flex-1">
        <div className="font-bold text-sm text-gray-900 truncate">{plant.name}</div>
        <div className="text-xs italic text-gray-500 truncate">{plant.botanicalName}</div>
        <div className="flex flex-wrap gap-1 mt-1">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">
            {CATEGORY_LABELS[plant.category]}
          </span>
          {plant.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PlantSidebar() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<PlantCategory | null>(null);
  const [activeTags, setActiveTags] = useState<Set<PlantTag>>(new Set());
  const selectedId = useGardenStore((s) => s.selectedId);
  const placedPlants = useGardenStore((s) => s.placedPlants);

  const categoriesWithPlants = useMemo(
    () => ALL_CATEGORIES.filter((cat) => PLANTS.some((p) => p.category === cat)),
    [],
  );

  const tagsWithPlants = useMemo(
    () => ALL_TAGS.filter((tag) => PLANTS.some((p) => p.tags.includes(tag))),
    [],
  );

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return PLANTS.filter((p) => {
      if (term && !p.name.toLowerCase().includes(term)) return false;
      if (activeCategory && p.category !== activeCategory) return false;
      if (activeTags.size > 0) {
        for (const tag of activeTags) {
          if (!p.tags.includes(tag)) return false;
        }
      }
      return true;
    });
  }, [search, activeCategory, activeTags]);

  const toggleTag = (tag: PlantTag) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  // Check if selectedId corresponds to a placed plant
  const selectedPlacedPlant = placedPlants.find((p) => p.id === selectedId);
  const showInfoPanel = selectedPlacedPlant && PLANTS_MAP[selectedPlacedPlant.plantId];

  return (
    <div className="w-80 h-full bg-white border-l border-gray-200 flex flex-col overflow-hidden">
      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search plants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Category filter */}
      <div className="px-3 py-2 border-b border-gray-200">
        <div className="flex flex-wrap gap-1">
          {categoriesWithPlants.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`text-xs px-2 py-1 rounded-full transition-colors ${
                activeCategory === cat
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Tag filter */}
      <div className="px-3 py-2 border-b border-gray-200">
        <div className="flex flex-wrap gap-1">
          {tagsWithPlants.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`text-[11px] px-2 py-0.5 rounded-full transition-colors ${
                activeTags.has(tag)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Plant list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((plant) => (
          <PlantCard key={plant.id} plant={plant} />
        ))}
        {filtered.length === 0 && (
          <div className="p-4 text-sm text-gray-400 text-center">No plants match filters</div>
        )}
      </div>

      {/* Info panel for selected plant */}
      {showInfoPanel && <PlantInfoPanel />}
    </div>
  );
}
