export type TipoTarjeta =
  | 'pregunta'
  | 'prefieres'
  | 'adivina'
  | 'completa'
  | 'dosVerdades'
  | 'yoNunca'
  | 'reto'
  | 'recuerdo'
  | 'plan'
  | 'comodin'
  | 'semaforo'
  | 'debate';

// 1 = ligera, 2 = media, 3 = profunda
export type Intensidad = 1 | 2 | 3;

export type Categoria =
  // Básico
  | 'gustos'
  | 'humor'
  | 'rutinas'
  | 'viajes'
  | 'prefieres'
  | 'comida'
  | 'hipoteticas'
  // Personal
  | 'recuerdos'
  | 'valores'
  | 'futuro'
  | 'miedos'
  | 'delicados'
  | 'infancia'
  | 'amistades'
  | 'percepcion'
  // Caliente
  | 'atraccion'
  | 'coqueteo'
  | 'citas'
  | 'deseos'
  | 'cercania'
  | 'libre'
  | 'fantasias'
  | 'experiencias'
  // Infierno
  | 'posturas'
  | 'placer'
  | 'juguetes'
  | 'morbo'
  | 'pasado'
  | 'fuego'
  // Dado de temas (futuro se comparte con Personal)
  | 'ligeras'
  | 'reflexiones'
  | 'confesiones'
  | 'intimo'
  | 'retos';

export const INFO_CATEGORIA: Record<Categoria, { nombre: string }> = {
  gustos: { nombre: 'Gustos' },
  humor: { nombre: 'Humor' },
  rutinas: { nombre: 'Rutinas' },
  viajes: { nombre: 'Viajes y planes' },
  prefieres: { nombre: '¿Qué prefieres?' },
  comida: { nombre: 'Comida' },
  hipoteticas: { nombre: '¿Y si…?' },
  recuerdos: { nombre: 'Recuerdos' },
  valores: { nombre: 'Valores' },
  futuro: { nombre: 'Futuro' },
  miedos: { nombre: 'Miedos y confianza' },
  delicados: { nombre: 'Temas delicados' },
  infancia: { nombre: 'Infancia' },
  amistades: { nombre: 'Familia y amistades' },
  percepcion: { nombre: 'Cómo te veo' },
  atraccion: { nombre: 'Atracción' },
  coqueteo: { nombre: 'Coqueteo' },
  citas: { nombre: 'Citas y sorpresas' },
  deseos: { nombre: 'Deseos' },
  cercania: { nombre: 'Retos de cercanía' },
  libre: { nombre: 'Libre' },
  fantasias: { nombre: 'Fantasías' },
  experiencias: { nombre: 'Experiencias' },
  posturas: { nombre: 'Posturas' },
  placer: { nombre: 'Placer' },
  juguetes: { nombre: 'Juguetes y juegos' },
  morbo: { nombre: 'Morbo' },
  pasado: { nombre: 'Pasado' },
  fuego: { nombre: 'Retos de fuego' },
  ligeras: { nombre: 'Ligeras' },
  reflexiones: { nombre: 'Reflexiones' },
  confesiones: { nombre: 'Confesiones' },
  intimo: { nombre: 'Íntimo' },
  retos: { nombre: 'Retos' },
};

// Etiqueta de una tarjeta: su categoría y su intensidad
export interface Meta {
  categoria: Categoria;
  intensidad: Intensidad;
}

// en('gustos')(2) → { categoria: 'gustos', intensidad: 2 }
export const en =
  (categoria: Categoria) =>
  (intensidad: Intensidad): Meta => ({ categoria, intensidad });

// Cómo se responde una tarjeta dentro de la app
export type Interaccion =
  | { tipo: 'ninguna' } // se responde hablando
  | { tipo: 'elegir'; opciones: string[] }
  | { tipo: 'escribir' }
  | { tipo: 'escala'; min: number; max: number; etiquetas?: [string, string] }
  | { tipo: 'adivinar'; opciones: string[] } // una persona responde en secreto y la otra adivina
  | { tipo: 'adivinarLibre' } // igual, pero escribiendo la respuesta
  | { tipo: 'dosVerdades' } // tres frases, una falsa; la otra persona la busca
  | { tipo: 'semaforo' } // verde, amarillo o rojo, cada uno sin ver al otro
  | { tipo: 'debate' } // de acuerdo o no, cada uno sin ver al otro
  | { tipo: 'temporizador'; segundos: number };

export interface Tarjeta {
  tipo: TipoTarjeta;
  texto: string;
  opciones?: [string, string]; // solo en "¿Qué prefieres?"
  interaccion?: Interaccion; // si no se indica, depende del tipo
  categoria?: Categoria;
  intensidad?: Intensidad;
}

export const INFO_TIPO: Record<
  TipoTarjeta,
  { etiqueta: string; indicacion: string; color: string }
> = {
  pregunta: { etiqueta: 'Pregunta', indicacion: 'Responde con sinceridad', color: '#dcebf5' },
  prefieres: { etiqueta: '¿Qué prefieres?', indicacion: 'Elige una y cuenta por qué', color: '#f6d99a' },
  adivina: { etiqueta: 'Adivina sobre mí', indicacion: 'Piensa tu respuesta; tu pareja intenta adivinarla', color: '#e3d0f0' },
  completa: { etiqueta: 'Completa la frase', indicacion: 'Termínala en voz alta o escríbela', color: '#bfe3b4' },
  dosVerdades: { etiqueta: 'Dos verdades y una mentira', indicacion: 'Tu pareja debe descubrir la mentira', color: '#f0c4b8' },
  yoNunca: { etiqueta: 'Yo nunca', indicacion: 'Si lo has hecho, cuéntalo', color: '#f2d3e0' },
  reto: { etiqueta: 'Reto', indicacion: 'Cúmplelo o pásalo', color: '#f2a6a6' },
  recuerdo: { etiqueta: 'Recuerdo compartido', indicacion: 'Cuéntalo con detalle', color: '#b8d8f0' },
  plan: { etiqueta: 'Plan de futuro', indicacion: 'Imagínalo en voz alta', color: '#f7e27a' },
  comodin: { etiqueta: 'Comodín', indicacion: '', color: '#d6d0c4' },
  semaforo: { etiqueta: 'Semáforo', indicacion: '', color: '#f2d3a0' },
  debate: { etiqueta: 'Debate', indicacion: '', color: '#d6e4f5' },
};

// La interacción de una tarjeta: la indicada o, si no, la habitual de su tipo
export function interaccionDe(tarjeta: Tarjeta): Interaccion {
  if (tarjeta.interaccion) return tarjeta.interaccion;
  switch (tarjeta.tipo) {
    case 'prefieres':
      return { tipo: 'elegir', opciones: tarjeta.opciones ?? [] };
    case 'yoNunca':
      return { tipo: 'elegir', opciones: ['Yo sí', 'Yo no'] };
    case 'completa':
      return { tipo: 'escribir' };
    case 'adivina':
      return { tipo: 'adivinarLibre' };
    case 'dosVerdades':
      return { tipo: 'dosVerdades' };
    default:
      return { tipo: 'ninguna' };
  }
}

// Funciones para escribir los mazos de forma corta; el último parámetro es la etiqueta
const crear =
  (tipo: TipoTarjeta) =>
  (texto: string, meta?: Meta): Tarjeta => ({ tipo, texto, ...meta });

export const pregunta = crear('pregunta');
export const adivina = crear('adivina');
export const completa = crear('completa');
export const yoNunca = crear('yoNunca');
export const reto = crear('reto');
export const recuerdo = crear('recuerdo');
export const plan = crear('plan');

export const prefieres = (a: string, b: string, meta?: Meta): Tarjeta => ({
  tipo: 'prefieres',
  texto: '¿Qué prefieres?',
  opciones: [a, b],
  ...meta,
});

export const dosVerdades = (
  texto = 'Cuenta tres cosas sobre ti: dos verdaderas y una falsa.',
  meta?: Meta,
): Tarjeta => ({ tipo: 'dosVerdades', texto, ...meta });

export const comodin = (
  texto = 'Comodín: elige tú una pregunta para tu pareja.',
  meta?: Meta,
): Tarjeta => ({ tipo: 'comodin', texto, ...meta });

// Tarjetas interactivas
export const escala = (
  texto: string,
  etiquetas?: [string, string],
  meta?: Meta,
): Tarjeta => ({
  tipo: 'pregunta',
  texto,
  interaccion: { tipo: 'escala', min: 1, max: 10, etiquetas },
  ...meta,
});

export const adivinaOpciones = (texto: string, opciones: string[], meta?: Meta): Tarjeta => ({
  tipo: 'adivina',
  texto,
  interaccion: { tipo: 'adivinar', opciones },
  ...meta,
});

export const adivinaNumero = (texto: string, meta?: Meta): Tarjeta =>
  adivinaOpciones(
    texto,
    Array.from({ length: 10 }, (_, i) => String(i + 1)),
    meta,
  );

export const semaforo = (texto: string, meta?: Meta): Tarjeta => ({
  tipo: 'semaforo',
  texto,
  interaccion: { tipo: 'semaforo' },
  ...meta,
});

// Una propuesta ("ducharnos juntos esta noche"): cada uno dice del 1 al 10 cuánto le apetece.
// Sustituye al semáforo, que ya no se usa en los mazos
export const propuesta = (texto: string, meta?: Meta): Tarjeta => ({
  tipo: 'pregunta',
  texto: `¿Cuánto te apetece? ${texto}`,
  interaccion: { tipo: 'escala', min: 1, max: 10, etiquetas: ['Nada', 'Muchísimo'] },
  ...meta,
});

export const debate = (texto: string, meta?: Meta): Tarjeta => ({
  tipo: 'debate',
  texto,
  interaccion: { tipo: 'debate' },
  ...meta,
});

export const retoConTiempo = (texto: string, segundos = 30, meta?: Meta): Tarjeta => ({
  tipo: 'reto',
  texto,
  interaccion: { tipo: 'temporizador', segundos },
  ...meta,
});