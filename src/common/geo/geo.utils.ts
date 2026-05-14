import type { Point } from 'geojson';
import type { LngLat } from './geo.types';

export function toPoint({ lng, lat }: { lng: number; lat: number }) {
  return {
    type: 'Point',
    coordinates: [lng, lat],
  };
}
