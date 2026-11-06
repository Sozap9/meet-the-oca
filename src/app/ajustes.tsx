import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Pantalla } from '../components/Pantalla';
import { BotonDuro, CajaContorno, Icono, TextoPixel } from '../components/Ui';
import { useAjustes } from '../ajustes';
import type { Ajustes } from '../ajustes';
import { BORDE, FUENTES, PALETAS, PAPEL, TINTA } from '../diseno';
import { sonar } from '../sonido';
import { useVolver } from '../navegacion';

const P = PALETAS.basico;

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <CajaContorno>
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>{titulo}</Text>
        {children}
      </View>
    </CajaContorno>
  );
}

// Fila con un interruptor de encendido y apagado
function Interruptor({
  texto,
  nota,
  valor,
  onCambio,
  desactivado = false,
}: {
  texto: string;
  nota?: string;
  valor: boolean;
  onCambio: (v: boolean) => void;
  desactivado?: boolean;
}) {
  return (
    <Pressable
      onPress={() => onCambio(!valor)}
      disabled={desactivado}
      accessibilityRole="switch"
      accessibilityState={{ checked: valor, disabled: desactivado }}
      accessibilityLabel={texto}
      style={[styles.fila, desactivado && styles.apagada]}
    >
      <View style={styles.textos}>
        <Text style={styles.texto}>{texto}</Text>
        {nota ? <TextoPixel size={9}>{nota}</TextoPixel> : null}
      </View>
      <View style={[styles.pista, { backgroundColor: valor ? P.suelo : '#FFFFFF' }]}>
        <View style={[styles.bola, valor ? styles.bolaEncendida : null]} />
      </View>
    </Pressable>
  );
}

// Fila con un valor que se sube y se baja (volúmenes, pases)
function Selector({
  texto,
  valor,
  min,
  max,
  paso,
  formato = (v: number) => String(v),
  onCambio,
  desactivado = false,
}: {
  texto: string;
  valor: number;
  min: number;
  max: number;
  paso: number;
  formato?: (v: number) => string;
  onCambio: (v: number) => void;
  desactivado?: boolean;
}) {
  const Boton = ({ icono, nuevo }: { icono: 'mas' | 'menos'; nuevo: number }) => (
    <Pressable
      onPress={() => onCambio(nuevo)}
      disabled={desactivado || nuevo < min || nuevo > max}
      accessibilityRole="button"
      accessibilityLabel={`${icono === 'mas' ? 'Subir' : 'Bajar'} ${texto.toLowerCase()}`}
      hitSlop={6}
      style={({ pressed }) => [
        styles.botonPaso,
        (nuevo < min || nuevo > max) && styles.apagada,
        pressed && { backgroundColor: P.oca },
      ]}
    >
      <Icono nombre={icono} size={18} />
    </Pressable>
  );
  return (
    <View style={[styles.fila, desactivado && styles.apagada]}>
      <Text style={[styles.texto, styles.textos]}>{texto}</Text>
      <View style={styles.selector}>
        <Boton icono="menos" nuevo={valor - paso} />
        <Text style={styles.valor}>{formato(valor)}</Text>
        <Boton icono="mas" nuevo={valor + paso} />
      </View>
    </View>
  );
}

export default function PantallaAjustes() {
  const router = useRouter();
  const volver = useVolver('/');
  const { ajustes, cambiar, restablecer } = useAjustes();
  const cambia = <K extends keyof Ajustes>(clave: K) => (v: Ajustes[K]) => cambiar({ [clave]: v } as Partial<Ajustes>);
  const porcentaje = (v: number) => `${v}%`;
  const sinSonido = ajustes.silencio;

  return (
    <Pantalla titulo="Ajustes" subtitulo="a vuestro gusto." onVolver={router.canGoBack() ? () => router.back() : volver} iconoVolver="cerrar">
      <ScrollView contentContainerStyle={styles.contenido}>
        <Seccion titulo="Sonido">
          <Interruptor texto="Silencio" nota="apaga todos los sonidos." valor={ajustes.silencio} onCambio={cambia('silencio')} />
          <Selector
            texto="Efectos"
            valor={ajustes.efectos}
            min={0}
            max={100}
            paso={10}
            formato={porcentaje}
            desactivado={sinSonido}
            onCambio={(v) => {
              cambiar({ efectos: v });
              setTimeout(() => sonar('especial'), 50); // para oír cómo queda
            }}
          />
          <Interruptor texto="Sonido de botones" valor={ajustes.sonidoBotones} onCambio={cambia('sonidoBotones')} desactivado={sinSonido} />
          <Interruptor
            texto="Música de fondo"
            nota="suena durante la partida."
            valor={ajustes.musica}
            onCambio={cambia('musica')}
            desactivado={sinSonido}
          />
          <Selector
            texto="Volumen de la música"
            valor={ajustes.volumenMusica}
            min={0}
            max={100}
            paso={10}
            formato={porcentaje}
            desactivado={sinSonido || !ajustes.musica}
            onCambio={cambia('volumenMusica')}
          />
          <Interruptor texto="Vibración" valor={ajustes.vibracion} onCambio={cambia('vibracion')} />
        </Seccion>

        <Seccion titulo="Partida">
          <Selector texto="Pases de cada persona" valor={ajustes.pases} min={0} max={5} paso={1} onCambio={cambia('pases')} />
          <Interruptor
            texto="Pregunta final"
            nota="una pregunta para los dos al terminar."
            valor={ajustes.preguntaFinal}
            onCambio={cambia('preguntaFinal')}
          />
          <TextoPixel size={9}>los cambios de partida se notan en la siguiente.</TextoPixel>
        </Seccion>

        <Seccion titulo="Mazos">
          <Text style={styles.nota}>
            Mirad las tarjetas de cada mazo, desactivad las que no queráis y añadid las vuestras.
          </Text>
          <BotonDuro texto="Ver y editar mazos" onPress={() => router.push('/mazos')} />
        </Seccion>

        <Seccion titulo="Contenido">
          <Interruptor
            texto="Ocultar contenido +18"
            nota="esconde el modo caliente y sus temas."
            valor={ajustes.ocultarPicante}
            onCambio={cambia('ocultarPicante')}
          />
        </Seccion>

        <Seccion titulo="Accesibilidad">
          <Interruptor texto="Reducir animaciones" valor={ajustes.reducirAnimaciones} onCambio={cambia('reducirAnimaciones')} />
          <Interruptor texto="Textura de papel" nota="el grano de los fondos." valor={ajustes.grano} onCambio={cambia('grano')} />
        </Seccion>

        <BotonDuro texto="Restablecer ajustes" onPress={restablecer} />
      </ScrollView>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  contenido: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40, gap: 16 },
  seccion: { padding: 16, gap: 12 },
  seccionTitulo: { fontFamily: FUENTES.titulo, fontSize: 20, lineHeight: 26, color: TINTA, textTransform: 'uppercase' },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  textos: { flex: 1, gap: 2 },
  texto: { fontFamily: FUENTES.textoFuerte, fontSize: 15, color: TINTA },
  nota: { fontFamily: FUENTES.textoSemi, fontSize: 14, lineHeight: 20, color: TINTA },
  apagada: { opacity: 0.4 },
  pista: {
    width: 54,
    height: 32,
    borderRadius: 16,
    borderWidth: BORDE,
    borderColor: TINTA,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  bola: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: BORDE,
    borderColor: TINTA,
    backgroundColor: PAPEL,
  },
  bolaEncendida: { alignSelf: 'flex-end' },
  selector: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  botonPaso: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: BORDE,
    borderColor: TINTA,
    backgroundColor: PAPEL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valor: { minWidth: 48, textAlign: 'center', fontFamily: FUENTES.titulo, fontSize: 18, color: TINTA },
});
