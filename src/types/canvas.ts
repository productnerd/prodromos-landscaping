export interface PlacedPlant {
  id: string;
  plantId: string;
  x: number;
  y: number;
}

export interface PlacedBuilding {
  id: string;
  x: number;
  y: number;
  widthM: number;
  heightM: number;
  label: string;
  rotation?: number;
}

export interface PlotVertex {
  x: number;
  y: number;
}

