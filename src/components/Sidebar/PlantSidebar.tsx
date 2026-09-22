import { useState, useMemo } from 'react';
import { useGardenStore } from '../../stores/gardenStore';
import { PLANTS } from '../../data/plants';
import { plantPhotoUrl, PLANT_PHOTOS } from '../../data/plant-photos';
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

/** What a climber does to a tree it grows into. */
const TREE_RISK = {
  harmful: { label: '⚠️ Strangles trees', className: 'bg-[#B3261E] text-white' },
  caution: { label: '⚠️ Keep off trees', className: 'bg-[#D98E04] text-white' },
  safe: { label: '🌳 Safe on trees', className: 'bg-[var(--sage-light)] text-[var(--forest-deep)]' },
} as const;

const SUN_LABEL: Record<PlantDefinition['sun'], string> = {
  full: '☀️ Full sun',
  partial: '⛅ Part shade',
  shade: '🌑 Shade',
};

function PlantCard({ plant }: { plant: PlantDefinition }) {
  const brandColor = getBrandColor(plant);
  const setPreviewPlant = useGardenStore((s) => s.setPreviewPlant);
  const isOpen = useGardenStore((s) => s.previewPlantId === plant.id);
  const photo = plantPhotoUrl(plant.id);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('plantId', plant.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable="true"
      onDragStart={handleDragStart}
      onClick={() => setPreviewPlant(plant.id)}
      title={`Click to see ${plant.name}; drag it onto the plan to add it`}
      className={`flex items-stretch border-b border-[var(--divider)] cursor-pointer hover:brightness-95 ${
        isOpen ? 'ring-2 ring-inset ring-[var(--forest)]' : ''
      }`}
      style={{ backgroundColor: hexToRgba(brandColor, 0.08) }}
    >
      {photo ? (
        // The card's text sets its height; the photo fills it without stretching the card.
        <div className="relative w-20 flex-shrink-0 self-stretch overflow-hidden">
          <img
            src={photo}
            alt={plant.name}
            title={`Photo: ${PLANT_PHOTOS[plant.id].artist}`}
            loading="lazy"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="w-20 flex-shrink-0 self-stretch" style={{ backgroundColor: hexToRgba(brandColor, 0.45) }} />
      )}
      <div className="min-w-0 flex-1 py-2 px-3">
        <div className="font-[Fraunces,Georgia,serif] font-medium text-sm text-[var(--forest-deep)] truncate">{plant.name}</div>
        <div className="text-xs italic text-[var(--ink-light)] truncate">{plant.botanicalName}</div>
        <div className="mt-1">
          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-[var(--cream)] text-[var(--ink-light)] border border-[var(--divider)]">
            {SUN_LABEL[plant.sun]}
          </span>
          {plant.replant && (
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded font-medium bg-[var(--terracotta-light)] text-[var(--terracotta)]">
              {plant.replant.every === 'year' ? '↻ Replant yearly' : '↻ Replace in a few years'}
            </span>
          )}
          {plant.category === 'climber' && <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded font-medium ${TREE_RISK[plant.treeRisk?.level ?? 'safe'].className}`}>{TREE_RISK[plant.treeRisk?.level ?? 'safe'].label}</span>}
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
