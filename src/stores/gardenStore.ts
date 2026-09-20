import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { PlacedPlant, PlacedBuilding } from '../types/canvas';
import { DEFAULT_BUILDING, DEFAULT_PATIOS, DEFAULT_DOXAMENI, OLD_PATIO_SPOTS_PX } from '../data/survey-plot';
import { PLANTS_MAP } from '../data/plants';
import { stagingSpot } from '../utils/staging';
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
  previewPlantId: string | null;
  measureMode: boolean;
  measurePoints: { x: number; y: number }[];
  history: Snapshot[];
  /** A plant copied with Cmd+C, and how many times it has been pasted. */
  clipboard: { plant: PlacedPlant; pastes: number } | null;
  overlayWater: boolean;
  overlaySoil: boolean;
  overlaySun: boolean;

  addPlant: (plantId: string, x: number, y: number) => void;
  /** Save the current layout so the next change can be undone. Call once at the start of a drag. */
  checkpoint: () => void;
  /** Replace the whole plan, e.g. when loading it from a file. */
  loadPlan: (plan: { placedPlants: PlacedPlant[]; placedBuildings: PlacedBuilding[] }) => void;
  copyPlant: (id: string) => void;
  pastePlant: () => void;
  moveElement: (id: string, x: number, y: number) => void;
  updatePlant: (id: string, patch: Partial<Pick<PlacedPlant, 'radiusM' | 'lengthM' | 'rotation'>>) => void;
  rotateBuilding: (id: string, rotation: number) => void;
  resizeBuilding: (id: string, widthM: number, heightM: number) => void;
  removeElement: (id: string) => void;
  setMonth: (month: number) => void;
  setSelectedId: (id: string | null) => void;
  setMeasureMode: (on: boolean) => void;
  addMeasurePoint: (x: number, y: number) => void;
  clearMeasure: () => void;
  /** Show a plant's details from the list without adding it to the plan. */
  setPreviewPlant: (plantId: string | null) => void;
  setOverlayWater: (on: boolean) => void;
  setOverlaySoil: (on: boolean) => void;
  setOverlaySun: (on: boolean) => void;
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

function defaultDoxameni(): PlacedBuilding {
  const d = DEFAULT_DOXAMENI;
  return {
    id: 'doxameni-1',
    kind: 'doxameni',
    label: d.label,
    x: d.x * DEFAULT_PIXELS_PER_METER,
    y: d.y * DEFAULT_PIXELS_PER_METER,
    widthM: d.widthM,
    heightM: d.depthM,
    rotation: d.rotation,
  };
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
        defaultDoxameni(),
      ],
      pixelsPerMeter: DEFAULT_PIXELS_PER_METER,
      currentMonth: new Date().getMonth() + 1,
      selectedId: null,
      previewPlantId: null,
      measureMode: false,
      measurePoints: [],
      history: [],
      clipboard: null,
      overlayWater: false,
      overlaySoil: false,
      overlaySun: false,

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

      loadPlan: (plan) =>
        set({ placedPlants: plan.placedPlants, placedBuildings: plan.placedBuildings, history: [], selectedId: null, previewPlantId: null }),

      copyPlant: (id: string) => {
        const plant = get().placedPlants.find((p) => p.id === id);
        if (plant) set({ clipboard: { plant, pastes: 0 } });
      },

      pastePlant: () => {
        const clip = get().clipboard;
        if (!clip) return;
        // Each paste steps 1.5 m further down and right of the copied plant.
        const step = (clip.pastes + 1) * 1.5 * get().pixelsPerMeter;
        const { plantId, radiusM, lengthM, rotation } = clip.plant;
        const id = uuid();
        set((s: GardenState) => ({
          history: withSnapshot(s),
          placedPlants: [...s.placedPlants, { id, plantId, radiusM, lengthM, rotation, x: clip.plant.x + step, y: clip.plant.y + step }],
          selectedId: id,
          clipboard: { plant: clip.plant, pastes: clip.pastes + 1 },
        }));
      },

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
            b.id === id && b.kind && b.kind !== 'building' ? { ...b, widthM, heightM } : b,
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
      setSelectedId: (id: string | null) => set({ selectedId: id, previewPlantId: null }),
      setMeasureMode: (on: boolean) =>
        set({ measureMode: on, measurePoints: [] }),
      addMeasurePoint: (x: number, y: number) =>
        set((st: GardenState) => ({
          // A third click starts a fresh measurement.
          measurePoints: st.measurePoints.length >= 2 ? [{ x, y }] : [...st.measurePoints, { x, y }],
        })),
      clearMeasure: () => set({ measurePoints: [] }),
      setPreviewPlant: (plantId: string | null) => set({ previewPlantId: plantId, selectedId: null }),
      setOverlayWater: (on: boolean) => set({ overlayWater: on }),
      setOverlaySoil: (on: boolean) => set({ overlaySoil: on }),
      setOverlaySun: (on: boolean) => set({ overlaySun: on }),

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
      version: 5,
      // v1 added two patios; give them to plans saved before that, leaving everything else as it was.
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Partial<GardenState>;
        if (version < 1 && state.placedBuildings && !state.placedBuildings.some((b) => b.kind === 'patio')) {
          state.placedBuildings = [...state.placedBuildings, ...defaultPatios()];
        }
        // v2 moved the patios out of the plot; only move ones still where v1 dropped them.
        if (version < 2 && state.placedBuildings) {
          const fresh = defaultPatios().slice(0, OLD_PATIO_SPOTS_PX.length);
          state.placedBuildings = state.placedBuildings.map((b) => {
            const i = OLD_PATIO_SPOTS_PX.findIndex((o) => Math.round(b.x) === o.x && Math.round(b.y) === o.y);
            return b.kind === 'patio' && i >= 0 ? { ...b, x: fresh[i].x, y: fresh[i].y } : b;
          });
        }
        // v3 added a third patio; put it in the free column beside the plot.
        if (version < 3 && state.placedBuildings && !state.placedBuildings.some((b) => b.id === 'patio-3')) {
          const patio = defaultPatios()[2];
          const spot = stagingSpot(
            patio.widthM / 2,
            patio.heightM / 2,
            state.placedPlants ?? [],
            state.placedBuildings,
            state.pixelsPerMeter ?? DEFAULT_PIXELS_PER_METER,
          );
          state.placedBuildings = [...state.placedBuildings, { ...patio, ...spot }];
        }
        // v5 added the doxameni; put it in the first free spot beside the plot.
        if (version < 5 && state.placedBuildings && !state.placedBuildings.some((b) => b.kind === 'doxameni')) {
          const d = defaultDoxameni();
          const spot = stagingSpot(d.widthM / 2, d.heightM / 2, state.placedPlants ?? [], state.placedBuildings, state.pixelsPerMeter ?? DEFAULT_PIXELS_PER_METER);
          state.placedBuildings = [...state.placedBuildings, { ...d, ...spot }];
        }
        // v4: drop plants that have been removed from the plant list.
        if (version < 4 && state.placedPlants) {
          state.placedPlants = state.placedPlants.filter((p) => PLANTS_MAP[p.plantId]);
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
