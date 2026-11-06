import { ponerMusica, sonar } from '../sonido';
import { ajustesActuales } from '../ajustesBase';
import { Grano } from '../components/Grano';
import { useVolverAModos } from '../navegacion';
import { vibrar } from '../vibracion';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Capa } from '../components/Capa';
import { DadoAnimado, DadoReposo } from '../components/Dado';
import type { CaraVisual } from '../components/Dado';
import { TarjetaContenido } from '../components/ModalesJuego';
import { FinDadoContenido } from '../components/ModalesDado';
import { ConfirmarContenido, FinalContenido, MenuContenido, ResumenContenido } from '../components/ModalesPartida';
import type { Confirmacion } from '../components/ModalesPartida';
import { leerRondas } from '../data/dadoTemas';
import { tarjetasDeModo } from '../data/decks';
import { MEMORIA_VISTAS } from '../data/vistas';
import { INFO_TIPO } from '../data/tarjetas';
import type { TipoTarjeta } from '../data/tarjetas';
import { carasParaTirada, leerTemas } from '../data/temasDado';
import type { Tema } from '../data/temasDado';
import { DibujoTema, IconoTema } from '../components/DibujosTemas';
import type { Baraja } from '../engine/mazos';
import { PROBABILIDAD_MECANICA, TIPOS_MECANICA } from '../engine/mazos';
import { finalDeModo } from '../data/finales';
import type { Tarjeta } from '../data/tarjetas';
import { crearJuego, tirarDado } from '../engine/juego';
import { crearBaraja, intensidadSegunRonda } from '../engine/mazos';
import { leerParticipantes } from '../engine/participantes';
import { crearPases, darPase, gastarPase } from '../engine/pases';
import { resumir } from '../engine/resumen';
import type { Entrada } from '../engine/resumen';
import { OcaModo } from '../components/OcaModo';
import { BotonDuro, BotonRedondo, TextoPixel } from '../components/Ui';
import { BORDE, FUENTES, PAPEL, TINTA } from '../diseno';
import { TEMAS, TemaProvider } from '../temas';
import { COLORES_JUGADOR } from '../theme';

const ESPERA_CIERRE_MS = 400;

// Las caras del dado son las categorías
// (sin iconos: cada cara lleva sus puntos, que coinciden con el número de la leyenda)
const caraDeTema = (t: Tema): CaraVisual => ({ fondo: t.color, dibujo: <DibujoTema tema={t.id} /> });

const TIPOS_SIN_MECANICA = (Object.keys(INFO_TIPO) as TipoTarjeta[]).filter(
  (t) => !TIPOS_MECANICA.includes(t),
);

// Una baraja por tema, con las tarjetas de sus categorías en los tres mazos
function barajasDeTemas(temas: Tema[]): Map<string, Baraja> {
  const todas = tarjetasDeModo('aleatorio');
  return new Map(
    temas.map((t) => [
      t.id,
      crearBaraja(
        todas.filter((c) => c.categoria !== undefined && t.categorias.includes(c.categoria)),
        Math.random,
        MEMORIA_VISTAS,
      ),
    ]),
  );
}

type TarjetaActiva = { id: number; tarjeta: Tarjeta; tema: Tema };
type Reposo = { valor: number; inclinacion: number };


export default function Dado() {
  const router = useRouter();
  const {
    jugadores: jugadoresParam,
    rondas: rondasParam,
    temas: temasParam,
  } = useLocalSearchParams<{
    temas?: string;
    jugadores?: string;
    rondas?: string;
  }>();
  const participantes = leerParticipantes(jugadoresParam, COLORES_JUGADOR);
  const total = leerRondas(rondasParam);
  const tema = TEMAS.dado;
  const { width } = useWindowDimensions();
  const mesa = Math.min(width - 32, 360);
  const tamDado = Math.min(mesa * 0.6, 220);

  const [temas] = useState(() => leerTemas(temasParam));
  const nuevaBaraja = () => barajasDeTemas(temas);

  const [jugadores] = useState(() => crearJuego(participantes).jugadores);
  const [baraja, setBaraja] = useState(nuevaBaraja);
  const [pases, setPases] = useState(() => crearPases(participantes.length, ajustesActuales().pases));
  const [historial, setHistorial] = useState<Entrada[]>([]);
  const [ronda, setRonda] = useState(0); // tiradas ya completadas
  const [turno, setTurno] = useState(0);
  const [tirada, setTirada] = useState<{
    id: number;
    valor: number;
    inclinacion: number;
    tema: Tema;
  } | null>(null);
  const [reposo, setReposo] = useState<Reposo>({ valor: 6, inclinacion: 0.15 });
  const [temaActual, setTemaActual] = useState<Tema | null>(null);
  // Las caras del cubo: en cada tirada, la de arriba lleva el tema que sale
  const [caras, setCaras] = useState<CaraVisual[]>(() =>
    carasParaTirada(temas, temas[0], 6).map(caraDeTema),
  );
  const [tarjeta, setTarjeta] = useState<TarjetaActiva | null>(null);
  const [final, setFinal] = useState<string | null>(null);
  const [fin, setFin] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null);
  const [resumenAbierto, setResumenAbierto] = useState(false);
  const siguienteId = useRef(0);

  const tirar = () => {
    if (tirada || tarjeta || final !== null || fin) return;
    siguienteId.current += 1;
    setTemaActual(null);
    vibrar('dado');
    // El tema sale al azar entre los elegidos (todos igual de probables), y el cubo cae en su cara
    const salido = temas[Math.floor(Math.random() * temas.length)];
    const valor = tirarDado();
    setCaras(carasParaTirada(temas, salido, valor).map(caraDeTema));
    setTirada({
      id: siguienteId.current,
      valor,
      inclinacion: (Math.random() - 0.5) * 0.4,
      tema: salido,
    });
  };

  const terminarTirada = () => {
    if (!tirada) return;
    const tema = tirada.tema;
    setReposo({ valor: tirada.valor, inclinacion: tirada.inclinacion });
    setTirada(null);
    setTemaActual(tema);

    // Como en el tablero: sobre todo preguntas, y las tarjetas con mecánica de vez en cuando
    const mazo = baraja.get(tema.id);
    const intensidad = intensidadSegunRonda(ronda, total);
    const conMecanica = Math.random() < PROBABILIDAD_MECANICA;
    const nueva = mazo
      ? ((conMecanica ? null : mazo.robar(TIPOS_SIN_MECANICA, intensidad)) ?? mazo.robar(undefined, intensidad))
      : null;
    if (nueva) {
      siguienteId.current += 1;
      setTarjeta({ id: siguienteId.current, tarjeta: nueva, tema });
    } else {
      avanzar();
    }
  };

  // Termina la tirada: pregunta final si era la última, o turno de la otra persona
  const avanzar = () => {
    const completadas = ronda + 1;
    setRonda(completadas);
    if (completadas >= total) {
      if (ajustesActuales().preguntaFinal) setFinal(finalDeModo('dado'));
      else setFin(true);
    }
    else setTurno((t) => (t + 1) % jugadores.length);
  };

  const resolverTarjeta = (resultado: 'hecha' | 'pasada', respuesta?: string, acierto?: boolean) => {
    if (!tarjeta) return;
    const { tarjeta: actual } = tarjeta;
    setHistorial((h) => [...h, { jugador: turno, tarjeta: actual, resultado, respuesta, acierto }]);
    if (resultado === 'pasada') {
      setPases((p) => gastarPase(p, turno));
      sonar('ficha');
    } else if (actual.tipo === 'comodin') {
      setPases((p) => darPase(p, turno));
      sonar('ficha');
    }
    setTarjeta(null);
    avanzar();
  };

  const reiniciar = () => {
    sonar('cogerDados');
    setTirada(null);
    setTarjeta(null);
    setFinal(null);
    setFin(false);
    setMenuAbierto(false);
    setResumenAbierto(false);
    setTemaActual(null);
    setHistorial([]);
    setPases(crearPases(participantes.length, ajustesActuales().pases));
    setRonda(0);
    setTurno(0);
    setBaraja(nuevaBaraja());
  };

  // Salir de la partida lleva a elegir modo
  const salir = useVolverAModos();

  const abrirReglas = () => {
    setMenuAbierto(false);
    setTimeout(() => router.push({ pathname: '/reglas', params: { modo: 'dado' } }), ESPERA_CIERRE_MS);
  };

  const abrirAjustes = () => {
    setMenuAbierto(false);
    setTimeout(() => router.push('/ajustes'), ESPERA_CIERRE_MS);
  };

  // Música de fondo de la partida (si está activada en los ajustes)
  // Al empezar se cogen los dados
  useEffect(() => sonar('cogerDados'), []);

  useEffect(() => {
    ponerMusica('basico');
    return () => ponerMusica(null);
  }, []);

  const abrirResumen = () => {
    setMenuAbierto(false);
    setResumenAbierto(true);
  };

  // Salir o reiniciar se confirma en la misma ventana, con el estilo del juego
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

  // Un solo contenido a la vez, por prioridad, dentro de una única ventana
  const resumen = resumir(historial, jugadores);
  let contenido: ReactNode = null;
  if (confirmacion) {
    contenido = (
      <ConfirmarContenido confirmacion={confirmacion} onCancelar={() => setConfirmacion(null)} />
    );
  } else if (tarjeta) {
    contenido = (
      <TemaProvider modo="dado" cambios={{ cabecera: tarjeta.tema.color, cabeceraTexto: TINTA }}>
        <TarjetaContenido
          key={tarjeta.id}
          ilustracion={<DibujoTema tema={tarjeta.tema.id} />}
          chipTema={`${tarjeta.tema.nombre.toLowerCase()}.`}
          tarjeta={tarjeta.tarjeta}
          para={jugadores[turno]}
          otro={jugadores[(turno + 1) % jugadores.length]}
          pases={pases[turno]}
          onHecho={(respuesta, acierto) => resolverTarjeta('hecha', respuesta, acierto)}
          onPasar={() => resolverTarjeta('pasada')}
        />
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
        onReglas={abrirReglas}
        onAjustes={abrirAjustes}
        onResumen={abrirResumen}
        onReiniciar={pedirReinicio}
        onSalir={pedirSalida}
        onCerrar={() => setMenuAbierto(false)}
      />
    );
  } else if (fin) {
    contenido = (
      <FinDadoContenido
        total={total}
        resumen={resumen}
        onOtraVez={reiniciar}
        onResumen={() => setResumenAbierto(true)}
        onSalir={salir}
      />
    );
  }

  const actual = jugadores[turno];

  return (
    <TemaProvider modo="dado">
      <SafeAreaView edges={['top', 'bottom']} style={[styles.contenedor, { backgroundColor: tema.pagina }]}>
        <Grano />
        <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.barra}>
          <BotonRedondo icono="atras" etiqueta="Salir de la partida" onPress={pedirSalida} />
          <View style={styles.flex}>
            <TextoPixel size={10}>{`tirada ${Math.min(ronda + 1, total)} de ${total}`}</TextoPixel>
            <Text style={styles.titulo} numberOfLines={1} adjustsFontSizeToFit>
              Dado de temas
            </Text>
          </View>
          <BotonRedondo icono="menu" etiqueta="Menú" onPress={() => setMenuAbierto(true)} />
        </View>

        <View style={styles.progreso}>
          <View
            style={[styles.progresoRelleno, { width: `${(ronda / total) * 100}%`, backgroundColor: tema.oca }]}
          />
        </View>

        <View style={styles.turno}>
          <View style={[styles.punto, { backgroundColor: actual.color }]} />
          <Text style={styles.turnoTexto} numberOfLines={1}>
            Turno de {actual.nombre}
          </Text>
          <View style={styles.pases}>
            <Text style={styles.pasesTexto}>
              {pases[turno] === 1 ? '1 pase' : `${pases[turno]} pases`}
            </Text>
          </View>
        </View>

        <View style={[styles.mesa, { width: mesa, backgroundColor: tema.suelo }]}>
          <View style={styles.ocaMesa} pointerEvents="none">
            <OcaModo modo="dado" size={64} />
          </View>
          <View style={[styles.zonaDado, { height: tamDado * 1.25 }]}>
            {tirada ? (
              <DadoAnimado
                key={tirada.id}
                valor={tirada.valor}
                size={tamDado}
                inclinacion={tirada.inclinacion}
                desde={reposo}
                entrada="centro"
                caras={caras}
                onTerminar={terminarTirada}
              />
            ) : (
              <DadoReposo
                valor={reposo.valor}
                inclinacion={reposo.inclinacion}
                size={tamDado}
                caras={caras}
              />
            )}
          </View>
          <View style={styles.categoriaFila}>
            {temaActual ? (
              <View style={[styles.pildora, { backgroundColor: temaActual.color }]}>
                <Text style={styles.pildoraTexto}>{temaActual.nombre}</Text>
              </View>
            ) : (
              <TextoPixel color={PAPEL} size={11}>
                {tirada ? 'rodando...' : 'tira el dado y descubre el tema.'}
              </TextoPixel>
            )}
          </View>
        </View>

        <View style={[styles.leyenda, { width: mesa }]}>
          {temas.map((t) => {
            const activa = temaActual?.id === t.id;
            return (
              <View
                key={t.id}
                style={[styles.leyendaItem, { backgroundColor: t.color }, activa && styles.leyendaActiva]}
              >
                <IconoTema tema={t.id} size={30} />
                <Text style={styles.leyendaNombre} numberOfLines={2}>
                  {t.nombre}
                </Text>
              </View>
            );
          })}
        </View>

        <BotonDuro
          texto={tirada ? 'Tirando…' : 'Tirar dado'}
          grande
          icono="dado"
          color={tema.oca}
          onPress={tirar}
          desactivado={tirada !== null || contenido !== null}
          style={{ width: mesa }}
        />

        <Capa visible={contenido !== null}>{contenido}</Capa>
      </SafeAreaView>
    </TemaProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  contenedor: { flex: 1, alignItems: 'center', paddingBottom: 12, gap: 12 },
  barra: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  titulo: { fontFamily: FUENTES.titulo, fontSize: 30, color: TINTA, textTransform: 'uppercase' },
  progreso: {
    width: '90%',
    height: 12,
    borderRadius: 6,
    borderWidth: BORDE,
    borderColor: TINTA,
    backgroundColor: PAPEL,
    overflow: 'hidden',
  },
  progresoRelleno: { height: '100%' },
  turno: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20 },
  punto: { width: 16, height: 16, borderRadius: 8, borderWidth: BORDE, borderColor: TINTA },
  turnoTexto: { fontFamily: FUENTES.titulo, fontSize: 22, color: TINTA, textTransform: 'uppercase', flexShrink: 1 },
  pases: {
    borderWidth: 1.5,
    borderColor: TINTA,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: PAPEL,
  },
  pasesTexto: { fontFamily: FUENTES.pixel, fontSize: 10, color: TINTA },
  mesa: {
    flex: 1,
    maxHeight: 360,
    borderRadius: 22,
    borderWidth: BORDE,
    borderColor: TINTA,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  ocaMesa: { position: 'absolute', left: 10, bottom: 6 },
  zonaDado: { alignItems: 'center', justifyContent: 'center' },
  categoriaFila: { height: 44, alignItems: 'center', justifyContent: 'center' },
  pildora: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: BORDE,
    borderColor: TINTA,
  },
  pildoraTexto: { fontFamily: FUENTES.titulo, fontSize: 20, color: TINTA, textTransform: 'uppercase' },
  leyenda: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 8 },
  leyendaItem: {
    width: '31.5%',
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 4,
    opacity: 0.7,
  },
  leyendaActiva: { opacity: 1, borderWidth: 3 },
  leyendaCara: {
    width: 26,
    height: 26,
    borderRadius: 7,
    borderWidth: BORDE,
    borderColor: TINTA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leyendaNumero: { fontFamily: FUENTES.titulo, fontSize: 14, color: TINTA },
  leyendaNombre: { fontFamily: FUENTES.textoFuerte, fontSize: 12, lineHeight: 15, color: TINTA, flexShrink: 1 },
});
