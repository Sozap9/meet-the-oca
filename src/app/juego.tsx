import { ponerMusica, sonar } from '../sonido';
import { ajustesActuales } from '../ajustesBase';
import { Grano } from '../components/Grano';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AvisoTurno } from '../components/AvisoTurno';
import { Capa } from '../components/Capa';
import type { TiradaEnCurso } from '../components/Dado';
import { EscenaPozoAviso } from '../components/EscenaPozoAviso';
import {
  EscenaCambio,
  EscenaCarcel,
  EscenaCuerda,
  EscenaDados,
  EscenaEspejo,
  EscenaLibre,
  EscenaPosada,
  EscenaPozoArriba,
} from '../components/Escenas';
import type { Servicios } from '../components/Escenas';
import { EleccionContenido, TarjetaContenido } from '../components/ModalesJuego';
import {
  FinalContenido,
  HistorialContenido,
  ConfirmarContenido,
  MenuContenido,
  ResumenContenido,
  VictoriaContenido,
} from '../components/ModalesPartida';
import type { Confirmacion } from '../components/ModalesPartida';
import { PanelTurno } from '../components/PanelTurno';
import { BotonRedondo } from '../components/Ui';
import { FUENTES, TINTA } from '../diseno';
import type { LineaHistorial } from '../components/PanelTurno';
import { Tablero } from '../components/Tablero';
import type { AnimacionFicha } from '../components/Tablero';
import { generarTablero, leerEspeciales } from '../data/board';
import type { OrdenTablero } from '../data/board';
import { leerNiveles, tarjetasDeModo } from '../data/decks';
import { MEMORIA_VISTAS } from '../data/vistas';
import { finalDeModo } from '../data/finales';
import { MODOS } from '../data/modos';
import { INFO_TIPO } from '../data/tarjetas';
import type { Intensidad, Tarjeta, TipoTarjeta } from '../data/tarjetas';
import type { Evento } from '../engine/juego';
import {
  aplicarTirada,
  crearJuego,
  tableroDe,
  liberarPenalizacion,
  rescatarDelPozo,
  tirarDado,
} from '../engine/juego';
import {
  TIPOS_LIGERA,
  TIPOS_RETO,
  TIPOS_HABLAR,
  TIPOS_MECANICA,
  PROBABILIDAD_MECANICA,
  claseDeCasilla,
  crearBaraja,
  intensidadSegunProgreso,
} from '../engine/mazos';
import { describirPase, resumirTurno } from '../engine/mensajes';
import { leerParticipantes } from '../engine/participantes';
import { crearPases, darPase, gastarPase } from '../engine/pases';
import { rutaDeEventos } from '../engine/recorrido';
import { resumir } from '../engine/resumen';
import type { Entrada } from '../engine/resumen';
import { useVolverAModos } from '../navegacion';
import { vibrar } from '../vibracion';
import { TEMAS, TemaProvider } from '../temas';
import { COLORES_JUGADOR } from '../theme';

// Todos los tipos de tarjeta menos los de mecánica de dos personas
const TIPOS_SIN_MECANICA = (Object.keys(INFO_TIPO) as TipoTarjeta[]).filter(
  (t) => !TIPOS_MECANICA.includes(t),
);

// Probabilidad de que una casilla normal saque tarjeta (1 = siempre)
const PROBABILIDAD_TARJETA_NORMAL = 1;

// Espera a que se cierre una ventana antes de abrir un aviso o cambiar de pantalla
const ESPERA_CIERRE_MS = 400;

// Cuántas tiradas se guardan en el historial
const MAX_HISTORIAL = 60;

type EventoMueve = Extract<Evento, { tipo: 'mueve' }>;
type EventoPozo = Extract<Evento, { tipo: 'pozo' }>;
type TarjetaActiva = { id: number; tarjeta: Tarjeta; para: number };

// Un pase gastado, para el historial
type PaseGastado = { id: number; jugador: number; quedan: number; gastados: number };

// Una tirada ya terminada, guardada para el historial (con los pases gastados en ella)
type EntradaDiario = {
  id: number;
  jugador: number;
  valor: number;
  eventos: Evento[];
  pases: PaseGastado[];
};

// Escenas que pueden ocurrir tras una tirada; se atienden de una en una
type Escena =
  | { tipo: 'verdadReto'; quien: number; para: number }
  | { tipo: 'posada'; jugador: number }
  | { tipo: 'carcel'; jugador: number }
  | { tipo: 'dados'; jugador: number }
  | { tipo: 'espejo'; jugador: number }
  | { tipo: 'libre'; jugador: number }
  | { tipo: 'cambio'; jugador: number }
  | {
      tipo: 'pozoAviso';
      jugador: number;
      resultado: EventoPozo['resultado'];
      liberado: number | null;
    }
  | { tipo: 'pozoArriba'; preso: number }
  | { tipo: 'cuerda'; rescatador: number; preso: number };
type EscenaEnCola = { id: number; escena: Escena };


export default function Juego() {
  const router = useRouter();
  // Salir de la partida lleva a elegir modo
  const salir = useVolverAModos();
  const {
    modo,
    jugadores: jugadoresParam,
    niveles: nivelesParam,
    orden: ordenParam,
    casillas: casillasParam,
    sinTipos: sinTiposParam,
  } = useLocalSearchParams<{
    modo: string;
    jugadores?: string;
    niveles?: string;
    orden?: string; // 'aleatorio' para desordenar las casillas especiales
    casillas?: string; // las especiales que se quieren (solo en el modo aleatorio)
    sinTipos?: string; // tipos de tarjeta quitados con el filtro (solo en el modo aleatorio)
  }>();
  const modoActual = MODOS.find((m) => m.id === modo) ?? MODOS[0];
  const tema = TEMAS[modoActual.id];
  const participantes = leerParticipantes(jugadoresParam, COLORES_JUGADOR);
  const niveles = leerNiveles(nivelesParam);
  // El tablero: el clásico, o en el modo aleatorio uno con las casillas elegidas y quizá desordenadas
  const orden: OrdenTablero = ordenParam === 'aleatorio' ? 'aleatorio' : 'fijo';
  const especiales = leerEspeciales(casillasParam);
  const nuevoTablero = () => generarTablero({ activas: especiales, orden });

  // El filtro del modo aleatorio quita tipos de tarjeta (las preguntas no se pueden quitar)
  const sinTipos = (sinTiposParam ?? '').split(',').filter((t) => t && t !== 'pregunta');
  const nuevaBaraja = () =>
    crearBaraja(
      tarjetasDeModo(modoActual.id, niveles).filter((t) => !sinTipos.includes(t.tipo)),
      Math.random,
      MEMORIA_VISTAS, // prefiere las tarjetas que no han salido en las últimas partidas
    );

  const [estado, setEstado] = useState(() => crearJuego(participantes, nuevoTablero()));
  const [baraja, setBaraja] = useState(nuevaBaraja);
  const [pases, setPases] = useState(() => crearPases(participantes.length, ajustesActuales().pases));
  const [historial, setHistorial] = useState<Entrada[]>([]);
  const [diario, setDiario] = useState<EntradaDiario[]>([]);
  const [pasesTirada, setPasesTirada] = useState<PaseGastado[]>([]); // pases de la tirada en curso
  const [tirada, setTirada] = useState<TiradaEnCurso | null>(null);
  const [animacion, setAnimacion] = useState<AnimacionFicha | null>(null);
  const [tarjeta, setTarjeta] = useState<TarjetaActiva | null>(null);
  const [cola, setCola] = useState<EscenaEnCola[]>([]);
  const [final, setFinal] = useState<string | null>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null);
  const [historialAbierto, setHistorialAbierto] = useState(false);
  const [resumenAbierto, setResumenAbierto] = useState(false);
  const [victoriaOculta, setVictoriaOculta] = useState(false);
  const [numTiradas, setNumTiradas] = useState(0);
  const [aviso, setAviso] = useState<{
    id: number;
    texto: string;
    subtexto: string;
    color: string;
  } | null>(null);
  const siguienteId = useRef(0);
  const pendiente = useRef<(() => void) | null>(null); // lo que pasa cuando la ficha llega
  const ultimaClave = useRef('');
  const ultimoTurno = useRef(-1);

  const mostrarTarjeta = (nueva: Tarjeta | null, para: number) => {
    if (!nueva) return;
    siguienteId.current += 1;
    setTarjeta({ id: siguienteId.current, tarjeta: nueva, para });
  };

  const encolar = (escenas: Escena[]) => {
    if (escenas.length === 0) return;
    const nuevas = escenas.map((escena) => ({ id: ++siguienteId.current, escena }));
    setCola((actual) => [...actual, ...nuevas]);
  };

  const terminarEscena = () => setCola((actual) => actual.slice(1));

  // Anota en el historial lo que ha pasado con una tarjeta y ajusta los pases
  const registrar = (
    jugador: number,
    actual: Tarjeta,
    resultado: 'hecha' | 'pasada',
    respuesta?: string,
    acierto?: boolean,
  ) => {
    setHistorial((h) => [...h, { jugador, tarjeta: actual, resultado, respuesta, acierto }]);

    if (resultado === 'pasada') {
      // Se apunta el pase gastado para el historial de turnos
      const id = ++siguienteId.current;
      const quedan = gastarPase(pases, jugador)[jugador];
      const gastados =
        historial.filter((h) => h.jugador === jugador && h.resultado === 'pasada').length + 1;
      setPasesTirada((p) => [...p, { id, jugador, quedan, gastados }]);
      setPases((p) => gastarPase(p, jugador));
      sonar('ficha');
    } else if (actual.tipo === 'comodin') {
      setPases((p) => darPase(p, jugador));
      sonar('ficha');
    }
  };

  // El valor se decide al pulsar, pero la ficha no se mueve hasta que el dado cae
  const tirar = () => {
    if (
      tirada ||
      animacion ||
      tarjeta ||
      cola.length > 0 ||
      final !== null ||
      estado.ganador !== null
    ) {
      return;
    }
    setAviso(null);
    siguienteId.current += 1;
    vibrar('dado');
    setTirada({ id: siguienteId.current, valor: tirarDado() });
  };

  const terminarTirada = () => {
    if (!tirada) return;
    const quien = estado.turno;

    // La tirada anterior ya está completa (con lo que pasó en sus escenas): al historial
    if (estado.ultimaTirada) {
      const previa: EntradaDiario = {
        id: ++siguienteId.current,
        jugador: estado.ultimaTirada.jugador,
        valor: estado.ultimaTirada.valor,
        eventos: estado.eventos,
        pases: pasesTirada,
      };
      setDiario((d) => [...d, previa].slice(-MAX_HISTORIAL));
    }
    setPasesTirada([]);

    const nuevo = aplicarTirada(estado, tirada.valor);
    setEstado(nuevo);
    setTirada(null);
    setNumTiradas((n) => n + 1);

    // Lo que ocurre cuando la ficha ya ha llegado a su casilla
    let despues: () => void = () => {};

    if (nuevo.ganador !== null) {
      // Al llegar al jardín: pregunta final para los dos y, después, la victoria
      despues = () => {
        if (ajustesActuales().preguntaFinal) setFinal(finalDeModo(modoActual.id, niveles));
      };
    } else {
      // Lo que ocurre depende de la casilla donde cae el dado, antes de cualquier salto
      const llegada = nuevo.eventos.find((e): e is EventoMueve => e.tipo === 'mueve');
      if (llegada) {
        const clase = claseDeCasilla(tableroDe(estado)[llegada.hasta - 1].tipo);
        const intensidad = intensidadSegunProgreso(nuevo.jugadores);

        despues = () => {
          // Tarjeta directa (casillas normales y ocas)
          if (clase === 'ligera') {
            mostrarTarjeta(baraja.robar(TIPOS_LIGERA, intensidad), quien);
          } else if (clase === 'cualquiera' && Math.random() < PROBABILIDAD_TARJETA_NORMAL) {
            // Sobre todo preguntas; las tarjetas con mecánica salen de vez en cuando
            const conMecanica = Math.random() < PROBABILIDAD_MECANICA;
            mostrarTarjeta(
              (conMecanica ? null : baraja.robar(TIPOS_SIN_MECANICA, intensidad)) ??
                baraja.robar(undefined, intensidad),
              quien,
            );
          }

          // Escenas de las casillas especiales
          const escenas: Escena[] = [];
          if (clase === 'verdadOReto') {
            escenas.push({
              tipo: 'verdadReto',
              quien,
              para: quien, // quien cae elige verdad o reto y lo cumple él o ella
            });
          } else if (clase === 'dados') {
            escenas.push({ tipo: 'dados', jugador: quien });
          } else if (clase === 'espejo' || clase === 'libre' || clase === 'cambio') {
            escenas.push({ tipo: clase, jugador: quien });
          } else if (clase === 'posada') {
            escenas.push({ tipo: 'posada', jugador: quien });
          } else if (clase === 'carcel') {
            escenas.push({ tipo: 'carcel', jugador: quien });
          }

          // Pozo: un aviso al caer y una pregunta desde arriba por cada turno que se salta
          const eventoPozo = nuevo.eventos.find((e): e is EventoPozo => e.tipo === 'pozo');
          if (eventoPozo) {
            escenas.push({
              tipo: 'pozoAviso',
              jugador: eventoPozo.jugador,
              resultado: eventoPozo.resultado,
              liberado: eventoPozo.liberado,
            });
          }
          for (const evento of nuevo.eventos) {
            if (evento.tipo === 'saltaTurno' && evento.motivo === 'pozo') {
              escenas.push({ tipo: 'pozoArriba', preso: evento.jugador });
            }
          }
          encolar(escenas);
        };
      }
    }

    // Primero camina la ficha; cuando llega, ocurre lo de la casilla
    pendiente.current = despues;
    siguienteId.current += 1;
    setAnimacion({
      id: siguienteId.current,
      jugador: quien,
      pasos: rutaDeEventos(nuevo.eventos, quien),
    });
  };

  const terminarAnimacion = () => {
    setAnimacion(null);
    const siguiente = pendiente.current;
    pendiente.current = null;
    siguiente?.();
  };

  // Quien recibe la tarjeta la cumple o la pasa
  const resolverTarjeta = (
    resultado: 'hecha' | 'pasada',
    respuesta?: string,
    acierto?: boolean,
  ) => {
    if (!tarjeta) return;
    registrar(tarjeta.para, tarjeta.tarjeta, resultado, respuesta, acierto);
    setTarjeta(null);
  };

  const reiniciar = () => {
    sonar('fichas');
    pendiente.current = null;
    ultimaClave.current = '';
    ultimoTurno.current = -1;
    setTirada(null);
    setAnimacion(null);
    setTarjeta(null);
    setCola([]);
    setFinal(null);
    setMenuAbierto(false);
    setResumenAbierto(false);
    setHistorialAbierto(false);
    setVictoriaOculta(false);
    setAviso(null);
    setNumTiradas(0);
    setHistorial([]);
    setDiario([]);
    setPasesTirada([]);
    setPases(crearPases(participantes.length, ajustesActuales().pases));
    // En el modo aleatorio, cada partida nueva baraja otra vez el tablero
    setEstado(crearJuego(participantes, nuevoTablero()));
    setBaraja(nuevaBaraja());
  };

  const abrirReglas = () => {
    setMenuAbierto(false);
    setTimeout(() => router.push({ pathname: '/reglas', params: { modo: modoActual.id } }), ESPERA_CIERRE_MS);
  };

  const abrirAjustes = () => {
    setMenuAbierto(false);
    setTimeout(() => router.push('/ajustes'), ESPERA_CIERRE_MS);
  };

  // Música de fondo de la partida (si está activada en los ajustes)
  // Al empezar se colocan las fichas en la salida
  useEffect(() => sonar('fichas'), []);

  useEffect(() => {
    ponerMusica(modoActual.id === 'caliente' || modoActual.id === 'infierno' ? 'caliente' : modoActual.id === 'personal' ? 'personal' : 'basico');
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

  // Lo que necesitan las escenas
  const servicios: Servicios = {
    jugadores: estado.jugadores,
    pases,
    intensidad: intensidadSegunProgreso(estado.jugadores),
    // Si no queda ninguna del tipo pedido (por ejemplo, retos quitados con el filtro), una pregunta
    robar: (tipos?: TipoTarjeta[], intensidad?: Intensidad) =>
      baraja.robar(tipos, intensidad) ?? (tipos ? baraja.robar(TIPOS_HABLAR, intensidad) : null),
    registrar,
    actualizar: (cambio) => setEstado(cambio),
  };

  const dibujarEscena = ({ id, escena }: EscenaEnCola): ReactNode => {
    switch (escena.tipo) {
      case 'verdadReto':
        return (
          <EleccionContenido
            key={id}
            quien={estado.jugadores[escena.quien]}
            para={estado.jugadores[escena.para]}
            onElegir={(cual) => {
              terminarEscena();
              mostrarTarjeta(
                baraja.robar(
                  cual === 'verdad' ? TIPOS_HABLAR : TIPOS_RETO,
                  intensidadSegunProgreso(estado.jugadores),
                ),
                escena.para,
              );
            }}
          />
        );
      case 'posada':
        return (
          <EscenaPosada
            key={id}
            jugador={escena.jugador}
            servicios={servicios}
            onTerminar={(pagada) => {
              if (pagada) setEstado((e) => liberarPenalizacion(e, escena.jugador, 'posada'));
              terminarEscena();
            }}
          />
        );
      case 'carcel':
        return (
          <EscenaCarcel
            key={id}
            jugador={escena.jugador}
            servicios={servicios}
            onTerminar={(libre) => {
              if (libre) setEstado((e) => liberarPenalizacion(e, escena.jugador, 'carcel'));
              terminarEscena();
            }}
          />
        );
      case 'dados':
        return (
          <EscenaDados
            key={id}
            jugador={escena.jugador}
            servicios={servicios}
            onTerminar={terminarEscena}
          />
        );
      case 'espejo':
        return (
          <EscenaEspejo
            key={id}
            jugador={escena.jugador}
            servicios={servicios}
            onTerminar={terminarEscena}
          />
        );
      case 'libre':
        return (
          <EscenaLibre
            key={id}
            jugador={escena.jugador}
            servicios={servicios}
            onTerminar={terminarEscena}
          />
        );
      case 'cambio':
        return (
          <EscenaCambio
            key={id}
            jugador={escena.jugador}
            servicios={servicios}
            onTerminar={terminarEscena}
          />
        );
      case 'pozoAviso':
        return (
          <EscenaPozoAviso
            key={id}
            jugador={escena.jugador}
            resultado={escena.resultado}
            liberado={escena.liberado}
            jugadores={estado.jugadores}
            onTerminar={terminarEscena}
          />
        );
      case 'pozoArriba':
        return (
          <EscenaPozoArriba
            key={id}
            preso={escena.preso}
            servicios={servicios}
            onTerminar={terminarEscena}
          />
        );
      case 'cuerda':
        return (
          <EscenaCuerda
            key={id}
            rescatador={escena.rescatador}
            preso={escena.preso}
            servicios={servicios}
            onTerminar={(rescatado) => {
              if (rescatado) {
                setEstado((e) => rescatarDelPozo(e, escena.preso, escena.rescatador));
              }
              terminarEscena();
            }}
          />
        );
    }
  };

  // Historial de turnos, lo nuevo arriba. Dentro de cada tirada, sus pases van encima de ella
  const lineasHistorial: LineaHistorial[] = [];
  const añadirPases = (lista: PaseGastado[]) => {
    for (let i = lista.length - 1; i >= 0; i--) {
      const p = lista[i];
      lineasHistorial.push({
        id: `pase-${p.id}`,
        jugador: p.jugador,
        texto: describirPase(estado, p.jugador, p.quedan, p.gastados),
      });
    }
  };

  if (estado.ultimaTirada) {
    añadirPases(pasesTirada);
    lineasHistorial.push({
      id: 'actual',
      jugador: estado.ultimaTirada.jugador,
      texto: resumirTurno(
        estado,
        estado.ultimaTirada.jugador,
        estado.ultimaTirada.valor,
        estado.eventos,
      ),
    });
  }
  for (let i = diario.length - 1; i >= 0; i--) {
    const d = diario[i];
    añadirPases(d.pases);
    lineasHistorial.push({
      id: String(d.id),
      jugador: d.jugador,
      texto: resumirTurno(estado, d.jugador, d.valor, d.eventos),
    });
  }

  // Un solo contenido a la vez, por prioridad, dentro de una única ventana
  const ganador = estado.ganador !== null ? estado.jugadores[estado.ganador] : null;
  let contenido: ReactNode = null;
  if (confirmacion) {
    contenido = (
      <ConfirmarContenido confirmacion={confirmacion} onCancelar={() => setConfirmacion(null)} />
    );
  } else if (tarjeta) {
    contenido = (
      <TarjetaContenido
        key={tarjeta.id}
        tarjeta={tarjeta.tarjeta}
        para={estado.jugadores[tarjeta.para]}
        otro={estado.jugadores[(tarjeta.para + 1) % estado.jugadores.length]}
        pases={pases[tarjeta.para]}
        onHecho={(respuesta, acierto) => resolverTarjeta('hecha', respuesta, acierto)}
        onPasar={() => resolverTarjeta('pasada')}
      />
    );
  } else if (cola.length > 0) {
    contenido = dibujarEscena(cola[0]);
  } else if (final !== null) {
    contenido = <FinalContenido texto={final} onContinuar={() => setFinal(null)} />;
  } else if (resumenAbierto) {
    contenido = (
      <ResumenContenido
        resumen={resumir(historial, estado.jugadores)}
        onCerrar={() => setResumenAbierto(false)}
      />
    );
  } else if (historialAbierto) {
    contenido = (
      <HistorialContenido
        lineas={lineasHistorial}
        jugadores={estado.jugadores}
        onCerrar={() => setHistorialAbierto(false)}
      />
    );
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
  } else if (ganador && !victoriaOculta) {
    contenido = (
      <VictoriaContenido
        ganador={ganador}
        onOtraVez={reiniciar}
        onResumen={() => setResumenAbierto(true)}
        onVerTablero={() => setVictoriaOculta(true)}
        onSalir={salir}
      />
    );
  }

  // Todo está en calma y es el momento de anunciar de quién es el turno
  // El turno no cambia en pantalla hasta que se resuelve la casilla de quien ha tirado
  // (la ficha camina, sale la tarjeta o la escena); entonces pasa a la otra persona
  const resolviendoCasilla = tirada === null && (animacion !== null || tarjeta !== null || cola.length > 0);
  const turnoVisible =
    resolviendoCasilla && estado.ultimaTirada ? estado.ultimaTirada.jugador : estado.turno;

  const listo =
    contenido === null && tirada === null && animacion === null && estado.ganador === null;

  useEffect(() => {
    if (!listo) return;
    const clave = String(numTiradas);
    if (ultimaClave.current === clave) return;
    ultimaClave.current = clave;

    const jugador = estado.jugadores[estado.turno];
    const repite = numTiradas > 0 && ultimoTurno.current === estado.turno;
    ultimoTurno.current = estado.turno;
    const disponibles = pases[estado.turno] ?? 0;
    siguienteId.current += 1;
    setAviso({
      id: siguienteId.current,
      color: jugador.color,
      texto:
        numTiradas === 0
          ? `Empieza ${jugador.nombre}`
          : repite
            ? `¡Otra vez, ${jugador.nombre}!`
            : `Turno de ${jugador.nombre}`,
      subtexto:
        disponibles === 0 ? 'sin pases' : `${disponibles} ${disponibles === 1 ? 'pase' : 'pases'}`,
    });
  }, [listo, numTiradas]);

  // La cuerda: si la otra persona está en el pozo, se puede intentar rescatarla
  const preso = estado.jugadores.findIndex((j, i) => i !== estado.turno && j.enPozo);
  const accion =
    estado.ganador === null && preso >= 0
      ? {
          texto: 'Lanzar la cuerda',
          onPress: () => encolar([{ tipo: 'cuerda', rescatador: estado.turno, preso }]),
        }
      : undefined;

  return (
    <TemaProvider modo={modoActual.id}>
      <SafeAreaView edges={['top', 'bottom']} style={[styles.contenedor, { backgroundColor: tema.pagina }]}>
        <Grano />
        <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.barra}>
          <BotonRedondo icono="atras" etiqueta="Salir de la partida" onPress={pedirSalida} />
          <Text style={styles.modo} numberOfLines={1} adjustsFontSizeToFit>
            Modo {modoActual.nombre}
          </Text>
          <BotonRedondo icono="menu" etiqueta="Menú de la partida" onPress={() => setMenuAbierto(true)} />
        </View>

        <Tablero
          tablero={estado.tablero}
          modo={modoActual.id}
          jugadores={estado.jugadores}
          tirada={tirada}
          onTiradaTerminada={terminarTirada}
          animacion={animacion}
          onAnimacionTerminada={terminarAnimacion}
          turnoActivo={listo ? estado.turno : null}
          aviso={
            aviso ? (
              <AvisoTurno
                key={aviso.id}
                texto={aviso.texto}
                subtexto={aviso.subtexto}
                color={aviso.color}
                onTerminar={() => setAviso(null)}
              />
            ) : null
          }
        />
        <PanelTurno
          estado={estado}
          turnoVisible={turnoVisible}
          pases={pases}
          tirando={tirada !== null}
          bloqueado={contenido !== null || animacion !== null}
          accion={accion}
          historial={lineasHistorial}
          onTirar={tirar}
          onReiniciar={reiniciar}
          onHistorial={() => setHistorialAbierto(true)}
        />

        <Capa visible={contenido !== null}>{contenido}</Capa>
      </SafeAreaView>
    </TemaProvider>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, alignItems: 'center', paddingTop: 4 },
  barra: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  modo: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FUENTES.titulo,
    fontSize: 30,
    color: TINTA,
    textTransform: 'uppercase',
  },
});