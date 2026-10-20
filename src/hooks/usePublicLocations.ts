import { useUser } from '@clerk/expo';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Bounds, LocationFilter } from '@/data/map/types';
import {
  PUBLIC_SERVICE_ERROR_CODES,
  type PublicLocation,
  type PublicServiceError,
} from '@/data/map/public-locations-service';
import { getPublicLocationsService } from '@/data/map/public-locations-service-selector';
import { MAP_TEXTS } from '@/data/map/texts';

const FETCH_DEBOUNCE_MS = 350;

export interface PublicLocationsState {
  loading: boolean;
  error: PublicServiceError | null;
  data: PublicLocation[];
  refresh: () => void;
}

export function usePublicLocations(
  bounds: Bounds,
  filter: LocationFilter,
): PublicLocationsState {
  const { isLoaded, user } = useUser();
  const viewerId = user?.id;
  const boundsKey = `${bounds.minLat},${bounds.minLng},${bounds.maxLat},${bounds.maxLng}`;
  const filterKey = JSON.stringify(filter);
  const stableBounds = useMemo(
    () => JSON.parse(boundsKey) as Bounds,
    [boundsKey],
  );
  const stableFilter = useMemo(
    () => JSON.parse(filterKey) as LocationFilter,
    [filterKey],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PublicServiceError | null>(null);
  const [data, setData] = useState<PublicLocation[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const requestId = useRef(0);

  const refresh = useCallback(() => {
    setRefreshKey((previous) => previous + 1);
  }, []);

  useEffect(() => {
    const currentRequestId = ++requestId.current;
    let isActive = true;

    const timeoutId = setTimeout(() => {
      setLoading(true);
      setError(null);
      if (!isLoaded) {
        return;
      }
      if (!viewerId) {
        setLoading(false);
        setError({
          code: PUBLIC_SERVICE_ERROR_CODES.NOT_AUTHORIZED,
          message: MAP_TEXTS.publishErrors.NOT_AUTHORIZED,
        });
        return;
      }

      void Promise.resolve()
        .then(() =>
          getPublicLocationsService().fetchPublic(stableBounds, stableFilter, viewerId),
        )
        .then((result) => {
          if (!isActive || requestId.current !== currentRequestId) {
            return;
          }
          if (result.ok) {
            setData(result.data);
            setError(null);
          } else {
            setError(result.error);
          }
        })
        .catch((caught: unknown) => {
          if (!isActive || requestId.current !== currentRequestId) {
            return;
          }
          console.error('No se pudieron cargar los lugares públicos del mapa.', caught);
          setError({
            code: PUBLIC_SERVICE_ERROR_CODES.UNKNOWN,
            message: MAP_TEXTS.publishErrors.UNKNOWN,
          });
        })
        .finally(() => {
          if (isActive && requestId.current === currentRequestId) {
            setLoading(false);
          }
        });
    }, FETCH_DEBOUNCE_MS);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [isLoaded, viewerId, stableBounds, stableFilter, refreshKey]);

  return { loading, error, data, refresh };
}
