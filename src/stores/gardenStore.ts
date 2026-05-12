import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { PlacedPlant, PlacedBuilding, DxfShape } from '../types/canvas';
import { DEFAULT_PIXELS_PER_METER } from '../utils/scale';

interface GardenState {
  dxfShapes: DxfShape[];
  placedPlants: PlacedPlant[];
  placedBuildings: PlacedBuilding[];
  pixelsPerMeter: number;
  currentMonth: number;
  selectedId: string | null;
  buildingMode: boolean;

  importDxf: (shapes: DxfShape[]) => void;
  clearDxf: () => void;
  addPlant: (plantId: string, x: number, y: number) => void;
  addBuilding: (x: number, y: number, widthM: number, heightM: number, label: string) => void;
  moveElement: (id: string, x: number, y: number) => void;
  resizeBuilding: (id: string, widthM: number, heightM: number) => void;
  removeElement: (id: string) => void;
  setMonth: (month: number) => void;
  setSelectedId: (id: string | null) => void;
  setPixelsPerMeter: (ppm: number) => void;
  setBuildingMode: (on: boolean) => void;
}

export const useGardenStore = create<GardenState>()(
  persist(
    (set) => ({
      dxfShapes: [],
      placedPlants: [],
      placedBuildings: [],
      pixelsPerMeter: DEFAULT_PIXELS_PER_METER,
      currentMonth: new Date().getMonth() + 1,
      selectedId: null,
      buildingMode: false,

      importDxf: (shapes) => set({ dxfShapes: shapes }),
      clearDxf: () => set({ dxfShapes: [] }),

      addPlant: (plantId, x, y) =>
        set((s) => ({
          placedPlants: [...s.placedPlants, { id: uuid(), plantId, x, y }],
        })),

      addBuilding: (x, y, widthM, heightM, label) =>
        set((s) => ({
          placedBuildings: [
            ...s.placedBuildings,
            { id: uuid(), x, y, widthM, heightM, label },
          ],
          buildingMode: false,
        })),

      moveElement: (id, x, y) =>
        set((s) => ({
          placedPlants: s.placedPlants.map((p) =>
            p.id === id ? { ...p, x, y } : p,
          ),
          placedBuildings: s.placedBuildings.map((b) =>
            b.id === id ? { ...b, x, y } : b,
          ),
        })),

      resizeBuilding: (id, widthM, heightM) =>
        set((s) => ({
          placedBuildings: s.placedBuildings.map((b) =>
            b.id === id ? { ...b, widthM, heightM } : b,
          ),
        })),

      removeElement: (id) =>
        set((s) => ({
          placedPlants: s.placedPlants.filter((p) => p.id !== id),
          placedBuildings: s.placedBuildings.filter((b) => b.id !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),

      setMonth: (month) => set({ currentMonth: month }),
      setSelectedId: (id) => set({ selectedId: id }),
      setPixelsPerMeter: (ppm) => set({ pixelsPerMeter: ppm }),
      setBuildingMode: (on) => set({ buildingMode: on }),
    }),
    {
      name: 'garden-planner-state',
      partialize: (state) => ({
        placedPlants: state.placedPlants,
        placedBuildings: state.placedBuildings,
        pixelsPerMeter: state.pixelsPerMeter,
        currentMonth: state.currentMonth,
      }),
    },
  ),
);
