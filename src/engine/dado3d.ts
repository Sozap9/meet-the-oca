export type Vec = [number, number, number];
export type Mat = [Vec, Vec, Vec]; // 3 filas
export type Cuat = [number, number, number, number]; // w, x, y, z

export function punto(a: Vec, b: Vec): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function cruz(a: Vec, b: Vec): Vec {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

export function normalizar(v: Vec): Vec {
  const longitud = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / longitud, v[1] / longitud, v[2] / longitud];
}

export function multiplicar(a: Mat, b: Mat): Mat {
  const r: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) r[i][j] += a[i][k] * b[k][j];
    }
  }
  return r as Mat;
}

export function aplicar(m: Mat, v: Vec): Vec {
  return [
    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
  ];
}

// Rotación de `angulo` radianes alrededor de un eje unitario (fórmula de Rodrigues)
export function rotar(eje: Vec, angulo: number): Mat {
  const [x, y, z] = eje;
  const c = Math.cos(angulo);
  const s = Math.sin(angulo);
  const t = 1 - c;
  return [
    [t * x * x + c, t * x * y - s * z, t * x * z + s * y],
    [t * x * y + s * z, t * y * y + c, t * y * z - s * x],
    [t * x * z - s * y, t * y * z + s * x, t * z * z + c],
  ];
}

export function ejeAleatorio(): Vec {
  const z = Math.random() * 2 - 1;
  const a = Math.random() * Math.PI * 2;
  const r = Math.sqrt(1 - z * z);
  return [r * Math.cos(a), r * Math.sin(a), z];
}

export function rotacionAleatoria(): Mat {
  return rotar(ejeAleatorio(), Math.random() * Math.PI * 2);
}

// ---------- Cuaterniones: para pasar suavemente de una orientación a otra ----------

export function aCuaternion(m: Mat): Cuat {
  const t = m[0][0] + m[1][1] + m[2][2];
  if (t > 0) {
    const s = Math.sqrt(t + 1) * 2;
    return [0.25 * s, (m[2][1] - m[1][2]) / s, (m[0][2] - m[2][0]) / s, (m[1][0] - m[0][1]) / s];
  }
  if (m[0][0] > m[1][1] && m[0][0] > m[2][2]) {
    const s = Math.sqrt(1 + m[0][0] - m[1][1] - m[2][2]) * 2;
    return [(m[2][1] - m[1][2]) / s, 0.25 * s, (m[0][1] + m[1][0]) / s, (m[0][2] + m[2][0]) / s];
  }
  if (m[1][1] > m[2][2]) {
    const s = Math.sqrt(1 + m[1][1] - m[0][0] - m[2][2]) * 2;
    return [(m[0][2] - m[2][0]) / s, (m[0][1] + m[1][0]) / s, 0.25 * s, (m[1][2] + m[2][1]) / s];
  }
  const s = Math.sqrt(1 + m[2][2] - m[0][0] - m[1][1]) * 2;
  return [(m[1][0] - m[0][1]) / s, (m[0][2] + m[2][0]) / s, (m[1][2] + m[2][1]) / s, 0.25 * s];
}

export function deCuaternion([w, x, y, z]: Cuat): Mat {
  return [
    [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
    [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
    [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)],
  ];
}

export function slerp(a: Cuat, b: Cuat, t: number): Cuat {
  let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  let destino: Cuat = b;
  if (dot < 0) {
    dot = -dot;
    destino = [-b[0], -b[1], -b[2], -b[3]];
  }
  if (dot > 0.9995) {
    const lineal: Cuat = [
      a[0] + (destino[0] - a[0]) * t,
      a[1] + (destino[1] - a[1]) * t,
      a[2] + (destino[2] - a[2]) * t,
      a[3] + (destino[3] - a[3]) * t,
    ];
    const longitud = Math.hypot(...lineal) || 1;
    return [lineal[0] / longitud, lineal[1] / longitud, lineal[2] / longitud, lineal[3] / longitud];
  }
  const theta0 = Math.acos(dot);
  const theta = theta0 * t;
  const s1 = Math.sin(theta) / Math.sin(theta0);
  const s0 = Math.cos(theta) - (dot * Math.sin(theta)) / Math.sin(theta0);
  return [
    s0 * a[0] + s1 * destino[0],
    s0 * a[1] + s1 * destino[1],
    s0 * a[2] + s1 * destino[2],
    s0 * a[3] + s1 * destino[3],
  ];
}

// ---------- Las seis caras ----------

// Cada cara: normal (n), eje horizontal (u) y eje vertical (v) sobre la cara.
// Las caras opuestas suman 7: 1-6, 2-5, 3-4.
export interface CaraGeo {
  valor: number;
  n: Vec;
  u: Vec;
  v: Vec;
}

export const CARAS: CaraGeo[] = [
  { valor: 1, n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
  { valor: 6, n: [0, 0, -1], u: [1, 0, 0], v: [0, -1, 0] },
  { valor: 2, n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] },
  { valor: 5, n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] },
  { valor: 3, n: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1] },
  { valor: 4, n: [-1, 0, 0], u: [0, 1, 0], v: [0, 0, -1] },
];

// Orientación con la que la cara `valor` queda mirando al jugador, con una pequeña inclinación
export function orientacionFinal(valor: number, inclinacion: number): Mat {
  const cara = CARAS.find((c) => c.valor === valor) ?? CARAS[0];
  const base: Mat = [cara.u, cara.v, cara.n];
  return multiplicar(rotar([0, 0, 1], inclinacion), base);
}
// Vista de tres cuartos, como un dado sobre la mesa: la cara del resultado queda arriba (en rombo)
// y se ven dos caras laterales. "inclinacion" gira un poco el dado para que no quede siempre igual.
const INCLINACION_VISTA = -0.75;
export function orientacionVista(valor: number, inclinacion: number): Mat {
  return multiplicar(rotar([1, 0, 0], INCLINACION_VISTA), orientacionFinal(valor, Math.PI / 4 + inclinacion * 0.5));
}
