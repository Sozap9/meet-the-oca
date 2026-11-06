import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { BORDE, FUENTES, PALETAS, TINTA } from '../diseno';
import { Capa } from './Capa';
import { Grano } from './Grano';
import {
  FondoLlamas,
  IconoLlama,
  Llama,
  NARANJA_LLAMA,
  NUCLEO_LLAMA,
  ROJO_LLAMA,
  AMARILLO_LLAMA,
} from './Infierno';
import { OcaModo } from './OcaModo';

// Al elegir Caliente: ¿seguir en Caliente o bajar al Infierno (explícito)?
// Para activar Infierno hay que confirmar que los dos sois mayores de edad.

const P = PALETAS.infierno;
const ALTO_CABECERA = 200;

const LLAMAS_DELANTE = [
  { x: 20, alto: 34, color: ROJO_LLAMA },
  { x: 62, alto: 50, color: NARANJA_LLAMA },
  { x: 104, alto: 30, color: ROJO_LLAMA },
  { x: 150, alto: 40, color: NARANJA_LLAMA },
  { x: 62, alto: 26, color: AMARILLO_LLAMA },
  { x: 150, alto: 20, color: NUCLEO_LLAMA },
];

export function ModalInfierno({
  visible,
  onCaliente,
  onInfierno,
  textoNo = 'Seguir en Caliente',
}: {
  visible: boolean;
  onCaliente: () => void;
  onInfierno: () => void;
  textoNo?: string; // el botón de no activarlo (al elegir mazos: "No añadirlo")
}) {
  const [mayores, setMayores] = useState(false);
  const [ancho, setAncho] = useState(0);

  // Cada vez que se abre, la confirmación empieza sin marcar
  useEffect(() => {
    if (visible) setMayores(false);
  }, [visible]);

  return (
    <Capa visible={visible}>
      <View style={styles.envoltura}>
        <View style={styles.sombra} />
        <View style={[styles.caja, { backgroundColor: P.papel }]}>
          <View
            style={[styles.cabecera, { backgroundColor: P.suelo }]}
            onLayout={(e) => setAncho(Math.ceil(e.nativeEvent.layout.width))}
          >
            {ancho > 0 ? (
              <Svg width={ancho} height={ALTO_CABECERA} style={StyleSheet.absoluteFill}>
                <G transform="translate(0 -60)">
                  <FondoLlamas ancho={ancho} alto={ALTO_CABECERA + 60} />
                </G>
                {LLAMAS_DELANTE.map((l, i) => (
                  <Llama key={i} x={l.x} y={ALTO_CABECERA + 4} alto={l.alto} color={l.color} />
                ))}
              </Svg>
            ) : null}
            <View style={styles.oca} pointerEvents="none">
              <OcaModo modo="infierno" size={104} grosor={4.5} />
            </View>
            <View style={styles.textosCabecera}>
              <View style={[styles.chip, { borderColor: P.papel }]}>
                <Text style={[styles.chipTexto, { color: P.papel }]}>solo +18.</Text>
              </View>
              <Text style={[styles.titulo, { color: P.papel }]}>¿Bajamos al infierno?</Text>
            </View>
          </View>

          <View style={styles.cuerpo}>
            <Grano opacidad={0.55} />
            <Text style={styles.texto}>Como el modo Caliente, pero explícito y sin filtros.</Text>

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: mayores }}
              onPress={() => setMayores((m) => !m)}
              style={[styles.confirmar, { backgroundColor: mayores ? '#FFE7C2' : '#FFFFFF' }]}
            >
              <View style={[styles.casilla, { backgroundColor: mayores ? P.suelo : '#FFFFFF' }]}>
                {mayores ? (
                  <Svg width={16} height={16} viewBox="0 0 24 24">
                    <Path d="M5 12l5 5 9-10" fill="none" stroke={P.papel} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                ) : null}
              </View>
              <Text style={styles.confirmarTexto}>Los dos somos mayores de edad y queremos jugarlo.</Text>
            </Pressable>

            <View style={styles.botones}>
              <Pressable
                accessibilityRole="button"
                onPress={onCaliente}
                style={({ pressed }) => [styles.boton, { backgroundColor: '#FFFFFF' }, pressed && styles.pulsado]}
              >
                <Text style={[styles.botonTexto, { color: TINTA }]} numberOfLines={2}>
                  {textoNo}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: !mayores }}
                disabled={!mayores}
                onPress={onInfierno}
                style={({ pressed }) => [
                  styles.boton,
                  { backgroundColor: mayores ? P.suelo : '#D9C9BC' },
                  pressed && styles.pulsado,
                ]}
              >
                <View style={styles.botonFila}>
                  <IconoLlama size={15} color={mayores ? P.papel : '#6B5A50'} />
                  <Text style={[styles.botonTexto, { color: mayores ? P.papel : '#6B5A50' }]} numberOfLines={2}>
                    Activar infierno
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Capa>
  );
}

const styles = StyleSheet.create({
  envoltura: { width: '100%', maxWidth: 380, paddingRight: 2, paddingBottom: 2 },
  sombra: {
    position: 'absolute',
    left: 2,
    top: 2,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    backgroundColor: 'rgba(21,21,21,0.35)',
  },
  caja: { borderWidth: BORDE, borderColor: TINTA, borderRadius: 22, overflow: 'hidden' },
  cabecera: { height: ALTO_CABECERA, overflow: 'hidden' },
  // La oca (con cuernos y tridente) cabe entera: sitio arriba para el tridente y abajo para las patas
  oca: { position: 'absolute', right: 16, top: 44 },
  textosCabecera: { position: 'absolute', left: 18, top: 18, right: 136, gap: 10, alignItems: 'flex-start' },
  chip: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  chipTexto: { fontFamily: FUENTES.pixel, fontSize: 10 },
  titulo: { fontFamily: FUENTES.titulo, fontSize: 28, lineHeight: 33, paddingTop: 2, textTransform: 'uppercase' },
  cuerpo: { padding: 18, gap: 14 },
  texto: { fontFamily: FUENTES.textoSemi, fontSize: 16, lineHeight: 22, color: TINTA },
  confirmar: {
    minHeight: 56,
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  casilla: {
    width: 26,
    height: 26,
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmarTexto: { flex: 1, fontFamily: FUENTES.textoFuerte, fontSize: 14, lineHeight: 19, color: TINTA },
  botones: { flexDirection: 'row', gap: 10 },
  boton: {
    flex: 1,
    height: 58,
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  pulsado: { transform: [{ translateX: 1.5 }, { translateY: 1.5 }] },
  botonFila: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  botonTexto: {
    fontFamily: FUENTES.titulo,
    fontSize: 16,
    lineHeight: 19,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
