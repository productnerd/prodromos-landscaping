import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { PlacedPlant, PlacedBuilding } from '../types/canvas';
import { DEFAULT_BUILDING, DEFAULT_PATIOS, OLD_PATIO_SPOTS_PX } from '../data/survey-plot';
import { PLANTS_MAP } from '../data/plants';
import { stagingSpot, plantHalfExtents } from '../utils/staging';
import { DEFAULT_PIXELS_PER_METER } from '../utils/scale';

/** What undo restores: the full layout before a change. */
interface Snapshot {
  placedPlants: PlacedPlant[];
  placedBuildings: PlacedBuilding[];
}

const HISTORY_LIMIT = 100;

interface GardenState {
  placedPlants: PlacedPlant[];
  placedBuildings: PlacedBuilding[];
  pixelsPerMeter: number;
  currentMonth: number;
  selectedId: string | null;
  measureMode: boolean;
  measurePoints: { x: number; y: number }[];
  history: Snapshot[];
  overlayWater: boolean;
  overlaySoil: boolean;

  addPlant: (plantId: string, x: number, y: number) => void;
  /** Save the current layout so the next change can be undone. Call once at the start of a drag. */
  checkpoint: () => void;
  moveElement: (id: string, x: number, y: number) => void;
  updatePlant: (id: string, patch: Partial<Pick<PlacedPlant, 'radiusM' | 'lengthM' | 'rotation'>>) => void;
  rotateBuilding: (id: string, rotation: number) => void;
  resizeBuilding: (id: string, widthM: number, heightM: number) => void;
  removeElement: (id: string) => void;
  setMonth: (month: number) => void;
  setSelectedId: (id: string | null) => void;
  setPixelsPerMeter: (ppm: number) => void;
  setMeasureMode: (on: boolean) => void;
  addMeasurePoint: (x: number, y: number) => void;
  clearMeasure: () => void;
  requestPlacePlant: (plantId: string) => void;
  setOverlayWater: (on: boolean) => void;
  setOverlaySoil: (on: boolean) => void;
  undo: () => void;
}

function defaultPatios(): PlacedBuilding[] {
  return DEFAULT_PATIOS.map((p, i) => ({
    id: `patio-${i + 1}`,
    kind: 'patio' as const,
    label: p.label,
    x: p.x * DEFAULT_PIXELS_PER_METER,
    y: p.y * DEFAULT_PIXELS_PER_METER,
    widthM: p.widthM,
    heightM: p.depthM,
    rotation: p.rotation,
  }));
}

function withSnapshot(s: GardenState): Snapshot[] {
  return [...s.history, { placedPlants: s.placedPlants, placedBuildings: s.placedBuildings }].slice(-HISTORY_LIMIT);
}

export const useGardenStore = create<GardenState>()(
  persist(
    (set, get) => ({
      placedPlants: [],
      placedBuildings: [
        {
          id: 'building',
          label: DEFAULT_BUILDING.label,
          x: DEFAULT_BUILDING.x * DEFAULT_PIXELS_PER_METER,
          y: DEFAULT_BUILDING.y * DEFAULT_PIXELS_PER_METER,
          widthM: DEFAULT_BUILDING.widthM,
          heightM: DEFAULT_BUILDING.depthM,
          rotation: DEFAULT_BUILDING.rotation,
        },
        ...defaultPatios(),
      ],
      pixelsPerMeter: DEFAULT_PIXELS_PER_METER,
      currentMonth: new Date().getMonth() + 1,
      selectedId: null,
      measureMode: false,
      measurePoints: [],
      history: [],
      overlayWater: false,
      overlaySoil: false,

      addPlant: (plantId: string, x: number, y: number) => {
        const id = uuid();
        set((s: GardenState) => ({
          placedPlants: [...s.placedPlants, { id, plantId, x, y }],
          history: withSnapshot(s),
          // Select what you just placed so its details come up straight away.
          selectedId: id,
        }));
      },

      checkpoint: () => set((s: GardenState) => ({ history: withSnapshot(s) })),

      moveElement: (id: string, x: number, y: number) =>
        set((s: GardenState) => ({
          placedPlants: s.placedPlants.map((p: PlacedPlant) =>
            p.id === id ? { ...p, x, y } : p,
          ),
          placedBuildings: s.placedBuildings.map((b: PlacedBuilding) =>
            b.id === id ? { ...b, x, y } : b,
          ),
        })),

      resizeBuilding: (id: string, widthM: number, heightM: number) =>
        set((s: GardenState) => ({
          placedBuildings: s.placedBuildings.map((b: PlacedBuilding) =>
            b.id === id && b.kind === 'patio' ? { ...b, widthM, heightM } : b,
          ),
        })),

      rotateBuilding: (id: string, rotation: number) =>
        set((s: GardenState) => ({
          placedBuildings: s.placedBuildings.map((b: PlacedBuilding) =>
            b.id === id ? { ...b, rotation } : b,
          ),
        })),

      updatePlant: (id: string, patch: Partial<Pick<PlacedPlant, 'radiusM' | 'lengthM' | 'rotation'>>) =>
        set((s: GardenState) => ({
          placedPlants: s.placedPlants.map((p: PlacedPlant) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      removeElement: (id: string) =>
        set((s: GardenState) => ({
          history: withSnapshot(s),
          placedPlants: s.placedPlants.filter((p: PlacedPlant) => p.id !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),

      setMonth: (month: number) => set({ currentMonth: month }),
      setSelectedId: (id: string | null) => set({ selectedId: id }),
      setPixelsPerMeter: (ppm: number) => set({ pixelsPerMeter: ppm }),
      setMeasureMode: (on: boolean) =>
        set({ measureMode: on, measurePoints: [] }),
      addMeasurePoint: (x: number, y: number) =>
        set((st: GardenState) => ({
          // A third click starts a fresh measurement.
          measurePoints: st.measurePoints.length >= 2 ? [{ x, y }] : [...st.measurePoints, { x, y }],
        })),
      clearMeasure: () => set({ measurePoints: [] }),
      requestPlacePlant: (plantId: string) => {
        const s = get();
        const plant = PLANTS_MAP[plantId];
        const [halfW, halfH] = plant ? plantHalfExtents(plant) : [1, 1];
        const spot = stagingSpot(halfW, halfH, s.placedPlants, s.placedBuildings, s.pixelsPerMeter);
        s.addPlant(plantId, spot.x, spot.y);
      },
      setOverlayWater: (on: boolean) => set({ overlayWater: on }),
      setOverlaySoil: (on: boolean) => set({ overlaySoil: on }),

      undo: () =>
        set((s: GardenState) => {
          const prev = s.history[s.history.length - 1];
          if (!prev) return {};
          const stillThere = (id: string | null) =>
            !!id && (prev.placedPlants.some((p) => p.id === id) || prev.placedBuildings.some((b) => b.id === id));
          return {
            ...prev,
            history: s.history.slice(0, -1),
            selectedId: stillThere(s.selectedId) ? s.selectedId : null,
          };
        }),
    }),
    {
      name: 'garden-planner-state',
      version: 2,
      // v1 added two patios; give them to plans saved before that, leaving everything else as it was.
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Partial<GardenState>;
        if (version < 1 && state.placedBuildings && !state.placedBuildings.some((b) => b.kind === 'patio')) {
          state.placedBuildings = [...state.placedBuildings, ...defaultPatios()];
        }
        // v2 moved the patios out of the plot; only move ones still where v1 dropped them.
        if (version < 2 && state.placedBuildings) {
          const fresh = defaultPatios();
          state.placedBuildings = state.placedBuildings.map((b) => {
            const i = OLD_PATIO_SPOTS_PX.findIndex((o) => Math.round(b.x) === o.x && Math.round(b.y) === o.y);
            return b.kind === 'patio' && i >= 0 ? { ...b, x: fresh[i].x, y: fresh[i].y } : b;
          });
        }
        return state as GardenState;
      },
      partialize: (state: GardenState) => ({
        placedPlants: state.placedPlants,
        placedBuildings: state.placedBuildings,
        pixelsPerMeter: state.pixelsPerMeter,
        currentMonth: state.currentMonth,
        selectedId: state.selectedId,
      }),
    },
  ),
);
