import Svg, { Ellipse, G, Path, Rect, Circle, Text as SvgText } from 'react-native-svg';
import type { TipoCasilla } from '../data/board';
import { FUENTES, PAPEL, TINTA } from '../diseno';
import { CuerpoOca } from './Oca';

// Dibujo de cada casilla especial, con la oca de protagonista.
// Todo está en una caja de 100 x 100 para poder escalarlo a cualquier tamaño.

const GRIS = '#9AA3A8';
const MADERA = '#B07A4A';
const ROJO = '#E2452B';
const CREMA = '#F4E6C8';
const BARROTE = '#C9CED1';
const DORADO = '#F6C21C';
const CRISTAL = '#BFE6F5';

type TipoDibujo = TipoCasilla | 'salida';

export function DibujoCasilla({ tipo, idUnico = 'icono' }: { tipo: TipoDibujo; idUnico?: string }) {
  switch (tipo) {
    case 'salida':
      return (
        <Path
          d="M18 50 H78 M58 28 L80 50 L58 72"
          fill="none"
          stroke={TINTA}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );

    case 'oca':
      return <CuerpoOca ojo="feliz" />;

    // Verdad o reto: los dos signos, como en el tablero
    case 'puente':
      return (
        <>
          <SvgText x={30} y={82} fontSize={76} fontFamily={FUENTES.titulo} fill={TINTA} textAnchor="middle">
            ?
          </SvgText>
          <SvgText x={70} y={82} fontSize={76} fontFamily={FUENTES.titulo} fill={TINTA} textAnchor="middle">
            !
          </SvgText>
        </>
      );

    case 'jardin':
      return (
        <>
          <G transform="translate(-8 4) scale(0.8)">
            <CuerpoOca ojo="feliz" />
          </G>
          <Path d="M80 20 V96" stroke={TINTA} strokeWidth={5} strokeLinecap="round" />
          <Path d="M82 20 H98 L94 28 L98 36 H82 Z" fill={TINTA} />
        </>
      );

    case 'dados':
      return (
        <>
          <G transform="translate(-8 4) scale(0.8)">
            <CuerpoOca ojo="normal" />
          </G>
          <G transform="rotate(-12 77 76)">
            <Rect x={58} y={57} width={38} height={38} rx={7} fill="#FFFFFF" stroke={TINTA} strokeWidth={5} />
            <Circle cx={67} cy={66} r={4} fill={TINTA} />
            <Circle cx={77} cy={76} r={4} fill={TINTA} />
            <Circle cx={87} cy={86} r={4} fill={TINTA} />
          </G>
        </>
      );

    case 'espejo':
      return (
        <>
          <Ellipse cx={50} cy={56} rx={14} ry={24} fill={DORADO} stroke={TINTA} strokeWidth={5} />
          <Ellipse cx={50} cy={56} rx={8} ry={17} fill={CRISTAL} stroke={TINTA} strokeWidth={3.5} />
          <G transform="translate(-16 36) scale(0.6)">
            <CuerpoOca />
          </G>
          <G transform="translate(116 36) scale(-0.6 0.6)">
            <CuerpoOca />
          </G>
        </>
      );

    case 'libre':
      return (
        <>
          <G transform="translate(-8 4) scale(0.8)">
            <CuerpoOca />
          </G>
          <Path d="M86 48 V96 M74 96 H98" stroke={TINTA} strokeWidth={5} strokeLinecap="round" />
          <G transform="rotate(-22 84 38)">
            <Rect x={77} y={24} width={15} height={26} rx={7.5} fill={GRIS} stroke={TINTA} strokeWidth={4.5} />
          </G>
        </>
      );

    case 'cambio':
      return (
        <>
          <Path d="M20 30 C34 10 66 10 80 30" fill="none" stroke={TINTA} strokeWidth={5} strokeLinecap="round" />
          <Path d="M80 30 l-2 -11 M80 30 l-11 -2" stroke={TINTA} strokeWidth={5} strokeLinecap="round" />
          <G transform="translate(-10 40) scale(0.58)">
            <CuerpoOca />
          </G>
          <G transform="translate(110 40) scale(-0.58 0.58)">
            <CuerpoOca />
          </G>
        </>
      );

    case 'posada':
      return (
        <>
          <G transform="translate(4 8) scale(0.78)">
            <CuerpoOca ojo="dormido" />
          </G>
          <Path d="M6 62 H94 A4 4 0 0 1 98 66 V80 H2 V66 A4 4 0 0 1 6 62 Z" fill={ROJO} stroke={TINTA} strokeWidth={4.5} />
          <Rect x={2} y={78} width={96} height={14} fill={MADERA} stroke={TINTA} strokeWidth={4.5} />
          <SvgText x={4} y={30} fontSize={26} fontFamily={FUENTES.titulo} fill={TINTA}>
            z
          </SvgText>
          <SvgText x={20} y={14} fontSize={18} fontFamily={FUENTES.titulo} fill={TINTA}>
            z
          </SvgText>
        </>
      );

    case 'pozo':
      return (
        <>
          <G transform="translate(2 2) scale(0.82)">
            <CuerpoOca ojo="preocupado" />
          </G>
          <Rect x={8} y={62} width={84} height={34} fill={ROJO} stroke={TINTA} strokeWidth={4.5} />
          <Path d="M8 79 H92 M30 62 V79 M54 62 V79 M76 62 V79 M20 79 V96 M42 79 V96 M66 79 V96" stroke={TINTA} strokeWidth={3} />
          <Rect x={2} y={54} width={96} height={12} rx={5} fill={CREMA} stroke={TINTA} strokeWidth={4.5} />
        </>
      );

    case 'carcel':
      return (
        <>
          <G transform="translate(2 4) scale(0.9)">
            <CuerpoOca ojo="enfadado" />
          </G>
          <Path d="M18 4 V96 M40 4 V96 M62 4 V96 M84 4 V96" stroke={TINTA} strokeWidth={10} strokeLinecap="round" />
          <Path d="M18 4 V96 M40 4 V96 M62 4 V96 M84 4 V96" stroke={BARROTE} strokeWidth={5} strokeLinecap="round" />
        </>
      );

    case 'laberinto':
      return (
        <>
          <CuerpoOca ojo="mareado" />
          <SvgText x={4} y={34} fontSize={30} fontFamily={FUENTES.titulo} fill={TINTA}>
            ?
          </SvgText>
        </>
      );

    case 'calavera':
      return (
        <>
          <Ellipse cx={68} cy={8} rx={14} ry={4.5} fill="none" stroke={TINTA} strokeWidth={5} />
          <CuerpoOca ojo="ko" sinPatas idUnico={idUnico} />
          <Path
            d="M20 75 q5 10 10 0 q5 10 10 0 q5 10 10 0 q5 10 10 0 q5 10 10 0"
            fill="#FFFFFF"
            stroke={TINTA}
            strokeWidth={5}
            strokeLinejoin="round"
          />
        </>
      );

    default:
      return null;
  }
}

// El dibujo en su propio lienzo (para listas como la de las reglas)
export function IconoCasilla({ tipo, size }: { tipo: TipoDibujo; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      <DibujoCasilla tipo={tipo} idUnico={`lista-${tipo}`} />
    </Svg>
  );
}
