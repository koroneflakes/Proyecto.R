import type { MapColorToken } from './colors';

export const MAP_CATEGORY_KEYS = {
  TALLER: 'taller',
  MERCADO: 'mercado',
  RECOLECCION: 'recoleccion',
  OTRO: 'otro',
} as const;

export const MAP_CATEGORIES = [
  {
    key: MAP_CATEGORY_KEYS.TALLER,
    label: 'Taller',
    colorToken: 'ladrillo',
    description: 'Espacio para crear, reparar o mejorar objetos.',
  },
  {
    key: MAP_CATEGORY_KEYS.MERCADO,
    label: 'Mercado',
    colorToken: 'ocre',
    description: 'Lugar donde encontrar herramientas, materiales o productos.',
  },
  {
    key: MAP_CATEGORY_KEYS.RECOLECCION,
    label: 'Recolección',
    colorToken: 'vegetacion',
    description: 'Punto para recuperar o conseguir materiales útiles.',
  },
  {
    key: MAP_CATEGORY_KEYS.OTRO,
    label: 'Otro lugar',
    colorToken: 'malva',
    description: 'Un lugar útil para la comunidad artesanal.',
  },
] as const satisfies readonly {
  key: (typeof MAP_CATEGORY_KEYS)[keyof typeof MAP_CATEGORY_KEYS];
  label: string;
  colorToken: MapColorToken;
  description: string;
}[];

export type MapCategory = (typeof MAP_CATEGORIES)[number];
export type MapCategoryKey = MapCategory['key'];

export function getCategory(categoryKey: string): MapCategory | undefined {
  return MAP_CATEGORIES.find((category) => category.key === categoryKey);
}
