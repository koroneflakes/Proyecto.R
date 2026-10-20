import * as Crypto from 'expo-crypto';

import { images } from '@/constants/images';

import { DAILY_PUBLISH_LIMIT, MAX_PUBLIC_RESULTS, REPORTS_TO_HIDE } from './constants';
import { getCategory, MAP_CATEGORY_KEYS } from './categories';
import { isValidBounds } from './coordinates';
import { getLocationsDatabase } from './database';
import { MOCK_CENTER, MOCK_PUBLIC_SERVICE_FLAGS } from './mock-public-constants';
import { MAP_TEXTS } from './texts';
import { type Bounds, type LocationFilter, type MapLocation } from './types';
import {
  PUBLIC_SERVICE_ERROR_CODES,
  type PublicLocation,
  type PublicLocationsService,
  type PublicReportReason,
  type PublicServiceError,
  type PublicServiceErrorCode,
  type PublicServiceResult,
} from './public-locations-service';
import { MAP_SUBTYPES, type MapSubtypeKey } from './subtypes';

interface MockLocationRow {
  id: string;
  owner_id: string;
  name: string;
  category: string;
  subtypes: string;
  lat: number;
  lng: number;
  photo_url: string;
  created_at: string;
  published_at: number;
}

const MOCK_OWNER_PREFIX = 'mock-artesano-';
const SAMPLE_OFFSETS = [
  [-0.028, -0.024],
  [-0.025, 0.012],
  [-0.021, 0.027],
  [-0.018, -0.006],
  [-0.015, 0.019],
  [-0.012, -0.029],
  [-0.009, 0.004],
  [-0.006, 0.025],
  [-0.003, -0.015],
  [0, 0.009],
  [0.004, -0.027],
  [0.007, 0.018],
  [0.01, -0.008],
  [0.013, 0.028],
  [0.016, -0.02],
  [0.019, 0.003],
  [0.022, 0.022],
  [0.025, -0.011],
  [0.028, 0.014],
  [0.03, -0.025],
] as const;
const SAMPLE_NAMES = [
  'Taller de fibras y tintes',
  'Mercado de herramientas',
  'Punto de recuperación de madera',
  'Taller comunitario del barrio',
  'Puesto de ingredientes locales',
  'Recolección de materiales reutilizables',
  'Mercado de telas y cuero',
  'Espacio de reparación vecinal',
  'Puesto de barro y cerámica',
  'Centro de intercambio artesanal',
  'Tienda de componentes',
  'Punto de acopio de materiales',
  'Mercado de pinturas',
  'Taller de oficios tradicionales',
  'Puesto de bisutería',
  'Recolección de maderas',
  'Mercado de mecánica',
  'Espacio artesanal comunitario',
  'Puesto de herramientas usadas',
  'Centro de recuperación de materiales',
] as const;

function error(code: PublicServiceErrorCode): PublicServiceError {
  return {
    code,
    message: MAP_TEXTS.publishErrors[code],
  };
}

function failure<T>(code: PublicServiceErrorCode): PublicServiceResult<T> {
  return { ok: false, error: error(code) };
}

function success<T>(data: T): PublicServiceResult<T> {
  return { ok: true, data };
}

function mapUnknownError<T>(caught: unknown): PublicServiceResult<T> {
  console.error('Error inesperado en el servicio público simulado del mapa.', caught);
  return failure(PUBLIC_SERVICE_ERROR_CODES.UNKNOWN);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((key: unknown) => typeof key === 'string');
}

async function simulateOperation(): Promise<PublicServiceError | null> {
  const flags = MOCK_PUBLIC_SERVICE_FLAGS;

  if (flags.simulateLatency) {
    await new Promise((resolve) => {
      setTimeout(resolve, 300 + Math.floor(Math.random() * 501));
    });
  }
  if (flags.offline) {
    return error(PUBLIC_SERVICE_ERROR_CODES.NO_CONNECTION);
  }
  if (Math.random() < flags.failureProbability) {
    return error(PUBLIC_SERVICE_ERROR_CODES.UNKNOWN);
  }
  return null;
}

async function ensureSeedData(): Promise<void> {
  const database = await getLocationsDatabase();
  await database.withTransactionAsync(async () => {
    const seedState = await database.getFirstAsync<{ id: number }>(
      'SELECT id FROM mock_public_seed_state WHERE id = 1',
    );
    if (seedState) {
      return;
    }

    const now = Date.now();
    const sampleCategories = [
      MAP_CATEGORY_KEYS.TALLER,
      MAP_CATEGORY_KEYS.MERCADO,
      MAP_CATEGORY_KEYS.RECOLECCION,
      MAP_CATEGORY_KEYS.OTRO,
    ] as const;
    const marketSubtypes = MAP_SUBTYPES.filter(
      (subtype) => subtype.categoryKey === MAP_CATEGORY_KEYS.MERCADO,
    );

    for (let index = 0; index < SAMPLE_OFFSETS.length; index += 1) {
      const category = sampleCategories[index % sampleCategories.length];
      const subtype =
        category === MAP_CATEGORY_KEYS.MERCADO
          ? marketSubtypes[index % marketSubtypes.length]
          : undefined;
      const [latOffset, lngOffset] = SAMPLE_OFFSETS[index];
      const createdAt = new Date(now - 72 * 60 * 60 * 1000 - index * 60_000).toISOString();

      await database.runAsync(
        `INSERT INTO mock_public_locations (
          id, owner_id, name, category, subtypes, lat, lng,
          photo_url, created_at, published_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
        `${MOCK_OWNER_PREFIX}${index + 1}`,
        SAMPLE_NAMES[index],
        category,
        JSON.stringify(subtype ? [subtype.key] : []),
        MOCK_CENTER.lat + latOffset,
        MOCK_CENTER.lng + lngOffset,
        images.mapPlaceholderDataUri,
        createdAt,
        now - 72 * 60 * 60 * 1000 - index * 60_000,
      );
    }

    await database.runAsync(
      'INSERT INTO mock_public_seed_state (id, seeded_at) VALUES (1, ?)',
      now,
    );
  });
}

function toPublicLocation(row: MockLocationRow, viewerId: string): PublicLocation {
  const subtypes: unknown = JSON.parse(row.subtypes);
  if (!isStringArray(subtypes)) {
    throw new Error(`El registro simulado ${row.id} tiene subtipos inválidos.`);
  }
  const category = getCategory(row.category);
  if (!category) {
    throw new Error(`El registro simulado ${row.id} tiene una categoría inválida.`);
  }
  const parsedSubtypes: MapSubtypeKey[] = subtypes.map((key) => {
    const subtype = MAP_SUBTYPES.find(
      (candidate) => candidate.key === key && candidate.categoryKey === category.key,
    );
    if (!subtype) {
      throw new Error(`El registro simulado ${row.id} tiene un subtipo inválido.`);
    }
    return subtype.key;
  });

  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    category: category.key,
    subtypes: parsedSubtypes,
    lat: row.lat,
    lng: row.lng,
    photoUrl: row.photo_url,
    createdAt: row.created_at,
    isOwn: row.owner_id === viewerId,
  };
}

function buildCategoryFilter(filter: LocationFilter): {
  sql: string;
  params: string[];
} {
  if (!filter.categories?.length) {
    return { sql: '', params: [] };
  }

  return {
    sql: ` AND p.category IN (${filter.categories.map(() => '?').join(', ')})`,
    params: filter.categories,
  };
}

function buildSubtypeFilter(filter: LocationFilter): {
  sql: string;
  params: string[];
} {
  if (!filter.subtypes?.length) {
    return { sql: '', params: [] };
  }
  return {
    sql: ` AND EXISTS (
      SELECT 1 FROM json_each(p.subtypes) AS subtype
      WHERE subtype.value IN (${filter.subtypes.map(() => '?').join(', ')})
    )`,
    params: filter.subtypes,
  };
}

export class MockPublicLocationsService implements PublicLocationsService {
  async publish(location: MapLocation): Promise<PublicServiceResult<PublicLocation>> {
    try {
      const simulatedError = await simulateOperation();
      if (simulatedError) {
        return { ok: false, error: simulatedError };
      }
      if (!location.ownerId.trim()) {
        return failure(PUBLIC_SERVICE_ERROR_CODES.NOT_AUTHORIZED);
      }
      const photoLocalUri = location.photoLocalUri;
      if (!photoLocalUri?.trim()) {
        return failure(PUBLIC_SERVICE_ERROR_CODES.PHOTO_MISSING);
      }

      await ensureSeedData();
      const database = await getLocationsDatabase();
      let existing: MockLocationRow | null = null;
      let notAuthorized = false;
      let dailyLimitReached = false;
      let isExisting = false;
      let publishedAt = Date.now();
      await database.withTransactionAsync(async () => {
        existing = await database.getFirstAsync<MockLocationRow>(
          'SELECT * FROM mock_public_locations WHERE id = ?',
          location.id,
        );
        if (existing) {
          isExisting = true;
          publishedAt = existing.published_at;
        }
        if (existing && existing.owner_id !== location.ownerId) {
          notAuthorized = true;
          return;
        }
        if (!isExisting) {
          const since = Date.now() - 24 * 60 * 60 * 1000;
          const publishedToday = await database.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) AS count FROM mock_public_publish_events
              WHERE owner_id = ? AND published_at >= ?`,
            location.ownerId,
            since,
          );
          if (
            MOCK_PUBLIC_SERVICE_FLAGS.forceDailyLimit ||
            (publishedToday?.count ?? 0) >= DAILY_PUBLISH_LIMIT
          ) {
            dailyLimitReached = true;
            return;
          }
        }

        await database.runAsync(
          `INSERT INTO mock_public_locations (
            id, owner_id, name, category, subtypes, lat, lng,
            photo_url, created_at, published_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            category = excluded.category,
            subtypes = excluded.subtypes,
            lat = excluded.lat,
            lng = excluded.lng,
            photo_url = excluded.photo_url`,
          location.id,
          location.ownerId,
          location.name,
          location.category,
          JSON.stringify(location.subtypes),
          location.lat,
          location.lng,
          photoLocalUri,
          location.createdAt,
          publishedAt,
        );
        if (!isExisting) {
          await database.runAsync(
            'INSERT INTO mock_public_publish_events (id, owner_id, published_at) VALUES (?, ?, ?)',
            Crypto.randomUUID(),
            location.ownerId,
            publishedAt,
          );
        }
      });

      if (notAuthorized) {
        return failure(PUBLIC_SERVICE_ERROR_CODES.NOT_AUTHORIZED);
      }
      if (dailyLimitReached) {
        return failure(PUBLIC_SERVICE_ERROR_CODES.DAILY_LIMIT_REACHED);
      }

      return success({
        id: location.id,
        ownerId: location.ownerId,
        name: location.name,
        category: location.category,
        subtypes: [...location.subtypes],
        lat: location.lat,
        lng: location.lng,
        photoUrl: photoLocalUri,
        createdAt: location.createdAt,
        isOwn: true,
      });
    } catch (caught) {
      return mapUnknownError(caught);
    }
  }

  async unpublish(
    id: string,
    ownerId: string,
  ): Promise<PublicServiceResult<void>> {
    try {
      const simulatedError = await simulateOperation();
      if (simulatedError) {
        return { ok: false, error: simulatedError };
      }
      if (!ownerId.trim()) {
        return failure(PUBLIC_SERVICE_ERROR_CODES.NOT_AUTHORIZED);
      }
      await ensureSeedData();
      const database = await getLocationsDatabase();
      const existing = await database.getFirstAsync<{ owner_id: string }>(
        'SELECT owner_id FROM mock_public_locations WHERE id = ?',
        id,
      );
      if (!existing) {
        return failure(PUBLIC_SERVICE_ERROR_CODES.NOT_FOUND);
      }
      if (existing.owner_id !== ownerId) {
        return failure(PUBLIC_SERVICE_ERROR_CODES.NOT_AUTHORIZED);
      }

      await database.withTransactionAsync(async () => {
        await database.runAsync('DELETE FROM mock_public_locations WHERE id = ?', id);
        await database.runAsync(
          'DELETE FROM mock_public_location_reports WHERE location_id = ?',
          id,
        );
      });
      return success(undefined);
    } catch (caught) {
      return mapUnknownError(caught);
    }
  }

  async fetchPublic(
    bounds: Bounds,
    filter: LocationFilter,
    viewerId: string,
  ): Promise<PublicServiceResult<PublicLocation[]>> {
    try {
      const simulatedError = await simulateOperation();
      if (simulatedError) {
        return { ok: false, error: simulatedError };
      }
      if (!viewerId.trim()) {
        return failure(PUBLIC_SERVICE_ERROR_CODES.NOT_AUTHORIZED);
      }
      if (!isValidBounds(bounds)) {
        return failure(PUBLIC_SERVICE_ERROR_CODES.UNKNOWN);
      }

      await ensureSeedData();
      const database = await getLocationsDatabase();
      const categoryFilter = buildCategoryFilter(filter);
      const subtypeFilter = buildSubtypeFilter(filter);
      const rows = await database.getAllAsync<MockLocationRow>(
        `SELECT p.* FROM mock_public_locations p
          WHERE p.lat BETWEEN ? AND ? AND p.lng BETWEEN ? AND ?${categoryFilter.sql}${subtypeFilter.sql}
            AND (
              p.owner_id = ? OR (
                SELECT COUNT(DISTINCT r.reporter_id)
                FROM mock_public_location_reports r
                WHERE r.location_id = p.id
              ) < ?
            )
          ORDER BY p.published_at DESC
          LIMIT ?`,
        bounds.minLat,
        bounds.maxLat,
        bounds.minLng,
        bounds.maxLng,
        ...categoryFilter.params,
        ...subtypeFilter.params,
        viewerId,
        REPORTS_TO_HIDE,
        MAX_PUBLIC_RESULTS,
      );
      const locations = rows.map((row) => toPublicLocation(row, viewerId));

      return success(locations);
    } catch (caught) {
      return mapUnknownError(caught);
    }
  }

  async report(
    id: string,
    reason: PublicReportReason,
    reporterId: string,
  ): Promise<PublicServiceResult<void>> {
    try {
      const simulatedError = await simulateOperation();
      if (simulatedError) {
        return { ok: false, error: simulatedError };
      }
      if (!reporterId.trim()) {
        return failure(PUBLIC_SERVICE_ERROR_CODES.NOT_AUTHORIZED);
      }
      if (!MAP_TEXTS.reportReasons.some((reportReason) => reportReason.key === reason)) {
        return failure(PUBLIC_SERVICE_ERROR_CODES.UNKNOWN);
      }

      await ensureSeedData();
      const database = await getLocationsDatabase();
      const existing = await database.getFirstAsync<{ owner_id: string }>(
        'SELECT owner_id FROM mock_public_locations WHERE id = ?',
        id,
      );
      if (!existing) {
        return failure(PUBLIC_SERVICE_ERROR_CODES.NOT_FOUND);
      }
      if (existing.owner_id === reporterId) {
        return failure(PUBLIC_SERVICE_ERROR_CODES.NOT_AUTHORIZED);
      }

      await database.runAsync(
        `INSERT INTO mock_public_location_reports
          (id, location_id, reporter_id, reason, created_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(location_id, reporter_id) DO NOTHING`,
        Crypto.randomUUID(),
        id,
        reporterId,
        reason,
        Date.now(),
      );
      return success(undefined);
    } catch (caught) {
      return mapUnknownError(caught);
    }
  }
}
