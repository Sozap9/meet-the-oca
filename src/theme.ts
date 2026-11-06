import { PALETAS, COLORES_FICHA, colorDeCasilla } from './diseno';
import type { TipoCasilla } from './data/board';

// Colores de las casillas en el modo básico (cada modo tiene los suyos: ver diseno.ts)
export const COLORES_CASILLA: Record<TipoCasilla, string> = {
  normal: colorDeCasilla('normal', PALETAS.basico),
  oca: colorDeCasilla('oca', PALETAS.basico),
  puente: colorDeCasilla('puente', PALETAS.basico),
  dados: colorDeCasilla('dados', PALETAS.basico),
  espejo: colorDeCasilla('espejo', PALETAS.basico),
  libre: colorDeCasilla('libre', PALETAS.basico),
  cambio: colorDeCasilla('cambio', PALETAS.basico),
  posada: colorDeCasilla('posada', PALETAS.basico),
  pozo: colorDeCasilla('pozo', PALETAS.basico),
  laberinto: colorDeCasilla('laberinto', PALETAS.basico),
  carcel: colorDeCasilla('carcel', PALETAS.basico),
  calavera: colorDeCasilla('calavera', PALETAS.basico),
  jardin: colorDeCasilla('jardin', PALETAS.basico),
};

export const REDONDEO_CASILLA = 0.3; // proporción del lado; 0.5 = círculo
export const COLORES_JUGADOR = COLORES_FICHA;
