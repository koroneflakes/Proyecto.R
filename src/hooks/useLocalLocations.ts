import { useUser } from '@clerk/expo';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { LocationFilter, MapLocation } from '@/data/map/types';
import { activatePendingSync } from '@/data/map/publish-orchestrator';
import {
  locationsRepository,
  subscribeToLocationChanges,
} from '@/data/map/locations-repository';

export interface LocalLocationsState {
  locations: MapLocation[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useLocalLocations(filter?: LocationFilter): LocalLocationsState {
  const { isLoaded, user } = useUser();
  const ownerId = user?.id;
  const filterSignature = JSON.stringify(filter ?? null);
  const stableFilter = useMemo(
    () => (filterSignature === 'null' ? undefined : JSON.parse(filterSignature) as LocationFilter),
    [filterSignature],
  );
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isLoaded || !ownerId) {
      return;
    }
    return activatePendingSync(ownerId);
  }, [isLoaded, ownerId]);

  const refresh = useCallback(async () => {
    if (!isLoaded) {
      return;
    }
    if (!ownerId) {
      setLocations([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    try {
      setLocations(await locationsRepository.listByOwner(ownerId, stableFilter));
      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError
          : new Error('No se pudieron cargar las locaciones locales.'),
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, ownerId, stableFilter]);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (!isLoaded) {
        return;
      }
      if (!ownerId) {
        setLocations([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      try {
        const result = await locationsRepository.listByOwner(ownerId, stableFilter);
        if (isActive) {
          setLocations(result);
          setError(null);
        }
      } catch (caughtError) {
        if (isActive) {
          setError(
            caughtError instanceof Error
              ? caughtError
              : new Error('No se pudieron cargar las locaciones locales.'),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    const unsubscribe = subscribeToLocationChanges((changedOwnerId) => {
      if (changedOwnerId === ownerId) {
        void load();
      }
    });

    void load();
    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [isLoaded, ownerId, stableFilter]);

  return { locations, isLoading, error, refresh };
}
