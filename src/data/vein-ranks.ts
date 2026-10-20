import type { VeinRank } from '../types/progression';

const MERCHANT_AREA_IDS = [
  'merchant-pricing',
  'merchant-honesty',
  'merchant-punctuality',
  'merchant-humanity',
] as const;

const COLLECTOR_AREA_IDS = [
  'collector-quality',
  'collector-local-impact',
  'collector-humanity',
  'collector-material',
] as const;

export const ARTIFICE_RANKS = [] as const satisfies readonly VeinRank[];
// PENDING DESIGN: rangos de la persona en la vena del Artífice

export const MERCHANT_RANKS = [
  {
    id: 'merchant-rank-1',
    veinId: 'merchant',
    order: 1,
    name: 'Mercader de Correspondencia',
    tagline: 'Comienza a intercambiar.',
    summary:
      'Ofrece sus piezas por mensajes, correo, grupos comunitarios, WhatsApp o marketplaces.',
    description:
      'Ofrece sus piezas por mensajes, correo, grupos comunitarios, WhatsApp o marketplaces. Todavía no cuenta con un espacio de venta establecido: su principal herramienta es el contacto directo. Cada venta es una oportunidad para aprender a tasar su trabajo, cumplir lo prometido y ganarse la confianza de otra persona.',
    requirements: {
      missionIds: [],
      qualityAreaIds: MERCHANT_AREA_IDS,
      // PENDING DESIGN: cuántas áreas deben cumplirse
      minQualityAreasMet: null,
    },
    rewards: [],
    status: 'official',
  },
  {
    id: 'merchant-rank-2',
    veinId: 'merchant',
    order: 2,
    name: 'Mercader de Barrio',
    tagline: 'Se hace conocido en su comunidad.',
    summary:
      'Ya no depende exclusivamente de encontrar compradores uno por uno. Tiene clientes habituales y las personas comienzan a reconocerlo, saben qué ofrece y dónde pueden encontrarlo.',
    description:
      'Ya no depende exclusivamente de encontrar compradores uno por uno. Tiene clientes habituales y las personas comienzan a reconocerlo, saben qué ofrece y dónde pueden encontrarlo. Su nombre empieza a tener valor. La confianza que construye se convierte en parte de su oficio.',
    requirements: {
      missionIds: ['merchant-mission-1'],
      qualityAreaIds: MERCHANT_AREA_IDS,
      // PENDING DESIGN: cuántas áreas deben cumplirse
      minQualityAreasMet: null,
    },
    rewards: [
      {
        type: 'recognition',
        title: 'Mercader de Barrio',
        description: 'Se hace conocido en su comunidad.',
      },
    ],
    status: 'official',
  },
  {
    id: 'merchant-rank-3',
    veinId: 'merchant',
    order: 3,
    name: 'Feriante',
    tagline: 'Lleva su trabajo al encuentro con otros.',
    summary:
      'Participa en bazares, festivales y ferias temporales. Aprende a preparar su exhibición, presentar sus piezas y aprovechar cada encuentro para ampliar su clientela.',
    description:
      'Participa en bazares, festivales y ferias temporales. Aprende a preparar su exhibición, presentar sus piezas y aprovechar cada encuentro para ampliar su clientela. Ya no solo encuentra compradores: aprende a acercarse a ellos, mostrar el valor de su trabajo y construir relaciones más allá de una sola venta.',
    requirements: {
      // PENDING DESIGN: misiones del rango
      missionIds: [],
      qualityAreaIds: MERCHANT_AREA_IDS,
      // PENDING DESIGN: cuántas áreas deben cumplirse
      minQualityAreasMet: null,
    },
    rewards: [
      {
        type: 'recognition',
        title: 'Feriante',
        description: 'Lleva su trabajo al encuentro con otros.',
      },
    ],
    status: 'official',
  },
  {
    id: 'merchant-rank-4',
    veinId: 'merchant',
    order: 4,
    name: 'Tendero',
    tagline: 'Mantiene sus puertas abiertas.',
    summary:
      'Administra un puesto en un tianguis, una tienda en línea o un establecimiento compartido. Sus productos están disponibles de forma regular y sus clientes saben que pueden volver.',
    description:
      'Administra un puesto en un tianguis, una tienda en línea o un establecimiento compartido. Sus productos están disponibles de forma regular y sus clientes saben que pueden volver. El comercio deja de depender únicamente de las oportunidades ocasionales. Requiere constancia, organización y el cumplimiento de compromisos que se repiten día tras día.',
    closingLine: 'Ya no solo vende. Sostiene un lugar en el mercado.',
    requirements: {
      // PENDING DESIGN: misiones del rango
      missionIds: [],
      qualityAreaIds: MERCHANT_AREA_IDS,
      // PENDING DESIGN: cuántas áreas deben cumplirse
      minQualityAreasMet: null,
    },
    rewards: [
      {
        type: 'recognition',
        title: 'Tendero',
        description: 'Mantiene sus puertas abiertas.',
      },
    ],
    status: 'official',
  },
  {
    id: 'merchant-rank-5',
    veinId: 'merchant',
    order: 5,
    name: 'Maestro de Tienda',
    tagline: 'Construye una casa para el intercambio.',
    summary:
      'Establece un local propio, reconocible por lo que ofrece y por la manera en que trata a las personas. Selecciona sus productos con criterio, administra inventarios y pedidos, y construye una reputación que atrae a compradores.',
    description:
      'Establece un local propio, reconocible por lo que ofrece y por la manera en que trata a las personas. Selecciona sus productos con criterio, administra inventarios y pedidos, y construye una reputación que atrae a compradores. Su tienda no se sostiene únicamente por las piezas que vende, sino también por la confianza que inspira y las relaciones que cultiva.',
    closingLine:
      'El comercio deja de ser solamente una actividad. Se convierte en un oficio propio.',
    thresholdText:
      'Aquí termina la escala conocida y comienza una nueva responsabilidad. Un Maestro de Tienda no es simplemente alguien que vende mucho o que posee un local. Es alguien que ha aprendido que cada intercambio implica algo más que un precio: implica confianza, compromisos y personas. Quizá su mayor logro sea una tienda llena de piezas excepcionales. Quizá sea la palabra que cumple, incluso cuando nadie lo vigila. Quizá sea el respeto con el que trata a quien puede comprar mucho y a quien solamente puede comprar poco. Descubre por ti mismo qué hace que un comerciante deje de ser solamente un vendedor y se convierta en alguien digno de confianza.',
    requirements: {
      // PENDING DESIGN: misiones del rango
      missionIds: [],
      qualityAreaIds: MERCHANT_AREA_IDS,
      // PENDING DESIGN: cuántas áreas deben cumplirse
      minQualityAreasMet: null,
    },
    rewards: [
      {
        type: 'recognition',
        title: 'Maestro de Tienda',
        description: 'Construye una casa para el intercambio.',
      },
    ],
    status: 'official',
  },
] as const satisfies readonly VeinRank[];

export const COLLECTOR_RANKS = [
  {
    id: 'collector-rank-1',
    veinId: 'collector',
    order: 1,
    name: 'Explorador de Rincones',
    tagline: 'Aprende a encontrar lo que otros pasan por alto.',
    summary:
      'Comienza explorando tianguis, tiendas locales, ventas de garaje, mercados de segunda mano, grupos de reventa y plataformas digitales.',
    description:
      'Comienza explorando tianguis, tiendas locales, ventas de garaje, mercados de segunda mano, grupos de reventa y plataformas digitales. Aprende a reconocer objetos, herramientas y materiales que pueden reutilizarse o transformarse en algo útil. Cada hallazgo le enseña a mirar de otra manera lo que lo rodea. Quizá algo que para otros ya no tiene utilidad sea justo lo que necesita para comenzar una nueva pieza.',
    requirements: {
      missionIds: [],
      qualityAreaIds: COLLECTOR_AREA_IDS,
      // PENDING DESIGN: cuántas áreas deben cumplirse
      minQualityAreasMet: null,
    },
    rewards: [],
    status: 'official',
  },
  {
    id: 'collector-rank-2',
    veinId: 'collector',
    order: 2,
    name: 'Rastreador de Abastos',
    tagline: 'Aprende dónde encontrar lo que necesita.',
    summary:
      'Ya cuenta con una red establecida de lugares donde consigue sus materias primas. Conoce tiendas, talleres, almacenes y otros puntos de suministro; sabe dónde buscar cada material, compara opciones y reconoce cuáles ofrecen la calidad y el precio adecuados.',
    description:
      'Ya cuenta con una red establecida de lugares donde consigue sus materias primas. Conoce tiendas, talleres, almacenes y otros puntos de suministro; sabe dónde buscar cada material, compara opciones y reconoce cuáles ofrecen la calidad y el precio adecuados. Deja de depender únicamente de la suerte. Su conocimiento del entorno le permite encontrar recursos con mayor constancia.',
    closingLine: 'Ya no solo encuentra materiales. Conoce sus fuentes.',
    requirements: {
      missionIds: ['collector-mission-1'],
      qualityAreaIds: COLLECTOR_AREA_IDS,
      // PENDING DESIGN: cuántas áreas deben cumplirse
      minQualityAreasMet: null,
    },
    rewards: [
      {
        type: 'recognition',
        title: 'Rastreador de Abastos',
        description: 'Aprende dónde encontrar lo que necesita.',
      },
    ],
    status: 'official',
  },
  {
    id: 'collector-rank-3',
    veinId: 'collector',
    order: 3,
    name: 'Tratante de Abastos',
    tagline: 'Aprende a negociar el acceso a los recursos.',
    summary:
      'Establece acuerdos directos con los dueños de tiendas, almacenes y comercios que distribuyen los materiales. Negocia precios, cantidades, disponibilidad y condiciones de entrega para conseguir un abastecimiento más conveniente y constante.',
    description:
      'Establece acuerdos directos con los dueños de tiendas, almacenes y comercios que distribuyen los materiales. Negocia precios, cantidades, disponibilidad y condiciones de entrega para conseguir un abastecimiento más conveniente y constante. Comprende que una buena fuente no es solamente aquella que ofrece un precio bajo, sino también la que permite construir una relación confiable y obtener los materiales adecuados cuando los necesita.',
    closingLine: 'Ya no solo sabe dónde buscar. Sabe cómo abastecerse.',
    requirements: {
      // PENDING DESIGN: misiones del rango
      missionIds: [],
      qualityAreaIds: COLLECTOR_AREA_IDS,
      // PENDING DESIGN: cuántas áreas deben cumplirse
      minQualityAreasMet: null,
    },
    rewards: [
      {
        type: 'recognition',
        title: 'Tratante de Abastos',
        description: 'Aprende a negociar el acceso a los recursos.',
      },
    ],
    status: 'official',
  },
  {
    id: 'collector-rank-4',
    veinId: 'collector',
    order: 4,
    name: 'Enlace de Origen',
    tagline: 'Llega hasta quienes producen los materiales.',
    summary:
      'Va directamente a la fuente y establece relaciones con quienes producen u obtienen originalmente los insumos en su zona: agricultores, madereros, productores de fibras, talleres de transformación primaria y otras fuentes locales pertinentes.',
    description:
      'Va directamente a la fuente y establece relaciones con quienes producen u obtienen originalmente los insumos en su zona: agricultores, madereros, productores de fibras, talleres de transformación primaria y otras fuentes locales pertinentes. Busca materiales de calidad, de procedencia conocida y, cuando sea posible, locales y sustentables. Aprende a reconocer el valor de los recursos de su región y las posibilidades que ofrecen materiales poco comunes o difíciles de encontrar fuera de ella. La relación deja de depender exclusivamente de los intermediarios. Ahora conoce a quienes hacen posible que el material exista y llegue hasta sus manos.',
    closingLine: 'Ya no solo consigue materias primas. Conoce su origen.',
    requirements: {
      // PENDING DESIGN: misiones del rango
      missionIds: [],
      qualityAreaIds: COLLECTOR_AREA_IDS,
      // PENDING DESIGN: cuántas áreas deben cumplirse
      minQualityAreasMet: null,
    },
    rewards: [
      {
        type: 'recognition',
        title: 'Enlace de Origen',
        description: 'Llega hasta quienes producen los materiales.',
      },
    ],
    status: 'official',
  },
  {
    id: 'collector-rank-5',
    veinId: 'collector',
    order: 5,
    name: 'Maestro de Abastos',
    tagline: 'Domina las fuentes y aprende a generar sus propios recursos.',
    summary:
      'Conoce y coordina fuentes de abastecimiento especializadas, mantiene relaciones directas con productores y encuentra oportunidades en materiales locales, sustentables y subproductos industriales que pueden transformarse en recursos de alto valor artesanal.',
    description:
      'Conoce y coordina fuentes de abastecimiento especializadas, mantiene relaciones directas con productores y encuentra oportunidades en materiales locales, sustentables y subproductos industriales que pueden transformarse en recursos de alto valor artesanal. Además, es capaz de generar sus propias materias primas mediante el cultivo, la extracción responsable, la recuperación o el procesamiento de recursos, según la naturaleza del material. No depende únicamente de encontrar lo que necesita: puede producir, preparar o transformar recursos básicos para abastecer sus propios proyectos y, potencialmente, los de otros artesanos. Su dominio no se mide por la cantidad de materiales que acumula, sino por su conocimiento de las fuentes, su capacidad para reconocer el potencial de cada recurso y su habilidad para mantener disponibles materiales valiosos.',
    closingLine:
      'Ya no solo encuentra el origen de los materiales. Puede convertirse en parte de ese origen.',
    thresholdText:
      'Aquí termina la búsqueda habitual y comienza un conocimiento más profundo. Un Maestro de Abastos no es simplemente alguien que tiene muchos proveedores o acceso a materiales costosos. Es alguien que comprende que cada material tiene una historia, un origen y un potencial que todavía puede estar por descubrirse. Quizá encuentre una fibra que solo crece en su región. Quizá descubra una forma de aprovechar un residuo industrial que antes se desperdiciaba. Quizá aprenda a generar una materia prima que permita a otros artesanos trabajar con mayor autonomía. Descubre por ti mismo qué hace que un recolector deje de ser solamente alguien que encuentra materiales y se convierta en alguien capaz de abrir nuevas fuentes para todo un oficio.',
    requirements: {
      // PENDING DESIGN: misiones del rango
      missionIds: [],
      qualityAreaIds: COLLECTOR_AREA_IDS,
      // PENDING DESIGN: cuántas áreas deben cumplirse
      minQualityAreasMet: null,
    },
    rewards: [
      {
        type: 'recognition',
        title: 'Maestro de Abastos',
        description: 'Domina las fuentes y aprende a generar sus propios recursos.',
      },
    ],
    status: 'official',
  },
] as const satisfies readonly VeinRank[];
