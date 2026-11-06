import { useEffect } from 'react';
import { Animated, Keyboard, StyleSheet, Text, View } from 'react-native';
import { sonar } from '../sonido';
import { useEntrada } from './Entrada';
import { Grano } from './Grano';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { BORDE, FUENTES, TINTA, COLOR_SOMBRA } from '../diseno';
import { useTema } from '../temas';
import { CuerpoOca } from './Oca';
import { BotonDuro } from './Ui';

// Pantalla de entrega del móvil entre las dos personas (adivina, espejo, semáforo...).
// Ocupa el sitio de la ventana para que no se vea nada de lo que ha respondido la otra persona.

function OcaConMovil({ size }: { size: number }) {
  const tema = useTema();
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" accessibilityLabel="La oca entrega el móvil">
      <Circle cx={60} cy={62} r={54} fill={tema.duo} stroke={TINTA} strokeWidth={2} />
      <G transform="translate(6 18) scale(0.9)">
        <CuerpoOca ojo="feliz" grosor={6} />
        <G transform="rotate(14 98 46)">
          <Rect x={86} y={28} width={22} height={38} rx={5} fill={TINTA} />
          <Rect x={89} y={32} width={16} height={27} rx={2} fill={tema.oca} />
          <Circle cx={97} cy={62} r={1.6} fill={tema.papel} />
        </G>
        <Path d="M60 60 C70 54 78 50 88 46" fill="none" stroke={TINTA} strokeWidth={2.6} strokeLinecap="round" />
      </G>
    </Svg>
  );
}

export function PasaMovil({
  chip,
  antes,
  para,
  texto,
  onListo,
}: {
  chip: string; // nombre de la tarjeta o casilla
  antes: string; // lo que acaba de pasar ("ana ya ha respondido.")
  para: string; // a quién se pasa
  texto: string;
  onListo: () => void;
}) {
  const tema = useTema();
  const entrada = useEntrada();
  useEffect(() => {
    // Al pasar el móvil no puede quedar el teclado abierto de quien acaba de escribir
    Keyboard.dismiss();
    sonar('pase');
  }, []);
  return (
    <Animated.View style={[styles.envoltura, entrada]}>
      <View style={styles.sombra} />
      <View style={[styles.caja, { backgroundColor: tema.suelo }]}>
        <Grano />
        <View style={[styles.chip, { backgroundColor: tema.papel }]}>
          <Text style={styles.chipTexto}>{chip}</Text>
        </View>
        <OcaConMovil size={190} />
        <View style={styles.textos}>
          <Text style={[styles.pixel, { color: tema.papel }]}>{antes}</Text>
          <Text style={[styles.titulo, { color: tema.papel }]}>{`Pasa el móvil a ${para}`}</Text>
          <Text style={[styles.texto, { color: tema.papel }]}>{texto}</Text>
        </View>
        <BotonDuro grande texto="Ya lo tengo" color={tema.oca} onPress={onListo} style={styles.ancho} />
        <Text style={[styles.pixel, { color: tema.papel }]}>{`solo debe pulsarlo ${para.toLowerCase()}.`}</Text>
      </View>
    </Animated.View>
  );
}

const SOMBRA = 3;

const styles = StyleSheet.create({
  envoltura: { width: '100%', maxWidth: 430, paddingRight: SOMBRA, paddingBottom: SOMBRA },
  sombra: {
    position: 'absolute',
    left: SOMBRA,
    top: SOMBRA,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    backgroundColor: COLOR_SOMBRA,
  },
  caja: {
    overflow: 'hidden',
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
    alignItems: 'center',
    gap: 14,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: TINTA,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  chipTexto: { fontFamily: FUENTES.pixel, fontSize: 10, color: TINTA },
  textos: { alignItems: 'center', gap: 8 },
  pixel: { fontFamily: FUENTES.pixel, fontSize: 10, textAlign: 'center' },
  titulo: {
    fontFamily: FUENTES.titulo,
    fontSize: 36,
    lineHeight: 44,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  texto: { fontFamily: FUENTES.textoSemi, fontSize: 15, lineHeight: 21, textAlign: 'center', maxWidth: 300 },
  ancho: { width: '100%' },
});
