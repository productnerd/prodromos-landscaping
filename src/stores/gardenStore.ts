import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { PlacedPlant, PlacedBuilding } from '../types/canvas';
import { DEFAULT_BUILDING } from '../data/survey-plot';
import { DEFAULT_PIXELS_PER_METER } from '../utils/scale';

type UndoEntry = { type: 'addPlant'; plantId: string };

interface GardenState {
  placedPlants: PlacedPlant[];
  placedBuildings: PlacedBuilding[];
  pixelsPerMeter: number;
  currentMonth: number;
  selectedId: string | null;
  measureMode: boolean;
  measurePoints: { x: number; y: number }[];
  pendingPlantId: string | null;
  undoStack: UndoEntry[];
  overlayWater: boolean;
  overlaySoil: boolean;

  addPlant: (plantId: string, x: number, y: number) => void;
  moveElement: (id: string, x: number, y: number) => void;
  rotateBuilding: (id: string, rotation: number) => void;
  removeElement: (id: string) => void;
  setMonth: (month: number) => void;
  setSelectedId: (id: string | null) => void;
  setPixelsPerMeter: (ppm: number) => void;
  setMeasureMode: (on: boolean) => void;
  addMeasurePoint: (x: number, y: number) => void;
  clearMeasure: () => void;
  requestPlacePlant: (plantId: string) => void;
  clearPendingPlant: () => void;
  setOverlayWater: (on: boolean) => void;
  setOverlaySoil: (on: boolean) => void;
  undo: () => void;
}

export const useGardenStore = create<GardenState>()(
  persist(
    (set) => ({
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
      ],
      pixelsPerMeter: DEFAULT_PIXELS_PER_METER,
      currentMonth: new Date().getMonth() + 1,
      selectedId: null,
      measureMode: false,
      measurePoints: [],
      pendingPlantId: null,
      undoStack: [],
      overlayWater: false,
      overlaySoil: false,

      addPlant: (plantId: string, x: number, y: number) => {
        const id = uuid();
        set((s: GardenState) => ({
          placedPlants: [...s.placedPlants, { id, plantId, x, y }],
          undoStack: [...s.undoStack, { type: 'addPlant' as const, plantId: id }],
          // Select what you just placed so its details come up straight away.
          selectedId: id,
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

      rotateBuilding: (id: string, rotation: number) =>
        set((s: GardenState) => ({
          placedBuildings: s.placedBuildings.map((b: PlacedBuilding) =>
            b.id === id ? { ...b, rotation } : b,
          ),
        })),

      removeElement: (id: string) =>
        set((s: GardenState) => ({
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
      requestPlacePlant: (plantId: string) => set({ pendingPlantId: plantId }),
      clearPendingPlant: () => set({ pendingPlantId: null }),
      setOverlayWater: (on: boolean) => set({ overlayWater: on }),
      setOverlaySoil: (on: boolean) => set({ overlaySoil: on }),

      undo: () =>
        set((s: GardenState) => {
          if (s.undoStack.length === 0) return {};
          const entry = s.undoStack[s.undoStack.length - 1];
          const newStack = s.undoStack.slice(0, -1);

          switch (entry.type) {
            case 'addPlant': {
              return {
                undoStack: newStack,
                placedPlants: s.placedPlants.filter((p: PlacedPlant) => p.id !== entry.plantId),
                selectedId: s.selectedId === entry.plantId ? null : s.selectedId,
              };
            }
          }
        }),
    }),
    {
      name: 'garden-planner-state',
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
