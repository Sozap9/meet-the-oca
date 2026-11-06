import type { Categoria } from './tarjetas';

export interface CategoriaDado {
  nombre: string;
  color: string; // color de la cara del dado y de la cabecera de la tarjeta
  textoCabecera: string; // color del texto sobre ese color
  categoria: Categoria;
}

// La cara 1 del dado es la primera de la lista, la 2 la segunda, etc.
export const CATEGORIAS_DADO: CategoriaDado[] = [
  { nombre: 'Ligeras', color: '#F7D23E', textoCabecera: '#151515', categoria: 'ligeras' },
  { nombre: 'Futuro', color: '#B9E4F4', textoCabecera: '#151515', categoria: 'futuro' },
  { nombre: 'Reflexiones', color: '#C9B6F2', textoCabecera: '#151515', categoria: 'reflexiones' },
  { nombre: 'Confesiones', color: '#F28C6B', textoCabecera: '#151515', categoria: 'confesiones' },
  { nombre: 'Íntimo', color: '#FF8FB1', textoCabecera: '#151515', categoria: 'intimo' },
  { nombre: 'Retos', color: '#E2452B', textoCabecera: '#151515', categoria: 'retos' },
];

export const DURACIONES = [
  { nombre: 'Rápido', tiradas: 8 },
  { nombre: 'Normal', tiradas: 15 },
  { nombre: 'Largo', tiradas: 20 },
];

// Lee el número de tiradas que llega por la ruta; por defecto, la normal
export function leerRondas(texto: string | undefined): number {
  const n = Number(texto);
  return DURACIONES.some((d) => d.tiradas === n) ? n : 15;
}