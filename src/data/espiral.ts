import { TOTAL_CASILLAS } from './board';

export const COLUMNAS = 8;
export const FILAS = 11;

// Hueco libre del centro, medido en casillas (para la imagen central)
export const AREA_CENTRAL = { fila: 2, columna: 2, filas: 6, columnas: 4 };

export interface Posicion {
  fila: number;
  columna: number;
}

// Recorre la cuadrícula en espiral hacia dentro, empezando abajo a la izquierda,
// y se detiene cuando ha colocado todas las casillas.
export function calcularEspiral(
  columnas: number,
  filas: number,
  total: number,
): Posicion[] {
  const visitadas = Array.from({ length: filas }, () =>
    Array<boolean>(columnas).fill(false),
  );
  // derecha, arriba, izquierda, abajo
  const direcciones = [
    { df: 0, dc: 1 },
    { df: -1, dc: 0 },
    { df: 0, dc: -1 },
    { df: 1, dc: 0 },
  ];
  const posiciones: Posicion[] = [];
  let fila = filas - 1;
  let columna = 0;
  let d = 0;

  for (let i = 0; i < total; i++) {
    posiciones.push({ fila, columna });
    visitadas[fila][columna] = true;

    let siguienteFila = fila + direcciones[d].df;
    let siguienteColumna = columna + direcciones[d].dc;
    const bloqueada =
      siguienteFila < 0 ||
      siguienteFila >= filas ||
      siguienteColumna < 0 ||
      siguienteColumna >= columnas ||
      visitadas[siguienteFila][siguienteColumna];

    if (bloqueada) {
      d = (d + 1) % 4;
      siguienteFila = fila + direcciones[d].df;
      siguienteColumna = columna + direcciones[d].dc;
    }
    fila = siguienteFila;
    columna = siguienteColumna;
  }
  return posiciones;
}

// POSICIONES[n] es la posición de la casilla n; la 0 es la salida
export const POSICIONES = calcularEspiral(COLUMNAS, FILAS, TOTAL_CASILLAS + 1);