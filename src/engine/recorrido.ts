import { TOTAL_CASILLAS } from '../data/board';
import type { Evento } from './juego';

// Una casilla por la que pasa la ficha: caminando, o saltando de golpe a otra
export interface Paso {
  posicion: number;
  tipo: 'paso' | 'salto';
}

// Convierte lo ocurrido en una tirada en el recorrido de la ficha de un jugador
export function rutaDeEventos(eventos: Evento[], jugador: number): Paso[] {
  const pasos: Paso[] = [];
  for (const evento of eventos) {
    if (evento.jugador !== jugador) continue;

    if (evento.tipo === 'mueve') {
      const tope = Math.min(evento.desde + evento.valor, TOTAL_CASILLAS);
      for (let p = evento.desde + 1; p <= tope; p++) pasos.push({ posicion: p, tipo: 'paso' });
      if (evento.rebota) {
        // Llega al 63 y vuelve hacia atrás casilla a casilla
        for (let p = TOTAL_CASILLAS - 1; p >= evento.hasta; p--) {
          pasos.push({ posicion: p, tipo: 'paso' });
        }
      }
    } else if (evento.tipo === 'salto' || evento.tipo === 'retrocede') {
      pasos.push({ posicion: evento.hasta, tipo: 'salto' });
    }
  }
  return pasos;
}