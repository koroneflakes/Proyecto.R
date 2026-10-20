import type { Bounds } from './types';

export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function isValidBounds(bounds: Bounds): boolean {
  return (
    isValidCoordinate(bounds.minLat, bounds.minLng) &&
    isValidCoordinate(bounds.maxLat, bounds.maxLng) &&
    bounds.minLat <= bounds.maxLat &&
    bounds.minLng <= bounds.maxLng
  );
}

export function clampBounds(bounds: Bounds): Bounds {
  const values = [bounds.minLat, bounds.minLng, bounds.maxLat, bounds.maxLng];

  if (!values.every(Number.isFinite)) {
    throw new RangeError('Los límites deben contener coordenadas finitas.');
  }

  const clamp = (value: number, minimum: number, maximum: number) =>
    Math.max(minimum, Math.min(maximum, value));
  const latitudes = [
    clamp(bounds.minLat, -90, 90),
    clamp(bounds.maxLat, -90, 90),
  ].sort((first, second) => first - second);
  const longitudes = [
    clamp(bounds.minLng, -180, 180),
    clamp(bounds.maxLng, -180, 180),
  ].sort((first, second) => first - second);

  return {
    minLat: latitudes[0],
    minLng: longitudes[0],
    maxLat: latitudes[1],
    maxLng: longitudes[1],
  };
}
