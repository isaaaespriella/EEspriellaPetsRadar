import type { Point } from 'geojson';
import type { LngLat } from './geo.types';

export function toPoint({ lng, lat }: LngLat): Point {
  return { type: 'Point', coordinates: [lng, lat] };
}

