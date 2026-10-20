import type { LngLatBounds } from '@maplibre/maplibre-react-native';

export const SPIKE_TEST_CENTER = {
  latitude: 31.87149,
  longitude: -116.60071,
} as const;

// Approximately 3 km by 3 km around Ensenada. Replace with a small local area for testing.
export const SPIKE_TEST_BOUNDS: LngLatBounds = [
  -116.617,
  31.85799,
  -116.58442,
  31.88499,
];

export const SPIKE_MIN_ZOOM = 10;
export const SPIKE_MAX_ZOOM_OPTIONS = [14, 15, 16] as const;
export const SPIKE_DEFAULT_MAX_ZOOM = 14;

export const SPIKE_BASE_STYLE_URL =
  'https://tiles.openfreemap.org/styles/liberty';

export const SPIKE_SAMPLE_POINTS = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'sample-taller',
      geometry: { type: 'Point', coordinates: [-116.60071, 31.87149] },
      properties: { category: 'taller', name: 'Taller de prueba', icon: 'pin-taller' },
    },
    {
      type: 'Feature',
      id: 'sample-market',
      geometry: { type: 'Point', coordinates: [-116.5978, 31.8729] },
      properties: { category: 'mercado', name: 'Mercado de prueba', icon: 'pin-mercado' },
    },
    {
      type: 'Feature',
      id: 'sample-taller-2',
      geometry: { type: 'Point', coordinates: [-116.604, 31.8698] },
      properties: { category: 'taller', name: 'Taller comunitario', icon: 'pin-taller' },
    },
    {
      type: 'Feature',
      id: 'sample-market-2',
      geometry: { type: 'Point', coordinates: [-116.5944, 31.8702] },
      properties: { category: 'mercado', name: 'Puesto de materiales', icon: 'pin-mercado' },
    },
  ],
} as const;
