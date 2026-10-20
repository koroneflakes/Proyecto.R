import * as Crypto from 'expo-crypto';

import { DAILY_PUBLISH_LIMIT } from './constants';
import { MAP_CATEGORY_KEYS } from './categories';
import { MAP_SUBTYPE_KEYS } from './subtypes';
import { getLocationsDatabase } from './database';
import { MOCK_CENTER, MOCK_PUBLIC_SERVICE_FLAGS, setMockPublicServiceFlags } from './mock-public-constants';
import { getPublicLocationsService } from './public-locations-service-selector';
import {
  publishLocation,
  syncPending,
  unpublishLocation,
} from './publish-orchestrator';
import { createOfflineTestPhoto } from './self-test';
import { locationsRepository } from './locations-repository';
import { LOCATION_STATUS, type LocationDraft, type LocationFilter, type MapLocation } from './types';
import { PUBLIC_SERVICE_ERROR_CODES } from './public-locations-service';
import { MAP_TEXTS } from './texts';

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Autotest de publicación del mapa: ${message}`);
  }
}

async function createTestLocation(ownerId: string, name: string) {
  const photo = createOfflineTestPhoto();
  try {
    const draft: LocationDraft = {
      name,
      category: MAP_CATEGORY_KEYS.MERCADO,
      subtypes: [MAP_SUBTYPE_KEYS.ELECTRONICOS],
      lat: MOCK_CENTER.lat,
      lng: MOCK_CENTER.lng,
      photoLocalUri: photo.uri,
    };
    const result = await locationsRepository.create(draft, ownerId);
    if (!result.ok) {
      throw new Error(result.errors.map((error) => error.message).join(' '));
    }
    return result.location;
  } finally {
    if (photo.exists) {
      photo.delete();
    }
  }
}

export async function runPublishLayerSelfTest(ownerId: string): Promise<void> {
  if (!ownerId.trim()) {
    throw new Error('El autotest requiere el identificador de usuario de Clerk.');
  }

  const originalFlags = { ...MOCK_PUBLIC_SERVICE_FLAGS };
  const testOwnerId = `${ownerId}-publish-test-${Crypto.randomUUID()}`;
  const offlineOwnerId = `${testOwnerId}-offline`;
  const locations: MapLocation[] = [];
  const connectionAvailable = async () => true;

  try {
    setMockPublicServiceFlags({
      simulateLatency: false,
      offline: false,
      forceDailyLimit: false,
      failureProbability: 0,
    });

    for (let index = 0; index < DAILY_PUBLISH_LIMIT + 1; index += 1) {
      locations.push(await createTestLocation(testOwnerId, `Lugar de prueba ${index + 1}`));
    }

    for (const location of locations.slice(0, DAILY_PUBLISH_LIMIT)) {
      const result = await publishLocation(location.id, testOwnerId, connectionAvailable);
      assert(result.ok, `no se publicó ${location.name}.`);
      assert(
        (await locationsRepository.getById(location.id, testOwnerId))?.status ===
          LOCATION_STATUS.PUBLISHED,
        'el estado local no cambió a published.',
      );
    }

    const limitResult = await publishLocation(
      locations[DAILY_PUBLISH_LIMIT].id,
      testOwnerId,
      connectionAvailable,
    );
    assert(
      !limitResult.ok &&
        limitResult.error.code === PUBLIC_SERVICE_ERROR_CODES.DAILY_LIMIT_REACHED,
      'no se rechazó la publicación que supera el límite diario.',
    );
    assert(
      (await locationsRepository.getById(
        locations[DAILY_PUBLISH_LIMIT].id,
        testOwnerId,
      ))?.status === LOCATION_STATUS.PENDING,
      'el lugar que alcanzó el límite no quedó pendiente.',
    );

    const service = getPublicLocationsService();
    const bounds = {
      minLat: MOCK_CENTER.lat - 0.001,
      minLng: MOCK_CENTER.lng - 0.001,
      maxLat: MOCK_CENTER.lat + 0.001,
      maxLng: MOCK_CENTER.lng + 0.001,
    };
    const publicFilter: LocationFilter = {
      categories: [MAP_CATEGORY_KEYS.MERCADO],
      subtypes: [MAP_SUBTYPE_KEYS.ELECTRONICOS],
    };
    const publicLocations = await service.fetchPublic(
      bounds,
      publicFilter,
      `${testOwnerId}-viewer`,
    );
    assert(
      publicLocations.ok &&
        publicLocations.data.some((location) => location.id === locations[0].id),
      'no apareció en la consulta pública o falló el filtro de categoría/subtipo.',
    );

    const upsertResult = await service.publish(locations[0]);
    assert(upsertResult.ok, 'el upsert de una locación publicada falló.');
    const database = await getLocationsDatabase();
    const publishEvents = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM mock_public_publish_events WHERE owner_id = ?',
      testOwnerId,
    );
    assert(
      publishEvents?.count === DAILY_PUBLISH_LIMIT,
      'el upsert se contó como una publicación nueva.',
    );

    for (let index = 0; index < 3; index += 1) {
      const reportResult = await service.report(
        locations[0].id,
        MAP_TEXTS.reportReasons[0].key,
        `${testOwnerId}-reporter-${index}`,
      );
      assert(reportResult.ok, `no se guardó el reporte número ${index + 1}.`);
    }

    const hiddenForOthers = await service.fetchPublic(
      bounds,
      publicFilter,
      `${testOwnerId}-viewer`,
    );
    assert(
      hiddenForOthers.ok &&
        !hiddenForOthers.data.some((location) => location.id === locations[0].id),
      'tres reportes no ocultaron el lugar para otros usuarios.',
    );
    const visibleToOwner = await service.fetchPublic(bounds, publicFilter, testOwnerId);
    assert(
      visibleToOwner.ok &&
        visibleToOwner.data.some(
          (location) => location.id === locations[0].id && location.isOwn,
        ),
      'los reportes ocultaron el lugar para su propietario.',
    );

    const subtypeFiltered = await service.fetchPublic(
      bounds,
      {
        categories: [MAP_CATEGORY_KEYS.MERCADO],
        subtypes: [MAP_SUBTYPE_KEYS.VARIADO],
      },
      `${testOwnerId}-viewer`,
    );
    assert(
      subtypeFiltered.ok && subtypeFiltered.data.length === 0,
      'el filtro por subtipo devolvió lugares incompatibles.',
    );

    const unpublishResult = await unpublishLocation(
      locations[1].id,
      testOwnerId,
      connectionAvailable,
    );
    assert(unpublishResult.ok, 'no se pudo despublicar el lugar.');
    assert(
      (await locationsRepository.getById(locations[1].id, testOwnerId))?.status ===
        LOCATION_STATUS.LOCAL,
      'la locación despublicada no volvió al estado local.',
    );

    const offlineLocation = await createTestLocation(
      offlineOwnerId,
      'Lugar para reintentar publicación',
    );
    locations.push(offlineLocation);
    setMockPublicServiceFlags({ offline: true });
    const offlineResult = await publishLocation(
      offlineLocation.id,
      offlineOwnerId,
      connectionAvailable,
    );
    assert(
      !offlineResult.ok &&
        offlineResult.error.code === PUBLIC_SERVICE_ERROR_CODES.NO_CONNECTION,
      'el servicio no devolvió NO_CONNECTION.',
    );
    assert(
      (await locationsRepository.getById(offlineLocation.id, offlineOwnerId))?.status ===
        LOCATION_STATUS.PENDING,
      'una publicación sin conexión no quedó pendiente.',
    );

    setMockPublicServiceFlags({ offline: false });
    const syncResult = await syncPending(offlineOwnerId, connectionAvailable);
    assert(
      syncResult.attempted === 1 && syncResult.failures.length === 0,
      'el reintento no procesó correctamente la locación pendiente.',
    );
    assert(
      (await locationsRepository.getById(offlineLocation.id, offlineOwnerId))?.status ===
        LOCATION_STATUS.PUBLISHED,
      'el reintento no publicó la locación.',
    );
  } finally {
    setMockPublicServiceFlags(originalFlags);
    const database = await getLocationsDatabase();
    for (const location of locations) {
      await locationsRepository.remove(
        location.id,
        location.ownerId === offlineOwnerId ? offlineOwnerId : testOwnerId,
      );
      await database.runAsync(
        'DELETE FROM mock_public_location_reports WHERE location_id = ?',
        location.id,
      );
      await database.runAsync('DELETE FROM mock_public_locations WHERE id = ?', location.id);
    }
    await database.runAsync(
      'DELETE FROM mock_public_publish_events WHERE owner_id IN (?, ?)',
      testOwnerId,
      offlineOwnerId,
    );
  }
}
