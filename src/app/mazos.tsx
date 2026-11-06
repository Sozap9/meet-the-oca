import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAjustes } from '../ajustes';
import { OcaModo } from '../components/OcaModo';
import { Pantalla } from '../components/Pantalla';
import { CajaContorno, Icono, TextoPixel } from '../components/Ui';
import { MAZOS } from '../data/decks';
import { IDS_MAZO, tarjetasDelMazo } from '../data/mazosPersonales';
import type { IdMazo } from '../data/mazosPersonales';
import { MODOS } from '../data/modos';
import { BORDE, FUENTES, PALETAS, PAPEL, TINTA } from '../diseno';
import { useMazos } from '../mazos';
import { useVolver } from '../navegacion';

// Dónde se usa cada mazo
const USOS: Record<IdMazo, string> = {
  basico: 'Modo Básico, Aleatorio, Dado de temas y Cartas.',
  personal: 'Modo Personal, Aleatorio, Dado de temas y Cartas.',
  caliente: 'Modo Caliente, Aleatorio, Dado de temas y Cartas.',
  infierno: 'Modo Infierno.',
};

export default function Mazos() {
  const router = useRouter();
  const volver = useVolver('/');
  const { ajustes } = useAjustes();
  const { mazos } = useMazos();
  const visibles = IDS_MAZO.filter((m) => !(ajustes.ocultarPicante && (m === 'caliente' || m === 'infierno')));

  return (
    <Pantalla titulo="Mazos" subtitulo="ajustes." onVolver={router.canGoBack() ? () => router.back() : volver}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.intro}>
          Elegid qué tarjetas salen en cada mazo y añadid las vuestras. Los cambios valen en todos los
          modos que usan ese mazo.
        </Text>
        {visibles.map((id) => {
          const lista = tarjetasDelMazo(id, MAZOS[id], mazos);
          const activas = lista.filter((t) => t.activa).length;
          const propias = lista.filter((t) => t.propia).length;
          const paleta = PALETAS[id];
          const nombre = MODOS.find((m) => m.id === id)?.nombre ?? id;
          return (
            <Pressable
              key={id}
              accessibilityRole="button"
              accessibilityLabel={`Mazo ${nombre}`}
              onPress={() => router.push({ pathname: '/mazo', params: { mazo: id } })}
              style={({ pressed }) => [pressed && styles.pulsado]}
            >
              <CajaContorno color={paleta.suelo}>
                <View style={styles.fila}>
                  <View style={[styles.insignia, { backgroundColor: paleta.papel }]}>
                    <OcaModo modo={id} size={46} />
                  </View>
                  <View style={styles.textos}>
                    <Text style={styles.nombre}>{nombre}</Text>
                    <Text style={styles.cuenta}>
                      {`${activas} de ${lista.length} activas${propias > 0 ? ` · ${propias} ${propias === 1 ? 'propia' : 'propias'}` : ''}`}
                    </Text>
                    <TextoPixel size={9} color={PAPEL}>{USOS[id]}</TextoPixel>
                  </View>
                  <View style={[styles.flecha, { backgroundColor: paleta.papel }]}>
                    <View style={styles.girada}>
                      <Icono nombre="atras" size={18} />
                    </View>
                  </View>
                </View>
              </CajaContorno>
            </Pressable>
          );
        })}
      </ScrollView>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  contenido: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40, gap: 16 },
  intro: { fontFamily: FUENTES.textoSemi, fontSize: 15, lineHeight: 21, color: TINTA },
  pulsado: { transform: [{ translateX: 2 }, { translateY: 2 }] },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  insignia: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: BORDE,
    borderColor: TINTA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: { flex: 1, gap: 3 },
  nombre: { fontFamily: FUENTES.titulo, fontSize: 24, color: PAPEL, textTransform: 'uppercase' },
  cuenta: { fontFamily: FUENTES.textoFuerte, fontSize: 14, color: PAPEL },
  flecha: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: BORDE,
    borderColor: TINTA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  girada: { transform: [{ rotate: '180deg' }] },
});
