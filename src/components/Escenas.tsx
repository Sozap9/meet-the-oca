import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { Intensidad, Tarjeta, TipoTarjeta } from '../data/tarjetas';
import { CASILLAS_APUESTA, perdedorDeDados } from '../engine/dados';
import { intercambiarPosiciones, retroceder, tirarDado } from '../engine/juego';
import type { EstadoJuego, Jugador } from '../engine/juego';
import { TIPOS_HABLAR, TIPOS_LIGERA, TIPOS_RETO, subirNivel } from '../engine/mazos';
import { useTema } from '../temas';
import { BotonModal, CabeceraModal, Caja, TextoModal } from './Capa';
import type { DibujoCabecera } from './Capa';
import { DadoAnimado, DadoReposo } from './Dado';
import { TarjetaContenido } from './ModalesJuego';
import { BloquesRespuesta, Pasos, SiNo } from './Interacciones';
import { PasaMovil } from './PasaMovil';
import { FUENTES, TINTA } from '../diseno';

// Lo que necesitan las escenas de la partida
export interface Servicios {
  jugadores: Jugador[];
  pases: number[];
  intensidad: Intensidad; // la que toca según el avance de la partida
  robar: (tipos?: TipoTarjeta[], intensidad?: Intensidad) => Tarjeta | null;
  registrar: (
    jugador: number,
    tarjeta: Tarjeta,
    resultado: 'hecha' | 'pasada',
    respuesta?: string,
    acierto?: boolean,
  ) => void;
  actualizar: (cambio: (estado: EstadoJuego) => EstadoJuego) => void;
}

// ---------- Piezas comunes ----------

function Cabecera({
  dibujo,
  titulo,
  texto,
  chip,
}: {
  dibujo: DibujoCabecera;
  titulo: string;
  texto?: string;
  chip?: string;
}) {
  return (
    <>
      <CabeceraModal sangrado dibujo={dibujo} titulo={titulo} chip={chip} />
      {texto ? <TextoModal>{texto}</TextoModal> : null}
    </>
  );
}

const Boton = BotonModal;

// Muestra una tarjeta a una persona y avisa de si la hizo (true) o la pasó (false)
function PasoTarjeta({
  tarjeta,
  para,
  servicios,
  onFin,
}: {
  tarjeta: Tarjeta;
  para: number;
  servicios: Servicios;
  onFin: (hecha: boolean) => void;
}): ReactNode {
  const { jugadores, pases, registrar } = servicios;
  return (
    <TarjetaContenido
      tarjeta={tarjeta}
      para={jugadores[para]}
      otro={jugadores[(para + 1) % jugadores.length]}
      pases={pases[para]}
      onHecho={(respuesta, acierto) => {
        registrar(para, tarjeta, 'hecha', respuesta, acierto);
        onFin(true);
      }}
      onPasar={() => {
        registrar(para, tarjeta, 'pasada');
        onFin(false);
      }}
    />
  );
}

// ---------- Posada: pagarla con una pregunta o perder un turno ----------

export function EscenaPosada({
  jugador,
  servicios,
  onTerminar,
}: {
  jugador: number;
  servicios: Servicios;
  onTerminar: (pagada: boolean) => void;
}) {
  const [tarjeta, setTarjeta] = useState<Tarjeta | null>(null);

  if (tarjeta) {
    return <PasoTarjeta tarjeta={tarjeta} para={jugador} servicios={servicios} onFin={onTerminar} />;
  }

  const pagar = () => {
    const nueva = servicios.robar(TIPOS_HABLAR, servicios.intensidad);
    if (nueva) setTarjeta(nueva);
    else onTerminar(false);
  };

  return (
    <Caja>
      <Cabecera
        dibujo="posada"
        titulo="La posada"
        texto={`${servicios.jugadores[jugador].nombre} puede pagar la posada contestando una pregunta, o descansar y perder un turno.`}
      />
      <Boton principal texto="Contestar una pregunta" descripcion="No pierdes el turno" onPress={pagar} />
      <Boton texto="Perder un turno" onPress={() => onTerminar(false)} />
    </Caja>
  );
}

// ---------- Cárcel: fianza con una pregunta (un nivel más) o con un reto que elige el carcelero ----------

export function EscenaCarcel({
  jugador,
  servicios,
  onTerminar,
}: {
  jugador: number;
  servicios: Servicios;
  onTerminar: (libre: boolean) => void;
}) {
  const [fase, setFase] = useState<'elegir' | 'fianza' | 'carcelero' | 'tarjeta'>('elegir');
  const [tarjeta, setTarjeta] = useState<Tarjeta | null>(null);
  const [retos, setRetos] = useState<Tarjeta[]>([]);

  const { jugadores } = servicios;
  const nombre = jugadores[jugador].nombre;
  const carcelero = jugadores[(jugador + 1) % jugadores.length];

  const fianzaConPregunta = () => {
    const nueva = servicios.robar(TIPOS_HABLAR, subirNivel(servicios.intensidad));
    if (!nueva) {
      onTerminar(false);
      return;
    }
    setTarjeta(nueva);
    setFase('tarjeta');
  };

  const fianzaConReto = () => {
    const lista: Tarjeta[] = [];
    for (let i = 0; i < 10 && lista.length < 4; i++) {
      const reto = servicios.robar(TIPOS_RETO);
      if (reto && !lista.some((r) => r.texto === reto.texto)) lista.push(reto);
    }
    if (lista.length === 0) {
      onTerminar(false);
      return;
    }
    setRetos(lista);
    setFase('carcelero');
  };

  if (fase === 'tarjeta' && tarjeta) {
    return <PasoTarjeta tarjeta={tarjeta} para={jugador} servicios={servicios} onFin={onTerminar} />;
  }

  if (fase === 'carcelero') {
    return (
      <Caja>
        <Cabecera
          dibujo="carcel"
          titulo="El carcelero"
          texto={`${carcelero.nombre} elige el reto que libera a ${nombre}.`}
        />
        {retos.map((reto) => (
          <Boton
            key={reto.texto}
            texto={reto.texto}
            onPress={() => {
              setTarjeta(reto);
              setFase('tarjeta');
            }}
          />
        ))}
      </Caja>
    );
  }

  if (fase === 'fianza') {
    return (
      <Caja>
        <Cabecera dibujo="carcel" titulo="La fianza" texto={`¿Con qué paga la fianza ${nombre}?`} />
        <Boton
          principal
          texto="Una pregunta"
          descripcion="Un nivel más intensa de lo que toca"
          onPress={fianzaConPregunta}
        />
        <Boton
          texto="Un reto"
          descripcion={`${carcelero.nombre} elige cuál`}
          onPress={fianzaConReto}
        />
      </Caja>
    );
  }

  return (
    <Caja>
      <Cabecera
        dibujo="carcel"
        titulo="¡A la cárcel!"
        texto={`${nombre} puede cumplir la condena de dos turnos o pagar la fianza.`}
      />
      <Boton principal texto="Pagar la fianza" onPress={() => setFase('fianza')} />
      <Boton texto="Cumplir la condena" descripcion="Pierdes dos turnos" onPress={() => onTerminar(false)} />
    </Caja>
  );
}

// ---------- Dados: duelo o apuesta ----------

export function EscenaDados({
  jugador,
  servicios,
  onTerminar,
}: {
  jugador: number;
  servicios: Servicios;
  onTerminar: () => void;
}) {
  const tema = useTema();
  const { jugadores } = servicios;
  const [modo, setModo] = useState<'duelo' | 'apuesta' | null>(null);
  const [fase, setFase] = useState<'elegir' | 'tirar' | 'resultado' | 'tarjeta'>('elegir');
  // Se tira por turnos: primero quien ha caído en la casilla, luego el resto
  const orden = [jugador, ...jugadores.map((_, i) => i).filter((i) => i !== jugador)];
  const [valores, setValores] = useState<(number | null)[]>(() => jugadores.map(() => null));
  const [rodando, setRodando] = useState<{
    id: number;
    quien: number;
    valor: number;
    inclinacion: number;
  } | null>(null);
  const [empate, setEmpate] = useState(false);
  const [reposo, setReposo] = useState(() =>
    jugadores.map((_, i) => ({ valor: 1, inclinacion: i % 2 === 0 ? 0.12 : -0.12 })),
  );
  const [resultado, setResultado] = useState<{ valores: number[]; perdedor: number | null } | null>(
    null,
  );
  const [tarjeta, setTarjeta] = useState<Tarjeta | null>(null);
  const contador = useRef(0);

  const siguiente = orden.find((i) => valores[i] === null) ?? null;

  const tirar = () => {
    if (siguiente === null || rodando) return;
    contador.current += 1;
    setEmpate(false);
    setRodando({
      id: contador.current,
      quien: siguiente,
      valor: tirarDado(),
      inclinacion: (Math.random() - 0.5) * 0.4,
    });
  };

  // Cuando el dado de uno se para, se apunta; cuando han tirado todos, se mira quién pierde
  const terminarDado = () => {
    if (!rodando) return;
    const { quien, valor, inclinacion } = rodando;
    setReposo((r) => r.map((p, i) => (i === quien ? { valor, inclinacion } : p)));
    const nuevos = valores.map((v, i) => (i === quien ? valor : v));
    setRodando(null);
    if (nuevos.some((v) => v === null)) {
      setValores(nuevos);
      return;
    }
    const finales = nuevos as number[];
    const perdedor = perdedorDeDados(finales);
    if (perdedor === null) {
      // Empate: se vuelve a tirar, otra vez por turnos
      setEmpate(true);
      setValores(jugadores.map(() => null));
      return;
    }
    setValores(nuevos);
    setResultado({ valores: finales, perdedor });
    setFase('resultado');
  };

  const continuar = () => {
    if (!resultado || resultado.perdedor === null) return;
    const perdedor = resultado.perdedor;
    if (modo === 'apuesta') {
      servicios.actualizar((estado) => retroceder(estado, perdedor, CASILLAS_APUESTA));
    }
    const nueva =
      modo === 'duelo'
        ? servicios.robar(TIPOS_HABLAR, subirNivel(servicios.intensidad))
        : servicios.robar(TIPOS_HABLAR, 1);
    if (nueva) {
      setTarjeta(nueva);
      setFase('tarjeta');
    } else {
      onTerminar();
    }
  };

  if (fase === 'tarjeta' && tarjeta && resultado && resultado.perdedor !== null) {
    return (
      <PasoTarjeta
        tarjeta={tarjeta}
        para={resultado.perdedor}
        servicios={servicios}
        onFin={() => onTerminar()}
      />
    );
  }

  if (fase === 'elegir') {
    return (
      <Caja>
        <Cabecera
          dibujo="dados"
          titulo="Dados"
          texto={`${jugadores[jugador].nombre}, elige cómo jugáis esta casilla.`}
        />
        <Boton
          principal
          texto="Duelo"
          descripcion="Tiráis por turnos: quien saque menos contesta una pregunta más intensa"
          onPress={() => {
            setModo('duelo');
            setFase('tirar');
          }}
        />
        <Boton
          texto="Apuesta"
          descripcion={`Tiráis por turnos: quien saque menos retrocede ${CASILLAS_APUESTA} casillas y contesta una pregunta ligera`}
          onPress={() => {
            setModo('apuesta');
            setFase('tirar');
          }}
        />
      </Caja>
    );
  }

  const perdedorNombre =
    resultado && resultado.perdedor !== null ? jugadores[resultado.perdedor].nombre : null;

  return (
    <Caja>
      <Text style={[styles.titulo, { color: tema.texto }]}>
        {modo === 'duelo' ? 'Duelo de dados' : 'Apuesta de dados'}
      </Text>

      <View style={styles.dados}>
        {jugadores.map((j, i) => (
          <View key={j.id} style={styles.dadoColumna}>
            <View style={styles.dadoCaja}>
              {rodando && rodando.quien === i ? (
                <DadoAnimado
                  key={rodando.id}
                  valor={rodando.valor}
                  size={92}
                  inclinacion={rodando.inclinacion}
                  desde={reposo[i]}
                  entrada="centro"
                  onTerminar={terminarDado}
                />
              ) : (
                <DadoReposo valor={reposo[i].valor} inclinacion={reposo[i].inclinacion} size={92} />
              )}
            </View>
            <View style={styles.fila}>
              <View style={[styles.punto, { backgroundColor: j.color }]} />
              <Text style={[styles.nombre, { color: tema.texto }]}>{j.nombre}</Text>
            </View>
          </View>
        ))}
      </View>

      {fase === 'resultado' && resultado && perdedorNombre ? (
        <>
          <Text style={[styles.resultado, { color: tema.texto }]}>
            {jugadores.map((j, i) => `${j.nombre} sacó ${resultado.valores[i]}`).join(' · ')}
          </Text>
          <Text style={[styles.resultado, { color: TINTA }]}>
            {modo === 'duelo'
              ? `${perdedorNombre} saca menos y contesta una pregunta`
              : `${perdedorNombre} saca menos: retrocede ${CASILLAS_APUESTA} casillas y contesta una pregunta ligera`}
          </Text>
          <Boton principal texto="Continuar" onPress={continuar} />
        </>
      ) : (
        <>
          {empate ? (
            <Text style={[styles.resultado, { color: TINTA }]}>¡Empate! Volved a tirar.</Text>
          ) : null}
          <Boton
            principal
            icono="dado"
            texto={siguiente !== null ? `Tira ${jugadores[siguiente].nombre}` : 'Tirando…'}
            onPress={tirar}
            desactivado={rodando !== null || siguiente === null}
          />
        </>
      )}
    </Caja>
  );
}

// ---------- Pozo: pregunta desde arriba ----------

export function EscenaPozoArriba({
  preso,
  servicios,
  onTerminar,
}: {
  preso: number;
  servicios: Servicios;
  onTerminar: () => void;
}) {
  const [tarjeta, setTarjeta] = useState<Tarjeta | null>(null);
  const { jugadores } = servicios;
  const arriba = jugadores[(preso + 1) % jugadores.length];

  if (tarjeta) {
    return <PasoTarjeta tarjeta={tarjeta} para={preso} servicios={servicios} onFin={() => onTerminar()} />;
  }

  const escuchar = () => {
    const nueva = servicios.robar(TIPOS_HABLAR, servicios.intensidad);
    if (nueva) setTarjeta(nueva);
    else onTerminar();
  };

  return (
    <Caja>
      <Cabecera
        dibujo="pozo"
        titulo="Desde arriba"
        texto={`${arriba.nombre} se asoma al pozo y le hace una pregunta a ${jugadores[preso].nombre}.`}
      />
      <Boton principal texto="Escuchar la pregunta" onPress={escuchar} />
    </Caja>
  );
}

// ---------- Pozo: la cuerda ----------

export function EscenaCuerda({
  rescatador,
  preso,
  servicios,
  onTerminar,
}: {
  rescatador: number;
  preso: number;
  servicios: Servicios;
  onTerminar: (rescatado: boolean) => void;
}) {
  const [tarjeta, setTarjeta] = useState<Tarjeta | null>(null);
  const { jugadores } = servicios;

  if (tarjeta) {
    return <PasoTarjeta tarjeta={tarjeta} para={rescatador} servicios={servicios} onFin={onTerminar} />;
  }

  const lanzar = () => {
    const nueva = servicios.robar(TIPOS_HABLAR, subirNivel(servicios.intensidad));
    if (nueva) setTarjeta(nueva);
    else onTerminar(false);
  };

  return (
    <Caja>
      <Cabecera
        dibujo="pozo"
        titulo="La cuerda"
        texto={`${jugadores[rescatador].nombre} puede rescatar al instante a ${jugadores[preso].nombre} si contesta una pregunta un poco más intensa.`}
      />
      <Boton principal texto="Lanzar la cuerda" onPress={lanzar} />
      <Boton texto="Mejor no" onPress={() => onTerminar(false)} />
    </Caja>
  );
}

function CampoTexto({
  valor,
  onCambiar,
  placeholder,
}: {
  valor: string;
  onCambiar: (texto: string) => void;
  placeholder: string;
}) {
  return (
    <TextInput
      value={valor}
      onChangeText={onCambiar}
      placeholder={placeholder}
      placeholderTextColor="#8A857A"
      multiline
      maxLength={280}
      scrollEnabled
      style={styles.campo}
    />
  );
}

// ---------- Espejo: los dos responden por turnos sin mirar y luego comparan ----------

export function EscenaEspejo({
  jugador,
  servicios,
  onTerminar,
}: {
  jugador: number;
  servicios: Servicios;
  onTerminar: () => void;
}) {
  const tema = useTema();
  const { jugadores, pases, registrar } = servicios;
  const otro = (jugador + 1) % jugadores.length;
  const [tarjeta] = useState<Tarjeta | null>(
    () => servicios.robar(['pregunta'], servicios.intensidad) ?? servicios.robar(TIPOS_LIGERA),
  );
  const [fase, setFase] = useState<'intro' | 'primero' | 'pasar' | 'segundo' | 'revelar'>('intro');
  const [primera, setPrimera] = useState('');
  const [segunda, setSegunda] = useState('');
  const [coinciden, setCoinciden] = useState<boolean | null>(null);

  if (!tarjeta) {
    return (
      <Caja>
        <Cabecera dibujo="espejo" titulo="Espejo" texto="No quedan preguntas para el espejo." />
        <Boton principal texto="Continuar" onPress={onTerminar} />
      </Caja>
    );
  }

  const terminar = () => {
    // Si coinciden cuenta para la sintonía del resumen (solo una vez, en la primera respuesta)
    registrar(jugador, tarjeta, 'hecha', primera.trim() || undefined, coinciden ?? undefined);
    registrar(otro, tarjeta, 'hecha', segunda.trim() || undefined);
    onTerminar();
  };

  const pasar = () => {
    registrar(jugador, tarjeta, 'pasada');
    onTerminar();
  };

  if (fase === 'intro') {
    return (
      <Caja>
        <Cabecera
          dibujo="espejo"
          titulo="Espejo"
          texto={`Los dos respondéis la misma pregunta, por turnos y sin mirar. Empieza ${jugadores[jugador].nombre}.`}
        />
        <Text style={[styles.pregunta, { color: tema.texto }]}>{tarjeta.texto}</Text>
        <Boton principal texto="Empezar" onPress={() => setFase('primero')} />
        {pases[jugador] > 0 ? (
          <Boton texto={`Pasar · quedan ${pases[jugador]}`} onPress={pasar} />
        ) : null}
      </Caja>
    );
  }

  if (fase === 'primero' || fase === 'segundo') {
    const quien = fase === 'primero' ? jugador : otro;
    const valor = fase === 'primero' ? primera : segunda;
    const cambiar = fase === 'primero' ? setPrimera : setSegunda;
    return (
      <Caja>
        <CabeceraModal sangrado dibujo="espejo" titulo="Espejo" chip="espejo." nivel={tarjeta.intensidad} />
        <Pasos
          paso={fase === 'primero' ? 1 : 2}
          texto={`escribe ${jugadores[quien].nombre}. ${jugadores[(quien + 1) % jugadores.length].nombre} no mira.`}
        />
        <Text style={[styles.pregunta, { color: tema.texto }]}>{tarjeta.texto}</Text>
        <CampoTexto valor={valor} onCambiar={cambiar} placeholder="Escribe en secreto…" />
        <Boton
          principal
          texto={fase === 'primero' ? 'Listo' : 'Ver las dos respuestas'}
          desactivado={valor.trim().length === 0}
          onPress={() => setFase(fase === 'primero' ? 'pasar' : 'revelar')}
        />
      </Caja>
    );
  }

  if (fase === 'pasar') {
    return (
      <PasaMovil
        chip="espejo."
        antes={`${jugadores[jugador].nombre} ya ha escrito.`.toLowerCase()}
        para={jugadores[otro].nombre}
        texto="Responde la misma pregunta sin mirar lo que ha puesto. Luego comparáis."
        onListo={() => setFase('segundo')}
      />
    );
  }

  return (
    <Caja>
      <CabeceraModal sangrado dibujo="espejo" titulo="Espejo" chip="espejo." nivel={tarjeta.intensidad} />
      <Text style={[styles.pregunta, { color: tema.texto, alignSelf: 'stretch', textAlign: 'left' }]}>
        {tarjeta.texto}
      </Text>
      <BloquesRespuesta
        filas={[
          { jugador: jugadores[jugador], etiqueta: `${jugadores[jugador].nombre}.`, texto: primera.trim() },
          { jugador: jugadores[otro], etiqueta: `${jugadores[otro].nombre}.`, texto: segunda.trim() },
        ]}
      />
      <SiNo pregunta="¿coincidís?" valor={coinciden} onElegir={setCoinciden} />
      <Boton principal texto="Seguir" desactivado={coinciden === null} onPress={terminar} />
    </Caja>
  );
}

// ---------- Pregunta libre: la otra persona pregunta lo que quiera, o saca una al azar ----------

export function EscenaLibre({
  jugador,
  servicios,
  onTerminar,
}: {
  jugador: number;
  servicios: Servicios;
  onTerminar: () => void;
}) {
  const { jugadores } = servicios;
  const pregunta = jugadores[(jugador + 1) % jugadores.length];
  const [texto, setTexto] = useState('');
  const [tarjeta, setTarjeta] = useState<Tarjeta | null>(null);

  if (tarjeta) {
    return <PasoTarjeta tarjeta={tarjeta} para={jugador} servicios={servicios} onFin={() => onTerminar()} />;
  }

  const alAzar = () => {
    const nueva = servicios.robar(TIPOS_HABLAR, servicios.intensidad);
    if (nueva) setTarjeta(nueva);
    else onTerminar();
  };

  return (
    <Caja>
      <Cabecera
        dibujo="libre"
        titulo="Pregunta libre"
        texto={`${pregunta.nombre}, pregúntale a ${jugadores[jugador].nombre} lo que quieras.`}
      />
      <CampoTexto valor={texto} onCambiar={setTexto} placeholder="Escribe tu pregunta…" />
      <Boton
        principal
        texto="Preguntar"
        desactivado={texto.trim().length === 0}
        onPress={() =>
          setTarjeta({ tipo: 'pregunta', texto: texto.trim(), intensidad: servicios.intensidad })
        }
      />
      <Boton texto="Sacar una al azar" descripcion="Si no se te ocurre ninguna" onPress={alAzar} />
    </Caja>
  );
}

// ---------- Cambio: intercambiar la posición con la otra persona o responder una pregunta ----------

export function EscenaCambio({
  jugador,
  servicios,
  onTerminar,
}: {
  jugador: number;
  servicios: Servicios;
  onTerminar: () => void;
}) {
  const { jugadores } = servicios;
  const otro = (jugador + 1) % jugadores.length;
  const [tarjeta, setTarjeta] = useState<Tarjeta | null>(null);
  const yo = jugadores[jugador];
  const el = jugadores[otro];
  // No se puede cambiar con alguien que está en el pozo o cumpliendo turnos
  const sePuede = !yo.enPozo && !el.enPozo && el.turnosPerdidos === 0 && el.posicion !== yo.posicion;

  if (tarjeta) {
    return <PasoTarjeta tarjeta={tarjeta} para={jugador} servicios={servicios} onFin={() => onTerminar()} />;
  }

  const cambiar = () => {
    servicios.actualizar((estado) => intercambiarPosiciones(estado, jugador, otro));
    onTerminar();
  };

  const responder = () => {
    const nueva = servicios.robar(TIPOS_HABLAR, servicios.intensidad);
    if (nueva) setTarjeta(nueva);
    else onTerminar();
  };

  return (
    <Caja>
      <Cabecera dibujo="cambio" titulo="Cambio" texto={`${yo.nombre}, ¿cambias de sitio o respondes?`} />
      <Boton
        principal
        texto="Cambiar de sitio"
        descripcion={
          sePuede
            ? `Tú a la ${el.posicion} y ${el.nombre} a la ${yo.posicion}`
            : 'Ahora no se puede cambiar'
        }
        desactivado={!sePuede}
        onPress={cambiar}
      />
      <Boton texto="Responder una pregunta" descripcion="Te quedas en tu casilla" onPress={responder} />
    </Caja>
  );
}

const styles = StyleSheet.create({
  icono: { fontSize: 48 },
  titulo: { fontFamily: FUENTES.titulo, fontSize: 26, color: TINTA, textTransform: 'uppercase', textAlign: 'center' },
  texto: { fontSize: 15, textAlign: 'center' },
  boton: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 2,
  },
  desactivado: { opacity: 0.45 },
  botonTexto: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  botonDescripcion: { fontSize: 13, textAlign: 'center' },
  dados: { flexDirection: 'row', justifyContent: 'center', gap: 28 },
  dadoColumna: { alignItems: 'center', gap: 4 },
  dadoCaja: { width: 104, height: 124, alignItems: 'center', justifyContent: 'center' },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  punto: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: TINTA },
  nombre: { fontFamily: FUENTES.textoFuerte, fontSize: 14, color: TINTA },
  resultado: { fontFamily: FUENTES.textoFuerte, fontSize: 16, textAlign: 'center' },
  ocas: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
  tituloNuevo: { fontFamily: FUENTES.titulo, fontSize: 28, textTransform: 'uppercase', textAlign: 'center' },
  textoNuevo: { fontFamily: FUENTES.textoSemi, fontSize: 15, lineHeight: 20, textAlign: 'center' },
  pregunta: { fontFamily: FUENTES.textoFuerte, fontSize: 19, lineHeight: 24, textAlign: 'center' },
  pixel: { fontFamily: FUENTES.pixel, fontSize: 11, textAlign: 'center' },
  campo: {
    width: '100%',
    minHeight: 90,
    maxHeight: 150,
    borderWidth: 2,
    borderColor: TINTA,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FUENTES.textoSemi,
    fontSize: 15,
    color: TINTA,
    textAlignVertical: 'top',
  },
  respuesta: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    borderWidth: 2,
    borderColor: TINTA,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
});
