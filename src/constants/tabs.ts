import { MaterialCommunityIcons } from '@expo/vector-icons';

type TabConfiguration = {
  id: string;
  routeName: string;
  label: string;
  accessibilityLabel: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  placeholderSubtitle: string;
};

export const TAB_CONFIG = [
  {
    id: 'my-artisan',
    routeName: 'index',
    label: 'Mi Artesano',
    accessibilityLabel: 'Mi Artesano',
    icon: 'hammer-screwdriver',
    placeholderSubtitle:
      'Perfil, nivel actual, progreso general, historial y capacidades demostradas.',
  },
  {
    id: 'development-tree',
    routeName: 'development-tree',
    label: 'Árbol',
    accessibilityLabel: 'Árbol de desarrollo',
    icon: 'source-branch',
    placeholderSubtitle: 'Las tres venas, sus rangos, requisitos y avances.',
  },
  {
    id: 'missions',
    routeName: 'missions',
    label: 'Misiones',
    accessibilityLabel: 'Misiones',
    icon: 'target',
    placeholderSubtitle: 'Misiones disponibles, objetivos en curso, evidencias y logros.',
  },
  {
    id: 'workshop',
    routeName: 'workshop',
    label: 'Taller',
    accessibilityLabel: 'Taller',
    icon: 'toolbox-outline',
    placeholderSubtitle: 'Habilidades, proyectos, piezas creadas, reparaciones y mejoras.',
  },
  {
    id: 'more',
    routeName: 'more',
    label: 'Más',
    accessibilityLabel: 'Más opciones',
    icon: 'dots-horizontal',
    placeholderSubtitle: 'Descubrimientos, Comercio y, más adelante, Comunidad.',
  },
] as const satisfies readonly TabConfiguration[];

// FUTURE: Descubrimientos, Comercio y Comunidad (etapa posterior).

export type TabId = (typeof TAB_CONFIG)[number]['id'];
export type TabRouteName = (typeof TAB_CONFIG)[number]['routeName'];

export function getTabConfig(routeName: TabRouteName) {
  const tab = TAB_CONFIG.find((item) => item.routeName === routeName);
  if (!tab) {
    throw new Error(`Missing tab configuration for route "${routeName}".`);
  }
  return tab;
}
