import { TABLERO, TOTAL_CASILLAS } from '../data/board';
import type { Casilla } from '../data/board';

export interface Jugador {
  id: number;
  nombre: string;
  color: string;
  posicion: number; // 0 = aún no ha salido; 1-63 = casilla
  turnosPerdidos: number; // turnos que aún tiene que perder
  enPozo: boolean;
  turnosPozo: number | null; // turnos que le quedan dentro del pozo; null = hasta que le pasen
}

export type TipoSalto = 'laberinto' | 'calavera';

// Lo que ocurre durante una tirada (la interfaz decide cómo contarlo)
export type Evento =
  | { tipo: 'mueve'; jugador: number; desde: number; hasta: number; valor: number; rebota: boolean }
  | { tipo: 'salto'; jugador: number; casilla: TipoSalto; desde: number; hasta: number }
  | { tipo: 'oca'; jugador: number }
  | { tipo: 'verdadReto'; jugador: number }
  | { tipo: 'dados'; jugador: number }
  | { tipo: 'espejo'; jugador: number }
  | { tipo: 'libre'; jugador: number }
  | { tipo: 'cambio'; jugador: number }
  | { tipo: 'intercambio'; jugador: number; con: number; desde: number; hasta: number }
  | { tipo: 'tiraOtraVez'; jugador: number }
  | { tipo: 'pierdeTurnos'; jugador: number; casilla: 'posada' | 'carcel'; turnos: number }
  | { tipo: 'pagaPenalizacion'; jugador: number; casilla: 'posada' | 'carcel' }
  | {
      tipo: 'pozo';
      jugador: number;
      resultado: 'atrapado' | 'condena' | 'rescate';
      liberado: number | null;
    }
  | { tipo: 'salePozo'; jugador: number; por: number }
  | { tipo: 'cuerda'; jugador: number; por: number }
  | { tipo: 'retrocede'; jugador: number; desde: number; hasta: number }
  | { tipo: 'saltaTurno'; jugador: number; motivo: 'pozo' | 'penalizacion' }
  | { tipo: 'gana'; jugador: number };

export interface Tirada {
  jugador: number; // índice del jugador que tiró
  valor: number;
}

export interface EstadoJuego {
  jugadores: Jugador[];
  turno: number; // índice del jugador al que le toca
  ultimaTirada: Tirada | null;
  eventos: Evento[]; // lo ocurrido en la última tirada
  ganador: number | null;
  tablero?: Casilla[]; // el de esta partida; si no hay, el clásico
}

// El tablero con el que se juega la partida
export function tableroDe(estado: EstadoJuego): Casilla[] {
  return estado.tablero ?? TABLERO;
}

export function crearJuego(
  participantes: { nombre: string; color: string }[],
  tablero: Casilla[] = TABLERO,
): EstadoJuego {
  return {
    jugadores: participantes.map((p, id) => ({
      id,
      ...p,
      posicion: 0,
      turnosPerdidos: 0,
      enPozo: false,
      turnosPozo: null,
    })),
    turno: 0,
    ultimaTirada: null,
    eventos: [],
    ganador: null,
    tablero,
  };
}

export function tirarDado(): number {
  return Math.floor(Math.random() * 6) + 1;
}

const TURNOS_POZO_ADELANTADO = 3; // si la otra persona ya va por delante

// Pasa al siguiente jugador que pueda jugar, saltando penalizaciones y pozo
function pasarTurno(jugadores: Jugador[], actual: number, eventos: Evento[]): number {
  let siguiente = actual;
  for (let i = 0; i < jugadores.length * 6; i++) {
    siguiente = (siguiente + 1) % jugadores.length;
    const jugador = jugadores[siguiente];
    if (jugador.enPozo) {
      eventos.push({ tipo: 'saltaTurno', jugador: siguiente, motivo: 'pozo' });
      if (jugador.turnosPozo !== null) {
        jugador.turnosPozo -= 1;
        if (jugador.turnosPozo <= 0) {
          jugador.enPozo = false;
          jugador.turnosPozo = null;
        }
      }
      continue;
    }
    if (jugador.turnosPerdidos > 0) {
      jugador.turnosPerdidos -= 1;
      eventos.push({ tipo: 'saltaTurno', jugador: siguiente, motivo: 'penalizacion' });
      continue;
    }
    return siguiente;
  }
  return actual;
}

// Resuelve una tirada del jugador al que le toca. No modifica el estado recibido.
export function aplicarTirada(estado: EstadoJuego, valor: number): EstadoJuego {
  if (estado.ganador !== null) return estado;
  const tablero = tableroDe(estado);
  const casillaPozo = tablero.find((c) => c.tipo === 'pozo')?.numero ?? Infinity;

  const jugadores = estado.jugadores.map((j) => ({ ...j }));
  const eventos: Evento[] = [];
  const indice = estado.turno;
  const jugador = jugadores[indice];
  let ganador: number | null = null;
  let turnoExtra = false;

  const saltarA = (casilla: TipoSalto, hasta: number) => {
    eventos.push({ tipo: 'salto', jugador: indice, casilla, desde: jugador.posicion, hasta });
    jugador.posicion = hasta;
  };

  // 1. Avance, con rebote si se pasa del jardín
  const desde = jugador.posicion;
  const objetivo = desde + valor;
  const rebota = objetivo > TOTAL_CASILLAS;
  jugador.posicion = rebota ? 2 * TOTAL_CASILLAS - objetivo : objetivo;
  eventos.push({ tipo: 'mueve', jugador: indice, desde, hasta: jugador.posicion, valor, rebota });

  // 2. Pasar por delante del pozo libera a quien esté atrapado hasta que le pasen
  if (jugador.posicion > casillaPozo) {
    jugadores.forEach((otro, i) => {
      if (i !== indice && otro.enPozo && otro.turnosPozo === null) {
        otro.enPozo = false;
        eventos.push({ tipo: 'salePozo', jugador: i, por: indice });
      }
    });
  }

  // 3. Efecto de la casilla en la que cae
  const casilla = tablero[jugador.posicion - 1];
  switch (casilla.tipo) {
    case 'jardin':
      ganador = indice;
      break;
    case 'oca':
      eventos.push({ tipo: 'oca', jugador: indice });
      turnoExtra = true;
      break;
    case 'puente':
      eventos.push({ tipo: 'verdadReto', jugador: indice });
      break;
    case 'dados':
      eventos.push({ tipo: 'dados', jugador: indice });
      break;
    case 'espejo':
    case 'libre':
    case 'cambio':
      eventos.push({ tipo: casilla.tipo, jugador: indice });
      break;
    case 'laberinto':
    case 'calavera':
      saltarA(casilla.tipo, casilla.destino ?? casilla.numero);
      break;
    case 'posada':
      jugador.turnosPerdidos = 1;
      eventos.push({ tipo: 'pierdeTurnos', jugador: indice, casilla: 'posada', turnos: 1 });
      break;
    case 'carcel':
      jugador.turnosPerdidos = 2;
      eventos.push({ tipo: 'pierdeTurnos', jugador: indice, casilla: 'carcel', turnos: 2 });
      break;
    case 'pozo': {
      const preso = jugadores.findIndex((j, i) => i !== indice && j.enPozo);
      if (preso >= 0) {
        // Caer justo donde hay alguien atrapado lo rescata
        jugadores[preso].enPozo = false;
        jugadores[preso].turnosPozo = null;
        eventos.push({ tipo: 'pozo', jugador: indice, resultado: 'rescate', liberado: preso });
      } else if (jugadores.some((j, i) => i !== indice && j.posicion > casilla.numero)) {
        // Si la otra persona ya va por delante, nadie puede pasarte: te quedas dentro unos turnos
        jugador.enPozo = true;
        jugador.turnosPozo = TURNOS_POZO_ADELANTADO;
        eventos.push({ tipo: 'pozo', jugador: indice, resultado: 'condena', liberado: null });
      } else {
        jugador.enPozo = true;
        jugador.turnosPozo = null;
        eventos.push({ tipo: 'pozo', jugador: indice, resultado: 'atrapado', liberado: null });
      }
      break;
    }
    default:
      break;
  }

  // 4. Siguiente turno
  let turno = indice;
  if (ganador !== null) {
    eventos.push({ tipo: 'gana', jugador: ganador });
  } else if (turnoExtra) {
    eventos.push({ tipo: 'tiraOtraVez', jugador: indice });
  } else {
    turno = pasarTurno(jugadores, indice, eventos);
  }

  return {
    jugadores,
    turno,
    ultimaTirada: { jugador: indice, valor },
    eventos,
    ganador,
    tablero: estado.tablero,
  };
}

// ---------- Decisiones que se toman después de caer en una casilla ----------

// Quien paga la posada o la fianza no pierde los turnos
export function liberarPenalizacion(
  estado: EstadoJuego,
  indice: number,
  casilla: 'posada' | 'carcel',
): EstadoJuego {
  return {
    ...estado,
    jugadores: estado.jugadores.map((j, i) => (i === indice ? { ...j, turnosPerdidos: 0 } : j)),
    eventos: [...estado.eventos, { tipo: 'pagaPenalizacion', jugador: indice, casilla }],
  };
}

// Retrocede casillas (sin bajar de la salida), como en la apuesta de los dados
export function retroceder(estado: EstadoJuego, indice: number, casillas: number): EstadoJuego {
  const desde = estado.jugadores[indice].posicion;
  const hasta = Math.max(0, desde - casillas);
  return {
    ...estado,
    jugadores: estado.jugadores.map((j, i) => (i === indice ? { ...j, posicion: hasta } : j)),
    eventos: [...estado.eventos, { tipo: 'retrocede', jugador: indice, desde, hasta }],
  };
}

// La cuerda: otra persona saca a quien está en el pozo, tenga el tiempo que tenga que pasar
export function rescatarDelPozo(estado: EstadoJuego, preso: number, por: number): EstadoJuego {
  return {
    ...estado,
    jugadores: estado.jugadores.map((j, i) =>
      i === preso ? { ...j, enPozo: false, turnosPozo: null } : j,
    ),
    eventos: [...estado.eventos, { tipo: 'cuerda', jugador: preso, por }],
  };
}
// Cambio: dos jugadores intercambian sus fichas. No se aplica el efecto de las casillas
// a las que llegan (solo se mueven), para que el cambio no encadene castigos.
export function intercambiarPosiciones(
  estado: EstadoJuego,
  indice: number,
  con: number,
): EstadoJuego {
  const desde = estado.jugadores[indice].posicion;
  const hasta = estado.jugadores[con].posicion;
  return {
    ...estado,
    jugadores: estado.jugadores.map((j, i) => {
      if (i === indice) return { ...j, posicion: hasta };
      if (i === con) return { ...j, posicion: desde };
      return j;
    }),
    eventos: [...estado.eventos, { tipo: 'intercambio', jugador: indice, con, desde, hasta }],
  };
}
