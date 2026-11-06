import { useVolver } from '../navegacion';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { OcaModo } from '../components/OcaModo';
import { Pantalla } from '../components/Pantalla';
import { MODOS } from '../data/modos';
import { useAjustes } from '../ajustes';
import type { Modo } from '../data/modos';
import { BORDE, DESPLAZAMIENTO_SOMBRA, FUENTES, PALETAS, PAPEL, TINTA, COLOR_SOMBRA } from '../diseno';

const ETIQUETA: Record<Modo, string> = {
  basico: 'ligero.',
  personal: 'profundo.',
  caliente: '+18.',
  infierno: '+18 explícito.',
  aleatorio: 'mezcla.',
  dado: 'sin tablero.',
  cartas: 'con cartas.',
};

export default function Modos() {
  const router = useRouter();
  const { ajustes } = useAjustes();
  const volver = useVolver('/');
  const empezar = (modo: Modo) => router.push({ pathname: '/jugadores', params: { modo } });

  return (
    <Pantalla titulo="Elige modo" subtitulo="¿cómo queréis jugar?" onVolver={volver}>
      <ScrollView contentContainerStyle={styles.lista}>
        {MODOS.filter((m) => !m.oculto && !(ajustes.ocultarPicante && m.id === 'caliente')).map((modo) => {
          const paleta = PALETAS[modo.id];
          return (
            <View key={modo.id}>
              <View style={styles.sombra} />
              <Pressable
                accessibilityRole="button"
                onPress={() => empezar(modo.id)}
                style={({ pressed }) => [
                  styles.tarjeta,
                  { backgroundColor: paleta.suelo },
                  pressed && styles.pulsada,
                ]}
              >
                <View style={[styles.insignia, { backgroundColor: paleta.papel }]}>
                  <OcaModo modo={modo.id} size={58} />
                </View>
                <View style={styles.textos}>
                  <View style={[styles.chip, { backgroundColor: paleta.oca }]}>
                    <Text style={styles.chipTexto}>{ETIQUETA[modo.id]}</Text>
                  </View>
                  <Text style={styles.nombre} numberOfLines={1} adjustsFontSizeToFit>
                    {modo.nombre}
                  </Text>
                  <Text style={styles.descripcion} numberOfLines={2}>
                    {modo.descripcion}
                  </Text>
                </View>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </Pantalla>
  );
}

const ALTO_TARJETA = 128;

const styles = StyleSheet.create({
  lista: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 28, gap: 16 },
  sombra: {
    position: 'absolute',
    left: DESPLAZAMIENTO_SOMBRA,
    top: DESPLAZAMIENTO_SOMBRA,
    right: -DESPLAZAMIENTO_SOMBRA,
    bottom: -DESPLAZAMIENTO_SOMBRA,
    borderRadius: 20,
    backgroundColor: COLOR_SOMBRA,
  },
  // Todas las tarjetas del mismo alto, digan lo que digan
  tarjeta: {
    height: ALTO_TARJETA,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 20,
    borderWidth: BORDE,
    borderColor: TINTA,
  },
  pulsada: { transform: [{ translateX: DESPLAZAMIENTO_SOMBRA }, { translateY: DESPLAZAMIENTO_SOMBRA }] },
  insignia: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: BORDE,
    borderColor: TINTA,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
  },
  textos: { flex: 1, gap: 4, alignItems: 'flex-start' },
  chip: {
    borderWidth: 1.5,
    borderColor: TINTA,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chipTexto: { fontFamily: FUENTES.pixel, fontSize: 10, color: TINTA },
  nombre: { fontFamily: FUENTES.titulo, fontSize: 28, color: PAPEL, textTransform: 'uppercase' },
  descripcion: { fontFamily: FUENTES.textoSemi, fontSize: 14, lineHeight: 19, color: PAPEL },
});
