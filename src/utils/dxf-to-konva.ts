import type { DxfShape } from '../types/canvas';

interface DxfEntity {
  type: string;
  vertices?: Array<{ x: number; y: number }>;
  x?: number;
  y?: number;
  r?: number;
  startAngle?: number;
  endAngle?: number;
  text?: string;
  string?: string;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  shape?: boolean;
}

interface DxfData {
  entities?: DxfEntity[];
}

export function dxfToKonvaShapes(dxfData: DxfData): DxfShape[] {
  const shapes: DxfShape[] = [];
  if (!dxfData.entities) return shapes;

  for (const entity of dxfData.entities) {
    switch (entity.type) {
      case 'LINE':
        if (entity.start && entity.end) {
          shapes.push({
            type: 'line',
            points: [entity.start.x, -entity.start.y, entity.end.x, -entity.end.y],
            color: '#666',
          });
        }
        break;

      case 'LWPOLYLINE':
      case 'POLYLINE':
        if (entity.vertices && entity.vertices.length > 1) {
          const pts = entity.vertices.flatMap((v) => [v.x, -v.y]);
          shapes.push({
            type: 'polyline',
            points: pts,
            closed: entity.shape ?? false,
            color: '#666',
          });
        }
        break;

      case 'CIRCLE':
        if (entity.x != null && entity.y != null && entity.r != null) {
          shapes.push({
            type: 'circle',
            x: entity.x,
            y: -entity.y,
            radius: entity.r,
            color: '#666',
          });
        }
        break;

      case 'ARC':
        if (entity.x != null && entity.y != null && entity.r != null) {
          shapes.push({
            type: 'arc',
            x: entity.x,
            y: -entity.y,
            radius: entity.r,
            startAngle: entity.startAngle ?? 0,
            endAngle: entity.endAngle ?? 360,
            color: '#666',
          });
        }
        break;

      case 'TEXT':
      case 'MTEXT':
        if (entity.x != null && entity.y != null) {
          shapes.push({
            type: 'text',
            x: entity.x,
            y: -entity.y,
            text: entity.text ?? entity.string ?? '',
            color: '#444',
          });
        }
        break;
    }
  }

  return shapes;
}
