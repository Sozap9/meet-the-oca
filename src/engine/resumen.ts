import type { Tarjeta } from '../data/tarjetas';
import type { Jugador } from './juego';

export interface Entrada {
  jugador: number; // quién recibió la tarjeta
  tarjeta: Tarjeta;
  resultado: 'hecha' | 'pasada';
  respuesta?: string; // lo que eligió o escribió, si lo compartió
  acierto?: boolean; // solo en las tarjetas de adivinar
}

export interface Resumen {
  porJugador: { nombre: string; color: string; hechas: number; pasadas: number }[];
  hechas: Entrada[];
  totalHechas: number;
  totalPasadas: number;
  sintonia: { aciertos: number; total: number } | null;
}

export function textoTarjeta(tarjeta: Tarjeta): string {
  return tarjeta.opciones ? `${tarjeta.opciones[0]} o ${tarjeta.opciones[1]}` : tarjeta.texto;
}

export function resumir(historial: Entrada[], jugadores: Jugador[]): Resumen {
  const hechas = historial.filter((e) => e.resultado === 'hecha');
  const conAdivinanza = historial.filter((e) => e.acierto !== undefined);
  return {
    porJugador: jugadores.map((j, i) => ({
      nombre: j.nombre,
      color: j.color,
      hechas: historial.filter((e) => e.jugador === i && e.resultado === 'hecha').length,
      pasadas: historial.filter((e) => e.jugador === i && e.resultado === 'pasada').length,
    })),
    hechas,
    totalHechas: hechas.length,
    totalPasadas: historial.length - hechas.length,
    sintonia:
      conAdivinanza.length > 0
        ? { aciertos: conAdivinanza.filter((e) => e.acierto).length, total: conAdivinanza.length }
        : null,
  };
}