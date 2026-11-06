import { memo, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { ajustesActuales } from '../ajustesBase';
import { PAPEL, TINTA } from '../diseno';
import { sonar } from '../sonido';

// El dado del juego, dibujado como una ilustración: un cubo con contorno de tinta y caras planas.
// Es un cubo en 3D de verdad: al tirarlo cae sobre la mesa, bota y rueda hasta quedarse con el
// resultado arriba. En reposo se ve en tres cuartos, como siempre.
// (Versiones anteriores: Dado3D.anterior.tsx.txt y DadoIlustrado.anterior.tsx.txt)

const DURACION_TIRADA = 1500; // ms
const PAUSA_FINAL = 500; // ms quieto mostrando el resultado
const REBOTES = 3;
const CAIDA = 0.22; // parte de la tirada que tarda en caer desde arriba hasta tocar la mesa

// La "inclinación" de siempre (un pequeño giro del dado sobre la mesa), como ángulo en 3D
const giroDeMesa = (inclinacion: number) => (inclinacion * 15 * Math.PI) / 180;

export interface TiradaEnCurso {
  id: number;
  valor: number;
  inclinacion?: number;
}

// Aspecto de una cara: color de fondo y, si lo hay, un dibujo (caja de 100 x 100); sin dibujo lleva los puntos
export interface CaraVisual {
  fondo: string;
  dibujo?: ReactNode;
}

export const CARAS_CLASICAS: CaraVisual[] = Array.from({ length: 6 }, () => ({ fondo: PAPEL }));

const PUNTOS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[26, 26], [50, 50], [74, 74]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]],
  6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]],
};

function sombrear(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (d: number) => Math.round(((n >> d) & 255) * f);
  return `rgb(${c(16)}, ${c(8)}, ${c(0)})`;
}

// Una cara plana (100 x 100) con su dibujo o sus puntos
function Cara({ valor, visual, luz }: { valor: number; visual: CaraVisual; luz: number }) {
  return (
    <>
      <Rect x={0} y={0} width={100} height={100} rx={10} fill={sombrear(visual.fondo, luz)} />
      {visual.dibujo ?? PUNTOS[valor].map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={9} fill={TINTA} />)}
      <Rect x={0} y={0} width={100} height={100} rx={10} fill="none" stroke={TINTA} strokeWidth={3.4} />
    </>
  );
}

// ---------- El cubo en 3D ----------
// Un cubo de verdad (de -1 a 1 en cada eje) que se gira y se proyecta en plano, sin perspectiva,
// para que conserve el aspecto de ilustración. Cada cara visible se dibuja con una matriz afín
// que lleva su caja de 100 x 100 a la pantalla, así los puntos y los dibujos giran con ella.

type V3 = [number, number, number];
type M3 = [V3, V3, V3]; // filas

const mul = (a: M3, b: M3): M3 =>
  [0, 1, 2].map((i) => [0, 1, 2].map((j) => a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j])) as M3;
const aplicar = (m: M3, v: V3): V3 => [
  m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
  m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
  m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
];
const rotX = (a: number): M3 => [[1, 0, 0], [0, Math.cos(a), -Math.sin(a)], [0, Math.sin(a), Math.cos(a)]];
const rotY = (a: number): M3 => [[Math.cos(a), 0, Math.sin(a)], [0, 1, 0], [-Math.sin(a), 0, Math.cos(a)]];
const rotZ = (a: number): M3 => [[Math.cos(a), -Math.sin(a), 0], [Math.sin(a), Math.cos(a), 0], [0, 0, 1]];

// Cada cara del dado: su normal y los ejes de su caja (u hacia la derecha, v hacia abajo, vista desde fuera).
// Las opuestas suman 7, como en un dado de verdad.
const CARAS_CUBO: { valor: number; n: V3; u: V3; v: V3 }[] = [
  { valor: 1, n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, 1] },
  { valor: 6, n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, -1] },
  { valor: 2, n: [0, 0, 1], u: [1, 0, 0], v: [0, -1, 0] },
  { valor: 5, n: [0, 0, -1], u: [-1, 0, 0], v: [0, -1, 0] },
  { valor: 3, n: [1, 0, 0], u: [0, 0, -1], v: [0, -1, 0] },
  { valor: 4, n: [-1, 0, 0], u: [0, 0, 1], v: [0, -1, 0] },
];

// Gira el dado para que la cara "valor" quede arriba
const ORIENTAR: Record<number, M3> = {
  1: rotX(0),
  6: rotX(Math.PI),
  2: rotX(-Math.PI / 2),
  5: rotX(Math.PI / 2),
  3: rotZ(Math.PI / 2),
  4: rotZ(-Math.PI / 2),
};

// Cámara: el dado girado 45 grados y visto un poco desde arriba (como la ilustración de siempre)
const INCLINACION_CAMARA = Math.asin(0.55);
const camara = (giroMesa: number): M3 => mul(rotX(INCLINACION_CAMARA), rotY(Math.PI / 4 + giroMesa));

// Escala y centro en la caja de 300 x 300
const ESCALA = 70.6;
const CENTRO: [number, number] = [150, 151];
const LUZ: V3 = (() => {
  const l: V3 = [-0.35, 0.85, 0.4];
  const m = Math.hypot(...l);
  return [l[0] / m, l[1] / m, l[2] / m];
})();

// La orientación del dado: cámara · giro de la tirada · cara de arriba
export function orientacion(valor: number, giroMesa: number, giro: M3 = rotX(0)): M3 {
  return mul(camara(giroMesa), mul(giro, ORIENTAR[valor] ?? ORIENTAR[1]));
}

const Cubo = memo(function Cubo({
  rotacion,
  caras,
  size,
}: {
  rotacion: M3;
  caras: CaraVisual[];
  size: number;
}) {
  const vis = (v: number) => caras[v - 1] ?? caras[0];
  const visibles = CARAS_CUBO.map((c) => {
    const n = aplicar(rotacion, c.n);
    if (n[2] <= 0.02) return null; // de espaldas a la cámara
    const u = aplicar(rotacion, c.u);
    const v = aplicar(rotacion, c.v);
    const k = ESCALA / 50;
    const origen: V3 = [n[0] - u[0] - v[0], n[1] - u[1] - v[1], n[2] - u[2] - v[2]];
    const matriz = `matrix(${k * u[0]} ${-k * u[1]} ${k * v[0]} ${-k * v[1]} ${CENTRO[0] + ESCALA * origen[0]} ${CENTRO[1] - ESCALA * origen[1]})`;
    const luz = 0.8 + 0.2 * Math.max(0, n[0] * LUZ[0] + n[1] * LUZ[1] + n[2] * LUZ[2]);
    return (
      <G key={c.valor} transform={matriz}>
        <Cara valor={c.valor} visual={vis(c.valor)} luz={Math.min(1, luz)} />
      </G>
    );
  });
  return (
    <Svg width={size} height={size} viewBox="0 0 300 300" style={{ overflow: 'visible' }}>
      {visibles}
    </Svg>
  );
});

function SombraSuelo({ size, rebote = 0, x = 0 }: { size: number; rebote?: number; x?: number }) {
  return (
    <Svg
      width={size}
      height={size * 0.14}
      viewBox="0 0 300 42"
      style={{ position: 'absolute', left: x, top: size * 0.86 }}
    >
      <Ellipse cx={150} cy={21} rx={74 * (1 - 0.35 * rebote)} ry={8} fill={TINTA} opacity={0.14 * (1 - 0.5 * rebote)} />
    </Svg>
  );
}

// ---------- Dado quieto ----------

type PropsReposo = {
  valor: number;
  size: number;
  inclinacion?: number;
  caras?: CaraVisual[];
};

export function DadoReposo({ valor, size, inclinacion = 0, caras = CARAS_CLASICAS }: PropsReposo) {
  return (
    <View style={{ width: size, height: size }}>
      <SombraSuelo size={size} />
      <Cubo rotacion={orientacion(valor, giroDeMesa(inclinacion))} caras={caras} size={size} />
    </View>
  );
}

// ---------- Dado lanzándose ----------

type PropsAnimado = {
  valor: number;
  size: number;
  onTerminar: () => void;
  inclinacion?: number; // giro con el que se queda
  desde?: { valor: number; inclinacion: number }; // cómo estaba antes de lanzarlo
  entrada?: 'lado' | 'centro'; // entra volando desde un lado o se lanza en su sitio
  caras?: CaraVisual[];
};

export function DadoAnimado({
  valor,
  size,
  onTerminar,
  inclinacion = 0,
  desde,
  entrada = 'lado',
  caras = CARAS_CLASICAS,
}: PropsAnimado) {
  const { width: ancho } = useWindowDimensions();
  const alTerminar = useRef(onTerminar);
  alTerminar.current = onTerminar;
  const rapido = ajustesActuales().reducirAnimaciones;
  const duracion = rapido ? 500 : DURACION_TIRADA;

  const [p, setP] = useState(0); // progreso, de 0 a 1
  // Vueltas de la tirada: grandes al principio y nada al final, así acaba con "valor" arriba
  const [azar] = useState(() => {
    const signo = () => (Math.random() < 0.5 ? -1 : 1);
    return {
      lado: signo(),
      x: signo() * Math.PI * 2 * (1.6 + Math.random()),
      y: signo() * Math.PI * (0.5 + Math.random()),
      z: signo() * Math.PI * 2 * (1.2 + Math.random()),
    };
  });

  useEffect(() => {
    // Suena cuando el dado toca la mesa por primera vez
    const golpe = setTimeout(() => sonar('dado'), duracion * CAIDA);
    const inicio = Date.now();
    let cuadro = 0;
    let espera: ReturnType<typeof setTimeout> | undefined;
    const paso = () => {
      const progreso = Math.min((Date.now() - inicio) / duracion, 1);
      setP(progreso);
      if (progreso < 1) cuadro = requestAnimationFrame(paso);
      else espera = setTimeout(() => alTerminar.current(), PAUSA_FINAL);
    };
    cuadro = requestAnimationFrame(paso);
    return () => {
      clearTimeout(golpe);
      cancelAnimationFrame(cuadro);
      if (espera) clearTimeout(espera);
    };
  }, [valor]);

  // Cae desde arriba, bota cada vez más bajo y rueda hasta pararse con el resultado arriba
  let altura: number;
  if (p < CAIDA) {
    const q = p / CAIDA;
    altura = 1 - q * q;
  } else {
    const q = (p - CAIDA) / (1 - CAIDA);
    altura = 0.32 * Math.abs(Math.sin(Math.PI * REBOTES * q)) * Math.pow(1 - q, 2.2);
  }
  const y = -altura * size * 1.1;
  const x = entrada === 'lado' ? azar.lado * ancho * 0.5 * Math.pow(1 - Math.min(1, p / 0.7), 2) : 0;
  // Las vueltas se frenan y paran un poco antes del final, y queda un instante quieto
  const frenado = Math.pow(1 - Math.min(1, p / 0.82), 2.6);
  const giro = mul(rotZ(azar.z * frenado), mul(rotX(azar.x * frenado), rotY(azar.y * frenado)));
  const desdeGiro = desde ? giroDeMesa(desde.inclinacion) : 0;
  const giroMesa = desdeGiro + (giroDeMesa(inclinacion) - desdeGiro) * Math.min(1, p / 0.82);
  const rotacion = orientacion(valor, giroMesa, giro);
  const rebote = Math.min(1, altura);

  return (
    <View style={{ width: size, height: size, opacity: entrada === 'lado' ? Math.min(1, p / 0.08) : 1 }}>
      <SombraSuelo size={size} rebote={rebote} x={x} />
      <View style={{ transform: [{ translateX: x }, { translateY: y }] }}>
        <Cubo rotacion={rotacion} caras={caras} size={size} />
      </View>
    </View>
  );
}
