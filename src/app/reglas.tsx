import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAjustes } from '../ajustes';
import { COLOR_CARTA } from '../components/CartasJuego';
import { IconoCasilla } from '../components/IconosCasilla';
import { Pantalla } from '../components/Pantalla';
import { BotonDuro, CajaContorno, Icono, TextoPixel } from '../components/Ui';
import { useVolver } from '../navegacion';
import { TABLERO } from '../data/board';
import { ESPECIALES, IDS_ESPECIALES } from '../data/cartasModo';
import { MODOS } from '../data/modos';
import type { Modo } from '../data/modos';
import { REGLAS_MODO, leerModoReglas, lineasTiposTarjeta, lineasTurno, modosVisibles } from '../data/reglas';
import type { TipoCasilla } from '../data/board';
import { BORDE, FUENTES, PALETAS, PAPEL, TINTA, colorDeCasilla } from '../diseno';

const P = PALETAS.basico;

// Las casillas que aparecen numeradas en el tablero, sacadas del propio tablero
function posiciones(tipo: TipoCasilla): string {
  const numeros = TABLERO.filter((c) => c.tipo === tipo).map((c) => c.numero);
  if (numeros.length === 1) return `casilla ${numeros[0]}.`;
  return `casillas ${numeros.slice(0, -1).join(', ')} y ${numeros[numeros.length - 1]}.`;
}

const CASILLAS: { tipo: TipoCasilla; nombre: string; texto: string }[] = [
  { tipo: 'oca', nombre: 'Oca', texto: 'Contestas una pregunta ligera y vuelves a tirar.' },
  {
    tipo: 'puente',
    nombre: 'Verdad o reto',
    texto: 'Eliges verdad o reto, y la otra persona te lo plantea.',
  },
  {
    tipo: 'dados',
    nombre: 'Dados',
    texto:
      'Elegís entre un duelo (tiráis por turnos y quien saque menos contesta una pregunta, un nivel más intensa de lo que toca) o una apuesta (quien saque menos retrocede 10 casillas y contesta una pregunta ligera).',
  },
  {
    tipo: 'libre',
    nombre: 'Pregunta libre',
    texto:
      'La otra persona te pregunta lo que quiera, sin mazo. Si no se le ocurre nada, puede sacar una pregunta al azar.',
  },
  {
    tipo: 'espejo',
    nombre: 'Espejo',
    texto:
      'Los dos respondéis la misma pregunta por turnos, sin leer lo que escribe el otro. Después comparáis.',
  },
  {
    tipo: 'cambio',
    nombre: 'Cambio',
    texto: 'Eliges: intercambiar tu posición con la de la otra persona o responder una pregunta.',
  },
  {
    tipo: 'posada',
    nombre: 'Posada',
    texto: 'Pagas contestando una pregunta, o pierdes un turno.',
  },
  {
    tipo: 'pozo',
    nombre: 'Pozo',
    texto:
      'Quedas atrapado hasta que la otra persona te pase, o tres turnos si ya va por delante. Cada turno que se salta, te hace una pregunta desde arriba, y puede sacarte al instante con la cuerda si contesta una pregunta un nivel más intensa. Si cae justo en el pozo, te rescata.',
  },
  { tipo: 'laberinto', nombre: 'Laberinto', texto: 'Te pierdes y retrocedes a la casilla 30.' },
  {
    tipo: 'carcel',
    nombre: 'Cárcel',
    texto:
      'Cumples dos turnos o pagas la fianza con una pregunta un nivel más intensa o con un reto que elige la otra persona.',
  },
  { tipo: 'calavera', nombre: 'Calavera', texto: 'Vuelves a empezar desde la casilla 1.' },
  {
    tipo: 'jardin',
    nombre: 'Jardín',
    texto: 'La meta. Hay que llegar con la tirada exacta; si te pasas, rebotas hacia atrás.',
  },
];

function Titulo({ children }: { children: string }) {
  return <Text style={styles.titulo}>{children}</Text>;
}

function Puntos({ lineas, color }: { lineas: string[]; color: string }) {
  return (
    <View style={styles.seccion}>
      {lineas.map((linea, i) => (
        <View key={i} style={styles.punto}>
          <View style={[styles.vineta, { backgroundColor: color }]} />
          <Text style={[styles.linea, styles.flex]}>{linea}</Text>
        </View>
      ))}
    </View>
  );
}

// ---------- Reglas de un modo: lo que se está jugando ----------

function ReglasDeModo({ modo }: { modo: Modo }) {
  const router = useRouter();
  const { ajustes } = useAjustes();
  const reglas = REGLAS_MODO[modo];
  const paleta = PALETAS[modo];
  const info = MODOS.find((m) => m.id === modo);
  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      <CajaContorno color={paleta.suelo}>
        <View style={styles.intro}>
          <Text style={styles.introTitulo}>{reglas.objetivo.titulo}</Text>
          <Text style={styles.introTexto}>{reglas.objetivo.texto}</Text>
        </View>
      </CajaContorno>

      <Titulo>{`Modo ${info?.nombre ?? ''}`}</Titulo>
      <Puntos lineas={reglas.esteModo} color={paleta.oca} />

      <Titulo>Cada turno</Titulo>
      <Puntos lineas={lineasTurno(modo, ajustes.pases)} color={paleta.oca} />

      {reglas.tablero ? (
        <>
          <Titulo>Casillas especiales</Titulo>
          {modo === 'aleatorio' ? (
            <TextoPixel size={10}>en este modo las casillas pueden cambiar de sitio o no estar.</TextoPixel>
          ) : null}
          {CASILLAS.map((c) => (
            <View key={c.tipo} style={styles.casilla}>
              <View style={[styles.cuenta, { backgroundColor: colorDeCasilla(c.tipo, paleta) }]}>
                <IconoCasilla tipo={c.tipo} size={38} />
              </View>
              <View style={styles.casillaTextos}>
                <View style={styles.casillaCabecera}>
                  <Text style={styles.casillaNombre}>{c.nombre}</Text>
                  {modo !== 'aleatorio' ? <TextoPixel size={9}>{posiciones(c.tipo)}</TextoPixel> : null}
                </View>
                <Text style={styles.linea}>{c.texto}</Text>
              </View>
            </View>
          ))}
        </>
      ) : null}

      {modo === 'cartas' ? (
        <>
          <Titulo>Cartas especiales</Titulo>
          {IDS_ESPECIALES.map((id) => (
            <View key={id} style={styles.punto}>
              <View style={[styles.vineta, { backgroundColor: COLOR_CARTA.especial }]} />
              <Text style={[styles.linea, styles.flex]}>
                <Text style={styles.modoNombre}>{ESPECIALES[id].nombre}: </Text>
                {ESPECIALES[id].texto}
              </Text>
            </View>
          ))}
        </>
      ) : null}

      <Titulo>Tipos de tarjeta</Titulo>
      <Puntos lineas={lineasTiposTarjeta(modo)} color={paleta.oca} />

      <BotonDuro
        texto="Ver todos los modos"
        onPress={() => router.push('/reglas')}
        color={PAPEL}
        style={styles.botonTodos}
      />
    </ScrollView>
  );
}

// ---------- Resumen de todos los modos (desde el inicio, sin modo elegido) ----------

function ResumenModos() {
  const router = useRouter();
  const { ajustes } = useAjustes();
  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      <CajaContorno color={P.suelo}>
        <View style={styles.intro}>
          <Text style={styles.introTitulo}>Una excusa para conoceros</Text>
          <Text style={styles.introTexto}>
            Todos los modos son para dos y se juegan con un solo móvil. Elegid uno para ver sus reglas.
            Durante una partida, «Cómo se juega» os enseña directamente las del modo que estáis jugando.
          </Text>
        </View>
      </CajaContorno>

      <Titulo>Modos</Titulo>
      {modosVisibles(ajustes.ocultarPicante).map((modo) => {
        const info = MODOS.find((m) => m.id === modo);
        return (
          <Pressable
            key={modo}
            accessibilityRole="button"
            accessibilityLabel={`Reglas del modo ${info?.nombre ?? ''}`}
            onPress={() => router.push({ pathname: '/reglas', params: { modo } })}
            style={({ pressed }) => [styles.modoFila, pressed && { backgroundColor: PALETAS[modo].oca }]}
          >
            <View style={[styles.muestra, { backgroundColor: PALETAS[modo].suelo }]} />
            <View style={styles.flex}>
              <Text style={styles.modoNombre}>{info?.nombre}</Text>
              <Text style={styles.linea}>{REGLAS_MODO[modo].resumen}</Text>
            </View>
            <View style={styles.flecha}>
              <Icono nombre="atras" size={18} />
            </View>
          </Pressable>
        );
      })}

      <Titulo>En todos los modos</Titulo>
      <Puntos
        lineas={[
          `Cada persona tiene ${ajustes.pases === 1 ? '1 pase' : `${ajustes.pases} pases`} para saltarse tarjetas. Se cambia en Ajustes.`,
          'Cuando una tarjeta tiene algo secreto, la app os pide pasar el móvil y tapa lo que no se debe ver.',
          'Al terminar hay una pregunta para los dos (se puede quitar en Ajustes) y un resumen de la partida.',
        ]}
        color={P.oca}
      />
    </ScrollView>
  );
}

export default function Reglas() {
  const volver = useVolver('/');
  const { modo: modoParam } = useLocalSearchParams<{ modo?: string }>();
  const modo = leerModoReglas(modoParam);
  const info = modo ? MODOS.find((m) => m.id === modo) : null;
  return (
    <Pantalla
      titulo={info ? `Modo ${info.nombre}` : 'Cómo se juega'}
      subtitulo={info ? 'reglas del modo.' : 'reglas.'}
      onVolver={volver}
      iconoVolver="cerrar"
    >
      {modo ? <ReglasDeModo modo={modo} /> : <ResumenModos />}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  contenido: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40, gap: 14 },
  intro: { padding: 18, gap: 8 },
  introTitulo: { fontFamily: FUENTES.titulo, fontSize: 26, color: PAPEL, textTransform: 'uppercase' },
  introTexto: { fontFamily: FUENTES.textoSemi, fontSize: 15, lineHeight: 21, color: PAPEL },
  titulo: {
    fontFamily: FUENTES.titulo,
    fontSize: 22,
    color: TINTA,
    textTransform: 'uppercase',
    marginTop: 10,
  },
  seccion: { gap: 8 },
  casilla: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  cuenta: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: BORDE,
    borderColor: TINTA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  casillaTextos: { flex: 1, gap: 3 },
  casillaCabecera: { flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' },
  casillaNombre: { fontFamily: FUENTES.titulo, fontSize: 18, color: TINTA, textTransform: 'uppercase' },
  linea: { fontFamily: FUENTES.texto, fontSize: 14.5, lineHeight: 21, color: TINTA },
  punto: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  vineta: {
    width: 10,
    height: 10,
    marginTop: 6,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: TINTA,
  },
  modoFila: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 12,
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  flecha: { transform: [{ rotate: '180deg' }] },
  botonTodos: { marginTop: 16 },
  muestra: { width: 22, height: 22, borderRadius: 6, borderWidth: BORDE, borderColor: TINTA, marginTop: 0 },
  modoNombre: { fontFamily: FUENTES.textoFuerte, fontSize: 15, color: TINTA },
});
