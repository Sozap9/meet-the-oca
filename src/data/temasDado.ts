import type { Categoria } from './tarjetas';

// Los temas del Dado de temas: cada uno junta categorías de los mazos Básico, Personal y Caliente,
// así las tarjetas son las mismas que en el tablero y suben de intensidad igual.
export type IdTema =
  | 'gustos'
  | 'ysi'
  | 'risas'
  | 'infancia'
  | 'suenos'
  | 'teveo'
  | 'deseos'
  | 'picante'
  | 'retos';

export interface Tema {
  id: IdTema;
  nombre: string;
  color: string; // color de la cara del dado y de la cabecera de la tarjeta
  mazo: 'básico' | 'personal' | 'caliente';
  categorias: Categoria[];
}

export const TEMAS_DADO: Tema[] = [
  { id: 'gustos', nombre: 'Gustos', color: '#F7D23E', mazo: 'básico', categorias: ['gustos', 'comida'] },
  { id: 'ysi', nombre: '¿Y si…?', color: '#B9E4F4', mazo: 'básico', categorias: ['hipoteticas', 'prefieres'] },
  { id: 'risas', nombre: 'Risas', color: '#F28C6B', mazo: 'básico', categorias: ['humor', 'rutinas', 'viajes'] },
  { id: 'infancia', nombre: 'Infancia', color: '#9BE3D0', mazo: 'personal', categorias: ['infancia', 'recuerdos'] },
  { id: 'suenos', nombre: 'Sueños', color: '#C9B6F2', mazo: 'personal', categorias: ['futuro', 'valores'] },
  {
    id: 'teveo',
    nombre: 'Cómo te veo',
    color: '#7FC8F8',
    mazo: 'personal',
    categorias: ['percepcion', 'amistades', 'miedos', 'delicados'],
  },
  { id: 'deseos', nombre: 'Deseos', color: '#FF8FB1', mazo: 'caliente', categorias: ['deseos', 'fantasias'] },
  {
    id: 'picante',
    nombre: 'Picante',
    color: '#FF6B4A',
    mazo: 'caliente',
    categorias: ['atraccion', 'coqueteo', 'experiencias', 'libre'],
  },
  { id: 'retos', nombre: 'Retos', color: '#FFC94A', mazo: 'caliente', categorias: ['cercania', 'citas'] },
];

export const MINIMO_TEMAS = 3;
// Por defecto, todos los temas
export const TEMAS_POR_DEFECTO: IdTema[] = TEMAS_DADO.map((t) => t.id);

// Lee los temas de la ruta ("gustos,risas,deseos"); si son menos de 3, los de por defecto
export function leerTemas(texto: string | undefined): Tema[] {
  const ids = (texto ?? '').split(',');
  const elegidos = TEMAS_DADO.filter((t) => ids.includes(t.id));
  return elegidos.length >= MINIMO_TEMAS
    ? elegidos
    : TEMAS_DADO.filter((t) => TEMAS_POR_DEFECTO.includes(t.id));
}

// Las 6 caras del cubo para una tirada: la cara que queda arriba lleva el tema que ha salido
// y el resto se rellenan con los demás temas elegidos (repitiendo si hay menos de 6).
export function carasParaTirada(elegidos: Tema[], salido: Tema, caraArriba: number): Tema[] {
  const otros = elegidos.filter((t) => t.id !== salido.id);
  const relleno = otros.length > 0 ? otros : [salido];
  const caras: Tema[] = [];
  let j = 0;
  for (let i = 0; i < 6; i++) {
    if (i === caraArriba - 1) caras.push(salido);
    else caras.push(relleno[j++ % relleno.length]);
  }
  return caras;
}
