import { Image } from 'react-native';
import * as Crypto from 'expo-crypto';
import { File, Paths } from 'expo-file-system';

import { PHOTO_MAX_SIDE_PX, PHOTO_TARGET_MAX_BYTES } from './constants';
import { LOCATION_STATUS } from './types';
import { getPhotoFile } from './photos';
import { locationsRepository } from './locations-repository';
import { MAP_CATEGORY_KEYS } from './categories';
import type { LocationDraft } from './types';

const SELF_TEST_JPEG_BASE64 =
  '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAEAAQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD6Looor8CP3s//2Q==';

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Autotest del almacenamiento local: ${message}`);
  }
}

export function createOfflineTestPhoto(): File {
  const photo = new File(Paths.cache, `map-self-test-${Crypto.randomUUID()}.jpg`);
  try {
    photo.create();
    photo.write(SELF_TEST_JPEG_BASE64, { encoding: 'base64' });
    return photo;
  } catch (error) {
    if (photo.exists) {
      photo.delete();
    }
    throw error;
  }
}

export async function runLocalStorageSelfTest(ownerId: string): Promise<void> {
  if (!ownerId.trim()) {
    throw new Error('El autotest requiere el identificador de usuario de Clerk.');
  }

  const testOwnerId = `${ownerId}-map-test-${Crypto.randomUUID()}`;
  const otherOwnerId = `${testOwnerId}-other`;
  let locationId: string | undefined;
  let photoUri: string | undefined;
  let testPhoto: File | undefined;

  try {
    testPhoto = createOfflineTestPhoto();
    const draft: LocationDraft = {
      name: 'Taller de prueba local',
      category: MAP_CATEGORY_KEYS.MERCADO,
      subtypes: ['electronicos'],
      lat: 32.5,
      lng: -116.9,
      photoLocalUri: testPhoto.uri,
    };
    const created = await locationsRepository.create(draft, testOwnerId);
    assert(created.ok, 'no se pudo crear la locación con la foto de prueba.');
    assert(created.location.status === LOCATION_STATUS.LOCAL, 'no se creó en estado local.');
    locationId = created.location.id;
    photoUri = created.location.photoLocalUri;
    assert(Boolean(photoUri), 'no se guardó la URI de la foto.');
    const photoFile = getPhotoFile(photoUri!);
    assert(photoFile.exists, 'no existe el archivo de foto procesado.');
    assert(
      photoFile.size <= PHOTO_TARGET_MAX_BYTES,
      'la foto procesada supera el tamaño máximo.',
    );
    const processedImage = await Image.getSize(photoUri!);
    assert(
      Math.max(processedImage.width, processedImage.height) <= PHOTO_MAX_SIDE_PX,
      'la foto procesada supera el lado máximo.',
    );

    const ownerLocations = await locationsRepository.listByOwner(testOwnerId);
    assert(ownerLocations.length === 1, 'la lista no devolvió la locación creada.');
    assert(
      (await locationsRepository.listByOwner(otherOwnerId)).length === 0,
      'una cuenta distinta pudo ver la locación.',
    );
    assert(
      (await locationsRepository.listByOwner(testOwnerId, {
        categories: [MAP_CATEGORY_KEYS.MERCADO],
        subtypes: ['electronicos'],
      })).length === 1,
      'el filtro por categoría y subtipo no encontró la locación.',
    );
    assert(
      (await locationsRepository.listByOwner(testOwnerId, {
        categories: [],
        subtypes: [],
      })).length === 1,
      'los filtros vacíos deberían devolver todas las locaciones.',
    );
    assert(
      (await locationsRepository.listInBounds(testOwnerId, {
        minLat: 32,
        minLng: -117,
        maxLat: 33,
        maxLng: -116,
      })).length === 1,
      'la consulta por límites no encontró la locación.',
    );

    const updated = await locationsRepository.update(locationId, testOwnerId, {
      name: 'Taller de prueba editado',
    });
    assert(updated?.name === 'Taller de prueba editado', 'no se aplicó la edición.');

    assert(
      (await locationsRepository.markPending(locationId, testOwnerId)).status ===
        LOCATION_STATUS.PENDING,
      'no se marcó como pendiente.',
    );
    assert(
      (await locationsRepository.listPendingSync(testOwnerId)).length === 1,
      'la lista de sincronización pendiente es incorrecta.',
    );
    assert(
      (await locationsRepository.markPublished(
        locationId,
        testOwnerId,
        'test/photo.jpg',
      )).status === LOCATION_STATUS.PUBLISHED,
      'no se marcó como publicada.',
    );
    assert(
      (await locationsRepository.update(locationId, testOwnerId, {
        name: 'Taller editado para resincronizar',
      }))?.status === LOCATION_STATUS.PENDING,
      'editar una locación publicada no la devolvió a pendiente.',
    );
    await locationsRepository.setSyncError(locationId, testOwnerId, 'Error de prueba');
    assert(
      (await locationsRepository.getById(locationId, testOwnerId))?.lastSyncError ===
        'Error de prueba',
      'no se guardó el error de sincronización.',
    );
    assert(
      (await locationsRepository.markLocalOnly(locationId, testOwnerId)).status ===
        LOCATION_STATUS.LOCAL,
      'no se pudo devolver la locación al estado local.',
    );

    let invalidTransitionRejected = false;
    try {
      await locationsRepository.markPublished(locationId, testOwnerId, 'test/photo.jpg');
    } catch {
      invalidTransitionRejected = true;
    }
    assert(invalidTransitionRejected, 'se aceptó una transición de estado inválida.');

    assert(await locationsRepository.remove(locationId, testOwnerId), 'no se borró la fila.');
    assert(
      (await locationsRepository.getById(locationId, testOwnerId)) === null,
      'la fila sigue existiendo después de borrarla.',
    );
    assert(!getPhotoFile(photoUri!).exists, 'la foto sigue existiendo después de borrar.');
    locationId = undefined;
    photoUri = undefined;
  } finally {
    if (locationId) {
      await locationsRepository.remove(locationId, testOwnerId);
    }
    if (photoUri && getPhotoFile(photoUri).exists) {
      getPhotoFile(photoUri).delete();
    }
    if (testPhoto?.exists) {
      testPhoto.delete();
    }
  }
}
