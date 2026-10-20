import type { MapCategoryKey } from './categories';
import type { MapSubtypeKey } from './subtypes';

export const LOCATION_STATUS = {
  LOCAL: 'local',
  PENDING: 'pending',
  PUBLISHED: 'published',
} as const;

export const LOCATION_STATUSES = [
  LOCATION_STATUS.LOCAL,
  LOCATION_STATUS.PENDING,
  LOCATION_STATUS.PUBLISHED,
] as const;

export type LocationStatus = (typeof LOCATION_STATUS)[keyof typeof LOCATION_STATUS];

export const VALIDATION_ERROR_CODES = {
  NAME_REQUIRED: 'NAME_REQUIRED',
  NAME_TOO_SHORT: 'NAME_TOO_SHORT',
  NAME_TOO_LONG: 'NAME_TOO_LONG',
  CATEGORY_REQUIRED: 'CATEGORY_REQUIRED',
  CATEGORY_INVALID: 'CATEGORY_INVALID',
  TOO_MANY_SUBTYPES: 'TOO_MANY_SUBTYPES',
  SUBTYPE_NOT_ALLOWED_FOR_CATEGORY: 'SUBTYPE_NOT_ALLOWED_FOR_CATEGORY',
  COORDINATES_INVALID: 'COORDINATES_INVALID',
  PHOTO_REQUIRED: 'PHOTO_REQUIRED',
} as const;

export type ValidationErrorCode =
  (typeof VALIDATION_ERROR_CODES)[keyof typeof VALIDATION_ERROR_CODES];

export interface MapLocation {
  id: string;
  ownerId: string;
  name: string;
  category: MapCategoryKey;
  subtypes: MapSubtypeKey[];
  lat: number;
  lng: number;
  photoLocalUri?: string;
  photoPath?: string;
  status: LocationStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  lastSyncError?: string;
}

export interface LocationDraft {
  name: string;
  category: MapCategoryKey | null;
  subtypes: MapSubtypeKey[];
  lat: number;
  lng: number;
  photoLocalUri?: string;
}

export interface Bounds {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

export interface LocationFilter {
  categories?: MapCategoryKey[];
  subtypes?: MapSubtypeKey[];
}
