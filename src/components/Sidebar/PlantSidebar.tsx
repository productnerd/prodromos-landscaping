import { useState, useMemo } from 'react';
import { useGardenStore } from '../../stores/gardenStore';
import { PLANTS } from '../../data/plants';
import { CATEGORY_LABELS } from '../../types/plant';
import type { PlantCategory, PlantTag, PlantDefinition } from '../../types/plant';

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as PlantCategory[];

/** Trees first, then down the canopy to ground level. */
const GROUP_ORDER: PlantCategory[] = [
  'tree',
  'bush',
  'climber',
  'herb',
  'flower',
  'bulb',
  'grass',
  'groundcover',
  'vegetable',
];
const ALL_TAGS: PlantTag[] = ['herb', 'fruit', 'flower', 'fence', 'ornamental', 'evergreen', 'deciduous', 'edible'];

function getBrandColor(plant: PlantDefinition): string {
  if (plant.mapColor) return plant.mapColor;
  if (plant.tags.includes('fruit')) return plant.fruitColor;
  if (plant.tags.includes('flower')) return plant.flowerColor;
  return plant.foliageColor;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const SUN_LABEL: Record<PlantDefinition['sun'], string> = {
  full: '☀️ Full sun',
  partial: '⛅ Part shade',
  shade: '🌑 Shade',
};

function PlantCard({ plant }: { plant: PlantDefinition }) {
  const brandColor = getBrandColor(plant);
  const requestPlacePlant = useGardenStore((s) => s.requestPlacePlant);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('plantId', plant.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable="true"
      onDragStart={handleDragStart}
      onClick={() => requestPlacePlant(plant.id)}
      title={`Click to place ${plant.name} on the plan, or drag it where you want it`}
      className="flex items-start gap-3 py-2 px-3 border-b border-[var(--divider)] cursor-pointer hover:brightness-95"
      style={{ backgroundColor: hexToRgba(brandColor, 0.08) }}
    >
      <div
        className="w-5 h-5 rounded-full flex-shrink-0 mt-1 ring-2"
        style={{
          backgroundColor: brandColor,
          ['--tw-ring-color' as string]: hexToRgba(brandColor, 0.35),
        }}
      />
      <div className="min-w-0 flex-1">
        <div className="font-[Fraunces,Georgia,serif] font-medium text-sm text-[var(--forest-deep)] truncate">{plant.name}</div>
        <div className="text-xs italic text-[var(--ink-light)] truncate">{plant.botanicalName}</div>
        <div className="flex flex-wrap gap-1 mt-1">
          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-[var(--cream)] text-[var(--ink-light)] border border-[var(--divider)]">
            {SUN_LABEL[plant.sun]}
          </span>
          {plant.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: hexToRgba(brandColor, 0.12),
                color: brandColor,
              }}
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

  const grouped = useMemo(
    () =>
      GROUP_ORDER.map((category) => ({
        category,
        plants: filtered.filter((p) => p.category === category),
      })).filter((g) => g.plants.length > 0),
    [filtered],
  );

  const toggleTag = (tag: PlantTag) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  return (
    <div className="w-80 h-full bg-[var(--paper)] border-l border-[var(--divider)] flex flex-col overflow-hidden">
      {/* Search */}
      <div className="p-3 border-b border-[var(--divider)]">
        <input
          type="text"
          placeholder="Search plants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-[var(--cream)] text-[var(--ink)] placeholder:text-[var(--warm-gray)] border border-[var(--divider)] rounded-[4px] focus:outline-none focus:border-[var(--sage)] focus:ring-1 focus:ring-[var(--sage)]"
        />
      </div>

      {/* Category filter */}
      <div className="px-3 py-2 border-b border-[var(--divider)]">
        <div className="flex flex-wrap gap-1">
          {categoriesWithPlants.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`text-xs px-2 py-1 rounded-full transition-colors ${
                activeCategory === cat
                  ? 'bg-[var(--forest)] text-[var(--paper)]'
                  : 'bg-[var(--sage-light)]/40 text-[var(--ink-light)] hover:bg-[var(--sage-light)]'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Tag filter */}
      <div className="px-3 py-2 border-b border-[var(--divider)]">
        <div className="flex flex-wrap gap-1">
          {tagsWithPlants.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`text-[11px] px-2 py-0.5 rounded-full transition-colors ${
                activeTags.has(tag)
                  ? 'bg-[var(--sage)] text-[var(--paper)]'
                  : 'bg-[var(--cream)] text-[var(--ink-light)] hover:bg-[var(--sage-light)]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Plant list, grouped with trees at the top */}
      <div className="flex-1 overflow-y-auto">
        {grouped.map(({ category, plants }) => (
          <div key={category}>
            <div className="sticky top-0 z-10 px-3 py-1 bg-[var(--sage-light)] border-y border-[var(--divider)] font-[Fraunces,Georgia,serif] text-[11px] font-medium uppercase tracking-wide text-[var(--forest-deep)] flex items-center">
              {CATEGORY_LABELS[category]}
              <span className="ml-auto font-normal normal-case text-[var(--ink-light)]">{plants.length}</span>
            </div>
            {plants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-4 text-sm italic text-[var(--warm-gray)] text-center">No plants match filters</div>
        )}
      </div>
    </div>
  );
}
