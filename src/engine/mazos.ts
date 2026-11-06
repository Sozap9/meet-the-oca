import { TOTAL_CASILLAS } from '../data/board';
import type { TipoCasilla } from '../data/board';
import type { Categoria, Intensidad, Tarjeta, TipoTarjeta } from '../data/tarjetas';
import type { Jugador } from './juego';

// Qué tipos de tarjeta salen en cada situación
export const TIPOS_LIGERA: TipoTarjeta[] = ['pregunta', 'prefieres', 'completa'];
export const TIPOS_VERDAD: TipoTarjeta[] = [
  'pregunta',
  'recuerdo',
  'plan',
  'completa',
  'yoNunca',
  'adivina',
  'dosVerdades',
  'semaforo',
  'debate',
];
export const TIPOS_RETO: TipoTarjeta[] = ['reto'];

// Cartas que se responden hablando: las que piden las casillas especiales ("contesta una pregunta")
export const TIPOS_HABLAR: TipoTarjeta[] = ['pregunta', 'completa', 'recuerdo', 'plan'];

// Tarjetas con mecánica de dos personas: salen menos en las casillas normales
export const TIPOS_MECANICA: TipoTarjeta[] = ['adivina', 'semaforo', 'debate', 'dosVerdades'];
export const PROBABILIDAD_MECANICA = 0.25;

// Los castigos (cárcel, duelo, cuerda) piden un nivel más de lo que toca por la posición
export function subirNivel(intensidad: Intensidad): Intensidad {
  return Math.min(3, intensidad + 1) as Intensidad;
}

// Qué ocurre al caer en cada casilla (null = nada especial)
export type ClaseCasilla =
  | 'cualquiera'
  | 'ligera'
  | 'verdadOReto'
  | 'dados'
  | 'espejo'
  | 'libre'
  | 'cambio'
  | 'posada'
  | 'carcel';

export function claseDeCasilla(tipo: TipoCasilla): ClaseCasilla | null {
  switch (tipo) {
    case 'normal':
      return 'cualquiera';
    case 'oca':
      return 'ligera';
    case 'puente':
      return 'verdadOReto';
    case 'dados':
      return 'dados';
    case 'espejo':
      return 'espejo';
    case 'libre':
      return 'libre';
    case 'cambio':
      return 'cambio';
    case 'posada':
      return 'posada';
    case 'carcel':
      return 'carcel';
    default:
      return null;
  }
}

function porTercios(avance: number): Intensidad {
  if (avance < 1 / 3) return 1;
  if (avance < 2 / 3) return 2;
  return 3;
}

// La intensidad que toca según lo avanzada que va la partida (la ficha más adelantada)
export function intensidadSegunProgreso(jugadores: Jugador[]): Intensidad {
  return porTercios(Math.max(0, ...jugadores.map((j) => j.posicion)) / TOTAL_CASILLAS);
}

// La intensidad según la tirada en la que va el modo del dado
export function intensidadSegunRonda(completadas: number, total: number): Intensidad {
  return porTercios(completadas / total);
}

function barajar<T>(lista: T[], azar: () => number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export interface Baraja {
  robar(tipos?: TipoTarjeta[], intensidad?: Intensidad, categoria?: Categoria): Tarjeta | null;
}

// Mazo barajado que no repite tarjetas hasta agotarlas. Al robar prefiere la
// intensidad pedida (o la más cercana) y evita repetir tipo y categoría seguidos.
// Memoria entre partidas: qué tarjetas han salido hace poco y qué hacer al robar una
export interface Memoria {
  reciente?: (t: Tarjeta) => boolean;
  alRobar?: (t: Tarjeta) => void;
}

export function crearBaraja(
  tarjetas: Tarjeta[],
  azar: () => number = Math.random,
  memoria: Memoria = {},
): Baraja {
  let pendientes = barajar(tarjetas, azar);
  let ultimoTipo: TipoTarjeta | null = null;
  let ultimaCategoria: Categoria | undefined;

  const coincide = (t: Tarjeta, tipos?: TipoTarjeta[], categoria?: Categoria) =>
    (!tipos || tipos.includes(t.tipo)) && (!categoria || t.categoria === categoria);

  // Posición de la mejor tarjeta: primero la intensidad más cercana, luego menos repeticiones
  const elegir = (tipos?: TipoTarjeta[], intensidad?: Intensidad, categoria?: Categoria): number => {
    let mejor = -1;
    let mejorDistancia = Infinity;
    let mejorRepeticiones = Infinity;
    let mejorVista = Infinity;

    for (let i = 0; i < pendientes.length; i++) {
      const t = pendientes[i];
      if (!coincide(t, tipos, categoria)) continue;
      const distancia = intensidad === undefined ? 0 : Math.abs((t.intensidad ?? 2) - intensidad);
      const repeticiones =
        (t.tipo === ultimoTipo ? 1 : 0) +
        (t.categoria !== undefined && t.categoria === ultimaCategoria ? 1 : 0);
      // Primero la intensidad; luego, las que no han salido hace poco; luego, no repetir tipo ni tema
      const vista = memoria.reciente?.(t) ? 1 : 0;
      if (
        distancia < mejorDistancia ||
        (distancia === mejorDistancia && vista < mejorVista) ||
        (distancia === mejorDistancia && vista === mejorVista && repeticiones < mejorRepeticiones)
      ) {
        mejor = i;
        mejorDistancia = distancia;
        mejorVista = vista;
        mejorRepeticiones = repeticiones;
      }
    }
    return mejor;
  };

  return {
    robar(tipos, intensidad, categoria) {
      let i = elegir(tipos, intensidad, categoria);
      if (i === -1) {
        pendientes = barajar(tarjetas, azar); // se agotó: se vuelve a barajar
        i = elegir(tipos, intensidad, categoria);
        if (i === -1) return null; // no hay tarjetas de ese tipo o categoría
      }
      const [tarjeta] = pendientes.splice(i, 1);
      ultimoTipo = tarjeta.tipo;
      ultimaCategoria = tarjeta.categoria;
      memoria.alRobar?.(tarjeta);
      return tarjeta;
    },
  };
}