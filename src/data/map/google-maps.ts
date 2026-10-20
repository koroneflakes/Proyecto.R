import * as Linking from 'expo-linking';
import { isValidCoordinate } from './coordinates';

function formatCoordinate(value: number): string {
  return Number(value.toFixed(6)).toString();
}

export function buildGoogleMapsUrl(lat: number, lng: number): string {
  if (!isValidCoordinate(lat, lng)) {
    throw new RangeError('Las coordenadas deben ser válidas para crear el enlace.');
  }

  return `https://www.google.com/maps/search/?api=1&query=${formatCoordinate(lat)},${formatCoordinate(lng)}`;
}

export async function openInGoogleMaps(lat: number, lng: number): Promise<boolean> {
  if (!isValidCoordinate(lat, lng)) {
    return false;
  }

  try {
    await Linking.openURL(buildGoogleMapsUrl(lat, lng));
    return true;
  } catch {
    return false;
  }
}
