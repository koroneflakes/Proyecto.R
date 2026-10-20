import type { PublicLocationsService } from './public-locations-service';
import { MockPublicLocationsService } from './mock-public-locations-service';

const mockService = new MockPublicLocationsService();

export function getPublicLocationsService(): PublicLocationsService {
  const backend = process.env.EXPO_PUBLIC_MAP_BACKEND ?? 'mock';

  if (backend === 'mock') {
    return mockService;
  }
  if (backend === 'supabase') {
    throw new Error('El backend real aún no está implementado');
  }

  throw new Error(`Backend de mapa desconocido: "${backend}". Usa "mock".`);
}
