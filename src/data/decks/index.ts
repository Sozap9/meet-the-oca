import type { Modo } from '../modos';
import { mazoEnJuego, mazosActuales } from '../mazosPersonales';
import type { Categoria, Tarjeta } from '../tarjetas';
import { BASICO } from './basico';
import { CALIENTE } from './caliente';
import { DADO } from './dado';
import { INFIERNO } from './infierno';
import { PERSONAL } from './personal';

// Los niveles de intensidad. El modo aleatorio mezcla los que se elijan entre los tres primeros;
// Infierno solo se juega desde Caliente
export type Nivel = Exclude<Modo, 'aleatorio' | 'dado' | 'cartas'>;
export const NIVELES: Nivel[] = ['basico', 'personal', 'caliente'];

// Los mazos tal y como vienen de fábrica
export const MAZOS: Record<Nivel, Tarjeta[]> = {
  basico: BASICO,
  personal: PERSONAL,
  caliente: CALIENTE,
  infierno: INFIERNO,
};

export function tarjetasDeModo(modo: Modo, niveles: Nivel[] = NIVELES): Tarjeta[] {
  if (modo === 'dado') return DADO;
  if (modo === 'aleatorio' || modo === 'cartas') {
    const elegidos = niveles.length > 0 ? niveles : NIVELES;
    return elegidos.flatMap((nivel) => mazoDeNivel(nivel));
  }
  return mazoDeNivel(modo);
}

// Un mazo con los cambios de Ajustes > Mazos (tarjetas desactivadas y propias)
export function mazoDeNivel(nivel: Nivel): Tarjeta[] {
  return mazoEnJuego(nivel, MAZOS[nivel], mazosActuales());
}

// Las categorías de un mazo, en el orden en que aparecen
export function categoriasDeMazo(nivel: Nivel): Categoria[] {
  const lista: Categoria[] = [];
  for (const t of MAZOS[nivel]) {
    if (t.categoria && !lista.includes(t.categoria)) lista.push(t.categoria);
  }
  return lista;
}

// Lee los niveles que llegan por la ruta ("basico,personal"); si no hay, todos
// Todos los mazos que se pueden mezclar (Infierno solo si se elige a propósito)
export const TODOS_LOS_MAZOS: Nivel[] = [...NIVELES, 'infierno'];

export function leerNiveles(texto: string | undefined): Nivel[] {
  if (!texto) return NIVELES;
  const lista = texto
    .split(',')
    .filter((n): n is Nivel => (TODOS_LOS_MAZOS as string[]).includes(n));
  return lista.length > 0 ? lista : NIVELES;
}