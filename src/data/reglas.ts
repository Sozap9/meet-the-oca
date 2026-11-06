import { TIPOS_JUEGO, TIPOS_PREGUNTA, TIPOS_RETO } from './cartasModo';
import { NIVELES, tarjetasDeModo } from './decks';
import type { Modo } from './modos';
import type { TipoTarjeta } from './tarjetas';
import { interaccionDe } from './tarjetas';

// Las reglas de cada modo: lo que se enseña en "Cómo se juega" según el modo que se esté jugando.
// Desde el inicio, sin modo, se enseña un resumen de todos.

export interface ReglasModo {
  objetivo: { titulo: string; texto: string };
  resumen: string; // una línea, para la lista de todos los modos
  esteModo: string[]; // lo propio del modo: mazo, temas, cómo se activa...
  tablero: boolean; // si lleva tablero (y por tanto casillas especiales)
}

const OBJETIVO_TABLERO = {
  titulo: 'Llegad al jardín',
  texto:
    'Gana quien llega primero a la casilla 63. Al llegar os espera una última pregunta para los dos. Por el camino, cada casilla es una excusa para conoceros mejor.',
};

export const REGLAS_MODO: Record<Modo, ReglasModo> = {
  basico: {
    objetivo: OBJETIVO_TABLERO,
    resumen: 'Tablero con preguntas ligeras y divertidas. El modo para empezar.',
    esteModo: [
      'Mazo Básico: gustos, comida, manías, rutinas, viajes, humor y preguntas de «¿y si…?».',
      'Nada incómodo: es el modo para empezar y reírse un rato.',
    ],
    tablero: true,
  },
  personal: {
    objetivo: OBJETIVO_TABLERO,
    resumen: 'Tablero con preguntas para conoceros de verdad.',
    esteModo: [
      'Mazo Personal: infancia, familia y amistades, sueños, valores, miedos y cómo os veis.',
      'Las preguntas empiezan suaves y ganan profundidad según avanzáis por el tablero.',
    ],
    tablero: true,
  },
  caliente: {
    objetivo: OBJETIVO_TABLERO,
    resumen: 'Tablero +18: atracción, deseos, fantasías y retos picantes.',
    esteModo: [
      'Solo para mayores de 18.',
      'Mazo Caliente: atracción, provocación, citas, deseos, fantasías, experiencias y retos de contacto. Hay más juegos y retos que preguntas.',
      'Las propuestas más atrevidas se puntúan del 1 al 10: cada uno dice cuánto le apetece.',
      'Al empezar la partida podéis activar Infierno, su versión explícita.',
    ],
    tablero: true,
  },
  infierno: {
    objetivo: OBJETIVO_TABLERO,
    resumen: 'Caliente, pero explícito y sin filtros. Se activa al empezar una partida de Caliente.',
    esteModo: [
      'Solo para mayores de 18: se activa al empezar una partida de Caliente, después de poner los nombres, confirmando que los dos lo sois.',
      'Mazo Infierno: posturas, placer, juguetes y juegos, morbo, pasado y retos de fuego.',
      'Lo más arriesgado va como propuesta: decís del 1 al 10 cuánto os apetece. Cualquier carta se puede pasar.',
    ],
    tablero: true,
  },
  aleatorio: {
    objetivo: OBJETIVO_TABLERO,
    resumen: 'Tablero a vuestra medida: elegís mazos y casillas, o lo dejáis todo al azar.',
    esteModo: [
      'Elegís qué mazos mezclar (Básico, Personal, Caliente o Infierno) y qué tipos de tarjeta quitar.',
      'Las casillas especiales que quitéis se vuelven normales; las demás se reparten por el tablero.',
      'Con el botón «Aleatorio» no elegís nada: se mezclan los tres mazos y las casillas cambian de sitio.',
    ],
    tablero: true,
  },
  dado: {
    objetivo: {
      titulo: 'Tirad y hablad',
      texto:
        'Sin tablero ni carrera: un dado elige el tema y sale una tarjeta. Jugáis las tiradas que elijáis al empezar y termináis con una pregunta para los dos.',
    },
    resumen: 'Sin tablero: un dado elige el tema y sale una pregunta.',
    esteModo: [
      'Elegís de 3 a 9 temas: gustos, ¿y si…?, risas, infancia, sueños, cómo te veo, deseos, picante y retos.',
      'El dado siempre tiene seis caras: en cada tirada se reparten entre los temas elegidos y el que sale queda arriba.',
      'Cada tema saca sus tarjetas de los mismos mazos que el tablero.',
    ],
    tablero: false,
  },
  cartas: {
    objetivo: {
      titulo: 'Ronda a ronda',
      texto:
        'Aquí no gana nadie: es un juego de preguntas por rondas. Cada uno empieza con cinco cartas y la partida termina cuando ya no quedan cartas ni en el mazo ni en las manos.',
    },
    resumen: 'Sin tablero: preguntas por rondas con cartas en la mano y cartas especiales.',
    esteModo: [
      'Elegís qué mazos entran (Básico, Personal, Caliente o Infierno) y cuánto dura la partida.',
      'Veis de qué tipo es cada carta de vuestra mano, pero no lo que dice hasta jugarla.',
    ],
    tablero: false,
  },
};

// Cómo es cada turno
export function lineasTurno(modo: Modo, pases: number): string[] {
  const textoPases =
    pases === 0
      ? 'En esta partida no hay pases para saltarse tarjetas (se puede cambiar en Ajustes).'
      : `Cada persona tiene ${pases === 1 ? '1 pase' : `${pases} pases`} para saltarse tarjetas (se puede cambiar en Ajustes).`;
  if (modo === 'dado') {
    return [
      'Por turnos, cada uno tira el dado. El tema que queda arriba decide la tarjeta, y es para quien tira.',
      textoPases,
    ];
  }
  if (modo === 'cartas') {
    return [
      'En tu turno juegas una carta de tu mano, y la responde tu pareja. Después robas otra del mazo; cuando se acaba, seguís jugando las cartas que os quedan.',
      'Entre turnos se pasa el móvil y la mano queda tapada, para que nadie vea las cartas del otro.',
      textoPases,
    ];
  }
  return [
    'Tira el dado y avanza. Al caer en una casilla normal sale una tarjeta para ti: una pregunta, un reto, un «¿qué prefieres?»...',
    'A medida que avanza la partida, las tarjetas se vuelven más intensas. Las preguntas de las casillas especiales también siguen ese avance.',
    textoPases,
  ];
}

// Los tipos de tarjeta que salen en el modo, explicados (solo los que de verdad hay en sus mazos)
export function lineasTiposTarjeta(modo: Modo): string[] {
  let tipos: Set<TipoTarjeta>;
  let interacciones: Set<string>;
  if (modo === 'cartas') {
    tipos = new Set([...TIPOS_PREGUNTA, ...TIPOS_JUEGO, ...TIPOS_RETO]);
    interacciones = new Set();
  } else {
    const mazo = tarjetasDeModo(modo === 'dado' ? 'aleatorio' : modo, NIVELES);
    tipos = new Set(mazo.map((t) => t.tipo));
    interacciones = new Set(mazo.map((t) => interaccionDe(t).tipo));
  }
  const lineas: string[] = [];
  if (tipos.has('prefieres') || tipos.has('yoNunca') || tipos.has('completa')) {
    lineas.push('Elegir y escribir: «¿qué prefieres?», «yo nunca» y frases para completar. Lo escrito se puede compartir en el resumen.');
  }
  if (tipos.has('adivina')) {
    lineas.push('Adivinar: una persona responde en secreto, pasa el móvil y la otra intenta acertar.');
  }
  if (tipos.has('dosVerdades')) {
    lineas.push('Dos verdades y una mentira: tu pareja tiene que encontrar la mentira.');
  }
  if (tipos.has('semaforo')) {
    lineas.push('Semáforo: cada uno marca verde, amarillo o rojo sin ver al otro. Un rojo siempre se respeta.');
  }
  if (tipos.has('debate')) {
    lineas.push('Debate: cada uno vota si está de acuerdo y luego se revela.');
  }
  if (tipos.has('reto')) {
    lineas.push(
      interacciones.has('temporizador')
        ? 'Retos: algunos llevan cuenta atrás.'
        : 'Retos: los cumples o los pasas.',
    );
  }
  if (interacciones.has('escala')) {
    lineas.push('Escalas: respondes del 1 al 10.');
  }
  return lineas;
}

// Los modos que se enseñan en el resumen (sin el contenido +18 si está oculto)
export const ORDEN_MODOS: Modo[] = ['basico', 'personal', 'caliente', 'infierno', 'aleatorio', 'dado', 'cartas'];

export function modosVisibles(ocultarPicante: boolean): Modo[] {
  return ORDEN_MODOS.filter((m) => !(ocultarPicante && (m === 'caliente' || m === 'infierno')));
}

// Lee el modo que llega por la ruta; si no es válido, no hay modo (se enseña el resumen)
export function leerModoReglas(texto: string | undefined): Modo | null {
  return texto && (ORDEN_MODOS as string[]).includes(texto) ? (texto as Modo) : null;
}
