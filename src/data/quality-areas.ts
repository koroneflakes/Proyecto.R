import type { QualityArea } from '../types/progression';

export const QUALITY_AREAS = [
  {
    id: 'craft-material',
    scope: 'craft-piece',
    name: 'Material',
    description:
      'Qué se utiliza y de dónde viene; se valora especialmente la procedencia local y nacional.',
    status: 'official',
  },
  {
    id: 'craft-strength',
    scope: 'craft-piece',
    name: 'Resistencia',
    description: 'Qué tanto soporta el uso.',
    status: 'official',
  },
  {
    id: 'craft-durability',
    scope: 'craft-piece',
    name: 'Durabilidad',
    description: 'Cuánto tiempo puede conservar su función y calidad.',
    status: 'official',
  },
  {
    id: 'craft-repairability',
    scope: 'craft-piece',
    name: 'Reparabilidad',
    description: 'Qué tan posible y accesible es mantenerlo, repararlo y prolongar su vida.',
    status: 'official',
  },
  {
    id: 'craft-function',
    scope: 'craft-piece',
    name: 'Función',
    description: 'Qué tan bien cumple su propósito y qué tan útil es.',
    status: 'official',
  },
  {
    id: 'craft-style',
    scope: 'craft-piece',
    name: 'Estilo',
    description: 'Diseño, estética, acabados e identidad.',
    status: 'official',
  },
  {
    id: 'merchant-pricing',
    scope: 'merchant',
    name: 'Tasado',
    description:
      'Qué tan justo y razonable es el precio en relación con el producto, sus materiales, su trabajo y su valor.',
    status: 'official',
  },
  {
    id: 'merchant-honesty',
    scope: 'merchant',
    name: 'Honestidad',
    description:
      'Qué tan transparente es con sus compradores respecto a lo que vende, sus condiciones y las cualidades de sus productos.',
    status: 'official',
  },
  {
    id: 'merchant-punctuality',
    scope: 'merchant',
    name: 'Puntualidad',
    description:
      'Qué tan bien cumple los tiempos acordados, las entregas y los compromisos adquiridos.',
    status: 'official',
  },
  {
    id: 'merchant-humanity',
    scope: 'merchant',
    name: 'Humanidad',
    description:
      'Cómo trata a las personas con las que comercia; respeto, empatía, trato digno y voluntad de construir relaciones justas.',
    status: 'official',
  },
  {
    id: 'collector-quality',
    scope: 'collector',
    name: 'Calidad',
    description:
      'Qué tan adecuado es el material para su propósito, qué propiedades ofrece y qué posibilidades brinda para el trabajo artesanal.',
    status: 'official',
  },
  {
    id: 'collector-local-impact',
    scope: 'collector',
    name: 'Impacto local',
    description:
      'Cómo contribuye la obtención y el aprovechamiento del recurso a su entorno; recuperación de materiales, apoyo a productores de la zona y fortalecimiento de redes locales.',
    status: 'official',
  },
  {
    id: 'collector-humanity',
    scope: 'collector',
    name: 'Humanidad',
    description:
      'Cómo se relaciona con quienes participan en la obtención y el suministro; respeto, trato justo y relaciones de confianza.',
    status: 'official',
  },
  {
    id: 'collector-material',
    scope: 'collector',
    name: 'Material',
    description:
      'Qué tan singular, extraño o propio de la región es el recurso; materiales poco comunes, de procedencia local y difíciles de sustituir.',
    status: 'official',
  },
] as const satisfies readonly QualityArea[];
