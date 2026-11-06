import Svg, { Circle, G, Path } from 'react-native-svg';
import { TINTA } from '../diseno';

// Dibujos del modo Infierno: llamas, hoguera y el tridente negro de la oca.
// Todo en coordenadas del diseño; quien lo usa lo coloca y lo escala.

// Una llama con la base en (0, 0) y una unidad de alto (crece hacia arriba)
const LLAMA =
  'M0 0 C-0.42 -0.04 -0.52 -0.38 -0.32 -0.6 C-0.22 -0.72 -0.2 -0.86 -0.26 -1 C-0.02 -0.9 0.1 -0.72 0.07 -0.54 C0.15 -0.6 0.19 -0.7 0.17 -0.8 C0.42 -0.6 0.52 -0.3 0.38 -0.12 C0.29 -0.03 0.15 0 0 0 Z';

export const ROJO_LLAMA = '#FF5A4E';
export const NARANJA_LLAMA = '#FF7A2E';
export const AMARILLO_LLAMA = '#FFB23F';
export const NUCLEO_LLAMA = '#FFC94A';
export const LLAMA_APAGADA = '#4A101E'; // llamas del fondo, tono sobre tono

export function Llama({
  x,
  y,
  alto,
  color,
  contorno = 1.8,
}: {
  x: number;
  y: number;
  alto: number;
  color: string;
  contorno?: number; // grosor del contorno de tinta; 0 = sin contorno
}) {
  return (
    <Path
      d={LLAMA}
      transform={`translate(${x} ${y}) scale(${alto})`}
      fill={color}
      stroke={contorno > 0 ? TINTA : undefined}
      strokeWidth={contorno > 0 ? contorno / alto : 0}
      strokeLinejoin="round"
    />
  );
}

// Un número pseudoaleatorio fijo para cada posición, para que el fondo no cambie entre renders
function ruido(a: number, b: number): number {
  const j = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return j - Math.floor(j);
}

// Llamas apagadas repartidas por todo el suelo (la banda del recorrido las tapa)
export function FondoLlamas({ ancho, alto, color = LLAMA_APAGADA }: { ancho: number; alto: number; color?: string }) {
  const llamas = [];
  const columnas = Math.ceil(ancho / 38) + 1;
  const filas = Math.ceil(alto / 44) + 1;
  for (let fy = 0; fy < filas; fy++) {
    for (let fx = 0; fx < columnas; fx++) {
      const r = ruido(fx, fy);
      llamas.push(
        <Llama
          key={`${fx}-${fy}`}
          x={fx * 38 + (fy % 2) * 19 + r * 10}
          y={fy * 44 + 40 + r * 8}
          alto={16 + r * 14}
          color={color}
          contorno={0}
        />,
      );
    }
  }
  return <G>{llamas}</G>;
}

// La hoguera del centro del tablero, con la base en (x, y)
export function Hoguera({ x, y }: { x: number; y: number }) {
  const fuego: { dx: number; alto: number; color: string }[] = [
    { dx: -52, alto: 30, color: ROJO_LLAMA },
    { dx: 54, alto: 28, color: ROJO_LLAMA },
    { dx: -28, alto: 46, color: NARANJA_LLAMA },
    { dx: 30, alto: 44, color: NARANJA_LLAMA },
    { dx: 0, alto: 62, color: ROJO_LLAMA },
    { dx: -24, alto: 22, color: AMARILLO_LLAMA },
    { dx: 26, alto: 22, color: AMARILLO_LLAMA },
    { dx: 0, alto: 34, color: NUCLEO_LLAMA },
  ];
  const chispas: [number, number, number][] = [
    [-42, -46, 1.6],
    [44, -58, 1.4],
    [-10, -68, 1.2],
    [16, -54, 1.8],
    [62, -36, 1.2],
    [-60, -28, 1.1],
  ];
  return (
    <G>
      {fuego.map((f, i) => (
        <Llama key={i} x={x + f.dx} y={i >= 5 ? y - 2 : y} alto={f.alto} color={f.color} />
      ))}
      {chispas.map(([dx, dy, r], i) => (
        <Circle key={`c${i}`} cx={x + dx} cy={y + dy} r={r} fill={AMARILLO_LLAMA} />
      ))}
    </G>
  );
}

// El tridente negro. La punta central queda en (0, 0) y el mango baja "largo" unidades.
// Lleva un borde claro para que se vea sobre el suelo oscuro.
export function Tridente({
  transform,
  largo = 150,
  grosor = 4.4,
  borde = '#F3E2D2',
  anchoBorde = 3.6,
}: {
  transform?: string;
  largo?: number;
  grosor?: number;
  borde?: string;
  anchoBorde?: number; // cuánto asoma el borde claro alrededor del negro
}) {
  const d = `M0 22 L0 ${largo} M-15 4 L-15 16 Q-15 26 0 26 Q15 26 15 16 L15 4 M0 26 L0 -6`;
  return (
    <G transform={transform}>
      <Path d={d} fill="none" stroke={borde} strokeWidth={grosor + anchoBorde} strokeLinecap="round" strokeLinejoin="round" />
      <Path d={d} fill="none" stroke={TINTA} strokeWidth={grosor} strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M-21 7 L-15 -8 L-9 7 Z M-6 -3 L0 -19 L6 -3 Z M9 7 L15 -8 L21 7 Z"
        fill={TINTA}
        stroke={borde}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </G>
  );
}

// Un icono de llama suelto, para botones
export function IconoLlama({ size = 18, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="-0.6 -1.1 1.2 1.2">
      <Path d={LLAMA} fill={color} />
    </Svg>
  );
}
