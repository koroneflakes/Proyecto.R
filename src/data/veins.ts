import type { Vein } from '../types/progression';

export const VEINS = [
  {
    id: 'artifice',
    name: 'Artífice',
    summary:
      'La Vena del Artífice se centra en el desarrollo de habilidades manuales y técnicas para crear, reparar, modificar y transformar materias primas o materiales secundarios en productos con valor agregado.',
    purpose:
      'Su finalidad es que el artesano aprenda a producir objetos útiles, funcionales, duraderos y de calidad.',
    principles: [
      'El progreso debe representar una mejora real en la capacidad de trabajar con materiales, utilizar herramientas, dominar técnicas y resolver problemas mediante la práctica.',
      'Esta vena debe dar importancia a la utilidad del producto, su resistencia, durabilidad, reparabilidad, calidad material y diseño.',
      'El objetivo no es producir más objetos por producirlos, sino crear mejores soluciones y prolongar la vida útil de los recursos.',
    ],
    archetype: {
      name: 'El Artífice',
      essence: 'Es quien disfruta hacer algo con sus propias manos y hacerlo cada vez mejor.',
      description: [
        'No quiere saber "un poco de todo". Quiere dominar una cosa concreta. Mientras más específica sea la habilidad, mejor.',
        'Al Artífice le gusta descubrir cómo funciona algo. Practica. Desarma. Prueba. Se equivoca. Vuelve a hacerlo. Encuentra una forma más rápida. Encuentra una forma más limpia.',
        'Su obsesión no es tener la máquina más cara ni el taller más grande. Es hacer un buen trabajo con lo que tiene.',
        'Descubre cuánto tarda, qué necesita y cuánto cuesta hacerlo. Empieza con lo que haya y aprende haciendo.',
      ],
    },
    status: 'official',
  },
  {
    id: 'merchant',
    name: 'Comerciante',
    summary:
      'La Vena del Comerciante se centra en conectar los productos del artesano con las personas que pueden valorarlos y comprarlos.',
    purpose:
      'Su finalidad es facilitar la continuidad del trabajo artesanal: encontrar compradores, cerrar tratos, recuperar el costo operativo de la producción y conseguir que los recursos vuelvan a circular.',
    principles: [
      'La aplicación deberá distinguir entre vender por vender y conseguir que una pieza llegue a alguien que realmente la valore.',
      'El éxito no debe medirse exclusivamente por el dinero obtenido. También debe considerar la continuidad del ciclo, la calidad de las relaciones comerciales y la capacidad de recuperar y reutilizar los recursos.',
      'El desarrollo conceptual deberá determinar cómo se registran las ventas, cómo se demuestra el cumplimiento de una operación, cómo se construye la reputación y qué recompensas corresponden a cada avance.',
    ],
    archetype: {
      name: 'El Comerciante',
      essence: 'Es quien hace que todo vuelva a moverse.',
      description: [
        'Su satisfacción está en ver que algo que fue reparado, transformado o rescatado encuentra a quien lo valore y vuelve a generar recursos para continuar.',
        'No está obsesionado con sacar la mayor ganancia posible. Quiere que el precio sea razonable, que alguien quiera comprar, que se recupere lo invertido y que la utilidad vuelva al proceso.',
        'La idea es sencilla: vender → recuperar → reinvertir → volver a producir.',
        'El Comerciante no ve una venta como el final. La ve como el comienzo de la siguiente vuelta.',
      ],
    },
    status: 'official',
  },
  {
    id: 'collector',
    name: 'Recolector',
    summary:
      'La Vena del Recolector se centra en descubrir, construir y mantener redes de abastecimiento y conocimiento sobre los recursos que necesita el artesano.',
    purpose:
      'No consiste únicamente en comprar materiales. Busca identificar personas concretas, reconocer sus especialidades, descubrir establecimientos y encontrar lugares donde se venden, intercambian, recuperan o consiguen materiales y herramientas de interés.',
    principles: [
      'La información descubierta podrá registrarse y compartirse dentro de la aplicación para que otros artesanos también puedan aprovecharla.',
      'Personas identificadas por su nombre o negocio, cuando corresponda.',
      'Establecimientos y lugares específicos.',
      'Materiales, herramientas y productos disponibles.',
      'Precios observados y condiciones de compra o intercambio.',
      'Recomendaciones y experiencias de otros artesanos.',
      'Contactos útiles para futuras necesidades.',
      'Rutas y relaciones que faciliten el descubrimiento de nuevos recursos.',
      'La aplicación deberá convertir estos descubrimientos en conocimiento acumulable y compartido, en lugar de obligar a cada artesano a comenzar su búsqueda desde cero.',
      'El desarrollo conceptual de esta vena deberá definir cómo se reconoce una búsqueda útil, cómo se registra un descubrimiento, cómo se valora la calidad de la información y cómo progresa el usuario al construir redes de abastecimiento cada vez más útiles.',
    ],
    archetype: {
      name: 'El Recolector',
      essence: 'Es quien disfruta buscar donde nadie más está buscando.',
      description: [
        'El Recolector no necesita saber exactamente qué va a encontrar. Le gusta salir a cazar oportunidades.',
        'Se mete al tianguis a ver qué aparece. Entra a una frutería y termina haciendo trato directo con el dueño. Se da una vuelta por la Frikiplaza para scoutear tesoros ocultos. Tiene el diente afilado para Marketplace y detecta ese anuncio mal publicado que nadie más ha visto.',
        'Ve una bicicleta vieja y piensa: "Aquí hay algo." Ve unos frascos abandonados y piensa: "Esto sirve." Ve un lote que alguien quiere sacar de su casa y pregunta: "¿Cuánto por todo?"',
        'Pregunta. Negocia. Regatea. Intercambia. Pregunta otra vez. Y cuando todos ven basura, está buscando recursos.',
        'No necesita comprar caro. Su reto es encontrar lo que hace falta gratis, barato, por intercambio o por trato directo.',
      ],
    },
    status: 'official',
  },
] as const satisfies readonly Vein[];
