import { marcarVista } from '../data/vistas';
import { useEffect, useState } from 'react';
import { sonar } from '../sonido';
import type { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { INFO_CATEGORIA, INFO_TIPO, interaccionDe } from '../data/tarjetas';
import type { Interaccion, Tarjeta } from '../data/tarjetas';
import { OPCIONES_DEBATE, OPCIONES_SEMAFORO } from '../engine/interacciones';
import type { OpcionRonda, TipoRonda } from '../engine/interacciones';
import type { Jugador } from '../engine/juego';
import { useTema } from '../temas';
import { CabeceraModal, Caja, TextoModal } from './Capa';
import type { Ojo } from './Oca';
import { BotonDuro, Icono } from './Ui';
import { BORDE, FUENTES, TINTA, COLOR_SOMBRA } from '../diseno';
import { AdivinaLibre, DosVerdades, PaseContexto, RondaDoble, SelectorEscala, Temporizador } from './Interacciones';
import type { PedidoPase } from './Interacciones';
import { PasaMovil } from './PasaMovil';

function tipoDeRonda(interaccion: Interaccion): TipoRonda | null {
  return interaccion.tipo === 'adivinar' ||
    interaccion.tipo === 'semaforo' ||
    interaccion.tipo === 'debate'
    ? interaccion.tipo
    : null;
}

type PropsTarjeta = {
  tarjeta: Tarjeta;
  para: Jugador; // quien recibe la tarjeta
  otro: Jugador; // la otra persona
  pases: number; // pases que le quedan a quien recibe la tarjeta
  onHecho: (respuesta?: string, acierto?: boolean) => void;
  onPasar: () => void;
  ilustracion?: ReactNode; // dibujo de la cabecera (los temas del dado)
  chipTema?: string; // texto de arriba en lugar de la categoría
  acciones?: { texto: string; onPress: () => void }[]; // botones extra (cartas guardadas del modo Cartas)
};

// Pon una "key" distinta en cada tarjeta para que empiece sin respuesta
export function TarjetaContenido({
  tarjeta,
  para,
  otro,
  pases,
  onHecho,
  onPasar,
  ilustracion,
  chipTema,
  acciones = [],
}: PropsTarjeta) {
  const tema = useTema();
  const info = INFO_TIPO[tarjeta.tipo];
  const categoria = tarjeta.categoria ? INFO_CATEGORIA[tarjeta.categoria] : null;
  const interaccion = interaccionDe(tarjeta);
  const esComodin = tarjeta.tipo === 'comodin';
  const sinPases = pases <= 0;

  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [valorEscala, setValorEscala] = useState<number | null>(null);
  const [texto, setTexto] = useState('');
  const [compartir, setCompartir] = useState(true);
  const [pase, setPase] = useState<PedidoPase | null>(null);
  useEffect(() => {
    sonar('carta');
    marcarVista(tarjeta); // cuenta como vista para las próximas partidas
  }, []);

  const opciones = interaccion.tipo === 'elegir' ? interaccion.opciones : [];
  const hayOpciones = opciones.length > 0;
  const escribe = interaccion.tipo === 'escribir';
  const tipoRonda = tipoDeRonda(interaccion);
  // Las rondas de dos personas llevan sus propios botones
  const rondaPropia =
    tipoRonda !== null || interaccion.tipo === 'adivinarLibre' || interaccion.tipo === 'dosVerdades';
  const faltaElegir =
    (hayOpciones && seleccion === null) ||
    (interaccion.tipo === 'escala' && valorEscala === null);

  const opcionesRonda: OpcionRonda[] =
    interaccion.tipo === 'adivinar'
      ? interaccion.opciones.map((o) => ({ id: o, etiqueta: o }))
      : interaccion.tipo === 'semaforo'
        ? OPCIONES_SEMAFORO
        : OPCIONES_DEBATE;

  const terminar = () => {
    let respuesta: string | undefined;
    if (hayOpciones && seleccion !== null) respuesta = opciones[seleccion];
    else if (interaccion.tipo === 'escala' && valorEscala !== null) {
      respuesta = `${valorEscala} de ${interaccion.max}`;
    } else if (escribe && compartir && texto.trim()) respuesta = texto.trim();
    onHecho(respuesta);
  };

  // La oca de la cabecera cambia de gesto según el tipo de tarjeta
  const gesto: Ojo =
    tarjeta.tipo === 'reto'
      ? 'enfadado'
      : tarjeta.tipo === 'comodin' || tarjeta.tipo === 'adivina'
        ? 'feliz'
        : 'normal';

  return (
    <PaseContexto.Provider value={setPase}>
    {pase ? (
      <PasaMovil
        chip={pase.chip}
        antes={pase.antes}
        para={pase.para}
        texto={pase.texto}
        onListo={() => setPase(null)}
      />
    ) : null}
    <Caja grande oculta={pase !== null}>
      <CabeceraModal
        titulo={info.etiqueta}
        chip={chipTema ?? (categoria ? `${categoria.nombre.toLowerCase()}.` : undefined)}
        nivel={tarjeta.intensidad}
        dibujo={gesto}
        ilustracion={ilustracion}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.cuerpo}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        bounces={false}
      >
        <View style={styles.paraFila}>
          <View style={[styles.punto, { backgroundColor: para.color }]} />
          <Text style={styles.para}>{`para ${para.nombre.toLowerCase()}.`}</Text>
        </View>

        <Text style={styles.texto}>{tarjeta.texto}</Text>

        {hayOpciones ? (
          <View style={styles.opciones}>
            {opciones.map((opcion, i) => {
              const activa = seleccion === i;
              return (
                <Pressable
                  key={opcion}
                  onPress={() => setSeleccion(i)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activa }}
                  style={[styles.opcion, { backgroundColor: activa ? tema.oca : '#FFFFFF' }]}
                >
                  <View style={[styles.letra, { backgroundColor: tema.papel }]}>
                    <Text style={styles.letraTexto}>{String.fromCharCode(65 + i)}</Text>
                  </View>
                  <Text style={styles.opcionTexto}>{opcion}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {interaccion.tipo === 'escala' ? (
          <SelectorEscala
            min={interaccion.min}
            max={interaccion.max}
            valor={valorEscala}
            onCambio={setValorEscala}
            etiquetas={interaccion.etiquetas}
          />
        ) : null}

        {interaccion.tipo === 'temporizador' ? <Temporizador segundos={interaccion.segundos} /> : null}

        {escribe ? (
          <View style={styles.escribir}>
            <TextInput
              style={styles.input}
              value={texto}
              onChangeText={setTexto}
              placeholder="Escribe aquí…"
              placeholderTextColor="#8A857A"
              multiline
              maxLength={280}
              textAlignVertical="top"
            />
            <Pressable style={styles.compartirFila} onPress={() => setCompartir((c) => !c)}>
              <View style={[styles.casilla, { backgroundColor: compartir ? tema.oca : '#FFFFFF' }]}>
                {compartir ? <Icono nombre="hecho" size={14} /> : null}
              </View>
              <Text style={styles.compartirTexto}>Compartir en el resumen</Text>
            </Pressable>
          </View>
        ) : null}

        {tipoRonda ? (
          <RondaDoble
            tipo={tipoRonda}
            opciones={opcionesRonda}
            primero={para}
            segundo={otro}
            pases={pases}
            onPasar={onPasar}
            onTerminar={(respuesta, acierto) => onHecho(respuesta, acierto)}
          />
        ) : interaccion.tipo === 'adivinarLibre' ? (
          <AdivinaLibre
            primero={para}
            segundo={otro}
            pases={pases}
            onPasar={onPasar}
            onTerminar={(respuesta, acierto) => onHecho(respuesta, acierto)}
          />
        ) : interaccion.tipo === 'dosVerdades' ? (
          <DosVerdades
            primero={para}
            segundo={otro}
            pases={pases}
            onPasar={onPasar}
            onTerminar={(respuesta, acierto) => onHecho(respuesta, acierto)}
          />
        ) : info.indicacion ? (
          <Text style={styles.indicacion}>{`${info.indicacion.toLowerCase()}.`}</Text>
        ) : null}

        {esComodin ? <Text style={styles.regalo}>Ganas un pase extra</Text> : null}
      </ScrollView>

      {!rondaPropia && acciones.length > 0 ? (
        <View style={styles.acciones}>
          {acciones.map((a) => (
            <BotonDuro key={a.texto} pequeno texto={a.texto} color={tema.juego} onPress={a.onPress} style={styles.flex} />
          ))}
        </View>
      ) : null}
      {rondaPropia ? null : (
        <View style={styles.botones}>
          {esComodin ? (
            <BotonDuro texto="¡Genial!" color={tema.oca} onPress={terminar} style={styles.flex} />
          ) : (
            <>
              <BotonDuro
                texto={sinPases ? 'Sin pases' : `Pasar · ${pases}`}
                color={tema.papel}
                onPress={onPasar}
                desactivado={sinPases}
                style={styles.flex}
              />
              <BotonDuro
                texto="Listo"
                color={tema.oca}
                onPress={terminar}
                desactivado={faltaElegir}
                style={styles.flexGrande}
              />
            </>
          )}
        </View>
      )}
    </Caja>
    </PaseContexto.Provider>
  );
}

type PropsEleccion = {
  quien: Jugador; // quien ha tirado y elige
  para: Jugador; // a quien va dirigida la tarjeta
  onElegir: (cual: 'verdad' | 'reto') => void;
};

export function EleccionContenido({ quien, para, onElegir }: PropsEleccion) {
  const tema = useTema();
  const opciones: { id: 'verdad' | 'reto'; nombre: string; detalle: string; color: string }[] = [
    { id: 'verdad', nombre: 'Verdad', detalle: 'una pregunta', color: tema.juego },
    { id: 'reto', nombre: 'Reto', detalle: 'una prueba', color: tema.oca },
  ];
  return (
    <Caja>
      <CabeceraModal sangrado titulo="Verdad o reto" dibujo="feliz" />
      <TextoModal>
        {quien.nombre === para.nombre
          ? `${quien.nombre}, elige: ¿verdad o reto? Te toca cumplirlo a ti.`
          : `${quien.nombre} elige qué le toca a ${para.nombre}.`}
      </TextoModal>
      <View style={styles.losetas}>
        {opciones.map((o) => (
          <View key={o.id} style={styles.loseta}>
            <View style={styles.losetaSombra} />
            <Pressable
              onPress={() => onElegir(o.id)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.losetaBoton,
                { backgroundColor: o.color },
                pressed && { transform: [{ translateX: 3 }, { translateY: 3 }] },
              ]}
            >
              <Text style={styles.losetaTitulo}>{o.nombre}</Text>
              <Text style={styles.losetaDetalle}>{o.detalle}</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </Caja>
  );
}

const styles = StyleSheet.create({
  acciones: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 10 },
  scroll: { flexGrow: 1, flexShrink: 1, width: '100%' },
  cuerpo: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 16 },
  paraFila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  punto: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: TINTA },
  para: { fontFamily: FUENTES.pixel, fontSize: 11, color: TINTA },
  texto: { fontFamily: FUENTES.textoFuerte, fontSize: 22, lineHeight: 28, color: TINTA, textAlign: 'center' },
  opciones: { width: '100%', gap: 10 },
  opcion: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  letra: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: BORDE,
    borderColor: TINTA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letraTexto: { fontFamily: FUENTES.titulo, fontSize: 15, color: TINTA },
  opcionTexto: { flex: 1, fontFamily: FUENTES.textoSemi, fontSize: 16, lineHeight: 21, color: TINTA },
  escribir: { width: '100%', gap: 12 },
  input: {
    minHeight: 110,
    maxHeight: 170,
    backgroundColor: '#FFFFFF',
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 14,
    padding: 12,
    fontFamily: FUENTES.textoSemi,
    fontSize: 16,
    color: TINTA,
  },
  compartirFila: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  casilla: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: BORDE,
    borderColor: TINTA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compartirTexto: { fontFamily: FUENTES.textoSemi, fontSize: 14, color: TINTA },
  indicacion: { fontFamily: FUENTES.pixel, fontSize: 10, color: TINTA, textAlign: 'center' },
  regalo: { fontFamily: FUENTES.titulo, fontSize: 20, color: TINTA, textTransform: 'uppercase' },
  botones: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 6,
  },
  flex: { flex: 1 },
  flexGrande: { flex: 1.4 },
  losetas: { width: '100%', flexDirection: 'row', gap: 12 },
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
    height: 118,
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  losetaTitulo: { fontFamily: FUENTES.titulo, fontSize: 28, color: TINTA, textTransform: 'uppercase' },
  losetaDetalle: { fontFamily: FUENTES.textoSemi, fontSize: 12.5, color: TINTA },
});
