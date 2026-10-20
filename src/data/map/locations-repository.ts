import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import { getCategory, type MapCategoryKey } from './categories';
import { isValidBounds } from './coordinates';
import { getLocationsDatabase } from './database';
import {
  cleanupOrphanPhotos as removeOrphanPhotos,
  deletePhoto,
  deletePhotoAtUri,
  processPhoto,
} from './photos';
import { isValidSubtype } from './subtypes';
import type { MapSubtypeKey } from './subtypes';
import { sanitizeName, validateDraft, type DraftValidationError } from './validation';
import {
  LOCATION_STATUS,
  LOCATION_STATUSES,
  type Bounds,
  type LocationDraft,
  type LocationFilter,
  type LocationStatus,
  type MapLocation,
} from './types';

interface LocationRow {
  id: string;
  owner_id: string;
  name: string;
  category: string;
  subtypes: string;
  lat: number;
  lng: number;
  photo_local_uri: string | null;
  photo_path: string | null;
  status: string;
  last_sync_error: string | null;
  created_at: number;
  updated_at: number;
  published_at: number | null;
}

export type LocationChanges = Partial<
  Pick<LocationDraft, 'name' | 'category' | 'subtypes' | 'lat' | 'lng' | 'photoLocalUri'>
>;

export type CreateLocationResult =
  | { ok: true; location: MapLocation }
  | { ok: false; errors: DraftValidationError[] };

type LocationChangeListener = (ownerId: string) => void;

const listeners = new Set<LocationChangeListener>();

function notifyLocationsChanged(ownerId: string): void {
  for (const listener of listeners) {
    listener(ownerId);
  }
}

export function subscribeToLocationChanges(
  listener: LocationChangeListener,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function parseSubtypes(value: string, category: MapCategoryKey): MapSubtypeKey[] {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) {
    throw new Error('La lista de subtipos guardada no es válida.');
  }

  const subtypes = parsed.filter(
    (subtype): subtype is MapSubtypeKey =>
      typeof subtype === 'string' && isValidSubtype(category, subtype),
  );

  if (subtypes.length !== parsed.length) {
    throw new Error('La base local contiene subtipos desconocidos o incompatibles.');
  }

  return subtypes;
}

function toLocation(row: LocationRow): MapLocation {
  if (!getCategory(row.category)) {
    throw new Error(`La locación ${row.id} contiene una categoría desconocida.`);
  }

  if (!LOCATION_STATUSES.includes(row.status as LocationStatus)) {
    throw new Error(`La locación ${row.id} contiene un estado desconocido.`);
  }

  const category = row.category as MapCategoryKey;
  const location: MapLocation = {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    category,
    subtypes: parseSubtypes(row.subtypes, category),
    lat: row.lat,
    lng: row.lng,
    status: row.status as LocationStatus,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };

  if (row.photo_local_uri) {
    location.photoLocalUri = row.photo_local_uri;
  }
  if (row.photo_path) {
    location.photoPath = row.photo_path;
  }
  if (row.last_sync_error) {
    location.lastSyncError = row.last_sync_error;
  }
  if (row.published_at !== null) {
    location.publishedAt = new Date(row.published_at).toISOString();
  }

  return location;
}

async function selectById(
  database: SQLiteDatabase,
  id: string,
  ownerId: string,
): Promise<MapLocation | null> {
  const row = await database.getFirstAsync<LocationRow>(
    'SELECT * FROM locations WHERE id = ? AND owner_id = ?',
    id,
    ownerId,
  );

  return row ? toLocation(row) : null;
}

function createFilterSql(filter?: LocationFilter): {
  sql: string;
  params: string[];
} {
  if (!filter?.categories?.length) {
    return { sql: '', params: [] };
  }

  const placeholders = filter.categories.map(() => '?').join(', ');
  return {
    sql: ` AND category IN (${placeholders})`,
    params: filter.categories,
  };
}

function matchesSubtypeFilter(
  location: MapLocation,
  subtypeFilter: readonly MapSubtypeKey[] | undefined,
): boolean {
  return (
    !subtypeFilter?.length ||
    location.subtypes.some((subtype) => subtypeFilter.includes(subtype))
  );
}

function getUpdateStatus(status: LocationStatus): LocationStatus {
  return status === LOCATION_STATUS.PUBLISHED ? LOCATION_STATUS.PENDING : status;
}

function getCurrentTime(): number {
  return Date.now();
}

export class LocationsRepository {
  constructor(
    private readonly databaseProvider: () => Promise<SQLiteDatabase> = getLocationsDatabase,
  ) {}

  async create(draft: LocationDraft, ownerId: string): Promise<CreateLocationResult> {
    const errors = validateDraft(draft);
    if (errors.length > 0) {
      return { ok: false, errors };
    }
    if (!ownerId.trim()) {
      throw new Error('No se puede guardar una locación sin ownerId.');
    }

    const id = Crypto.randomUUID();
    const createdAt = getCurrentTime();
    const name = sanitizeName(draft.name);
    const category = draft.category;
    if (category === null) {
      throw new Error('La categoría debe ser válida después de la validación.');
    }

    const photoLocalUri = await processPhoto(draft.photoLocalUri!, id);
    try {
      const database = await this.databaseProvider();
      await database.runAsync(
        `INSERT INTO locations (
          id, owner_id, name, category, subtypes, lat, lng,
          photo_local_uri, photo_path, status, last_sync_error,
          created_at, updated_at, published_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, NULL, ?, ?, NULL)`,
        id,
        ownerId,
        name,
        category,
        JSON.stringify(draft.subtypes),
        draft.lat,
        draft.lng,
        photoLocalUri,
        LOCATION_STATUS.LOCAL,
        createdAt,
        createdAt,
      );
    } catch (error) {
      try {
        deletePhoto(id);
      } catch (cleanupError) {
        console.error('No se pudo limpiar la foto tras fallar el alta local.', cleanupError);
      }
      throw error;
    }

    const location: MapLocation = {
      id,
      ownerId,
      name,
      category,
      subtypes: [...draft.subtypes],
      lat: draft.lat,
      lng: draft.lng,
      photoLocalUri,
      status: LOCATION_STATUS.LOCAL,
      createdAt: new Date(createdAt).toISOString(),
      updatedAt: new Date(createdAt).toISOString(),
    };
    notifyLocationsChanged(ownerId);
    return { ok: true, location };
  }

  async update(
    id: string,
    ownerId: string,
    changes: LocationChanges,
  ): Promise<MapLocation | null> {
    const database = await this.databaseProvider();
    const existing = await selectById(database, id, ownerId);
    if (!existing) {
      return null;
    }

    const draft: LocationDraft = {
      name: changes.name ?? existing.name,
      category: changes.category === undefined ? existing.category : changes.category,
      subtypes: changes.subtypes ?? existing.subtypes,
      lat: changes.lat ?? existing.lat,
      lng: changes.lng ?? existing.lng,
      photoLocalUri: changes.photoLocalUri ?? existing.photoLocalUri,
    };
    const errors = validateDraft(draft);
    if (errors.length > 0) {
      throw new Error(`Los cambios no son válidos: ${errors.map((error) => error.message).join(' ')}`);
    }
    const category = draft.category;
    if (category === null) {
      throw new Error('La categoría debe ser válida después de la validación.');
    }

    const photoChanged =
      changes.photoLocalUri !== undefined &&
      changes.photoLocalUri !== existing.photoLocalUri;
    const newPhotoUri = photoChanged
      ? await processPhoto(changes.photoLocalUri!)
      : existing.photoLocalUri;
    const status = getUpdateStatus(existing.status);
    const updatedAt = getCurrentTime();

    try {
      await database.runAsync(
        `UPDATE locations SET
          name = ?, category = ?, subtypes = ?, lat = ?, lng = ?,
          photo_local_uri = ?, status = ?, photo_path = ?, last_sync_error = NULL,
          published_at = ?, updated_at = ?
        WHERE id = ? AND owner_id = ?`,
        sanitizeName(draft.name),
        category,
        JSON.stringify(draft.subtypes),
        draft.lat,
        draft.lng,
        newPhotoUri ?? null,
        status,
        status === LOCATION_STATUS.PENDING && existing.status === LOCATION_STATUS.PUBLISHED
          ? null
          : existing.photoPath ?? null,
        status === LOCATION_STATUS.PENDING && existing.status === LOCATION_STATUS.PUBLISHED
          ? null
          : existing.publishedAt
            ? Date.parse(existing.publishedAt)
            : null,
        updatedAt,
        id,
        ownerId,
      );
    } catch (error) {
      if (photoChanged) {
        try {
          deletePhotoAtUri(newPhotoUri);
        } catch (cleanupError) {
          console.error('No se pudo limpiar la nueva foto tras fallar la edición.', cleanupError);
        }
      }
      throw error;
    }
    notifyLocationsChanged(ownerId);

    if (photoChanged && existing.photoLocalUri) {
      try {
        deletePhotoAtUri(existing.photoLocalUri);
      } catch (error) {
        throw new Error(
          'La locación se actualizó, pero no se pudo limpiar su foto anterior.',
          { cause: error },
        );
      }
    }

    const updated = await selectById(database, id, ownerId);
    return updated;
  }

  async remove(id: string, ownerId: string): Promise<boolean> {
    const database = await this.databaseProvider();
    const existing = await selectById(database, id, ownerId);
    if (!existing) {
      return false;
    }

    await database.runAsync(
      'DELETE FROM locations WHERE id = ? AND owner_id = ?',
      id,
      ownerId,
    );
    notifyLocationsChanged(ownerId);
    if (existing.photoLocalUri) {
      try {
        deletePhotoAtUri(existing.photoLocalUri);
      } catch (error) {
        throw new Error(
          'La locación se borró, pero no se pudo limpiar su foto; la limpieza de huérfanas puede retirarla.',
          { cause: error },
        );
      }
    }
    return true;
  }

  async getById(id: string, ownerId: string): Promise<MapLocation | null> {
    return selectById(await this.databaseProvider(), id, ownerId);
  }

  async listByOwner(
    ownerId: string,
    filter?: LocationFilter,
  ): Promise<MapLocation[]> {
    const database = await this.databaseProvider();
    const filterSql = createFilterSql(filter);
    const rows = await database.getAllAsync<LocationRow>(
      `SELECT * FROM locations WHERE owner_id = ?${filterSql.sql}
        ORDER BY created_at DESC`,
      ownerId,
      ...filterSql.params,
    );
    return rows
      .map(toLocation)
      .filter((location) => matchesSubtypeFilter(location, filter?.subtypes));
  }

  async listInBounds(
    ownerId: string,
    bounds: Bounds,
    filter?: LocationFilter,
  ): Promise<MapLocation[]> {
    if (!isValidBounds(bounds)) {
      throw new RangeError('Los límites geográficos no son válidos.');
    }

    const database = await this.databaseProvider();
    const filterSql = createFilterSql(filter);
    const rows = await database.getAllAsync<LocationRow>(
      `SELECT * FROM locations
        WHERE owner_id = ? AND lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?${filterSql.sql}
        ORDER BY created_at DESC`,
      ownerId,
      bounds.minLat,
      bounds.maxLat,
      bounds.minLng,
      bounds.maxLng,
      ...filterSql.params,
    );
    return rows
      .map(toLocation)
      .filter((location) => matchesSubtypeFilter(location, filter?.subtypes));
  }

  async listPendingSync(ownerId: string): Promise<MapLocation[]> {
    const database = await this.databaseProvider();
    const rows = await database.getAllAsync<LocationRow>(
      `SELECT * FROM locations
        WHERE owner_id = ? AND status = ?
        ORDER BY created_at DESC`,
      ownerId,
      LOCATION_STATUS.PENDING,
    );
    return rows.map(toLocation);
  }

  async markPending(id: string, ownerId: string): Promise<MapLocation> {
    return this.transition(id, ownerId, [LOCATION_STATUS.LOCAL, LOCATION_STATUS.PENDING], {
      status: LOCATION_STATUS.PENDING,
      lastSyncError: null,
    });
  }

  async markPublished(
    id: string,
    ownerId: string,
    photoPath: string,
  ): Promise<MapLocation> {
    if (!photoPath.trim()) {
      throw new Error('Se requiere la ruta de la foto publicada.');
    }

    return this.transition(id, ownerId, [LOCATION_STATUS.PENDING], {
      status: LOCATION_STATUS.PUBLISHED,
      photoPath,
      publishedAt: getCurrentTime(),
      lastSyncError: null,
    });
  }

  async markLocalOnly(id: string, ownerId: string): Promise<MapLocation> {
    return this.transition(
      id,
      ownerId,
      [LOCATION_STATUS.LOCAL, LOCATION_STATUS.PENDING, LOCATION_STATUS.PUBLISHED],
      {
        status: LOCATION_STATUS.LOCAL,
        photoPath: null,
        publishedAt: null,
        lastSyncError: null,
      },
    );
  }

  async setSyncError(
    id: string,
    ownerId: string,
    message: string,
  ): Promise<MapLocation> {
    return this.transition(id, ownerId, [LOCATION_STATUS.PENDING], {
      status: LOCATION_STATUS.PENDING,
      lastSyncError: message,
    });
  }

  async cleanupOrphanPhotos(): Promise<number> {
    const database = await this.databaseProvider();
    const rows = await database.getAllAsync<{ photo_local_uri: string | null }>(
      'SELECT photo_local_uri FROM locations WHERE photo_local_uri IS NOT NULL',
    );
    return removeOrphanPhotos(
      rows.flatMap((row) => (row.photo_local_uri ? [row.photo_local_uri] : [])),
    );
  }

  private async transition(
    id: string,
    ownerId: string,
    allowedStatuses: readonly LocationStatus[],
    changes: {
      status: LocationStatus;
      photoPath?: string | null;
      publishedAt?: number | null;
      lastSyncError?: string | null;
    },
  ): Promise<MapLocation> {
    const database = await this.databaseProvider();
    const existing = await selectById(database, id, ownerId);
    if (!existing) {
      throw new Error('No se encontró la locación para cambiar su estado.');
    }
    if (!allowedStatuses.includes(existing.status)) {
      throw new Error(
        `No se permite pasar de "${existing.status}" al estado "${changes.status}".`,
      );
    }

    const updatedAt = getCurrentTime();
    await database.runAsync(
      `UPDATE locations SET
        status = ?, photo_path = ?, published_at = ?, last_sync_error = ?, updated_at = ?
      WHERE id = ? AND owner_id = ?`,
      changes.status,
      changes.photoPath === undefined ? existing.photoPath ?? null : changes.photoPath,
      changes.publishedAt === undefined
        ? existing.publishedAt
          ? Date.parse(existing.publishedAt)
          : null
        : changes.publishedAt,
      changes.lastSyncError === undefined
        ? existing.lastSyncError ?? null
        : changes.lastSyncError,
      updatedAt,
      id,
      ownerId,
    );

    const updated = await selectById(database, id, ownerId);
    if (!updated) {
      throw new Error('No se pudo leer la locación después de cambiar su estado.');
    }
    notifyLocationsChanged(ownerId);
    return updated;
  }
}

export const locationsRepository = new LocationsRepository();
