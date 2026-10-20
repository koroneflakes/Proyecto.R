export const MAP_COLORS = {
  papel: '#D8C39A',
  tinta: '#3A2B20',
  agua: '#5E9A8E',
  vegetacion: '#6F8F55',
  ladrillo: '#A24A33',
  malva: '#9A6A7A',
  ocre: '#C8902E',
} as const;

export type MapColorToken = keyof typeof MAP_COLORS;
