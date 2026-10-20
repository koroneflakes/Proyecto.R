import type { ArtisanLevel } from '../types/progression';

export const ARTISAN_LEVELS = [
  {
    id: 'artisan-level-1',
    level: 1,
    name: 'Artesano de nivel 1',
    summary:
      'Punto de partida individual: descubrir qué sabe hacer, qué quiere aprender y qué puede construir con los recursos que tiene disponibles.',
    capabilities: [
      'Descubrir qué sabe hacer y qué quiere aprender.',
      'Elegir un enfoque artesanal concreto (una habilidad específica, no "un poco de todo").',
      'Iniciar cualquiera de las tres venas.',
      'Tomar su primera misión.',
    ],
    requirements: { minVeinsWithFirstMissionCompleted: 0 },
    rewards: [],
    status: 'official',
  },
  {
    id: 'artisan-level-2',
    level: 2,
    name: 'Artesano de nivel 2',
    summary: 'Ha completado la primera misión de una vena.',
    capabilities: [],
    requirements: { minVeinsWithFirstMissionCompleted: 1 },
    rewards: [
      {
        type: 'recognition',
        title: 'Primera capacidad demostrada',
        description: 'Primera capacidad demostrada',
      },
      {
        type: 'profile-upgrade',
        title: 'Perfil con vena activa',
        description: 'El perfil muestra la vena y el enfoque artesanal.',
      },
    ],
    status: 'official',
  },
  {
    id: 'artisan-level-3',
    level: 3,
    name: 'Artesano de nivel 3',
    summary: 'Ha completado la primera misión de dos venas.',
    capabilities: [],
    requirements: { minVeinsWithFirstMissionCompleted: 2 },
    rewards: [
      {
        type: 'recognition',
        title: 'Dos caminos recorridos',
        description: 'Dos caminos recorridos',
      },
    ],
    status: 'official',
  },
  {
    id: 'artisan-level-4',
    level: 4,
    name: 'Artesano de nivel 4',
    summary: 'Ha completado la primera misión de las tres venas.',
    capabilities: [],
    requirements: { minVeinsWithFirstMissionCompleted: 3 },
    rewards: [
      {
        type: 'recognition',
        title: 'Artesano de tres venas',
        description: 'Artesano de tres venas',
      },
      {
        type: 'collaboration-access',
        title: 'Preparado para la comunidad',
        description:
          'Preparado para la comunidad. Reservado para la etapa comunitaria; no implementa funciones todavía.',
      },
    ],
    status: 'official',
  },
] as const satisfies readonly ArtisanLevel[];

// PENDING DESIGN: cuántos niveles existirán y qué desbloquea cada uno
