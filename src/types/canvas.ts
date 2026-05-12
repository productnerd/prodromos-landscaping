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

export interface PlotPolygon {
  id: string;
  vertices: PlotVertex[];
  closed: boolean;
}

export interface DxfShape {
  type: 'line' | 'polyline' | 'circle' | 'arc' | 'text';
  points?: number[];
  x?: number;
  y?: number;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  text?: string;
  closed?: boolean;
  color?: string;
}
