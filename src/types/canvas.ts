export interface PlacedPlant {
  id: string;
  plantId: string;
  x: number;
  y: number;
  /** Canopy radius set by hand; falls back to the species' mature radius. */
  radiusM?: number;
  /** Climbers are strips along a wall: their length, and angle in degrees. */
  lengthM?: number;
  rotation?: number;
}


export interface PlacedBuilding {
  id: string;
  x: number;
  y: number;
  widthM: number;
  heightM: number;
  label: string;
  rotation?: number;
  /** Patios and the doxameni are resizable; the building has a fixed size. */
  kind?: 'building' | 'patio' | 'doxameni';
}

export interface PlotVertex {
  x: number;
  y: number;
}

