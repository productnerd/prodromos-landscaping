import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { PlacedPlant, PlacedBuilding, DxfShape, PlotPolygon, PlotVertex } from '../types/canvas';
import { DEFAULT_PIXELS_PER_METER } from '../utils/scale';

interface GardenState {
  dxfShapes: DxfShape[];
  placedPlants: PlacedPlant[];
  placedBuildings: PlacedBuilding[];
  plotPolygons: PlotPolygon[];
  drawingPlotId: string | null;
  pixelsPerMeter: number;
  currentMonth: number;
  selectedId: string | null;
  buildingMode: boolean;
  drawPlotMode: boolean;

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
  setDrawPlotMode: (on: boolean) => void;
  startPlot: () => void;
  addPlotVertex: (x: number, y: number) => void;
  closePlot: () => void;
  cancelPlot: () => void;
  moveVertex: (plotId: string, vertexIndex: number, x: number, y: number) => void;
  removePlot: (plotId: string) => void;
}

export const useGardenStore = create<GardenState>()(
  persist(
    (set) => ({
      dxfShapes: [],
      placedPlants: [],
      placedBuildings: [],
      plotPolygons: [],
      drawingPlotId: null,
      pixelsPerMeter: DEFAULT_PIXELS_PER_METER,
      currentMonth: new Date().getMonth() + 1,
      selectedId: null,
      buildingMode: false,
      drawPlotMode: false,

      importDxf: (shapes: DxfShape[]) => set({ dxfShapes: shapes }),
      clearDxf: () => set({ dxfShapes: [] }),

      addPlant: (plantId: string, x: number, y: number) =>
        set((s: GardenState) => ({
          placedPlants: [...s.placedPlants, { id: uuid(), plantId, x, y }],
        })),

      addBuilding: (x: number, y: number, widthM: number, heightM: number, label: string) =>
        set((s: GardenState) => ({
          placedBuildings: [
            ...s.placedBuildings,
            { id: uuid(), x, y, widthM, heightM, label },
          ],
          buildingMode: false,
        })),

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
            b.id === id ? { ...b, widthM, heightM } : b,
          ),
        })),

      removeElement: (id: string) =>
        set((s: GardenState) => ({
          placedPlants: s.placedPlants.filter((p: PlacedPlant) => p.id !== id),
          placedBuildings: s.placedBuildings.filter((b: PlacedBuilding) => b.id !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),

      setMonth: (month: number) => set({ currentMonth: month }),
      setSelectedId: (id: string | null) => set({ selectedId: id }),
      setPixelsPerMeter: (ppm: number) => set({ pixelsPerMeter: ppm }),
      setBuildingMode: (on: boolean) => set({ buildingMode: on }),
      setDrawPlotMode: (on: boolean) => set({ drawPlotMode: on, buildingMode: false }),

      startPlot: () => {
        const id = uuid();
        set((s: GardenState) => ({
          plotPolygons: [...s.plotPolygons, { id, vertices: [], closed: false }],
          drawingPlotId: id,
        }));
      },

      addPlotVertex: (x: number, y: number) =>
        set((s: GardenState) => {
          if (!s.drawingPlotId) return {};
          return {
            plotPolygons: s.plotPolygons.map((p: PlotPolygon) =>
              p.id === s.drawingPlotId
                ? { ...p, vertices: [...p.vertices, { x, y }] }
                : p,
            ),
          };
        }),

      closePlot: () =>
        set((s: GardenState) => ({
          plotPolygons: s.plotPolygons.map((p: PlotPolygon) =>
            p.id === s.drawingPlotId ? { ...p, closed: true } : p,
          ),
          drawingPlotId: null,
          drawPlotMode: false,
        })),

      cancelPlot: () =>
        set((s: GardenState) => ({
          plotPolygons: s.plotPolygons.filter((p: PlotPolygon) => p.id !== s.drawingPlotId),
          drawingPlotId: null,
          drawPlotMode: false,
        })),

      moveVertex: (plotId: string, vertexIndex: number, x: number, y: number) =>
        set((s: GardenState) => ({
          plotPolygons: s.plotPolygons.map((p: PlotPolygon) =>
            p.id === plotId
              ? {
                  ...p,
                  vertices: p.vertices.map((v: PlotVertex, i: number) =>
                    i === vertexIndex ? { x, y } : v,
                  ),
                }
              : p,
          ),
        })),

      removePlot: (plotId: string) =>
        set((s: GardenState) => ({
          plotPolygons: s.plotPolygons.filter((p: PlotPolygon) => p.id !== plotId),
        })),
    }),
    {
      name: 'garden-planner-state',
      partialize: (state: GardenState) => ({
        placedPlants: state.placedPlants,
        placedBuildings: state.placedBuildings,
        plotPolygons: state.plotPolygons,
        pixelsPerMeter: state.pixelsPerMeter,
        currentMonth: state.currentMonth,
      }),
    },
  ),
);
