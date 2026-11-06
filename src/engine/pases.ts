export const PASES_INICIALES = 3;

export function crearPases(jugadores: number, cantidad: number = PASES_INICIALES): number[] {
  return Array.from({ length: jugadores }, () => cantidad);
}

export function gastarPase(pases: number[], jugador: number): number[] {
  if (pases[jugador] <= 0) return pases;
  return pases.map((n, i) => (i === jugador ? n - 1 : n));
}

export function darPase(pases: number[], jugador: number): number[] {
  return pases.map((n, i) => (i === jugador ? n + 1 : n));
}