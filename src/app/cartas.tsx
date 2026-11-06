import { esReciente } from '../data/vistas';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BotonModal, CabeceraModal, Caja, Capa, TextoModal } from '../components/Capa';
import { Carta, DibujoCarta, Reverso, colorDeCarta, etiquetaDeCarta, tituloDeCarta } from '../components/CartasJuego';
import { Grano } from '../components/Grano';
import { TarjetaContenido } from '../components/ModalesJuego';
import { PasaMovil } from '../components/PasaMovil';
import { ConfirmarContenido, FinalContenido, MenuContenido, ResumenContenido } from '../components/ModalesPartida';
import type { Confirmacion } from '../components/ModalesPartida';
import { BotonRedondo, TextoPixel } from '../components/Ui';
import { ajustesActuales } from '../ajustesBase';
import { ESPECIALES, construirMazo, leerCartas } from '../data/cartasModo';
import type { CartaJuego } from '../data/cartasModo';
import { leerNiveles } from '../data/decks';
import { finalDeModo } from '../data/finales';
import { BORDE, FUENTES, PAPEL, TINTA } from '../diseno';
import { jugarCarta, repartir, terminarTurno, usarGuardada } from '../engine/cartas';
import type { EstadoCartas } from '../engine/cartas';
import { crearJuego } from '../engine/juego';
import { leerParticipantes } from '../engine/participantes';
import { crearPases, gastarPase } from '../engine/pases';
import { resumir } from '../engine/resumen';
import type { Entrada } from '../engine/resumen';
import { useVolverAModos } from '../navegacion';
import { ponerMusica, sonar } from '../sonido';
import { TEMAS, TemaProvider } from '../temas';
import { COLORES_JUGADOR } from '../theme';

const ESPERA_CIERRE_MS = 400;

// Una tarjeta en juego: quién la responde y si después la responde también la otra persona
type Activa = { clave: number; carta: Extract<CartaJuego, { tipo: 'tarjeta' }>; para: number; dos: boolean; segunda: boolean };

export default function Cartas() {
  const router = useRouter();
  const salir = useVolverAModos();
  const { width } = useWindowDimensions();
  const {
    jugadores: jugadoresParam,
    niveles: nivelesParam,
    cartas: cartasParam,
  } = useLocalSearchParams<{ jugadores?: string; niveles?: string; cartas?: string }>();
  const participantes = leerParticipantes(jugadoresParam, COLORES_JUGADOR);
  const niveles = leerNiveles(nivelesParam);
  const total = leerCartas(cartasParam);
  const tema = TEMAS.cartas;

  // Las tarjetas que no han salido en las últimas partidas entran antes en el mazo
  const nuevaPartida = () =>
    repartir(construirMazo(niveles, total, Math.random, esReciente), participantes.length);

  const [jugadores] = useState(() => crearJuego(participantes).jugadores);
  const [estado, setEstado] = useState<EstadoCartas>(nuevaPartida);
  const [pases, setPases] = useState(() => crearPases(participantes.length, ajustesActuales().pases));
  const [historial, setHistorial] = useState<Entrada[]>([]);
  const [activa, setActiva] = useState<Activa | null>(null);
  const [especial, setEspecial] = useState<Extract<CartaJuego, { tipo: 'especial' }> | null>(null);
  const [libre, setLibre] = useState<number | null>(null); // quién hace la pregunta libre
  // Entre turnos se tapa la mano y se pasa el móvil, para que nadie vea las cartas del otro
  const [pasando, setPasando] = useState<{ de: number; a: number } | null>(null);
  const [vuelta, setVuelta] = useState(0); // cambia cada vez que se enseña una mano, para animarla
  const [final, setFinal] = useState<string | null>(null);
  const [fin, setFin] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [resumenAbierto, setResumenAbierto] = useState(false);
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null);
  const clave = useRef(0);

  const otroDe = (j: number) => (j + 1) % jugadores.length;
  const turno = estado.turno;

  // Se baraja al empezar y suena la música de fondo si está activada
  useEffect(() => sonar('barajar'), []);
  useEffect(() => {
    ponerMusica('basico');
    return () => ponerMusica(null);
  }, []);

  // ---------- Turnos ----------

  const finTurno = (base: EstadoCartas, jugador: number) => {
    const nuevo = terminarTurno(base, jugador);
    // Al terminar el turno se roba del mazo (si quedan cartas)
    if (nuevo.mazo.length < base.mazo.length) sonar('robar');
    setEstado(nuevo);
    // Sin cartas en el mazo ni en las manos: se acabó la partida (no hay ganador)
    if (nuevo.terminada) {
      if (ajustesActuales().preguntaFinal) setFinal(finalDeModo('cartas', niveles));
      else setFin(true);
      return;
    }
    if (nuevo.turno !== jugador) setPasando({ de: jugador, a: nuevo.turno });
    else setVuelta((v) => v + 1); // salta turno: vuelve a jugar la misma persona
  };

  const tocarCarta = (c: CartaJuego) => {
    if (contenido !== null || estado.terminada) return;
    if (c.tipo === 'especial') {
      setEspecial(c);
      return;
    }
    const r = jugarCarta(estado, turno, c.id);
    if (!r.carta || r.carta.tipo !== 'tarjeta') return;
    setEstado(r.estado);
    clave.current += 1;
    // La carta que juegas va para tu pareja
    setActiva({ clave: clave.current, carta: r.carta, para: otroDe(turno), dos: r.responderDos, segunda: false });
  };

  const jugarEspecial = () => {
    if (!especial) return;
    const r = jugarCarta(estado, turno, especial.id);
    setEspecial(null);
    sonar('especial');
    if (especial.especial === 'libre') {
      setEstado(r.estado);
      setLibre(turno);
    } else {
      finTurno(r.estado, turno);
    }
  };

  // Resuelve la tarjeta en juego. "base" permite partir de un estado ya cambiado (por una carta guardada)
  const resolverTarjeta = (
    resultado: 'hecha' | 'pasada',
    respuesta?: string,
    acierto?: boolean,
    opciones: { gratis?: boolean; base?: EstadoCartas } = {},
  ) => {
    if (!activa) return;
    const { carta, para } = activa;
    setHistorial((h) => [...h, { jugador: para, tarjeta: carta.tarjeta, resultado, respuesta, acierto }]);
    if (resultado === 'pasada' && !opciones.gratis) {
      setPases((p) => gastarPase(p, para));
      sonar('ficha');
    }
    if (activa.dos && !activa.segunda) {
      // Doble: ahora la misma carta para la otra persona
      clave.current += 1;
      setActiva({ ...activa, clave: clave.current, para: otroDe(para), segunda: true });
      if (opciones.base) setEstado(opciones.base);
      return;
    }
    setActiva(null);
    finTurno(opciones.base ?? estado, turno);
  };

  // Carta guardada que puede usar quien tiene que responder (Te la devuelvo)
  const acciones: { texto: string; onPress: () => void }[] = [];
  if (activa && !activa.segunda) {
    const quien = activa.para;
    const guardada = (id: 'devuelvo') =>
      estado.manos[quien].find((c) => c.tipo === 'especial' && c.especial === id);
    const devuelvo = guardada('devuelvo');
    if (devuelvo)
      acciones.push({
        texto: 'Te la devuelvo',
        onPress: () => {
          sonar('especial');
          setEstado(usarGuardada(estado, quien, devuelvo.id));
          clave.current += 1;
          setActiva({ ...activa, clave: clave.current, para: otroDe(quien), segunda: true, dos: false });
        },
      });
  }

  // ---------- Menú, salir y reiniciar ----------

  const reiniciar = () => {
    sonar('barajar');
    setEstado(nuevaPartida());
    setPases(crearPases(participantes.length, ajustesActuales().pases));
    setHistorial([]);
    setActiva(null);
    setEspecial(null);
    setLibre(null);
    setFinal(null);
    setFin(false);
    setMenuAbierto(false);
    setResumenAbierto(false);
  };

  const pedirReinicio = () => {
    setMenuAbierto(false);
    setConfirmacion({
      titulo: '¿Reiniciar la partida?',
      texto: 'Se perderá el progreso actual.',
      ok: 'Reiniciar',
      alAceptar: () => {
        setConfirmacion(null);
        reiniciar();
      },
    });
  };

  const pedirSalida = () => {
    setMenuAbierto(false);
    setConfirmacion({
      titulo: '¿Salir de la partida?',
      texto: 'Se perderá el progreso actual.',
      ok: 'Salir',
      alAceptar: () => {
        setConfirmacion(null);
        salir();
      },
    });
  };

  const abrirTras = (ruta: '/reglas' | '/ajustes') => {
    setMenuAbierto(false);
    setTimeout(
      () => router.push(ruta === '/reglas' ? { pathname: '/reglas', params: { modo: 'cartas' } } : '/ajustes'),
      ESPERA_CIERRE_MS,
    );
  };

  // ---------- Ventana: un solo contenido a la vez ----------

  const resumen = resumir(historial, jugadores);
  let contenido: ReactNode = null;
  if (confirmacion) {
    contenido = <ConfirmarContenido confirmacion={confirmacion} onCancelar={() => setConfirmacion(null)} />;
  } else if (pasando && !activa && !especial && libre === null && final === null && !menuAbierto && !resumenAbierto) {
    contenido = (
      <PasaMovil
        chip="cartas."
        antes={`${jugadores[pasando.de].nombre} ha terminado su turno.`.toLowerCase()}
        para={jugadores[pasando.a].nombre}
        texto="Coge el móvil: tu mano está tapada hasta que lo tengas. Elige una carta y será para tu pareja."
        onListo={() => {
          setPasando(null);
          setVuelta((v) => v + 1);
        }}
      />
    );
  } else if (activa) {
    contenido = (
      <TemaProvider modo="cartas" cambios={{ cabecera: colorDeCarta(activa.carta), cabeceraTexto: TINTA }}>
        <TarjetaContenido
          key={activa.clave}
          tarjeta={activa.carta.tarjeta}
          para={jugadores[activa.para]}
          otro={jugadores[otroDe(activa.para)]}
          pases={pases[activa.para]}
          ilustracion={<DibujoCarta carta={activa.carta} />}
          chipTema={
            activa.dos
              ? 'doble: respondéis los dos.'
              : `${etiquetaDeCarta(activa.carta).replace(/\.$/, '')} · de ${jugadores[otroDe(activa.para)].nombre.toLowerCase()}.`
          }
          acciones={acciones}
          onHecho={(respuesta, acierto) => resolverTarjeta('hecha', respuesta, acierto)}
          onPasar={() => resolverTarjeta('pasada')}
        />
      </TemaProvider>
    );
  } else if (especial) {
    const info = ESPECIALES[especial.especial];
    contenido = (
      <TemaProvider modo="cartas" cambios={{ cabecera: colorDeCarta(especial), cabeceraTexto: TINTA }}>
        <Caja>
          <CabeceraModal
            sangrado
            titulo={info.nombre}
            chip="carta especial."
            ilustracion={<DibujoCarta carta={especial} />}
          />
          <TextoModal>{info.texto}</TextoModal>
          {info.guardable ? (
            <>
              <TextoPixel size={10}>se usa cuando te toca una carta.</TextoPixel>
              <BotonModal principal texto="Guardarla" onPress={() => setEspecial(null)} />
              <BotonModal texto="Descartarla" descripcion="La juegas como tu turno, sin efecto" onPress={jugarEspecial} />
            </>
          ) : (
            <>
              <BotonModal principal texto="Jugarla" onPress={jugarEspecial} />
              <BotonModal texto="Ahora no" onPress={() => setEspecial(null)} />
            </>
          )}
        </Caja>
      </TemaProvider>
    );
  } else if (libre !== null) {
    contenido = (
      <TemaProvider modo="cartas" cambios={{ cabecera: tema.juego, cabeceraTexto: TINTA }}>
        <Caja>
          <CabeceraModal
            sangrado
            titulo="Pregunta libre"
            chip="carta especial."
            ilustracion={<DibujoCarta carta={{ id: -1, tipo: 'especial', especial: 'libre' }} />}
          />
          <TextoModal>{`${jugadores[libre].nombre}, hazle a ${jugadores[otroDe(libre)].nombre} la pregunta que quieras.`}</TextoModal>
          <BotonModal
            principal
            texto="Hecho"
            onPress={() => {
              const quien = libre;
              setLibre(null);
              finTurno(estado, quien);
            }}
          />
        </Caja>
      </TemaProvider>
    );
  } else if (final !== null) {
    contenido = (
      <FinalContenido
        texto={final}
        onContinuar={() => {
          setFinal(null);
          setFin(true);
        }}
      />
    );
  } else if (resumenAbierto) {
    contenido = <ResumenContenido resumen={resumen} onCerrar={() => setResumenAbierto(false)} />;
  } else if (menuAbierto) {
    contenido = (
      <MenuContenido
        onReglas={() => abrirTras('/reglas')}
        onAjustes={() => abrirTras('/ajustes')}
        onResumen={() => {
          setMenuAbierto(false);
          setResumenAbierto(true);
        }}
        onReiniciar={pedirReinicio}
        onSalir={pedirSalida}
        onCerrar={() => setMenuAbierto(false)}
      />
    );
  } else if (fin) {
    contenido = (
      <Caja>
        <CabeceraModal
          sangrado
          titulo="Fin de la partida"
          chip={`${estado.ronda} ${estado.ronda === 1 ? 'ronda' : 'rondas'}.`}
          dibujo="feliz"
        />
        <TextoModal>{`${resumen.totalHechas} cartas respondidas entre los dos.`}</TextoModal>
        <BotonModal principal texto="Ver respuestas" onPress={() => setResumenAbierto(true)} />
        <BotonModal texto="Jugar otra vez" onPress={reiniciar} />
        <BotonModal texto="Elegir modo" onPress={salir} />
      </Caja>
    );
  }

  // ---------- Mesa ----------

  const mano = estado.manos[turno];
  const rival = otroDe(turno);
  const ultima = estado.pila[estado.pila.length - 1];
  const anchoMano = Math.min(118, Math.max(84, (width - 40) / Math.max(3, mano.length) + 30));
  const pasoMano = mano.length > 1 ? Math.min(anchoMano * 0.72, (width - 40 - anchoMano) / (mano.length - 1)) : 0;
  const anchoTotalMano = anchoMano + pasoMano * Math.max(0, mano.length - 1);

  return (
    <TemaProvider modo="cartas">
      <SafeAreaView edges={['top', 'bottom']} style={[styles.contenedor, { backgroundColor: tema.pagina }]}>
        <Grano />
        <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.barra}>
          <BotonRedondo icono="atras" etiqueta="Salir de la partida" onPress={pedirSalida} />
          <View style={styles.flex}>
            <TextoPixel size={10}>
              {estado.mazo.length > 0 ? `quedan ${estado.mazo.length} cartas en el mazo.` : 'sin mazo: gana quien se quede sin cartas.'}
            </TextoPixel>
            <Text style={styles.titulo}>Cartas</Text>
          </View>
          <BotonRedondo icono="menu" etiqueta="Menú" onPress={() => setMenuAbierto(true)} />
        </View>

        <View style={[styles.mesa, { backgroundColor: tema.suelo }]}>
          <Grano />
          <View style={styles.rivalInfo}>
            <View style={[styles.punto, { backgroundColor: jugadores[rival].color }]} />
            <TextoPixel size={10} color={PAPEL}>
              {`${jugadores[rival].nombre} · ${estado.manos[rival].length} cartas · ${pases[rival]} pases.`}
            </TextoPixel>
          </View>
          <View style={styles.rivalMano}>
            {estado.manos[rival].slice(0, 7).map((c, i, arr) => (
              <View
                key={c.id}
                style={{ marginLeft: i === 0 ? 0 : -24, transform: [{ rotate: `${(i - (arr.length - 1) / 2) * 6}deg` }] }}
              >
                <Reverso ancho={48} />
              </View>
            ))}
          </View>

          <View style={styles.centro}>
            <View style={styles.columna}>
              {estado.mazo.length > 0 ? (
                <View style={styles.mazo}>
                  <View style={[styles.capaMazo, { left: 4, top: 4 }]}>
                    <Reverso ancho={92} />
                  </View>
                  <View style={[styles.capaMazo, { left: 2, top: 2 }]}>
                    <Reverso ancho={92} />
                  </View>
                  <Reverso ancho={92} />
                </View>
              ) : (
                <View style={[styles.mazo, styles.mazoVacio]} />
              )}
            </View>
            <View style={styles.columna}>
              {ultima ? (
                <View style={{ transform: [{ rotate: '5deg' }] }}>
                  <Carta carta={ultima} ancho={104} />
                </View>
              ) : (
                <View style={[styles.mazo, styles.mazoVacio]} />
              )}
              <TextoPixel size={10} color={PAPEL}>última jugada.</TextoPixel>
            </View>
          </View>

          {estado.doble ? (
            <View style={[styles.aviso, { backgroundColor: tema.juego }]}>
              <Text style={styles.avisoTexto}>doble: la próxima carta la respondéis los dos.</Text>
            </View>
          ) : null}
          <View style={styles.pie}>
            <TextoPixel size={11} color={PAPEL}>
              {estado.terminada
                ? 'se acabaron las cartas.'
                : `ronda ${estado.ronda} · turno de ${jugadores[turno].nombre}: elige una carta para ${jugadores[otroDe(turno)].nombre}.`}
            </TextoPixel>
          </View>
        </View>

        <View style={styles.filaMano}>
          <View style={styles.quien}>
            <View style={[styles.punto, { backgroundColor: jugadores[turno].color }]} />
            <Text style={styles.manoTitulo} numberOfLines={1}>{`Tu mano, ${jugadores[turno].nombre}`}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipTexto}>{`${pases[turno]} pases`}</Text>
          </View>
        </View>

        <View style={[styles.mano, { height: anchoMano * 1.4 + 18 }]}>
          <View style={{ width: anchoTotalMano, height: anchoMano * 1.4 + 18 }}>
            {mano.map((c, i) => {
              const centro = (mano.length - 1) / 2;
              return (
                <CartaEnMano
                  key={`${vuelta}-${c.id}`}
                  orden={i}
                  tapada={pasando !== null}
                  style={{
                    left: i * pasoMano,
                    top: Math.abs(i - centro) * 4,
                    transform: [{ rotate: `${(i - centro) * 5}deg` }],
                  }}
                >
                  <Pressable
                    onPress={() => tocarCarta(c)}
                    disabled={pasando !== null}
                    accessibilityRole="button"
                    accessibilityLabel={`${tituloDeCarta(c)}, ${etiquetaDeCarta(c)}`}
                    style={({ pressed }) => (pressed ? { transform: [{ translateY: -10 }] } : null)}
                  >
                    {pasando !== null ? <Reverso ancho={anchoMano} /> : <Carta carta={c} ancho={anchoMano} oculta />}
                  </Pressable>
                </CartaEnMano>
              );
            })}
          </View>
        </View>

        <Capa visible={contenido !== null}>{contenido}</Capa>
      </SafeAreaView>
    </TemaProvider>
  );
}

// Cada carta de la mano entra desde abajo, una detrás de otra
function CartaEnMano({
  orden,
  tapada,
  style,
  children,
}: {
  orden: number;
  tapada: boolean;
  style: object;
  children: ReactNode;
}) {
  const valor = useRef(new Animated.Value(tapada || ajustesActuales().reducirAnimaciones ? 1 : 0)).current;
  useEffect(() => {
    if (tapada || ajustesActuales().reducirAnimaciones) return;
    Animated.timing(valor, {
      toValue: 1,
      duration: 260,
      delay: orden * 70,
      easing: Easing.out(Easing.back(1.4)),
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View
      style={[
        styles.cartaMano,
        style,
        {
          opacity: valor,
          marginTop: 0,
        },
        { transform: [...((style as { transform?: object[] }).transform ?? []), { translateY: valor.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  contenedor: { flex: 1, paddingHorizontal: 14, gap: 10 },
  barra: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 8 },
  titulo: { fontFamily: FUENTES.titulo, fontSize: 30, lineHeight: 38, color: TINTA, textTransform: 'uppercase' },
  mesa: {
    flex: 1,
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 22,
    overflow: 'hidden',
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  rivalInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14 },
  rivalMano: { flexDirection: 'row', justifyContent: 'center', paddingTop: 8 },
  punto: { width: 14, height: 14, borderRadius: 7, borderWidth: BORDE, borderColor: TINTA },
  centro: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 28 },
  columna: { alignItems: 'center', gap: 8 },
  mazo: { width: 96, height: 132 },
  capaMazo: { position: 'absolute' },
  mazoVacio: { borderWidth: 2, borderColor: PAPEL, borderStyle: 'dashed', borderRadius: 10, opacity: 0.6 },
  aviso: {
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: TINTA,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  avisoTexto: { fontFamily: FUENTES.pixel, fontSize: 9, color: TINTA },
  pie: { alignItems: 'center', paddingHorizontal: 12 },
  filaMano: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quien: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  manoTitulo: { fontFamily: FUENTES.titulo, fontSize: 20, lineHeight: 26, color: TINTA, textTransform: 'uppercase', flexShrink: 1 },
  chip: { borderWidth: 1.5, borderColor: TINTA, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2, backgroundColor: PAPEL },
  chipTexto: { fontFamily: FUENTES.pixel, fontSize: 10, color: TINTA },
  mano: { alignItems: 'center', paddingBottom: 6 },
  cartaMano: { position: 'absolute' },
});
