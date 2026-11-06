import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { Grano } from '../components/Grano';
import { OcaModo } from '../components/OcaModo';
import { BotonDuro, BotonRedondo, TextoPixel } from '../components/Ui';
import { BORDE, FUENTES, PALETAS, PAPEL, TINTA, COLOR_SOMBRA } from '../diseno';

const P = PALETAS.basico;

// Un trocito del recorrido del tablero: cuentas de colores sobre una banda ondulada
const CUENTAS: { x: number; y: number; color: string; texto: string }[] = [
  { x: 28, y: 52, color: PAPEL, texto: '1' },
  { x: 74, y: 40, color: P.oca, texto: '5' },
  { x: 120, y: 50, color: PAPEL, texto: '6' },
  { x: 166, y: 38, color: P.juego, texto: '?' },
  { x: 212, y: 48, color: PAPEL, texto: '9' },
  { x: 258, y: 36, color: P.duo, texto: '!' },
];

function Recorrido() {
  return (
    <Svg width="100%" height={90} viewBox="0 0 300 90">
      <Path
        d="M8 54 C40 30 60 30 96 44 S160 56 190 40 S250 26 292 38"
        fill="none"
        stroke={TINTA}
        strokeWidth={34}
        strokeLinecap="round"
      />
      <Path
        d="M8 54 C40 30 60 30 96 44 S160 56 190 40 S250 26 292 38"
        fill="none"
        stroke={P.retro}
        strokeWidth={30}
        strokeLinecap="round"
      />
      {CUENTAS.map((c) => (
        <Circle key={c.x} cx={c.x} cy={c.y} r={17} fill={c.color} stroke={TINTA} strokeWidth={2} />
      ))}
      {CUENTAS.map((c) => (
        <SvgText
          key={`t${c.x}`}
          x={c.x}
          y={c.y + 6}
          fontSize={17}
          fontFamily={FUENTES.titulo}
          fill={TINTA}
          textAnchor="middle"
        >
          {c.texto}
        </SvgText>
      ))}
    </Svg>
  );
}

export default function Inicio() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={styles.contenedor}>
      <Grano />
      <View style={[styles.engranaje, { top: insets.top + 8 }]}>
        <BotonRedondo icono="ajustes" etiqueta="Ajustes" onPress={() => router.push('/ajustes')} />
      </View>
      <View style={styles.cartel}>
        <View style={styles.sombra} />
        <View style={styles.caja}>
          <View style={styles.oca}>
            <OcaModo modo="basico" size={120} />
          </View>
          <Text style={styles.titulo}>Meet{'\n'}the Oca</Text>
          <TextoPixel color={PAPEL} size={12}>
            un juego para conoceros.
          </TextoPixel>
          <Recorrido />
        </View>
      </View>

      <View style={styles.botones}>
        <BotonDuro texto="Jugar" grande color={P.oca} icono="dado" onPress={() => router.push('/modos')} />
        <BotonDuro texto="Cómo se juega" onPress={() => router.push('/reglas')} />
      </View>
      <TextoPixel size={10}>para dos personas.</TextoPixel>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: P.pagina,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 28,
  },
  cartel: { width: '100%', maxWidth: 380 },
  engranaje: { position: 'absolute', right: 20 },
  sombra: {
    position: 'absolute',
    left: 3,
    top: 3,
    right: -3,
    bottom: -3,
    borderRadius: 26,
    backgroundColor: COLOR_SOMBRA,
  },
  caja: {
    backgroundColor: P.suelo,
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 26,
    paddingTop: 28,
    paddingHorizontal: 22,
    paddingBottom: 12,
    gap: 10,
    overflow: 'hidden',
  },
  oca: { position: 'absolute', right: 6, top: 18 },
  titulo: {
    fontFamily: FUENTES.titulo,
    fontSize: 56,
    lineHeight: 64,
    paddingTop: 4,
    color: PAPEL,
    textTransform: 'uppercase',
  },
  botones: { width: '100%', maxWidth: 380, gap: 14 },
});
