import { useVolver } from '../navegacion';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ModalInfierno } from '../components/ModalInfierno';
import { OcaModo } from '../components/OcaModo';
import { Pantalla } from '../components/Pantalla';
import { BotonDuro, CajaContorno, Icono, TextoPixel } from '../components/Ui';
import { BORDE, FUENTES, PALETAS, PAPEL, TINTA } from '../diseno';
import { ESPECIALES } from '../data/board';
import type { TipoEspecial } from '../data/board';
import { DURACIONES } from '../data/dadoTemas';
import { DURACIONES_CARTAS, rondasDe } from '../data/cartasModo';
import { MINIMO_TEMAS, TEMAS_DADO, TEMAS_POR_DEFECTO } from '../data/temasDado';
import type { IdTema } from '../data/temasDado';
import { IconoTema } from '../components/DibujosTemas';
import { IconoCasilla } from '../components/IconosCasilla';
import { colorDeCasilla } from '../diseno';
import { NIVELES, TODOS_LOS_MAZOS } from '../data/decks';
import { useAjustes } from '../ajustes';
import type { Nivel } from '../data/decks';
import type { TipoTarjeta } from '../data/tarjetas';
import { MODOS } from '../data/modos';
import type { Modo } from '../data/modos';
import { COLORES_JUGADOR } from '../theme';

export default function Jugadores() {
  const router = useRouter();
  const volver = useVolver('/modos');
  const { modo } = useLocalSearchParams<{ modo: string }>();
  const modoActual = MODOS.find((m) => m.id === modo) ?? MODOS[0];

  const [nombres, setNombres] = useState(['', '']);
  const [colores, setColores] = useState([0, 1]);
  const { ajustes } = useAjustes();
  // Con el contenido +18 oculto, el mazo Caliente y sus temas no aparecen
  const nivelesVisibles = NIVELES.filter((n) => !(ajustes.ocultarPicante && n === 'caliente'));
  const [niveles, setNiveles] = useState<Nivel[]>(nivelesVisibles);
  // Los mazos que se pueden elegir: los tres de siempre y, si no está oculto el +18, Infierno
  const mazosElegibles = TODOS_LOS_MAZOS.filter(
    (n) => !(ajustes.ocultarPicante && (n === 'caliente' || n === 'infierno')),
  );
  const [confirmarInfierno, setConfirmarInfierno] = useState(false);
  const [tiradas, setTiradas] = useState(15);
  const [numCartas, setNumCartas] = useState(30);
  const [casillas, setCasillas] = useState<TipoEspecial[]>(ESPECIALES);
  const [sinGrupos, setSinGrupos] = useState<string[]>([]);
  const [temas, setTemas] = useState<IdTema[]>(() =>
    ajustes.ocultarPicante
      ? TEMAS_DADO.filter((t) => t.mazo !== 'caliente').map((t) => t.id)
      : TEMAS_POR_DEFECTO,
  );

  // Al menos 3 temas: el último que queda no se puede quitar
  const alternarTema = (id: IdTema) =>
    setTemas((a) => (a.includes(id) ? (a.length > MINIMO_TEMAS ? a.filter((t) => t !== id) : a) : [...a, id]));
  const paleta = PALETAS[modoActual.id];
  const campos = useRef<(TextInput | null)[]>([]);

  const cambiarNombre = (i: number, texto: string) =>
    setNombres((actual) => actual.map((n, j) => (j === i ? texto : n)));

  const elegirColor = (i: number, color: number) => {
    if (colores[1 - i] === color) return; // ya lo usa la otra persona
    setColores((actual) => actual.map((c, j) => (j === i ? color : c)));
  };

  // Siempre debe quedar al menos un nivel
  const alternarNivel = (nivel: Nivel) => {
    // Añadir Infierno pide antes confirmar que los dos sois mayores de edad
    if (nivel === 'infierno' && !niveles.includes('infierno')) {
      setConfirmarInfierno(true);
      return;
    }
    cambiarNivel(nivel);
  };

  const cambiarNivel = (nivel: Nivel) =>
    setNiveles((actual) => {
      if (!actual.includes(nivel)) return [...actual, nivel];
      return actual.length > 1 ? actual.filter((n) => n !== nivel) : actual;
    });

  const alternarCasilla = (tipo: TipoEspecial) =>
    setCasillas((actual) =>
      actual.includes(tipo) ? actual.filter((t) => t !== tipo) : [...actual, tipo],
    );

  // Aleatorio puro: nadie elige nada, se mezclan los tres mazos y se desordena el tablero
  const empezarAleatorio = () => {
    Keyboard.dismiss();
    const jugadores = nombres.map((nombre, i) => ({ nombre, color: colores[i] }));
    router.push({
      pathname: '/juego',
      params: {
        modo: 'aleatorio',
        jugadores: JSON.stringify(jugadores),
        niveles: nivelesVisibles.join(','),
        orden: 'aleatorio',
      },
    });
  };

  // En Caliente, al empezar se pregunta si se quiere bajar al Infierno (explícito)
  const [preguntaInfierno, setPreguntaInfierno] = useState(false);
  const pulsarEmpezar = () => {
    Keyboard.dismiss();
    if (modoActual.id === 'caliente') setPreguntaInfierno(true);
    else empezar();
  };

  const empezar = (modoJuego: Modo = modoActual.id) => {
    Keyboard.dismiss();
    const jugadores = nombres.map((nombre, i) => ({ nombre, color: colores[i] }));
    if (modoActual.id === 'cartas') {
      router.push({
        pathname: '/cartas',
        params: { jugadores: JSON.stringify(jugadores), niveles: niveles.join(','), cartas: String(numCartas) },
      });
      return;
    }
    if (modoActual.id === 'dado') {
      router.push({
        pathname: '/dado',
        params: {
          jugadores: JSON.stringify(jugadores),
          rondas: String(tiradas),
          // en el orden de la lista, para que la leyenda salga siempre igual
          temas: TEMAS_DADO.filter((t) => temas.includes(t.id)).map((t) => t.id).join(','),
        },
      });
      return;
    }
    router.push({
      pathname: '/juego',
      params: {
        modo: modoJuego,
        jugadores: JSON.stringify(jugadores),
        niveles: niveles.join(','),
        // Solo se envían las casillas si se ha quitado alguna; las que quedan se reparten solas
        ...(modoActual.id === 'aleatorio' && casillas.length < ESPECIALES.length
          ? { casillas: casillas.join(',') }
          : {}),
        ...(modoActual.id === 'aleatorio' && sinGrupos.length > 0
          ? {
              sinTipos: GRUPOS_TARJETA.filter((g) => sinGrupos.includes(g.id))
                .flatMap((g) => g.tipos)
                .join(','),
            }
          : {}),
      },
    });
  };

  // Una opción con contorno: rellena del color del modo cuando está activa
  // Las opciones ocupan siempre el mismo sitio: la marca se reserva aunque no esté activa
  const Opcion = ({ texto, activa, onPress }: { texto: string; activa: boolean; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: activa }}
      style={[styles.opcion, { backgroundColor: activa ? paleta.oca : PAPEL }]}
    >
      <Text style={styles.opcionTexto} numberOfLines={1}>
        {texto}
      </Text>
      <View style={[styles.marca, { backgroundColor: activa ? PAPEL : 'transparent' }]}>
        {activa ? <Icono nombre="hecho" size={13} /> : null}
      </View>
    </Pressable>
  );

  // Un interruptor de la rejilla (casillas y tipos de tarjeta), siempre del mismo tamaño
  const Interruptor = ({
    texto,
    activa,
    color,
    onPress,
    icono,
    fijo = false,
  }: {
    texto: string;
    activa: boolean;
    color: string;
    onPress: () => void;
    icono?: TipoEspecial;
    fijo?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      disabled={fijo}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: activa, disabled: fijo }}
      accessibilityLabel={texto}
      style={[
        styles.casilla,
        { backgroundColor: activa ? color : '#FFFFFF' },
        !activa && styles.casillaQuitada,
      ]}
    >
      {icono ? <IconoCasilla tipo={icono} size={30} /> : null}
      <Text style={styles.casillaTexto} numberOfLines={2}>
        {texto}
      </Text>
      <View style={[styles.marca, { backgroundColor: activa ? PAPEL : 'transparent' }]}>
        {activa ? <Icono nombre="hecho" size={13} /> : null}
      </View>
    </Pressable>
  );

  return (
    <Pantalla
      titulo="Jugadores"
      subtitulo={modoActual.id === 'dado' ? 'dado de temas.' : modoActual.id === 'cartas' ? 'modo cartas.' : `modo ${modoActual.nombre.toLowerCase()}.`}
      onVolver={volver}
      fondo={paleta.pagina}
      derecha={<OcaModo modo={modoActual.id} size={48} />}
    >
      {/* En iPhone la lista se aparta sola del teclado; en Android lo hace el KeyboardAvoidingView */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'android' ? 'height' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.contenido}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          automaticallyAdjustKeyboardInsets
        >
          {[0, 1].map((i) => (
            <CajaContorno key={i}>
              <View style={[styles.banda, { backgroundColor: COLORES_JUGADOR[colores[i]] }]}>
                <Text style={styles.bandaTexto}>Jugador {i + 1}</Text>
              </View>
              <View style={styles.bloque}>
                <TextInput
                  ref={(campo) => {
                    campos.current[i] = campo;
                  }}
                  returnKeyType={i === 0 ? 'next' : 'done'}
                  submitBehavior={i === 0 ? 'submit' : 'blurAndSubmit'}
                  onSubmitEditing={() => (i === 0 ? campos.current[1]?.focus() : Keyboard.dismiss())}
                  style={styles.input}
                  value={nombres[i]}
                  onChangeText={(texto) => cambiarNombre(i, texto)}
                  placeholder={`Nombre de jugador ${i + 1}`}
                  placeholderTextColor="#8A857A"
                  maxLength={14}
                  autoCorrect={false}
                />
                <TextoPixel size={10}>color de ficha</TextoPixel>
                <View style={styles.colores}>
                  {COLORES_JUGADOR.map((color, indice) => {
                    const elegido = colores[i] === indice;
                    const ocupado = colores[1 - i] === indice;
                    return (
                      <Pressable
                        key={color}
                        onPress={() => elegirColor(i, indice)}
                        disabled={ocupado}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: elegido, disabled: ocupado }}
                        style={[
                          styles.color,
                          { backgroundColor: color },
                          elegido && styles.colorElegido,
                          ocupado && styles.colorOcupado,
                        ]}
                      >
                        {elegido ? <Icono nombre="hecho" size={18} /> : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </CajaContorno>
          ))}

          {modoActual.id === 'aleatorio' ? (
            <View style={styles.aleatorio}>
              <BotonDuro
                texto="Aleatorio"
                grande
                icono="dado"
                color={paleta.juego}
                descripcion="Nadie elige nada: se mezclan los tres mazos y las casillas cambian de orden."
                onPress={empezarAleatorio}
              />
              <TextoPixel size={10}>o personalizad la partida.</TextoPixel>
            </View>
          ) : null}

          {modoActual.id === 'aleatorio' || modoActual.id === 'cartas' ? (
            <CajaContorno>
              <View style={styles.bloque}>
                <Text style={styles.etiqueta}>¿Qué mazos queréis mezclar?</Text>
                <View style={styles.opciones}>
                  {mazosElegibles.map((nivel) => {
                    const info = MODOS.find((m) => m.id === nivel);
                    return (
                      <Opcion
                        key={nivel}
                        texto={info?.nombre ?? nivel}
                        activa={niveles.includes(nivel)}
                        onPress={() => alternarNivel(nivel)}
                      />
                    );
                  })}
                </View>
              </View>
            </CajaContorno>
          ) : null}

          {modoActual.id === 'aleatorio' ? (
            <CajaContorno>
              <View style={styles.bloque}>
                <View style={styles.cabeceraCasillas}>
                  <Text style={styles.etiqueta}>Casillas especiales</Text>
                  <Pressable
                    onPress={() =>
                      setCasillas(casillas.length === ESPECIALES.length ? [] : ESPECIALES)
                    }
                    hitSlop={8}
                  >
                    <Text style={styles.todas}>
                      {casillas.length === ESPECIALES.length ? 'quitar todas.' : 'poner todas.'}
                    </Text>
                  </Pressable>
                </View>
                <View style={styles.rejillaCasillas}>
                  {ESPECIALES.map((tipo) => (
                    <Interruptor
                      key={tipo}
                      texto={NOMBRE_ESPECIAL[tipo]}
                      icono={tipo}
                      activa={casillas.includes(tipo)}
                      color={colorDeCasilla(tipo, paleta)}
                      onPress={() => alternarCasilla(tipo)}
                    />
                  ))}
                </View>
                <TextoPixel size={10}>las que quitéis serán casillas normales.</TextoPixel>
              </View>
            </CajaContorno>
          ) : null}

          {modoActual.id === 'aleatorio' ? (
            <CajaContorno>
              <View style={styles.bloque}>
                <View style={styles.cabeceraCasillas}>
                  <Text style={styles.etiqueta}>Tipos de tarjeta</Text>
                  <Pressable onPress={() => setSinGrupos(sinGrupos.length === 0 ? GRUPOS_TARJETA.map((g) => g.id) : [])} hitSlop={8}>
                    <Text style={styles.todas}>{sinGrupos.length === 0 ? 'solo preguntas.' : 'poner todas.'}</Text>
                  </Pressable>
                </View>
                <View style={styles.rejillaCasillas}>
                  <Interruptor texto="Preguntas" activa fijo color={paleta.duo} onPress={() => {}} />
                  {GRUPOS_TARJETA.map((g) => (
                    <Interruptor
                      key={g.id}
                      texto={g.nombre}
                      activa={!sinGrupos.includes(g.id)}
                      color={g.mecanica ? paleta.juego : paleta.duo}
                      onPress={() =>
                        setSinGrupos((a) => (a.includes(g.id) ? a.filter((x) => x !== g.id) : [...a, g.id]))
                      }
                    />
                  ))}
                </View>
                <TextoPixel size={10}>las preguntas siempre están. en color de juego, las de dos personas.</TextoPixel>
              </View>
            </CajaContorno>
          ) : null}

          {modoActual.id === 'dado' ? (
            <CajaContorno>
              <View style={styles.bloque}>
                <Text style={styles.etiqueta}>¿Cuánto queréis jugar?</Text>
                <View style={styles.opciones}>
                  {DURACIONES.map((d) => (
                    <Opcion
                      key={d.tiradas}
                      texto={`${d.nombre} · ${d.tiradas}`}
                      activa={tiradas === d.tiradas}
                      onPress={() => setTiradas(d.tiradas)}
                    />
                  ))}
                </View>
                <TextoPixel size={10}>número de tiradas.</TextoPixel>
              </View>
            </CajaContorno>
          ) : null}

          {modoActual.id === 'dado' ? (
            <CajaContorno>
              <View style={styles.bloque}>
                <View style={styles.cabeceraCasillas}>
                  <Text style={styles.etiqueta}>Temas del dado</Text>
                  <Text style={styles.contador}>{`${temas.length} de ${TEMAS_DADO.length}. mínimo ${MINIMO_TEMAS}.`}</Text>
                </View>
                {(['básico', 'personal', 'caliente'] as const)
                  .filter((mazo) => !(ajustes.ocultarPicante && mazo === 'caliente'))
                  .map((mazo) => (
                  <View key={mazo} style={styles.grupoTemas}>
                    <TextoPixel size={9}>{mazo}</TextoPixel>
                    <View style={styles.filaTemas}>
                      {TEMAS_DADO.filter((t) => t.mazo === mazo).map((t) => {
                        const activa = temas.includes(t.id);
                        return (
                          <Pressable
                            key={t.id}
                            onPress={() => alternarTema(t.id)}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: activa }}
                            accessibilityLabel={t.nombre}
                            style={[
                              styles.tema,
                              { backgroundColor: activa ? t.color : '#FFFFFF' },
                              !activa && styles.casillaQuitada,
                            ]}
                          >
                            <View style={[styles.marca, styles.marcaTema, { backgroundColor: activa ? PAPEL : 'transparent' }]}>
                              {activa ? <Icono nombre="hecho" size={12} /> : null}
                            </View>
                            <IconoTema tema={t.id} size={54} />
                            <Text style={styles.temaTexto} numberOfLines={2}>
                              {t.nombre}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            </CajaContorno>
          ) : null}

          {modoActual.id === 'cartas' ? (
            <CajaContorno>
              <View style={styles.bloque}>
                <Text style={styles.etiqueta}>¿Cuánto dura la partida?</Text>
                <View style={styles.opciones}>
                  {DURACIONES_CARTAS.map((d) => (
                    <Opcion
                      key={d.cartas}
                      texto={`${d.nombre} · ${rondasDe(d.cartas)} rondas`}
                      activa={numCartas === d.cartas}
                      onPress={() => setNumCartas(d.cartas)}
                    />
                  ))}
                </View>
              </View>
            </CajaContorno>
          ) : null}

          <BotonDuro texto="Empezar partida" grande color={paleta.oca} icono="dado" onPress={pulsarEmpezar} />
        </ScrollView>
      </KeyboardAvoidingView>
      <ModalInfierno
        visible={confirmarInfierno}
        textoNo="No añadirlo"
        onCaliente={() => setConfirmarInfierno(false)}
        onInfierno={() => {
          setConfirmarInfierno(false);
          cambiarNivel('infierno');
        }}
      />
      <ModalInfierno
        visible={preguntaInfierno}
        onCaliente={() => {
          setPreguntaInfierno(false);
          empezar('caliente');
        }}
        onInfierno={() => {
          setPreguntaInfierno(false);
          empezar('infierno');
        }}
      />
    </Pantalla>
  );
}

// Tipos de tarjeta que se pueden quitar en el modo aleatorio (las preguntas, nunca)
const GRUPOS_TARJETA: { id: string; nombre: string; tipos: TipoTarjeta[]; mecanica?: boolean }[] = [
  { id: 'prefieres', nombre: '¿Qué prefieres?', tipos: ['prefieres'] },
  { id: 'completa', nombre: 'Completa la frase', tipos: ['completa'] },
  { id: 'recuerdos', nombre: 'Recuerdos y planes', tipos: ['recuerdo', 'plan'] },
  { id: 'yoNunca', nombre: 'Yo nunca', tipos: ['yoNunca'] },
  { id: 'reto', nombre: 'Retos', tipos: ['reto'] },
  { id: 'adivina', nombre: 'Adivina sobre mí', tipos: ['adivina'], mecanica: true },
  { id: 'dosVerdades', nombre: 'Dos verdades', tipos: ['dosVerdades'], mecanica: true },
  { id: 'debate', nombre: 'Debate', tipos: ['debate'], mecanica: true },
];

const NOMBRE_ESPECIAL: Record<TipoEspecial, string> = {
  oca: 'Oca',
  puente: 'Verdad o reto',
  dados: 'Dados',
  libre: 'Pregunta libre',
  espejo: 'Espejo',
  cambio: 'Cambio',
  posada: 'Posada',
  pozo: 'Pozo',
  laberinto: 'Laberinto',
  carcel: 'Cárcel',
  calavera: 'Calavera',
};

const styles = StyleSheet.create({
  aleatorio: { gap: 10, alignItems: 'center' },
  contador: { fontFamily: FUENTES.pixel, fontSize: 9, color: TINTA },
  grupoTemas: { gap: 6 },
  filaTemas: { flexDirection: 'row', gap: 8 },
  tema: {
    flex: 1,
    minHeight: 104,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 14,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  marcaTema: { position: 'absolute', right: 6, top: 6, width: 18, height: 18 },
  temaTexto: { fontFamily: FUENTES.textoFuerte, fontSize: 12.5, lineHeight: 15, color: TINTA, textAlign: 'center' },
  cabeceraCasillas: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  todas: { fontFamily: FUENTES.pixel, fontSize: 10, color: TINTA, textDecorationLine: 'underline' },
  rejillaCasillas: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 },
  casilla: {
    width: '48.5%',
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  casillaQuitada: { opacity: 0.5 },
  casillaTexto: { flex: 1, fontFamily: FUENTES.textoFuerte, fontSize: 13.5, lineHeight: 17, color: TINTA },
  marca: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: TINTA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  contenido: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32, gap: 18 },
  banda: { paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: BORDE, borderColor: TINTA },
  bandaTexto: { fontFamily: FUENTES.titulo, fontSize: 18, color: TINTA, textTransform: 'uppercase' },
  bloque: { padding: 16, gap: 10 },
  etiqueta: { fontFamily: FUENTES.textoFuerte, fontSize: 16, color: TINTA },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    fontFamily: FUENTES.textoSemi,
    color: TINTA,
  },
  colores: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  color: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: BORDE,
    borderColor: TINTA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorElegido: { borderWidth: 3.5 },
  colorOcupado: { opacity: 0.2 },
  opciones: { flexDirection: 'row', gap: 8 },
  opcion: {
    flex: 1,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  opcionTexto: { flexShrink: 1, fontFamily: FUENTES.textoFuerte, fontSize: 14.5, color: TINTA },
});
