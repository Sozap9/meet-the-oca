import type { ReactNode } from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import type { IdTema } from '../data/temasDado';
import { FUENTES, PAPEL, PICO, TINTA } from '../diseno';
import { CuerpoOca } from './Oca';
import type { Ojo } from './Oca';

// Un dibujo por tema del Dado de temas, en una caja de 100 x 100, con la oca de las cartas.

const ROJO = '#E2452B';

export function OcaEn({
  ojo = 'normal',
  transform = 'translate(14 22) scale(0.7)',
  children,
}: {
  ojo?: Ojo;
  transform?: string;
  children?: ReactNode; // detalles en coordenadas de la oca
}) {
  return (
    <G transform={transform}>
      <CuerpoOca ojo={ojo} grosor={6} />
      {children}
    </G>
  );
}

// Pictogramas sobrios, de trazo grueso, como el resto del juego
const TRAZO = { stroke: TINTA, strokeWidth: 3.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const AMARILLO = '#F7D23E';
const BLANCO = '#FFFFFF';

export function DibujoTema({ tema }: { tema: IdTema }) {
  switch (tema) {
    case 'gustos':
      return (
        <>
          <Path d="M26 58 V50 a24 24 0 0 1 48 0 V58" fill="none" {...TRAZO} />
          <Rect x={18} y={54} width={14} height={24} rx={6} fill={ROJO} {...TRAZO} />
          <Rect x={68} y={54} width={14} height={24} rx={6} fill={ROJO} {...TRAZO} />
          <Path d="M46 40 V26 l12 -4 V36" fill="none" {...TRAZO} />
          <Circle cx={43} cy={41} r={4} fill={TINTA} />
          <Circle cx={55} cy={37} r={4} fill={TINTA} />
        </>
      );
    case 'ysi':
      return (
        <>
          <Path
            d="M28 60 c-12 0 -13 -17 -1 -18 c0 -12 16 -16 22 -7 c6 -8 22 -5 22 6 c12 1 12 19 -1 19 Z"
            fill={BLANCO}
            {...TRAZO}
          />
          <Circle cx={30} cy={70} r={4} fill={BLANCO} {...TRAZO} />
          <Circle cx={22} cy={79} r={2.6} fill={BLANCO} stroke={TINTA} strokeWidth={3} />
          <SvgText x={50} y={58} textAnchor="middle" fontFamily={FUENTES.titulo} fontSize={24} fill={TINTA}>
            ?
          </SvgText>
        </>
      );
    case 'risas':
      return (
        <>
          <Path
            d="M20 26 h60 a6 6 0 0 1 6 6 v28 a6 6 0 0 1 -6 6 H46 l-12 11 v-11 H20 a6 6 0 0 1 -6 -6 V32 a6 6 0 0 1 6 -6 z"
            fill={BLANCO}
            {...TRAZO}
          />
          <SvgText x={50} y={55} textAnchor="middle" fontFamily={FUENTES.titulo} fontSize={22} fill={TINTA}>
            JA JA
          </SvgText>
        </>
      );
    case 'infancia':
      return (
        <>
          <Path d="M22 58 H78 L68 72 H32 Z" fill={BLANCO} {...TRAZO} />
          <Path d="M50 24 V58 M50 26 L70 52 H50" fill={AMARILLO} {...TRAZO} />
          <Path d="M50 32 L36 52 H50" fill={BLANCO} {...TRAZO} />
          <Path d="M14 80 q6 -5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0" fill="none" {...TRAZO} />
        </>
      );
    case 'suenos':
      return (
        <>
          <Path d="M60 22 a28 28 0 1 0 18 46 a22 22 0 1 1 -18 -46 z" fill={AMARILLO} {...TRAZO} />
          <Path
            d="M30 24 l2.4 5 5.4 .8 -3.9 3.8 .9 5.4 -4.8-2.6 -4.8 2.6 .9-5.4 -3.9-3.8 5.4-.8z"
            fill={BLANCO}
            stroke={TINTA}
            strokeWidth={2.6}
            strokeLinejoin="round"
          />
          <Circle cx={24} cy={50} r={2.2} fill={TINTA} />
          <Circle cx={40} cy={14} r={1.8} fill={TINTA} />
        </>
      );
    case 'teveo':
      return (
        <>
          <Path d="M12 50 C28 26 72 26 88 50 C72 74 28 74 12 50 Z" fill={BLANCO} {...TRAZO} />
          <Circle cx={50} cy={50} r={13} fill="#2F6BFF" {...TRAZO} />
          <Circle cx={50} cy={50} r={5.5} fill={TINTA} />
          <Circle cx={54.5} cy={45.5} r={2.4} fill={BLANCO} />
        </>
      );
    case 'deseos':
      return (
        <>
          <Path
            d="M50 14 C58 30 74 38 72 58 C70 74 60 82 50 82 C38 82 28 74 28 60 C28 48 36 42 38 32 C44 40 44 46 46 50 C50 40 52 28 50 14 Z"
            fill={ROJO}
            {...TRAZO}
          />
          <Path
            d="M50 50 C56 58 60 62 58 70 C56 76 52 78 50 78 C46 78 42 74 42 69 C42 62 48 60 50 50 Z"
            fill={AMARILLO}
            stroke={TINTA}
            strokeWidth={3}
            strokeLinejoin="round"
          />
        </>
      );
    case 'picante':
      return (
        <>
          <Path
            d="M64 28 C82 30 84 48 72 60 C60 72 42 80 24 82 C22 82 21 79 24 78 C40 72 50 62 54 50 C57 40 58 32 64 28 Z"
            fill={ROJO}
            {...TRAZO}
          />
          <Path
            d="M64 28 C64 22 68 18 74 16 M62 28 C66 24 72 24 76 28"
            fill="none"
            stroke="#2E7D5B"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <Path d="M60 40 C62 46 60 52 56 56" fill="none" stroke={BLANCO} strokeWidth={2.6} strokeLinecap="round" />
        </>
      );
    case 'retos':
      return (
        <>
          <Rect x={43} y={12} width={14} height={8} rx={2} fill={TINTA} />
          <Path d="M50 20 V26" {...TRAZO} />
          <Circle cx={50} cy={54} r={28} fill={BLANCO} {...TRAZO} />
          <Path d="M50 54 V36 M50 54 L62 62" {...TRAZO} />
          <Circle cx={50} cy={54} r={3} fill={TINTA} />
          <Path d="M74 28 l5 -5 M26 28 l-5 -5" {...TRAZO} />
        </>
      );
  }
}

// El dibujo en su propio lienzo (leyenda, elegir temas, cabecera de la tarjeta)
export function IconoTema({ tema, size }: { tema: IdTema; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      <DibujoTema tema={tema} />
    </Svg>
  );
}
