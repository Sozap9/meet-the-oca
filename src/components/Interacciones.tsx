import { createContext, useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { resolverMentira, resolverRonda } from '../engine/interacciones';
import type { OpcionRonda, TipoRonda } from '../engine/interacciones';
import type { Jugador } from '../engine/juego';
import { useTema } from '../temas';
import { BORDE, FUENTES, TINTA, COLOR_SOMBRA } from '../diseno';
import { BotonDuro } from './Ui';
import { sonar } from '../sonido';

// ---------- Escala ----------

type PropsEscala = {
  min: number;
  max: number;
  valor: number | null;
  onCambio: (valor: number) => void;
  etiquetas?: [string, string];
};

export function SelectorEscala({ min, max, valor, onCambio, etiquetas }: PropsEscala) {
  const tema = useTema();
  const numeros = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <View style={styles.bloque}>
      <View style={styles.numeros}>
        {numeros.map((n) => {
          const activo = valor === n;
          return (
            <Pressable
              key={n}
              onPress={() => onCambio(n)}
              style={[styles.numero, { backgroundColor: activo ? tema.oca : '#FFFFFF' }]}
            >
              <Text style={styles.numeroTexto}>
                {n}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {etiquetas ? (
        <View style={styles.extremos}>
          <Text style={styles.extremo}>{`${etiquetas[0].toLowerCase()}.`}</Text>
          <Text style={styles.extremo}>{`${etiquetas[1].toLowerCase()}.`}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ---------- Temporizador ----------

export function Temporizador({ segundos }: { segundos: number }) {
  const tema = useTema();
  const [restante, setRestante] = useState(segundos);
  const [activo, setActivo] = useState(false);

  useEffect(() => {
    if (!activo) return;
    const intervalo = setInterval(() => setRestante((r) => Math.max(r - 1, 0)), 1000);
    return () => clearInterval(intervalo);
  }, [activo]);

  const terminado = restante === 0;
  useEffect(() => {
    if (terminado) setActivo(false);
  }, [terminado]);

  useEffect(() => {
    if (!activo && !terminado) return;
    if (restante === 0) sonar('timbre');
    else if (restante <= 3) sonar('tic');
  }, [restante]);

  const minutos = Math.floor(restante / 60);
  const resto = restante % 60;
  const reloj = `${String(minutos).padStart(2, '0')}:${String(resto).padStart(2, '0')}`;

  const pulsar = () => {
    if (terminado) {
      setRestante(segundos);
      setActivo(false);
    } else {
      setActivo((a) => !a);
    }
  };

  return (
    <View style={styles.bloque}>
      <View style={[styles.relojCaja, { backgroundColor: terminado ? tema.oca : '#FFFFFF' }]}>
        <Text style={styles.reloj}>{terminado ? '¡Tiempo!' : reloj}</Text>
      </View>
      <BotonDuro
        texto={terminado ? 'Repetir' : activo ? 'Pausa' : 'Empezar'}
        color={tema.papel}
        onPress={pulsar}
      />
    </View>
  );
}

// ---------- Rondas de dos personas ----------

// Quien pinta la tarjeta ofrece esta función para mostrar la pantalla de "pasa el móvil"
export type PedidoPase = { chip: string; antes: string; para: string; texto: string };
export const PaseContexto = createContext<(pedido: PedidoPase) => void>(() => {});

// Los dos pasos de una ronda: 1 responde uno, 2 responde el otro
export function Pasos({ paso, texto }: { paso: 1 | 2; texto: string }) {
  return (
    <View style={styles.pasos}>
      <View style={styles.barras}>
        {[1, 2].map((n) => (
          <View key={n} style={[styles.barra, n <= paso && styles.barraLlena]} />
        ))}
      </View>
      <Text style={styles.pasosTexto}>{texto.toLowerCase()}</Text>
    </View>
  );
}

// Opciones grandes en fila: las luces del semáforo o los votos del debate
function Losetas({
  opciones,
  valor,
  onElegir,
}: {
  opciones: OpcionRonda[];
  valor: string | null;
  onElegir: (id: string) => void;
}) {
  const tema = useTema();
  return (
    <View style={styles.losetas}>
      {opciones.map((o) => {
        const activa = valor === o.id;
        return (
          <View key={o.id} style={styles.loseta}>
            {activa ? <View style={styles.losetaSombra} /> : null}
            <Pressable
              onPress={() => onElegir(o.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: activa }}
              accessibilityLabel={o.detalle ? `${o.etiqueta}, ${o.detalle}` : o.etiqueta}
              style={[
                styles.losetaBoton,
                { backgroundColor: activa ? '#FFFFFF' : tema.papel, borderWidth: activa ? 3 : BORDE },
              ]}
            >
              {o.color ? <View style={[styles.luz, { backgroundColor: o.color }]} /> : null}
              <Text style={styles.losetaTitulo} numberOfLines={1} adjustsFontSizeToFit>
                {o.etiqueta}
              </Text>
              {o.detalle ? <Text style={styles.losetaDetalle}>{o.detalle}</Text> : null}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

function ListaOpciones({
  opciones,
  valor,
  onElegir,
}: {
  opciones: OpcionRonda[];
  valor: string | null;
  onElegir: (id: string) => void;
}) {
  const tema = useTema();
  const compacta = opciones.length > 5;

  return (
    <View style={compacta ? styles.rejilla : styles.columna}>
      {opciones.map((opcion) => {
        const activa = valor === opcion.id;
        return (
          <Pressable
            key={opcion.id}
            onPress={() => onElegir(opcion.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: activa }}
            style={[
              compacta ? styles.opcionCompacta : styles.opcion,
              { backgroundColor: activa ? tema.oca : '#FFFFFF' },
            ]}
          >
            <Text style={styles.opcionTexto}>{opcion.etiqueta}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Las respuestas de los dos, una debajo de otra
export function BloquesRespuesta({
  filas,
}: {
  filas: { jugador: Jugador; etiqueta: string; texto: string; color?: string }[];
}) {
  return (
    <View style={styles.columna}>
      {filas.map((f, i) => (
        <View key={i} style={styles.bloqueRespuesta}>
          <View style={styles.bloqueCabecera}>
            <View style={[styles.punto, { backgroundColor: f.jugador.color }]} />
            <Text style={styles.bloqueEtiqueta}>{f.etiqueta.toLowerCase()}</Text>
          </View>
          <View style={styles.fila}>
            {f.color ? <View style={[styles.muestra, { backgroundColor: f.color }]} /> : null}
            <Text style={styles.bloqueTexto}>{f.texto}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// "¿Coincidís?" / "¿Ha acertado?" con dos botones
export function SiNo({
  pregunta,
  valor,
  onElegir,
}: {
  pregunta: string;
  valor: boolean | null;
  onElegir: (valor: boolean) => void;
}) {
  const tema = useTema();
  return (
    <View style={styles.siNo}>
      <Text style={styles.pasosTexto}>{pregunta.toLowerCase()}</Text>
      <View style={styles.siNoBotones}>
        {[true, false].map((v) => {
          const activa = valor === v;
          return (
            <Pressable
              key={String(v)}
              onPress={() => onElegir(v)}
              accessibilityRole="radio"
              accessibilityState={{ selected: activa }}
              style={[styles.siNoBoton, { backgroundColor: activa ? tema.oca : '#FFFFFF' }]}
            >
              <Text style={styles.siNoTexto}>{v ? 'Sí' : 'No'}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Campo({
  valor,
  onCambiar,
  placeholder,
  alto = 90,
}: {
  valor: string;
  onCambiar: (t: string) => void;
  placeholder: string;
  alto?: number;
}) {
  return (
    <TextInput
      value={valor}
      onChangeText={onCambiar}
      placeholder={placeholder}
      placeholderTextColor="#8A857A"
      multiline={alto > 50}
      maxLength={200}
      scrollEnabled
      style={[styles.campo, { minHeight: alto, maxHeight: Math.max(alto, 150) }]}
    />
  );
}

function BotonesPrimerPaso({
  pases,
  onPasar,
  onConfirmar,
  listo,
  texto = 'Confirmar',
}: {
  pases: number;
  onPasar: () => void;
  onConfirmar: () => void;
  listo: boolean;
  texto?: string;
}) {
  const tema = useTema();
  const sinPases = pases <= 0;
  return (
    <View style={styles.botones}>
      <BotonDuro
        texto={sinPases ? 'Sin pases' : `Pasar · ${pases}`}
        color={tema.papel}
        onPress={onPasar}
        desactivado={sinPases}
        style={styles.flex}
      />
      <BotonDuro texto={texto} color={tema.oca} onPress={onConfirmar} desactivado={!listo} style={styles.flexGrande} />
    </View>
  );
}

const NOMBRE_RONDA: Record<TipoRonda, string> = {
  adivinar: 'adivina sobre mí.',
  semaforo: 'semáforo.',
  debate: 'debate.',
};

type PropsRonda = {
  tipo: TipoRonda;
  opciones: OpcionRonda[];
  primero: Jugador; // quien recibe la tarjeta y responde primero
  segundo: Jugador;
  pases: number;
  onPasar: () => void;
  onTerminar: (respuesta: string, acierto?: boolean) => void;
};

export function RondaDoble({ tipo, opciones, primero, segundo, pases, onPasar, onTerminar }: PropsRonda) {
  const tema = useTema();
  const pedirPase = useContext(PaseContexto);
  const [fase, setFase] = useState<'a' | 'b' | 'revelar'>('a');
  const [eleccionA, setEleccionA] = useState<string | null>(null);
  const [eleccionB, setEleccionB] = useState<string | null>(null);
  const grandes = tipo !== 'adivinar';

  const etiqueta = (id: string | null) => opciones.find((o) => o.id === id)?.etiqueta ?? '';
  const colorDe = (id: string | null) => opciones.find((o) => o.id === id)?.color;
  const resultado =
    eleccionA !== null && eleccionB !== null ? resolverRonda(tipo, eleccionA, eleccionB) : null;

  const terminar = () => {
    const respuesta =
      tipo === 'adivinar'
        ? `${primero.nombre}: ${etiqueta(eleccionA)} · ${segundo.nombre} adivinó: ${etiqueta(eleccionB)}`
        : `${primero.nombre}: ${etiqueta(eleccionA)} · ${segundo.nombre}: ${etiqueta(eleccionB)}`;
    onTerminar(respuesta, resultado?.acierto);
  };

  const Opciones = grandes ? Losetas : ListaOpciones;
  const nota =
    tipo === 'semaforo'
      ? 'nadie ve lo que marca el otro. un rojo se respeta.'
      : tipo === 'debate'
        ? 'votáis los dos y luego se revela.'
        : null;

  if (fase === 'a') {
    return (
      <View style={styles.bloque}>
        <Pasos
          paso={1}
          texto={
            tipo === 'adivinar'
              ? `responde ${primero.nombre}. luego adivina ${segundo.nombre}.`
              : `marca ${primero.nombre}. ${segundo.nombre} no mira.`
          }
        />
        <Opciones opciones={opciones} valor={eleccionA} onElegir={setEleccionA} />
        {nota ? <Text style={styles.nota}>{nota}</Text> : null}
        <BotonesPrimerPaso
          pases={pases}
          onPasar={onPasar}
          listo={eleccionA !== null}
          onConfirmar={() => {
            setFase('b');
            pedirPase({
              chip: NOMBRE_RONDA[tipo],
              antes: `${primero.nombre} ya ha ${tipo === 'adivinar' ? 'respondido' : 'marcado'}.`.toLowerCase(),
              para: segundo.nombre,
              texto:
                tipo === 'adivinar'
                  ? 'Ahora te toca adivinar su respuesta. Después se descubre.'
                  : tipo === 'semaforo'
                    ? 'Marca tu color sin saber el suyo. Luego veis los dos.'
                    : 'Vota sin saber lo que ha votado. Luego se revela.',
            });
          }}
        />
      </View>
    );
  }

  if (fase === 'b') {
    return (
      <View style={styles.bloque}>
        <Pasos
          paso={2}
          texto={
            tipo === 'adivinar'
              ? `${segundo.nombre}, ¿qué crees que ha respondido?`
              : `ahora ${segundo.nombre}. ${primero.nombre} no mira.`
          }
        />
        <Opciones opciones={opciones} valor={eleccionB} onElegir={setEleccionB} />
        <BotonDuro
          texto="Descubrir"
          color={tema.oca}
          onPress={() => setFase('revelar')}
          desactivado={eleccionB === null}
          style={styles.ancho}
        />
      </View>
    );
  }

  return (
    <View style={styles.bloque}>
      <BloquesRespuesta
        filas={[
          { jugador: primero, etiqueta: `${primero.nombre}.`, texto: etiqueta(eleccionA), color: colorDe(eleccionA) },
          {
            jugador: segundo,
            etiqueta: tipo === 'adivinar' ? `${segundo.nombre} adivinó.` : `${segundo.nombre}.`,
            texto: etiqueta(eleccionB),
            color: colorDe(eleccionB),
          },
        ]}
      />
      {resultado ? <Text style={styles.mensaje}>{resultado.mensaje}</Text> : null}
      <BotonDuro texto="Seguir" color={tema.oca} onPress={terminar} style={styles.ancho} />
    </View>
  );
}

// ---------- Adivina sobre mí, escribiendo ----------

type PropsLibre = {
  primero: Jugador;
  segundo: Jugador;
  pases: number;
  onPasar: () => void;
  onTerminar: (respuesta: string, acierto?: boolean) => void;
};

export function AdivinaLibre({ primero, segundo, pases, onPasar, onTerminar }: PropsLibre) {
  const tema = useTema();
  const pedirPase = useContext(PaseContexto);
  const [fase, setFase] = useState<'a' | 'b' | 'revelar'>('a');
  const [respuesta, setRespuesta] = useState('');
  const [intento, setIntento] = useState('');
  const [acierto, setAcierto] = useState<boolean | null>(null);

  if (fase === 'a') {
    return (
      <View style={styles.bloque}>
        <Pasos paso={1} texto={`responde ${primero.nombre}. luego adivina ${segundo.nombre}.`} />
        <Campo valor={respuesta} onCambiar={setRespuesta} placeholder="Que no lo vea…" />
        <BotonesPrimerPaso
          pases={pases}
          onPasar={onPasar}
          listo={respuesta.trim().length > 0}
          texto="Pasar el móvil"
          onConfirmar={() => {
            setFase('b');
            pedirPase({
              chip: 'adivina sobre mí.',
              antes: `${primero.nombre} ya ha respondido.`.toLowerCase(),
              para: segundo.nombre,
              texto: 'Escribe lo que crees que ha puesto. Después se descubre.',
            });
          }}
        />
      </View>
    );
  }

  if (fase === 'b') {
    return (
      <View style={styles.bloque}>
        <Pasos paso={2} texto={`${segundo.nombre}, ¿qué crees que ha puesto?`} />
        <Campo valor={intento} onCambiar={setIntento} placeholder="Tu apuesta…" />
        <BotonDuro
          texto="Descubrir"
          color={tema.oca}
          onPress={() => setFase('revelar')}
          desactivado={intento.trim().length === 0}
          style={styles.ancho}
        />
      </View>
    );
  }

  return (
    <View style={styles.bloque}>
      <BloquesRespuesta
        filas={[
          { jugador: primero, etiqueta: `${primero.nombre} respondió.`, texto: respuesta.trim() },
          { jugador: segundo, etiqueta: `${segundo.nombre} creyó.`, texto: intento.trim() },
        ]}
      />
      <SiNo pregunta={`¿ha acertado ${segundo.nombre}?`} valor={acierto} onElegir={setAcierto} />
      <BotonDuro
        texto="Seguir"
        color={tema.oca}
        desactivado={acierto === null}
        onPress={() =>
          onTerminar(
            `${primero.nombre}: ${respuesta.trim()} · ${segundo.nombre} adivinó: ${intento.trim()}`,
            acierto ?? undefined,
          )
        }
        style={styles.ancho}
      />
    </View>
  );
}

// ---------- Dos verdades y una mentira ----------

export function DosVerdades({ primero, segundo, pases, onPasar, onTerminar }: PropsLibre) {
  const tema = useTema();
  const pedirPase = useContext(PaseContexto);
  const [fase, setFase] = useState<'a' | 'b' | 'revelar'>('a');
  const [frases, setFrases] = useState(['', '', '']);
  const [mentira, setMentira] = useState<number | null>(null);
  const [elegida, setElegida] = useState<number | null>(null);

  const completas = frases.every((f) => f.trim().length > 0);
  const resultado = mentira !== null && elegida !== null ? resolverMentira(mentira, elegida) : null;

  if (fase === 'a') {
    return (
      <View style={styles.bloque}>
        <Pasos paso={1} texto={`marca cuál es la mentira. ${segundo.nombre} la busca.`} />
        {frases.map((f, i) => {
          const marcada = mentira === i;
          return (
            <View key={i} style={styles.frase}>
              <View style={[styles.numeroFrase, { backgroundColor: tema.papel }]}>
                <Text style={styles.numeroFraseTexto}>{i + 1}</Text>
              </View>
              <View style={styles.flex}>
                <Campo
                  alto={44}
                  valor={f}
                  onCambiar={(t) => setFrases((a) => a.map((x, j) => (j === i ? t : x)))}
                  placeholder={i === 2 ? 'Otra cosa sobre ti…' : 'Algo sobre ti…'}
                />
              </View>
              <Pressable
                onPress={() => setMentira(i)}
                accessibilityRole="radio"
                accessibilityState={{ selected: marcada }}
                accessibilityLabel={`La frase ${i + 1} es la mentira`}
                style={[styles.marcaMentira, { backgroundColor: marcada ? tema.oca : '#FFFFFF' }]}
              >
                <Text style={styles.marcaTexto}>mentira</Text>
              </Pressable>
            </View>
          );
        })}
        <BotonesPrimerPaso
          pases={pases}
          onPasar={onPasar}
          listo={completas && mentira !== null}
          texto="Pasar el móvil"
          onConfirmar={() => {
            setFase('b');
            pedirPase({
              chip: 'dos verdades y una mentira.',
              antes: `${primero.nombre} ya ha escrito sus frases.`.toLowerCase(),
              para: segundo.nombre,
              texto: 'Lee las tres frases y elige cuál crees que es mentira.',
            });
          }}
        />
      </View>
    );
  }

  const listaFrases = (alPulsar?: (i: number) => void) =>
    frases.map((f, i) => {
      const esMentira = fase === 'revelar' && mentira === i;
      const esElegida = elegida === i;
      const fondo = esMentira ? tema.retro : esElegida ? tema.oca : '#FFFFFF';
      return (
        <Pressable
          key={i}
          disabled={!alPulsar}
          onPress={() => alPulsar?.(i)}
          accessibilityRole={alPulsar ? 'radio' : undefined}
          accessibilityState={alPulsar ? { selected: esElegida } : undefined}
          style={[styles.opcionFrase, { backgroundColor: fondo }]}
        >
          <View style={[styles.numeroFrase, { backgroundColor: tema.papel }]}>
            <Text style={styles.numeroFraseTexto}>{i + 1}</Text>
          </View>
          <Text style={styles.opcionFraseTexto}>{f.trim()}</Text>
          {fase === 'revelar' && (esMentira || esElegida) ? (
            <Text style={styles.marcaTexto}>{esMentira ? 'mentira.' : 'elegida.'}</Text>
          ) : null}
        </Pressable>
      );
    });

  if (fase === 'b') {
    return (
      <View style={styles.bloque}>
        <Pasos paso={2} texto={`${segundo.nombre}, ¿cuál es la mentira?`} />
        <View style={styles.columna}>{listaFrases(setElegida)}</View>
        <BotonDuro
          texto="Descubrir"
          color={tema.oca}
          onPress={() => setFase('revelar')}
          desactivado={elegida === null}
          style={styles.ancho}
        />
      </View>
    );
  }

  return (
    <View style={styles.bloque}>
      <View style={styles.columna}>{listaFrases()}</View>
      {resultado ? <Text style={styles.mensaje}>{resultado.mensaje}</Text> : null}
      <BotonDuro
        texto="Seguir"
        color={tema.oca}
        onPress={() =>
          onTerminar(
            frases.map((f, i) => `${f.trim()}${i === mentira ? ' (mentira)' : ''}`).join(' · '),
            resultado?.acierto,
          )
        }
        style={styles.ancho}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bloque: { width: '100%', alignItems: 'center', gap: 12 },
  numeros: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  numero: {
    width: 48,
    height: 46,
    borderRadius: 12,
    borderWidth: BORDE,
    borderColor: TINTA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroTexto: { fontFamily: FUENTES.titulo, fontSize: 19, color: TINTA },
  extremos: { width: '100%', flexDirection: 'row', justifyContent: 'space-between' },
  extremo: { fontFamily: FUENTES.pixel, fontSize: 10, color: TINTA },
  relojCaja: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: BORDE,
    borderColor: TINTA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reloj: { fontFamily: FUENTES.titulo, fontSize: 42, color: TINTA },
  columna: { width: '100%', gap: 10 },
  rejilla: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  opcion: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 12,
  },
  opcionCompacta: {
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  opcionTexto: { fontFamily: FUENTES.textoSemi, fontSize: 16, color: TINTA, textAlign: 'center' },
  muestra: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: TINTA },
  consigna: { fontFamily: FUENTES.textoFuerte, fontSize: 18, lineHeight: 23, textAlign: 'center' },
  ayuda: { fontFamily: FUENTES.pixel, fontSize: 10, textAlign: 'center' },
  botones: { width: '100%', flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  ancho: { width: '100%' },
  revelacion: { width: '100%', gap: 10 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  punto: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: TINTA },
  respuesta: { flexShrink: 1, fontFamily: FUENTES.textoFuerte, fontSize: 16 },
  mensaje: {
    fontFamily: FUENTES.titulo,
    fontSize: 22,
    lineHeight: 28,
    color: TINTA,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  flexGrande: { flex: 1.4 },
  nota: { fontFamily: FUENTES.pixel, fontSize: 10, color: TINTA, alignSelf: 'flex-start' },
  pasos: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 10 },
  barras: { flexDirection: 'row', gap: 4 },
  barra: { width: 22, height: 6, borderRadius: 3, borderWidth: 1.5, borderColor: TINTA },
  barraLlena: { backgroundColor: TINTA },
  pasosTexto: { flex: 1, fontFamily: FUENTES.pixel, fontSize: 10, lineHeight: 14, color: TINTA },
  losetas: { width: '100%', flexDirection: 'row', gap: 10 },
  loseta: { flex: 1 },
  losetaSombra: {
    position: 'absolute',
    left: 2,
    top: 2,
    right: -2,
    bottom: -2,
    borderRadius: 16,
    backgroundColor: COLOR_SOMBRA,
  },
  losetaBoton: {
    minHeight: 112,
    borderColor: TINTA,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 8,
  },
  luz: { width: 44, height: 44, borderRadius: 22, borderWidth: BORDE, borderColor: TINTA },
  losetaTitulo: { fontFamily: FUENTES.titulo, fontSize: 17, lineHeight: 22, color: TINTA, textTransform: 'uppercase' },
  losetaDetalle: { fontFamily: FUENTES.textoSemi, fontSize: 11.5, color: TINTA, textAlign: 'center' },
  bloqueRespuesta: {
    width: '100%',
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 4,
  },
  bloqueCabecera: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bloqueEtiqueta: { fontFamily: FUENTES.pixel, fontSize: 10, color: TINTA },
  bloqueTexto: { flexShrink: 1, fontFamily: FUENTES.textoSemi, fontSize: 15, lineHeight: 20, color: TINTA },
  siNo: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 10 },
  siNoBotones: { flexDirection: 'row', gap: 8 },
  siNoBoton: {
    minWidth: 64,
    height: 44,
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  siNoTexto: { fontFamily: FUENTES.titulo, fontSize: 17, color: TINTA, textTransform: 'uppercase' },
  campo: {
    width: '100%',
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: FUENTES.textoSemi,
    fontSize: 15,
    color: TINTA,
    textAlignVertical: 'top',
  },
  frase: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 8 },
  numeroFrase: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: BORDE,
    borderColor: TINTA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroFraseTexto: { fontFamily: FUENTES.titulo, fontSize: 15, color: TINTA },
  marcaMentira: {
    height: 44,
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marcaTexto: { fontFamily: FUENTES.pixel, fontSize: 9, color: TINTA },
  opcionFrase: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  opcionFraseTexto: { flex: 1, fontFamily: FUENTES.textoSemi, fontSize: 15, lineHeight: 20, color: TINTA },
});
