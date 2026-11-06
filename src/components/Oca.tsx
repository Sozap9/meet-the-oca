import type { ReactNode } from 'react';
import Svg, { Ellipse, G, Path, Circle } from 'react-native-svg';
import { PICO, TINTA } from '../diseno';

// La oca protagonista, de cuerpo entero y mirando a la derecha.
// Se dibuja en una caja de 100 x 100; el ojo está hacia (75, 23).

export type Ojo =
  | 'normal'
  | 'feliz' // arco hacia arriba
  | 'dormido' // arco hacia abajo
  | 'enfadado' // ojo y ceja inclinada
  | 'preocupado' // ojo y ceja arqueada
  | 'mareado' // remolino
  | 'ko' // aspa
  | 'ninguno'; // lo dibuja quien la usa (por ejemplo, con una lupa encima)

type PropsCuerpo = {
  ojo?: Ojo;
  sinPatas?: boolean; // para el fantasma de la calavera
  grosor?: number; // contorno en unidades de la caja (por defecto 8: se ve fino al reducirla)
  idUnico?: string; // se mantiene por compatibilidad; ya no hace falta
};

const CUERPO = (
  <>
    <Ellipse cx={46} cy={64} rx={26} ry={17} />
    <Path d="M24 58 L9 50 L26 72 Z" />
    <Path d="M60 62 L63 30 L77 30 L76 64 Z" />
    <Circle cx={71} cy={26} r={11} />
  </>
);

function OjoOca({ ojo }: { ojo: Ojo }) {
  switch (ojo) {
    case 'normal':
      return <Circle cx={75} cy={23} r={3.6} fill={TINTA} />;
    case 'feliz':
      return (
        <Path d="M69 25 q4 -5 8 0" fill="none" stroke={TINTA} strokeWidth={4} strokeLinecap="round" />
      );
    case 'dormido':
      return (
        <Path d="M69 24 q5 4 10 0" fill="none" stroke={TINTA} strokeWidth={4} strokeLinecap="round" />
      );
    case 'enfadado':
      return (
        <>
          <Circle cx={74} cy={24} r={3.6} fill={TINTA} />
          <Path d="M66 14 L80 18" stroke={TINTA} strokeWidth={3.6} strokeLinecap="round" />
        </>
      );
    case 'preocupado':
      return (
        <>
          <Circle cx={74} cy={24} r={3.6} fill={TINTA} />
          <Path
            d="M67 15 Q73 11 80 15"
            fill="none"
            stroke={TINTA}
            strokeWidth={3.4}
            strokeLinecap="round"
          />
        </>
      );
    case 'mareado':
      return (
        <Path
          d="M74 23m-1 0a1 1 0 1 1 2 .6a2.6 2.6 0 1 1 -3.8 -2.2a4 4 0 1 1 4.8 4.8"
          fill="none"
          stroke={TINTA}
          strokeWidth={3}
          strokeLinecap="round"
        />
      );
    case 'ko':
      return (
        <Path d="M69 19l9 9M78 19l-9 9" stroke={TINTA} strokeWidth={4} strokeLinecap="round" />
      );
    default:
      return null;
  }
}

// El cuerpo como grupo, para meterlo dentro de otro dibujo SVG (iconos, escenas...)
export function CuerpoOca({ ojo = 'normal', sinPatas = false, grosor = 8 }: PropsCuerpo) {
  return (
    <G>
      {sinPatas ? null : (
        <>
          <Path
            d="M42 80v12M56 80v12M36 94h10M50 94h10"
            stroke={TINTA}
            strokeWidth={grosor + 1}
            strokeLinecap="round"
          />
          <Path
            d="M42 80v12M56 80v12M36 94h10M50 94h10"
            stroke={PICO}
            strokeWidth={4.6}
            strokeLinecap="round"
          />
        </>
      )}
      {/* Contorno: las formas en negro y algo más gruesas, debajo del relleno blanco */}
      <G fill={TINTA} stroke={TINTA} strokeWidth={grosor} strokeLinejoin="round">
        {CUERPO}
      </G>
      <G fill="#FFFFFF">{CUERPO}</G>
      <Path
        d="M30 64 C40 57 52 59 58 68"
        fill="none"
        stroke={TINTA}
        strokeWidth={grosor * 0.45}
        strokeLinecap="round"
      />
      <Path
        d="M80 21 L95 26 L80 31 Z"
        fill={PICO}
        stroke={TINTA}
        strokeWidth={grosor * 0.45}
        strokeLinejoin="round"
      />
      <OjoOca ojo={ojo} />
    </G>
  );
}

// La oca sola, en su propio lienzo
export function Oca({
  size,
  ojo = 'normal',
  espejo = false,
  sinPatas = false,
  children,
}: {
  size: number;
  ojo?: Ojo;
  espejo?: boolean; // mirando a la izquierda
  sinPatas?: boolean;
  children?: ReactNode; // accesorios encima, en coordenadas de la caja de 100
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      <G transform={espejo ? 'translate(100 0) scale(-1 1)' : undefined}>
        <CuerpoOca ojo={ojo} sinPatas={sinPatas} />
        {children}
      </G>
    </Svg>
  );
}
