import { MAX_SUBTYPES, NAME_MAX_LENGTH, NAME_MIN_LENGTH } from './constants';
import { LOCATION_STATUS, VALIDATION_ERROR_CODES, type LocationStatus } from './types';

export const MAP_TEXTS = {
  statusLabels: {
    [LOCATION_STATUS.LOCAL]: 'Solo en este teléfono',
    [LOCATION_STATUS.PENDING]: 'Pendiente de publicación',
    [LOCATION_STATUS.PUBLISHED]: 'Publicado',
  } satisfies Record<LocationStatus, string>,
  validationErrors: {
    [VALIDATION_ERROR_CODES.NAME_REQUIRED]: 'Escribe el nombre del lugar.',
    [VALIDATION_ERROR_CODES.NAME_TOO_SHORT]: `El nombre debe tener al menos ${NAME_MIN_LENGTH} caracteres.`,
    [VALIDATION_ERROR_CODES.NAME_TOO_LONG]: `El nombre no puede tener más de ${NAME_MAX_LENGTH} caracteres.`,
    [VALIDATION_ERROR_CODES.CATEGORY_REQUIRED]: 'Selecciona una categoría.',
    [VALIDATION_ERROR_CODES.CATEGORY_INVALID]: 'La categoría seleccionada no es válida.',
    [VALIDATION_ERROR_CODES.TOO_MANY_SUBTYPES]: `Elige como máximo ${MAX_SUBTYPES} subtipos.`,
    [VALIDATION_ERROR_CODES.SUBTYPE_NOT_ALLOWED_FOR_CATEGORY]:
      'Uno o más subtipos no corresponden a esta categoría.',
    [VALIDATION_ERROR_CODES.COORDINATES_INVALID]:
      'La ubicación debe tener coordenadas válidas.',
    [VALIDATION_ERROR_CODES.PHOTO_REQUIRED]: 'Agrega una foto del lugar.',
  } satisfies Record<keyof typeof VALIDATION_ERROR_CODES, string>,
  emptyStates: {
    noLocalLocations: 'Aún no has registrado lugares',
    noPublicLocations: 'No hay lugares públicos en esta zona',
  },
  networkMessages: {
    offline: 'Sin conexión',
    publishRetry: 'No se pudo publicar, se reintentará',
  },
  publishErrors: {
    NO_CONNECTION: 'Sin conexión. El lugar quedó pendiente y se reintentará.',
    DAILY_LIMIT_REACHED: 'Alcanzaste el límite diario de publicaciones.',
    PHOTO_MISSING: 'No se encontró la foto necesaria para publicar el lugar.',
    NOT_AUTHORIZED: 'No tienes permiso para realizar esta acción.',
    NOT_FOUND: 'No se encontró el lugar público.',
    UNKNOWN: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
  },
  reportReasons: [
    { key: 'informacion_incorrecta', label: 'Información incorrecta' },
    { key: 'contenido_inapropiado', label: 'Contenido inapropiado' },
    { key: 'ubicacion_privada', label: 'Ubicación privada o sensible' },
    { key: 'duplicado', label: 'Lugar duplicado' },
    { key: 'otro', label: 'Otro motivo' },
  ] as const,
  publishPrivacyNotice:
    'Al publicar, la ubicación será visible para todas las personas usuarias. No publiques la dirección de una vivienda particular.',
} as const;
