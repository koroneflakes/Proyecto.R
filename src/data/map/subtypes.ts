import { MAP_CATEGORY_KEYS, type MapCategoryKey } from './categories';
import type { MapLocation } from './types';

export const MAP_SUBTYPE_KEYS = {
  ELECTRONICOS: 'electronicos',
  BISUTERIA: 'bisuteria',
  MECANICOS: 'mecanicos',
  INGREDIENTES: 'ingredientes',
  TELAS: 'telas',
  HERRAMIENTAS: 'herramientas',
  CUERO: 'cuero',
  BARRO: 'barro',
  MADERA: 'madera',
  PINTURAS: 'pinturas',
  VARIADO: 'variado',
} as const;

function createSubtype<const Key extends string>(
  categoryKey: MapCategoryKey,
  key: Key,
  label: string,
  glyphBrief: string,
): {
  key: Key;
  label: string;
  categoryKey: MapCategoryKey;
  glyphKey: `glyph_${Key}`;
  glyphBrief: string;
} {
  return {
    key,
    label,
    categoryKey,
    glyphKey: `glyph_${key}`,
    glyphBrief,
  };
}

export const MAP_SUBTYPES = [
  createSubtype(
    MAP_CATEGORY_KEYS.MERCADO,
    MAP_SUBTYPE_KEYS.ELECTRONICOS,
    'Electrónicos',
    'Dibuja una pequeña placa con pistas y puntos de conexión, en códice mesoamericano de tinta y relleno plano.',
  ),
  createSubtype(
    MAP_CATEGORY_KEYS.MERCADO,
    MAP_SUBTYPE_KEYS.BISUTERIA,
    'Bisutería',
    'Dibuja un collar de cuentas grandes y geométricas, en códice mesoamericano de tinta y relleno plano.',
  ),
  createSubtype(
    MAP_CATEGORY_KEYS.MERCADO,
    MAP_SUBTYPE_KEYS.MECANICOS,
    'Mecánicos',
    'Dibuja un engranaje sencillo con centro marcado, en códice mesoamericano de tinta y relleno plano.',
  ),
  createSubtype(
    MAP_CATEGORY_KEYS.MERCADO,
    MAP_SUBTYPE_KEYS.INGREDIENTES,
    'Ingredientes',
    'Dibuja un cuenco con hojas y semillas visibles, en códice mesoamericano de tinta y relleno plano.',
  ),
  createSubtype(
    MAP_CATEGORY_KEYS.MERCADO,
    MAP_SUBTYPE_KEYS.TELAS,
    'Telas',
    'Dibuja un rollo de tela con una trama geométrica, en códice mesoamericano de tinta y relleno plano.',
  ),
  createSubtype(
    MAP_CATEGORY_KEYS.MERCADO,
    MAP_SUBTYPE_KEYS.HERRAMIENTAS,
    'Herramientas',
    'Dibuja un martillo y una llave cruzados, en códice mesoamericano de tinta y relleno plano.',
  ),
  createSubtype(
    MAP_CATEGORY_KEYS.MERCADO,
    MAP_SUBTYPE_KEYS.CUERO,
    'Cuero',
    'Dibuja una pieza de cuero con un borde perforado, en códice mesoamericano de tinta y relleno plano.',
  ),
  createSubtype(
    MAP_CATEGORY_KEYS.MERCADO,
    MAP_SUBTYPE_KEYS.BARRO,
    'Barro',
    'Dibuja una vasija de barro de silueta simple, en códice mesoamericano de tinta y relleno plano.',
  ),
  createSubtype(
    MAP_CATEGORY_KEYS.MERCADO,
    MAP_SUBTYPE_KEYS.MADERA,
    'Madera',
    'Dibuja dos tablones con vetas visibles, en códice mesoamericano de tinta y relleno plano.',
  ),
  createSubtype(
    MAP_CATEGORY_KEYS.MERCADO,
    MAP_SUBTYPE_KEYS.PINTURAS,
    'Pinturas',
    'Dibuja un recipiente de pintura con una brocha, en códice mesoamericano de tinta y relleno plano.',
  ),
  createSubtype(
    MAP_CATEGORY_KEYS.MERCADO,
    MAP_SUBTYPE_KEYS.VARIADO,
    'Variado',
    'Dibuja tres objetos artesanales distintos agrupados, en códice mesoamericano de tinta y relleno plano.',
  ),
] as const satisfies readonly MapSubtype[];

export type MapSubtype = {
  key: string;
  label: string;
  categoryKey: MapCategoryKey;
  glyphKey: `glyph_${string}`;
  glyphBrief: string;
};

export type MapSubtypeKey =
  (typeof MAP_SUBTYPE_KEYS)[keyof typeof MAP_SUBTYPE_KEYS];

export function getSubtypesFor(categoryKey: string): readonly MapSubtype[] {
  return MAP_SUBTYPES.filter((subtype) => subtype.categoryKey === categoryKey);
}

export function isValidSubtype(categoryKey: string, subtypeKey: string): boolean {
  return MAP_SUBTYPES.some(
    (subtype) => subtype.categoryKey === categoryKey && subtype.key === subtypeKey,
  );
}

export function getPrimaryGlyphKey(
  location: Pick<MapLocation, 'category' | 'subtypes'>,
): MapSubtype['glyphKey'] | null {
  const primarySubtype = location.subtypes[0];

  if (!primarySubtype || !isValidSubtype(location.category, primarySubtype)) {
    return null;
  }

  return MAP_SUBTYPES.find((subtype) => subtype.key === primarySubtype)?.glyphKey ?? null;
}
