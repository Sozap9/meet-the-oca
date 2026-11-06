import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import type { CartaJuego, IdEspecial } from '../data/cartasModo';
import { ESPECIALES, claseDeTarjeta } from '../data/cartasModo';
import { INFO_TIPO } from '../data/tarjetas';
import { BORDE, FUENTES, PAPEL, TINTA } from '../diseno';
import { DibujoTema, OcaEn } from './DibujosTemas';
import { CuerpoOca } from './Oca';

// ---------- Colores y dibujos de las cartas ----------

export const COLOR_CARTA = {
  basico: '#F7D23E',
  personal: '#7FC8F8',
  caliente: '#FF8FB1',
  infierno: '#FF5A4E',
  reto: '#FF6B4A',
  especial: '#C9B6F2',
};
const VERDE_REVERSO = '#1E8E47';
// Sombra muy sutil para las cartas
const SOMBRA_SUAVE = 'rgba(21,21,21,0.3)';

export function colorDeCarta(c: CartaJuego): string {
  if (c.tipo === 'especial') return COLOR_CARTA.especial;
  if (claseDeTarjeta(c.tarjeta) === 'reto') return COLOR_CARTA.reto;
  return COLOR_CARTA[c.mazo];
}

export function etiquetaDeCarta(c: CartaJuego): string {
  if (c.tipo === 'especial') return 'especial.';
  const clase = claseDeTarjeta(c.tarjeta);
  const mazo = c.mazo === 'basico' ? 'básico' : c.mazo;
  return clase === 'reto' ? 'reto.' : clase === 'juego' ? `juego · ${mazo}.` : `${mazo}.`;
}

export function tituloDeCarta(c: CartaJuego): string {
  return c.tipo === 'especial' ? ESPECIALES[c.especial].nombre : INFO_TIPO[c.tarjeta.tipo].etiqueta;
}

export function textoDeCarta(c: CartaJuego): string {
  if (c.tipo === 'especial') return ESPECIALES[c.especial].texto;
  const t = c.tarjeta;
  return t.opciones ? `${t.opciones[0]} o ${t.opciones[1]}` : t.texto;
}

function CartaMini({ x, y, rot, color }: { x: number; y: number; rot: number; color: string }) {
  return (
    <G transform={`rotate(${rot} ${x + 9} ${y + 12})`}>
      <Rect x={x} y={y} width={18} height={25} rx={3} fill={color} stroke={TINTA} strokeWidth={2.2} />
    </G>
  );
}

function OjoFeliz() {
  return <Path d="M70 25q3.5-4.5 7 0" fill="none" stroke={TINTA} strokeWidth={3} strokeLinecap="round" />;
}
function OjoNormal() {
  return <Circle cx={75} cy={23} r={3.2} fill={TINTA} />;
}

// El dibujo de una carta, en una caja de 100 x 100
export function DibujoCarta({ carta }: { carta: CartaJuego }): ReactNode {
  if (carta.tipo === 'tarjeta') {
    const clase = claseDeTarjeta(carta.tarjeta);
    if (clase === 'reto') return <DibujoTema tema="retos" />;
    if (clase === 'juego')
      return (
        <>
          <OcaEn ojo="feliz" transform="translate(20 22) scale(0.7)" />
          <G transform="rotate(-14 22 34)">
            <Rect x={9} y={21} width={26} height={26} rx={5} fill="#FFFFFF" stroke={TINTA} strokeWidth={2.4} />
            <Circle cx={16} cy={28} r={2.4} fill={TINTA} />
            <Circle cx={22} cy={34} r={2.4} fill={TINTA} />
            <Circle cx={28} cy={40} r={2.4} fill={TINTA} />
          </G>
        </>
      );
    return (
      <>
        <OcaEn />
        <Path
          d="M12 12h26a5 5 0 0 1 5 5v14a5 5 0 0 1-5 5H26l-7 7v-7h-7a5 5 0 0 1-5-5V17a5 5 0 0 1 5-5z"
          fill="#FFFFFF"
          stroke={TINTA}
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
        <SvgText x={25} y={31} textAnchor="middle" fontFamily={FUENTES.titulo} fontSize={17} fill={TINTA}>
          ?
        </SvgText>
      </>
    );
  }
  return <DibujoEspecial especial={carta.especial} />;
}

function DibujoEspecial({ especial }: { especial: IdEspecial }) {
  switch (especial) {
    case 'robaDos':
      return (
        <>
          <OcaEn ojo="feliz" transform="translate(20 24) scale(0.7)" />
          <CartaMini x={8} y={16} rot={-16} color="#F7D23E" />
          <CartaMini x={20} y={12} rot={8} color="#B9E4F4" />
          <SvgText x={26} y={58} textAnchor="middle" fontFamily={FUENTES.titulo} fontSize={14} fill={TINTA}>
            +2
          </SvgText>
        </>
      );
    case 'devuelvo':
      return (
        <>
          <OcaEn ojo="enfadado" transform="translate(24 22) scale(0.7)" />
          <Path d="M40 20 C14 14 8 40 22 50" fill="none" stroke={TINTA} strokeWidth={4} strokeLinecap="round" />
          <Path d="M14 44 l8 7 l3-10" fill="none" stroke={TINTA} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case 'libre':
      return (
        <>
          <OcaEn transform="translate(4 26) scale(0.7)" />
          <Path d="M86 48 V92 M76 92 H96" stroke={TINTA} strokeWidth={4} strokeLinecap="round" />
          <G transform="rotate(-22 84 38)">
            <Rect x={78} y={25} width={13} height={23} rx={6.5} fill="#9AA3A8" stroke={TINTA} strokeWidth={3.5} />
          </G>
        </>
      );
    case 'doble':
      return (
        <>
          <G transform="translate(-6 34) scale(0.6)">
            <CuerpoOca ojo="feliz" grosor={6} />
          </G>
          <G transform="translate(40 34) scale(0.6)">
            <CuerpoOca ojo="feliz" grosor={6} />
          </G>
          <SvgText x={50} y={26} textAnchor="middle" fontFamily={FUENTES.titulo} fontSize={18} fill={TINTA}>
            x2
          </SvgText>
        </>
      );
    case 'salta':
      return (
        <>
          <OcaEn ojo="dormido" transform="translate(16 30) scale(0.66)" />
          <SvgText x={20} y={32} fontFamily={FUENTES.titulo} fontSize={18} fill={TINTA}>
            z
          </SvgText>
          <SvgText x={32} y={20} fontFamily={FUENTES.titulo} fontSize={13} fill={TINTA}>
            z
          </SvgText>
        </>
      );
    case 'intercambio':
      return (
        <>
          <Path d="M22 28 C34 10 66 10 78 28" fill="none" stroke={TINTA} strokeWidth={4} strokeLinecap="round" />
          <Path d="M78 28 l-2 -10 M78 28 l-10 -2" stroke={TINTA} strokeWidth={4} strokeLinecap="round" />
          <CartaMini x={6} y={40} rot={-10} color="#F7D23E" />
          <CartaMini x={74} y={40} rot={10} color="#FF8FB1" />
          <G transform="translate(8 46) scale(0.5)">
            <CuerpoOca grosor={6} />
          </G>
          <G transform="translate(92 46) scale(-0.5 0.5)">
            <CuerpoOca grosor={6} />
          </G>
        </>
      );
  }
}

// ---------- La carta ----------

export function Carta({
  carta,
  ancho,
  oculta = false, // en la mano: se ve el tipo pero no el texto
}: {
  carta: CartaJuego;
  ancho: number;
  oculta?: boolean;
}) {
  const alto = ancho * 1.4;
  const color = colorDeCarta(carta);
  const nivel = carta.tipo === 'tarjeta' ? (carta.tarjeta.intensidad ?? 0) : 0;
  const k = ancho / 150;
  const mostrarTexto = !oculta || carta.tipo === 'especial';
  return (
    <View style={[styles.carta, { width: ancho, height: alto, borderRadius: 14 * k }]}>
      <View style={[styles.cabecera, { backgroundColor: color, height: alto * 0.5 }]}>
        <Svg width={ancho * 0.62} height={ancho * 0.62} viewBox="0 0 100 100">
          <DibujoCarta carta={carta} />
        </Svg>
        <Text style={[styles.etiqueta, { fontSize: Math.max(6, 8.5 * k), left: 8 * k, top: 6 * k }]} numberOfLines={1}>
          {etiquetaDeCarta(carta)}
        </Text>
      </View>
      <View style={[styles.cuerpo, { padding: 8 * k, gap: 4 * k }]}>
        <View style={styles.filaTitulo}>
          <Text style={[styles.titulo, { fontSize: 15 * k, lineHeight: 19 * k }]} numberOfLines={2}>
            {tituloDeCarta(carta)}
          </Text>
          {nivel ? (
            <View style={styles.puntos}>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.punto,
                    { width: 7 * k + 1, height: 7 * k + 1, backgroundColor: i <= nivel ? '#F7D23E' : '#FFFFFF' },
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>
        {mostrarTexto ? (
          <Text style={[styles.texto, { fontSize: 11 * k + 1, lineHeight: 14 * k + 2 }]} numberOfLines={4}>
            {textoDeCarta(carta)}
          </Text>
        ) : (
          <View style={{ gap: 4 * k }}>
            {[92, 76, 58].map((w) => (
              <View key={w} style={[styles.raya, { width: `${w}%`, height: Math.max(4, 6 * k) }]} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

export function Reverso({ ancho }: { ancho: number }) {
  const m = ancho * 0.62;
  return (
    <View style={[styles.carta, styles.reverso, { width: ancho, height: ancho * 1.4, borderRadius: ancho * 0.09 }]}>
      <View style={[styles.medallon, { width: m, height: m, borderRadius: m / 2 }]}>
        <Svg width={m * 0.78} height={m * 0.78} viewBox="0 0 100 100">
          <G transform="translate(4 2) scale(0.92)">
            <CuerpoOca ojo="feliz" grosor={6} />
          </G>
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  carta: {
    borderWidth: BORDE,
    borderColor: TINTA,
    backgroundColor: PAPEL,
    overflow: 'hidden',
    shadowColor: SOMBRA_SUAVE,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 1.5, height: 1.5 },
  },
  cabecera: {
    borderBottomWidth: BORDE,
    borderColor: TINTA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etiqueta: { position: 'absolute', fontFamily: FUENTES.pixel, color: TINTA, maxWidth: '90%' },
  cuerpo: { flex: 1 },
  filaTitulo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  titulo: { flexShrink: 1, fontFamily: FUENTES.titulo, color: TINTA, textTransform: 'uppercase' },
  puntos: { flexDirection: 'row', gap: 2 },
  punto: { borderRadius: 6, borderWidth: 1.2, borderColor: TINTA },
  texto: { fontFamily: FUENTES.textoFuerte, color: TINTA },
  raya: { borderRadius: 3, backgroundColor: 'rgba(21,21,21,0.14)' },
  reverso: { backgroundColor: VERDE_REVERSO, alignItems: 'center', justifyContent: 'center' },
  medallon: {
    borderWidth: BORDE,
    borderColor: TINTA,
    backgroundColor: PAPEL,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
