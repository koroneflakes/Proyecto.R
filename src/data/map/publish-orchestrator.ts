import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

import { locationsRepository } from './locations-repository';
import { LOCATION_STATUS } from './types';
import { getPublicLocationsService } from './public-locations-service-selector';
import {
  PUBLIC_SERVICE_ERROR_CODES,
  type PublicServiceError,
  type PublicServiceResult,
} from './public-locations-service';
import { MAP_TEXTS } from './texts';

export type ConnectionCheck = () => Promise<boolean>;

function isConnected(state: NetInfoState): boolean {
  return state.isConnected === true && state.isInternetReachable !== false;
}

function getUnknownError(): PublicServiceError {
  return {
    code: PUBLIC_SERVICE_ERROR_CODES.UNKNOWN,
    message: MAP_TEXTS.publishErrors.UNKNOWN,
  };
}

async function hasConnection(): Promise<boolean> {
  return isConnected(await NetInfo.fetch());
}

async function setPendingError(
  id: string,
  ownerId: string,
  error: PublicServiceError,
): Promise<void> {
  const location = await locationsRepository.getById(id, ownerId);
  if (!location) {
    throw new Error('No se encontró la locación para registrar el error de publicación.');
  }
  if (location.status !== LOCATION_STATUS.PENDING) {
    await locationsRepository.markPending(id, ownerId);
  }
  await locationsRepository.setSyncError(id, ownerId, error.code);
}

export async function publishLocation(
  id: string,
  ownerId: string,
  connectionCheck: ConnectionCheck = hasConnection,
): Promise<PublicServiceResult<void>> {
  try {
    const location = await locationsRepository.getById(id, ownerId);
    if (!location) {
      return {
        ok: false,
        error: {
          code: PUBLIC_SERVICE_ERROR_CODES.NOT_FOUND,
          message: MAP_TEXTS.publishErrors.NOT_FOUND,
        },
      };
    }

    if (location.status !== LOCATION_STATUS.PENDING) {
      await locationsRepository.markPending(id, ownerId);
    }

    const connected = await connectionCheck();
    if (!connected) {
      const error: PublicServiceError = {
        code: PUBLIC_SERVICE_ERROR_CODES.NO_CONNECTION,
        message: MAP_TEXTS.publishErrors.NO_CONNECTION,
      };
      await locationsRepository.setSyncError(id, ownerId, error.code);
      return { ok: false, error };
    }

    const result = await getPublicLocationsService().publish({
      ...location,
      status: LOCATION_STATUS.PENDING,
    });
    if (!result.ok) {
      await locationsRepository.setSyncError(id, ownerId, result.error.code);
      return result;
    }

    try {
      await locationsRepository.markPublished(id, ownerId, result.data.photoUrl);
      return { ok: true, data: undefined };
    } catch (localError) {
      const rollback = await getPublicLocationsService().unpublish(id, ownerId);
      const error: PublicServiceError = rollback.ok ? getUnknownError() : rollback.error;
      await setPendingError(id, ownerId, error);
      console.error('Se revirtió la publicación por un error al actualizar SQLite.', localError);
      return { ok: false, error };
    }
  } catch (caught) {
    console.error('No se pudo completar la publicación local del mapa.', caught);
    const error = getUnknownError();
    try {
      await setPendingError(id, ownerId, error);
    } catch (stateError) {
      console.error('No se pudo dejar pendiente la locación tras el error.', stateError);
    }
    return { ok: false, error };
  }
}

export async function unpublishLocation(
  id: string,
  ownerId: string,
  connectionCheck: ConnectionCheck = hasConnection,
): Promise<PublicServiceResult<void>> {
  try {
    const location = await locationsRepository.getById(id, ownerId);
    if (!location) {
      return {
        ok: false,
        error: {
          code: PUBLIC_SERVICE_ERROR_CODES.NOT_FOUND,
          message: MAP_TEXTS.publishErrors.NOT_FOUND,
        },
      };
    }
    if (location.status === LOCATION_STATUS.LOCAL) {
      return { ok: true, data: undefined };
    }
    if (!(await connectionCheck())) {
      return {
        ok: false,
        error: {
          code: PUBLIC_SERVICE_ERROR_CODES.NO_CONNECTION,
          message: MAP_TEXTS.networkMessages.offline,
        },
      };
    }

    const service = getPublicLocationsService();
    const result = await service.unpublish(id, ownerId);
    if (!result.ok && result.error.code !== PUBLIC_SERVICE_ERROR_CODES.NOT_FOUND) {
      return result;
    }

    try {
      await locationsRepository.markLocalOnly(id, ownerId);
      return { ok: true, data: undefined };
    } catch (localError) {
      const rollback = await service.publish(location);
      console.error('No se pudo completar el cambio local tras retirar la publicación.', localError);
      return rollback.ok ? { ok: false, error: getUnknownError() } : rollback;
    }
  } catch (caught) {
    console.error('No se pudo completar la despublicación del mapa.', caught);
    return { ok: false, error: getUnknownError() };
  }
}

export interface PendingSyncResult {
  attempted: number;
  failures: { id: string; error: PublicServiceError }[];
}

export async function syncPending(
  ownerId: string,
  connectionCheck: ConnectionCheck = hasConnection,
): Promise<PendingSyncResult> {
  const pendingLocations = await locationsRepository.listPendingSync(ownerId);
  const result: PendingSyncResult = { attempted: 0, failures: [] };

  for (const location of pendingLocations) {
    result.attempted += 1;
    const publishResult = await publishLocation(location.id, ownerId, connectionCheck);
    if (!publishResult.ok) {
      result.failures.push({ id: location.id, error: publishResult.error });
    }
  }

  return result;
}

export function activatePendingSync(ownerId: string): () => void {
  if (!ownerId.trim()) {
    throw new Error('Se requiere el usuario actual para activar la sincronización.');
  }

  let syncInProgress = false;
  let syncRequestedAgain = false;
  let isActive = true;
  const runSync = async () => {
    if (!isActive) {
      return;
    }
    if (syncInProgress) {
      syncRequestedAgain = true;
      return;
    }
    syncInProgress = true;
    try {
      do {
        syncRequestedAgain = false;
        await syncPending(ownerId);
      } while (isActive && syncRequestedAgain);
    } catch (error) {
      console.error('No se pudieron sincronizar las locaciones pendientes.', error);
    } finally {
      syncInProgress = false;
    }
  };

  void hasConnection()
    .then((connected) => {
      if (isActive && connected) {
        void runSync();
      }
    })
    .catch((error: unknown) => {
      console.error('No se pudo revisar la conexión al iniciar la sincronización.', error);
    });

  const subscription = NetInfo.addEventListener((state) => {
    if (isActive && isConnected(state)) {
      void runSync();
    }
  });

  return () => {
    isActive = false;
    subscription();
  };
}
