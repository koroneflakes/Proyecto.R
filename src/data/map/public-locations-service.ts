import type { Bounds, LocationFilter, MapLocation } from './types';
import { MAP_TEXTS } from './texts';

export const PUBLIC_SERVICE_ERROR_CODES = {
  NO_CONNECTION: 'NO_CONNECTION',
  DAILY_LIMIT_REACHED: 'DAILY_LIMIT_REACHED',
  PHOTO_MISSING: 'PHOTO_MISSING',
  NOT_AUTHORIZED: 'NOT_AUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  UNKNOWN: 'UNKNOWN',
} as const;

export type PublicServiceErrorCode =
  (typeof PUBLIC_SERVICE_ERROR_CODES)[keyof typeof PUBLIC_SERVICE_ERROR_CODES];

export interface PublicServiceError {
  code: PublicServiceErrorCode;
  message: string;
}

export type PublicServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: PublicServiceError };

export interface PublicLocation {
  id: string;
  ownerId: string;
  name: string;
  category: MapLocation['category'];
  subtypes: MapLocation['subtypes'];
  lat: number;
  lng: number;
  photoUrl: string;
  createdAt: string;
  isOwn: boolean;
}

export type PublicReportReason = (typeof MAP_TEXTS.reportReasons)[number]['key'];

export interface PublicLocationsService {
  publish(location: MapLocation): Promise<PublicServiceResult<PublicLocation>>;
  unpublish(id: string, ownerId: string): Promise<PublicServiceResult<void>>;
  fetchPublic(
    bounds: Bounds,
    filter: LocationFilter,
    viewerId: string,
  ): Promise<PublicServiceResult<PublicLocation[]>>;
  report(
    id: string,
    reason: PublicReportReason,
    reporterId: string,
  ): Promise<PublicServiceResult<void>>;
}
