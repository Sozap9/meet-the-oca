import { TABLERO, TOTAL_CASILLAS } from './board';
import type { Casilla } from './board';
import type { TipoCasilla } from './board';
import { POSICIONES } from './espiral';

// Geometría del tablero en espiral: una banda ondulada que une todas las casillas
// (cada casilla es una "cuenta" que se ensancha en el centro y se estrecha en los bordes)
// y que, tras la casilla 63, sube como el cuello de la oca hasta la cabeza.

type Punto = [number, number];

export interface Cuenta {
  numero: number; // 0 = salida
  tipo: TipoCasilla | 'salida';
  centro: Punto; // donde va el número, el icono o la ficha
  contorno: string; // trazado SVG de la cuenta (para rellenarla de su color)
  mitades?: [string, string]; // verdad o reto: la cuenta partida en dos
  cuartos?: [Punto, Punto]; // centro de cada mitad, para el "?" y el "!"
}

export interface Banda {
  escala: number; // 1 = el diseño original (hueco de 45,5 px)
  relleno: string; // la banda entera, para pintarla de papel
  bordes: string; // los dos bordes, para el contorno negro
  divisores: string; // las rayas finas entre casillas
  cuentas: Cuenta[];
  cuello: string; // trazado del cuello hasta la cabeza
  anchoCuello: number;
}

// Medidas del diseño original, con un hueco de 45,5 px por casilla
const HUECO_BASE = 45.5;
const MEDIO_ANCHO_MAX = 18;
const MUESTRAS = 10; // puntos por casilla

const f = (p: Punto) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const linea = (puntos: Punto[]) => 'M' + puntos.map(f).join(' L');
const cerrado = (izq: Punto[], der: Punto[]) =>
  linea(izq.concat(der.slice().reverse())) + ' Z';

// Pequeño temblor para que el trazo parezca hecho a mano (siempre igual: no cambia al redibujar)
const temblor = (i: number) => Math.sin(i * 0.9) * Math.sin(i * 0.23 + 1);

export function calcularBanda(
  hueco: number,
  ondas = 4.5,
  conTemblor = true,
  tablero: Casilla[] = TABLERO,
): Banda {
  const k = hueco / HUECO_BASE;
  const amplitud = ondas * k;
  const base = (MEDIO_ANCHO_MAX - ondas) * k;

  const centroDe = (n: number): Punto => {
    const { fila, columna } = POSICIONES[n];
    return [columna * hueco + hueco / 2, fila * hueco + hueco / 2];
  };
  // Dirección de la casilla n a la siguiente; tras la 63, el cuello sube
  const direccion = (n: number): Punto => {
    if (n >= TOTAL_CASILLAS) return [0, -1];
    const a = centroDe(n);
    const b = centroDe(n + 1);
    return [Math.sign(b[0] - a[0]), Math.sign(b[1] - a[1])];
  };

  const izquierda: Punto[] = [];
  const derecha: Punto[] = [];
  const divisores: string[] = [];
  const cuentas: Cuenta[] = [];
  let indice = 0;

  for (let n = 0; n <= TOTAL_CASILLAS; n++) {
    const c = centroDe(n);
    const sale = direccion(n);
    const entra = n === 0 ? sale : direccion(n - 1);
    const recta = entra[0] === sale[0] && entra[1] === sale[1];
    const izq: Punto[] = [];
    const der: Punto[] = [];
    const eje: Punto[] = [];

    for (let i = 0; i <= MUESTRAS; i++) {
      const u = i / MUESTRAS;
      let px: number;
      let py: number;
      let tx: number;
      let ty: number;
      if (recta) {
        px = c[0] - (entra[0] * hueco) / 2 + entra[0] * hueco * u;
        py = c[1] - (entra[1] * hueco) / 2 + entra[1] * hueco * u;
        tx = entra[0];
        ty = entra[1];
      } else {
        // Esquina: un cuarto de circunferencia alrededor del vértice interior
        const angulo = (u * Math.PI) / 2;
        const kx = c[0] - (entra[0] * hueco) / 2 + (sale[0] * hueco) / 2;
        const ky = c[1] - (entra[1] * hueco) / 2 + (sale[1] * hueco) / 2;
        const cs = Math.cos(angulo);
        const sn = Math.sin(angulo);
        px = kx + ((-sale[0] * cs + entra[0] * sn) * hueco) / 2;
        py = ky + ((-sale[1] * cs + entra[1] * sn) * hueco) / 2;
        tx = sale[0] * sn + entra[0] * cs;
        ty = sale[1] * sn + entra[1] * cs;
        const m = Math.hypot(tx, ty);
        tx /= m;
        ty /= m;
      }
      // Ancha en el centro de la casilla y estrecha en los bordes; recta al entrar y en la meta
      let medio = base + amplitud * Math.sin(Math.PI * u);
      if ((n === TOTAL_CASILLAS && u > 0.5) || (n === 0 && u < 0.5)) medio = base + amplitud;
      const t = conTemblor ? 0.6 * k * temblor(indice++) : 0;
      const nx = -ty;
      const ny = tx;
      izq.push([px + nx * (medio + t), py + ny * (medio + t)]);
      der.push([px - nx * (medio - t), py - ny * (medio - t)]);
      eje.push([px, py]);
    }

    for (let i = n === 0 ? 0 : 1; i <= MUESTRAS; i++) {
      izquierda.push(izq[i]);
      derecha.push(der[i]);
    }
    if (n > 0) divisores.push(`M${f(izq[0])} L${f(der[0])}`);

    const mitad = MUESTRAS / 2;
    const tipo = n === 0 ? 'salida' : tablero[n - 1].tipo;
    const cuenta: Cuenta = { numero: n, tipo, centro: eje[mitad], contorno: cerrado(izq, der) };
    if (tipo === 'puente') {
      cuenta.mitades = [
        cerrado(izq.slice(0, mitad + 1), der.slice(0, mitad + 1)),
        cerrado(izq.slice(mitad), der.slice(mitad)),
      ];
      divisores.push(`M${f(izq[mitad])} L${f(der[mitad])}`);
      const medio = (a: Punto, b: Punto): Punto => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      cuenta.cuartos = [medio(eje[2], eje[3]), medio(eje[7], eje[8])];
    }
    cuentas.push(cuenta);
  }

  const x = 5.5 * hueco;
  const cuello =
    `M${x.toFixed(1)} ${(8 * hueco).toFixed(1)} L${x.toFixed(1)} ${(4.4 * hueco).toFixed(1)} ` +
    `Q${x.toFixed(1)} ${(3.3 * hueco).toFixed(1)} ${(4.4 * hueco).toFixed(1)} ${(3.3 * hueco).toFixed(1)} ` +
    `L${(4.2 * hueco).toFixed(1)} ${(3.3 * hueco).toFixed(1)}`;

  return {
    escala: k,
    relleno: linea(izquierda) + ' L' + derecha.slice().reverse().map(f).join(' L') + ' Z',
    bordes: linea(izquierda) + ' ' + linea(derecha),
    divisores: divisores.join(' '),
    cuentas,
    cuello,
    anchoCuello: 2 * MEDIO_ANCHO_MAX * k,
  };
}
