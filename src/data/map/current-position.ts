import * as Location from 'expo-location';

export type CurrentPositionResult =
  | { status: 'granted'; lat: number; lng: number }
  | { status: 'denied' }
  | { status: 'unavailable'; error: Error };

export async function getCurrentPosition(): Promise<CurrentPositionResult> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      return { status: 'denied' };
    }

    if (!(await Location.hasServicesEnabledAsync())) {
      return {
        status: 'unavailable',
        error: new Error('Los servicios de ubicación están desactivados.'),
      };
    }

    const position = await Location.getCurrentPositionAsync();
    return {
      status: 'granted',
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
  } catch (error) {
    return {
      status: 'unavailable',
      error: error instanceof Error ? error : new Error('No se pudo obtener la ubicación.'),
    };
  }
}
