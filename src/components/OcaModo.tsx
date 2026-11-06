import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import type { Modo } from '../data/modos';
import { TINTA } from '../diseno';
import { Tridente } from './Infierno';
import { CuerpoOca } from './Oca';
import type { Ojo } from './Oca';

// La oca de cada modo con su accesorio, igual que las cabezas del final del tablero:
// básico tal cual, personal curiosa con lupa, caliente demonio, aleatorio adivina con turbante
// y el dado de temas con su dado. Infierno: el demonio de Caliente con un tridente negro.

const OJO_MODO: Record<Modo, Ojo> = {
  basico: 'feliz',
  personal: 'ninguno', // el ojo va dentro de la lupa
  caliente: 'enfadado',
  infierno: 'enfadado',
  aleatorio: 'feliz',
  dado: 'normal',
  cartas: 'feliz',
};

function Accesorio({ modo }: { modo: Modo }) {
  switch (modo) {
    case 'personal':
      return (
        <>
          <Path d="M66 34 L56 46" stroke={TINTA} strokeWidth={6} strokeLinecap="round" />
          <Circle cx={75} cy={23} r={10} fill="#DDF3FB" stroke={TINTA} strokeWidth={4} />
          <Circle cx={76} cy={23} r={4.4} fill={TINTA} />
          <Circle cx={77.6} cy={21.4} r={1.4} fill="#FFFFFF" />
        </>
      );
    case 'caliente':
    case 'infierno':
      return (
        <>
          <Path d="M63 18 Q58 8 61 0 Q67 8 69 16 Z" fill="#E2452B" stroke={TINTA} strokeWidth={3.5} strokeLinejoin="round" />
          <Path d="M74 15 Q76 5 83 -1 Q83 9 79 17 Z" fill="#E2452B" stroke={TINTA} strokeWidth={3.5} strokeLinejoin="round" />
          <Path d="M10 51 Q2 44 6 38 Q10 44 16 45" fill="none" stroke={TINTA} strokeWidth={3.5} strokeLinecap="round" />
          <Path d="M6 38 l-3 -6 l7 2 Z" fill="#E2452B" stroke={TINTA} strokeWidth={2.5} strokeLinejoin="round" />
        </>
      );
    case 'aleatorio':
      return (
        <>
          <Ellipse cx={71} cy={16} rx={14} ry={7.5} fill="#43C59E" stroke={TINTA} strokeWidth={3.5} />
          <Path d="M58 17 Q71 10 84 17" fill="none" stroke={TINTA} strokeWidth={2.5} />
          <Circle cx={71} cy={10} r={3.6} fill="#FFD23F" stroke={TINTA} strokeWidth={2.5} />
          <Path d="M71 6 Q73 -2 79 -3" fill="none" stroke={TINTA} strokeWidth={3} strokeLinecap="round" />
        </>
      );
    case 'cartas':
      return (
        <>
          <G transform="rotate(-14 20 70)">
            <Rect x={6} y={56} width={20} height={28} rx={3} fill="#F7D23E" stroke={TINTA} strokeWidth={3} />
          </G>
          <G transform="rotate(10 34 70)">
            <Rect x={22} y={54} width={20} height={28} rx={3} fill="#C9B6F2" stroke={TINTA} strokeWidth={3} />
          </G>
        </>
      );
    case 'dado':
      return (
        <G transform="rotate(-12 82 76)">
          <Rect x={68} y={62} width={28} height={28} rx={6} fill="#FFFFFF" stroke={TINTA} strokeWidth={4} />
          <Circle cx={75} cy={69} r={3} fill={TINTA} />
          <Circle cx={82} cy={76} r={3} fill={TINTA} />
          <Circle cx={89} cy={83} r={3} fill={TINTA} />
        </G>
      );
    default:
      return null;
  }
}

// Lo que va detrás del cuerpo (el tridente de Infierno asoma por detrás del ala)
function Detras({ modo }: { modo: Modo }) {
  if (modo !== 'infierno') return null;
  // Negro y grueso, con un borde claro fino para que se vea sobre fondos oscuros
  return <Tridente transform="translate(18 -4) rotate(-8) scale(0.62)" largo={150} grosor={8} anchoBorde={2.6} />;
}

export function OcaModo({ modo, size, grosor = 7 }: { modo: Modo; size: number; grosor?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      <Detras modo={modo} />
      <CuerpoOca ojo={OJO_MODO[modo]} grosor={grosor} />
      <Accesorio modo={modo} />
    </Svg>
  );
}
