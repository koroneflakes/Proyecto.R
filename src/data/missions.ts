import type { Mission } from '../types/missions';

export const MISSIONS = [
  {
    id: 'artifice-mission-1',
    veinId: 'artifice',
    order: 1,
    title: 'Haz cinco piezas o 5 sets de piezas',
    summary: 'Repara, transforma o construye cinco unidades de tu oficio.',
    objective: { kind: 'create', targetCount: 5 },
    steps: ['Repara, transforma o construye cinco unidades de tu oficio.'],
    rules: [],
    evidence: [
      {
        id: 'artifice-mission-1-photo',
        type: 'photo',
        label: 'Fotografía',
        description: 'Una fotografía de cada pieza o set de piezas.',
        perEntry: true,
      },
    ],
    validation: {
      requiresDistinctEntries: true,
      requiresEvidencePerEntry: true,
      requiresReflection: false,
    },
    completionStatement: 'Ya sé hacerlo.',
    closingLine: null,
    prerequisites: { missionIds: [] },
    rewards: [
      {
        type: 'recognition',
        title: 'Ya sé hacerlo',
        description: 'Ya sé hacerlo.',
      },
      {
        type: 'unlock-mission',
        title: 'Sube un producto un grado',
        description: 'Desbloquea la siguiente misión del Artífice.',
        unlocksMissionIds: ['artifice-mission-2'],
      },
    ],
    status: 'official',
  },
  {
    id: 'artifice-mission-2',
    veinId: 'artifice',
    order: 2,
    title: 'Sube un producto un grado',
    summary:
      'El Artífice convierte una cosa en otra, y una habilidad sencilla en algo valioso. No sube de grado porque cueste más. No sube porque tenga más adornos. Sube porque tiene más alma, más trabajo y más camino detrás.',
    objective: { kind: 'upgrade-grade', targetCount: 1 },
    steps: [
      'Toma un producto que ya sabes hacer y llévalo un grado más arriba.',
      'Identifica las 6 áreas de calidad.',
      'Elige dos que todavía no hayas resuelto.',
      'Mejora esas dos y demuéstralo; cuando lo hayas demostrado, el producto sube de grado.',
    ],
    rules: [
      {
        kind: 'use-existing-product',
        description: 'Trabaja sobre un producto que el usuario ya sabe hacer.',
      },
      {
        kind: 'pick-unresolved-areas',
        count: 2,
        description: 'Elige dos áreas de calidad que todavía no hayas resuelto.',
      },
    ],
    evidence: [
      {
        id: 'artifice-mission-2-before-after',
        type: 'before-after',
        label: 'Antes y después',
        description: 'Demuestra el estado del producto antes y después de mejorarlo.',
        perEntry: true,
      },
    ],
    validation: {
      requiresDistinctEntries: false,
      requiresEvidencePerEntry: true,
      requiresReflection: true,
    },
    completionStatement: null,
    closingLine: null,
    prerequisites: { missionIds: ['artifice-mission-1'] },
    rewards: [
      {
        type: 'recognition',
        title: 'Un producto que subió de grado',
        description: 'Un producto que subió de grado',
      },
    ],
    status: 'official',
  },
  // PENDING DESIGN: misión 3 del Artífice (sin definir en el documento)
  {
    id: 'merchant-mission-1',
    veinId: 'merchant',
    order: 1,
    title: 'Haz tres ventas',
    summary:
      'La intención no es maximizar la ganancia, sino comprobar que existe alguien dispuesto a pagar, recuperar lo que costó hacer la pieza y generar un pequeño excedente que pueda regresar al proceso. Esa utilidad puede reinvertirse en reparaciones, materias primas, herramientas o publicidad.',
    objective: { kind: 'sell', targetCount: 3 },
    steps: [
      'Haz tres ventas.',
      'Vende a un precio equivalente al costo operativo —lo que cuesta hacer y entregar el producto: materiales, piezas, envase, transporte o comisión de venta— y puedes añadir hasta un 10% de utilidad.',
    ],
    rules: [
      {
        kind: 'max-markup-percent',
        percent: 10,
        description:
          'Vende a un precio equivalente al costo operativo más hasta un 10% de utilidad.',
      },
    ],
    evidence: [
      {
        id: 'merchant-mission-1-cost-breakdown',
        type: 'cost-breakdown',
        label: 'Desglose de costos',
        description: 'Registra el costo operativo de cada producto vendido.',
        perEntry: true,
      },
      {
        id: 'merchant-mission-1-sale-record',
        type: 'sale-record',
        label: 'Registro de venta',
        description: 'Registra cada venta realizada.',
        perEntry: true,
      },
    ],
    validation: {
      requiresDistinctEntries: true,
      requiresEvidencePerEntry: true,
      requiresReflection: false,
    },
    completionStatement: 'Esto ya puede financiar la siguiente vuelta.',
    closingLine: 'El Comerciante convierte una venta en el siguiente ciclo.',
    prerequisites: { missionIds: [] },
    rewards: [
      {
        type: 'recognition',
        title: 'Esto ya puede financiar la siguiente vuelta',
        description: 'Esto ya puede financiar la siguiente vuelta.',
      },
      {
        type: 'unlock-rank',
        title: 'Mercader de Barrio',
        description: 'Desbloquea el rango Mercader de Barrio.',
        unlocksRankIds: ['merchant-rank-2'],
      },
    ],
    status: 'official',
  },
  {
    id: 'collector-mission-1',
    veinId: 'collector',
    order: 1,
    title: 'Consigue cinco recursos útiles',
    summary: 'Encuentra cinco piezas, materiales o productos que alguien necesite para su oficio.',
    objective: { kind: 'source', targetCount: 5 },
    steps: [
      'Encuentra cinco piezas, materiales o productos que alguien necesite para su oficio.',
      'Consíguelos gratis, baratos, por intercambio o mediante un buen trato.',
    ],
    rules: [
      {
        kind: 'allowed-acquisition-methods',
        methods: ['free', 'cheap', 'exchange', 'good-deal'],
        description: 'Gratis, baratos, por intercambio o mediante un buen trato.',
      },
    ],
    evidence: [
      {
        id: 'collector-mission-1-resource-record',
        type: 'resource-record',
        label: 'Registro del recurso',
        description: 'Registra cada pieza, material o producto conseguido.',
        perEntry: true,
      },
      {
        id: 'collector-mission-1-photo',
        type: 'photo',
        label: 'Fotografía',
        description: 'Una fotografía de cada recurso conseguido.',
        perEntry: true,
      },
    ],
    validation: {
      requiresDistinctEntries: true,
      requiresEvidencePerEntry: true,
      requiresReflection: false,
    },
    completionStatement: 'Encontré algo donde otros no estaban buscando.',
    closingLine:
      'El Recolector convierte la búsqueda en un juego y los hallazgos en recursos.',
    prerequisites: { missionIds: [] },
    rewards: [
      {
        type: 'recognition',
        title: 'Encontré algo donde otros no estaban buscando',
        description: 'Encontré algo donde otros no estaban buscando.',
      },
      {
        type: 'unlock-rank',
        title: 'Rastreador de Abastos',
        description: 'Desbloquea el rango Rastreador de Abastos.',
        unlocksRankIds: ['collector-rank-2'],
      },
    ],
    status: 'official',
  },
] as const satisfies readonly Mission[];
