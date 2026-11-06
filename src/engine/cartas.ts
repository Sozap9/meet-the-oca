import type { CartaJuego } from '../data/cartasModo';
import { TAM_MANO } from '../data/cartasModo';

// ---------- Partida del modo Cartas ----------
// Cada persona tiene una mano. En su turno juega una carta; después roba una del mazo.
// No hay ganador: es un juego de preguntas por rondas. Cuando se acaba el mazo se siguen
// jugando las manos, y la partida termina cuando ya no le quedan cartas a nadie.

export interface EstadoCartas {
  mazo: CartaJuego[];
  manos: CartaJuego[][];
  pila: CartaJuego[]; // las cartas jugadas, la última al final
  turno: number;
  saltar: boolean[]; // pierde su próximo turno
  doble: boolean; // la próxima tarjeta la responden los dos
  ronda: number; // empieza en 1 y sube cuando el turno vuelve a la primera persona
  terminada: boolean;
}

export function repartir(mazo: CartaJuego[], jugadores = 2, tam = TAM_MANO): EstadoCartas {
  const resto = [...mazo];
  const manos = Array.from({ length: jugadores }, () => [] as CartaJuego[]);
  for (let r = 0; r < tam; r++) for (const mano of manos) if (resto.length) mano.push(resto.shift()!);
  return { mazo: resto, manos, pila: [], turno: 0, saltar: manos.map(() => false), doble: false, ronda: 1, terminada: false };
}

const otroDe = (estado: EstadoCartas, j: number) => (j + 1) % estado.manos.length;

function robar(estado: EstadoCartas, jugador: number, n: number): EstadoCartas {
  const mazo = [...estado.mazo];
  const cogidas = mazo.splice(0, n);
  return {
    ...estado,
    mazo,
    manos: estado.manos.map((m, i) => (i === jugador ? [...m, ...cogidas] : m)),
  };
}

// Saca una carta de la mano y la pone en la pila. Si es especial, aplica su efecto.
// "consumirDoble" indica si esta tarjeta la responden los dos (y se gasta el doble).
export function jugarCarta(
  estado: EstadoCartas,
  jugador: number,
  idCarta: number,
  azar: () => number = Math.random,
): { estado: EstadoCartas; carta: CartaJuego | null; responderDos: boolean } {
  const carta = estado.manos[jugador].find((c) => c.id === idCarta) ?? null;
  if (!carta || estado.terminada) return { estado, carta: null, responderDos: false };
  let nuevo: EstadoCartas = {
    ...estado,
    manos: estado.manos.map((m, i) => (i === jugador ? m.filter((c) => c.id !== idCarta) : m)),
    pila: [...estado.pila, carta],
  };
  const otro = otroDe(estado, jugador);
  let responderDos = false;

  if (carta.tipo === 'tarjeta') {
    if (nuevo.doble) {
      responderDos = true;
      nuevo = { ...nuevo, doble: false };
    }
  } else {
    switch (carta.especial) {
      case 'robaDos':
        nuevo = robar(nuevo, otro, 2);
        break;
      case 'salta':
        nuevo = { ...nuevo, saltar: nuevo.saltar.map((s, i) => (i === otro ? true : s)) };
        break;
      case 'doble':
        nuevo = { ...nuevo, doble: true };
        break;
      case 'intercambio': {
        const suya = nuevo.manos[otro];
        if (suya.length > 0) {
          const elegida = suya[Math.floor(azar() * suya.length)];
          nuevo = {
            ...nuevo,
            manos: nuevo.manos.map((m, i) =>
              i === otro ? m.filter((c) => c.id !== elegida.id) : i === jugador ? [...m, elegida] : m,
            ),
          };
        }
        break;
      }
      default:
        break; // libre, devuelvo y comodín no cambian la mesa
    }
  }
  return { estado: nuevo, carta, responderDos };
}

// Usa una carta guardada (Te la devuelvo o Comodín) en respuesta a otra: va a la pila sin gastar turno
export function usarGuardada(estado: EstadoCartas, jugador: number, idCarta: number): EstadoCartas {
  const carta = estado.manos[jugador].find((c) => c.id === idCarta);
  if (!carta) return estado;
  return {
    ...estado,
    manos: estado.manos.map((m, i) => (i === jugador ? m.filter((c) => c.id !== idCarta) : m)),
    pila: [...estado.pila, carta],
  };
}

// Termina el turno: quien ha jugado roba una carta (si queda mazo) y pasa el turno.
// La partida acaba cuando no quedan cartas ni en el mazo ni en ninguna mano.
export function terminarTurno(estado: EstadoCartas, jugador: number): EstadoCartas {
  let nuevo = estado.mazo.length > 0 ? robar(estado, jugador, 1) : estado;
  if (nuevo.mazo.length === 0 && nuevo.manos.every((m) => m.length === 0)) return { ...nuevo, terminada: true };

  // Empieza ronda nueva cuando el turno vuelve a la primera persona o alguien repite
  const pasarA = (siguiente: number): EstadoCartas => ({
    ...nuevo,
    turno: siguiente,
    ronda: siguiente === 0 || siguiente === jugador ? nuevo.ronda + 1 : nuevo.ronda,
  });

  const otro = otroDe(nuevo, jugador);
  if (nuevo.saltar[otro]) {
    // pierde el turno: vuelve a jugar quien ha jugado
    nuevo = { ...nuevo, saltar: nuevo.saltar.map((s, i) => (i === otro ? false : s)) };
    return nuevo.manos[jugador].length > 0 ? pasarA(jugador) : pasarA(otro);
  }
  // Si le han dejado sin cartas y aún queda mazo, roba una para poder jugar
  if (nuevo.manos[otro].length === 0 && nuevo.mazo.length > 0) nuevo = robar(nuevo, otro, 1);
  // Sin mazo y sin cartas en la mano, no puede jugar: sigue quien aún tiene
  if (nuevo.manos[otro].length === 0) return pasarA(jugador);
  return pasarA(otro);
}
