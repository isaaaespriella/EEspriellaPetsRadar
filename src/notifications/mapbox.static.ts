import type { LngLat } from '../common/geo/geo.types';

export function buildStaticMapUrl(params: {
  accessToken: string;
  found: LngLat;
  lost: LngLat;
  width?: number;
  height?: number;
}) {
  const width = params.width ?? 600;
  const height = params.height ?? 400;
  const foundMarker = `pin-s+00f(${params.found.lng},${params.found.lat})`;
  const lostMarker = `pin-s+f00(${params.lost.lng},${params.lost.lat})`;
  const overlays = `${foundMarker},${lostMarker}`;
  const base = 'https://api.mapbox.com/styles/v1/mapbox/streets-v12/static';
  return `${base}/${overlays}/auto/${width}x${height}?access_token=${params.accessToken}`;
}

