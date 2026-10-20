import type { CraftGrade } from '../types/progression';

export const CRAFT_GRADES = [
  {
    id: 'functional',
    order: 1,
    name: 'Funcional',
    summary: 'Cumple su propósito.',
    description: 'Es utilizable y está listo para entrar en circulación.',
    rule: 'base',
    minAreasMet: null,
    status: 'official',
  },
  {
    id: 'artisanal',
    order: 2,
    name: 'Artesanal',
    summary: 'Cumple 2 de las 6 áreas.',
    description: 'Ya no solamente funciona: demuestra cuidado en dos aspectos concretos.',
    rule: 'min-areas',
    minAreasMet: 2,
    status: 'official',
  },
  {
    id: 'maestre',
    order: 3,
    name: 'Maestre',
    summary: 'Cumple 4 de las 6 áreas.',
    description:
      'Se agregan dos áreas nuevas a las dos que ya domina. El objeto empieza a mostrar que varias mejoras pueden convivir y reforzarse entre sí. Ya no solo está cuidado. Está muy bien resuelto.',
    rule: 'min-areas',
    minAreasMet: 4,
    status: 'official',
  },
  {
    id: 'emblem',
    order: 4,
    name: 'Emblema',
    summary: 'Cumple las 6 áreas.',
    description:
      'Material. Resistencia. Durabilidad. Reparabilidad. Función. Estilo. Nada importante queda descuidado.',
    rule: 'all-areas',
    minAreasMet: 6,
    status: 'official',
  },
  {
    id: 'relic',
    order: 5,
    name: 'Reliquia',
    summary: 'Aquí termina la escala y empieza el misterio.',
    description:
      'Una Reliquia no es simplemente un objeto que cumplió todos los requisitos. Es una pieza que lleva esas seis áreas tan lejos como fue posible. Quizá sea una técnica. Quizá un material. Quizá una forma de reparar. Quizá una combinación que nadie había intentado. Descubre por ti mismo qué hace que una pieza deje de ser solamente excelente y se convierta en algo que merece permanecer.',
    rule: 'discretionary',
    minAreasMet: null,
    status: 'official',
  },
] as const satisfies readonly CraftGrade[];
