import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BotonModal, Caja, Capa, CabeceraModal, TextoModal } from '../components/Capa';
import { Pantalla } from '../components/Pantalla';
import { BotonDuro, Icono, TextoPixel } from '../components/Ui';
import { MAZOS, categoriasDeMazo } from '../data/decks';
import {
  IDS_MAZO,
  LARGO_MAXIMO,
  MINIMO_ACTIVAS_MAZO,
  sePuedeDesactivar,
  sePuedeEditar,
  tarjetasDelMazo,
} from '../data/mazosPersonales';
import type { IdMazo, TarjetaEnMazo, TipoPropia } from '../data/mazosPersonales';
import { MODOS } from '../data/modos';
import { INFO_CATEGORIA, INFO_TIPO, interaccionDe } from '../data/tarjetas';
import type { Categoria, Intensidad, Tarjeta } from '../data/tarjetas';
import { BORDE, FUENTES, PALETAS, PAPEL, TINTA } from '../diseno';
import { useMazos } from '../mazos';
import { useVolver } from '../navegacion';
import { TemaProvider } from '../temas';

type Filtro = 'todas' | 'propias' | 'desactivadas' | Categoria;

const NIVELES_TEXTO: Record<Intensidad, string> = { 1: 'Suave', 2: 'Media', 3: 'Intensa' };

// Cómo se lee una tarjeta en la lista
function textoDeFila(t: Tarjeta): string {
  if (t.tipo === 'prefieres' && t.opciones) return `${t.opciones[0]} o ${t.opciones[1]}`;
  return t.texto;
}

function etiquetaDeFila(t: Tarjeta): string {
  const interaccion = interaccionDe(t);
  if (interaccion.tipo === 'escala') return 'escala';
  if (interaccion.tipo === 'temporizador') return 'reto con tiempo';
  return INFO_TIPO[t.tipo].etiqueta.toLowerCase();
}

function Interruptor({ valor, onCambio, etiqueta, color }: { valor: boolean; onCambio: () => void; etiqueta: string; color: string }) {
  return (
    <Pressable
      onPress={onCambio}
      accessibilityRole="switch"
      accessibilityState={{ checked: valor }}
      accessibilityLabel={etiqueta}
      hitSlop={8}
      style={[styles.pista, { backgroundColor: valor ? color : '#FFFFFF' }]}
    >
      <View style={[styles.bola, valor ? styles.bolaEncendida : null]} />
    </Pressable>
  );
}

function Chip({ texto, activo, onPress, color }: { texto: string; activo: boolean; onPress: () => void; color: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      style={[styles.chip, { backgroundColor: activo ? color : '#FFFFFF' }]}
    >
      <Text style={styles.chipTexto}>{texto}</Text>
    </Pressable>
  );
}

function leerMazo(texto: string | undefined): IdMazo {
  return (IDS_MAZO as string[]).includes(texto ?? '') ? (texto as IdMazo) : 'basico';
}

export default function PantallaMazo() {
  const router = useRouter();
  const volver = useVolver('/');
  const { mazo: mazoParam } = useLocalSearchParams<{ mazo?: string }>();
  const id = leerMazo(mazoParam);
  const paleta = PALETAS[id];
  const nombre = MODOS.find((m) => m.id === id)?.nombre ?? id;
  const { mazos, activar, añadir, borrar, restablecer, editarPropia, editarDeFabrica } = useMazos();

  const lista = useMemo(() => tarjetasDelMazo(id, MAZOS[id], mazos), [id, mazos]);
  const categorias = useMemo(() => categoriasDeMazo(id), [id]);
  const activas = lista.filter((t) => t.activa).length;

  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [aviso, setAviso] = useState<string | null>(null);
  const [ventana, setVentana] = useState<
    null | 'nueva' | 'restablecer' | { borrar: TarjetaEnMazo } | { editar: TarjetaEnMazo }
  >(null);

  // Formulario de tarjeta nueva
  const [texto, setTexto] = useState('');
  const [tipo, setTipo] = useState<TipoPropia>('pregunta');
  const [categoria, setCategoria] = useState<Categoria>(categorias[0]);
  const [intensidad, setIntensidad] = useState<Intensidad>(1);

  const visibles = lista.filter((t) => {
    if (filtro === 'todas') return true;
    if (filtro === 'propias') return t.propia;
    if (filtro === 'desactivadas') return !t.activa;
    return t.tarjeta.categoria === filtro;
  });

  const cambiar = (t: TarjetaEnMazo) => {
    if (t.activa && !sePuedeDesactivar(lista, t.id)) {
      setAviso(
        activas - 1 < MINIMO_ACTIVAS_MAZO
          ? `El mazo necesita al menos ${MINIMO_ACTIVAS_MAZO} tarjetas activas.`
          : 'Cada tema necesita al menos una tarjeta activa.',
      );
      return;
    }
    setAviso(null);
    activar(t.id, !t.activa);
  };

  const abrirNueva = () => {
    setTexto('');
    setTipo('pregunta');
    setCategoria(filtro !== 'todas' && filtro !== 'propias' && filtro !== 'desactivadas' ? filtro : categorias[0]);
    setIntensidad(1);
    setVentana('nueva');
  };

  // Editar: las propias, todo; las de fábrica, solo el texto (se puede volver al original)
  const abrirEditar = (t: TarjetaEnMazo) => {
    setTexto(t.tarjeta.texto);
    setTipo(t.tarjeta.tipo === 'reto' ? 'reto' : 'pregunta');
    setCategoria(t.tarjeta.categoria ?? categorias[0]);
    setIntensidad(t.tarjeta.intensidad ?? 1);
    setVentana({ editar: t });
  };

  const edicion = ventana && typeof ventana === 'object' && 'editar' in ventana ? ventana.editar : null;

  const guardarFormulario = () => {
    if (texto.trim().length === 0) return;
    if (!edicion) añadir({ mazo: id, tipo, texto, categoria, intensidad });
    else if (edicion.propia) editarPropia(edicion.id, { tipo, texto, categoria, intensidad });
    else editarDeFabrica(edicion.id, texto, edicion.original ?? edicion.tarjeta.texto);
    setVentana(null);
  };

  const fila = ({ item: t }: { item: TarjetaEnMazo }) => (
    <View style={[styles.fila, !t.activa && styles.filaApagada]}>
      <View style={styles.filaTextos}>
        <View style={styles.filaCabecera}>
          <View style={styles.puntos} accessibilityLabel={`Intensidad ${t.tarjeta.intensidad ?? 1} de 3`}>
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={[styles.punto, { backgroundColor: i <= (t.tarjeta.intensidad ?? 1) ? TINTA : 'transparent' }]}
              />
            ))}
          </View>
          <TextoPixel size={9}>{etiquetaDeFila(t.tarjeta)}</TextoPixel>
          {t.tarjeta.categoria && filtro === 'todas' ? (
            <TextoPixel size={9}>{`· ${INFO_CATEGORIA[t.tarjeta.categoria].nombre}`}</TextoPixel>
          ) : null}
          {t.propia || t.editada ? (
            <View style={[styles.propia, { backgroundColor: paleta.oca }]}>
              <Text style={styles.propiaTexto}>{t.propia ? 'propia' : 'editada'}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.filaTexto}>{textoDeFila(t.tarjeta)}</Text>
        <View style={styles.acciones}>
          {sePuedeEditar(t.tarjeta) ? (
            <Pressable
              onPress={() => abrirEditar(t)}
              accessibilityRole="button"
              accessibilityLabel="Editar tarjeta"
              hitSlop={6}
              style={styles.borrar}
            >
              <Text style={styles.borrarTexto}>Editar</Text>
            </Pressable>
          ) : null}
          {t.propia ? (
            <Pressable
              onPress={() => setVentana({ borrar: t })}
              accessibilityRole="button"
              accessibilityLabel="Borrar tarjeta"
              hitSlop={6}
              style={styles.borrar}
            >
              <Icono nombre="cerrar" size={14} />
              <Text style={styles.borrarTexto}>Borrar</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      <Interruptor
        valor={t.activa}
        onCambio={() => cambiar(t)}
        etiqueta={`${t.activa ? 'Desactivar' : 'Activar'}: ${textoDeFila(t.tarjeta)}`}
        color={paleta.suelo}
      />
    </View>
  );

  const filtros: { id: Filtro; texto: string }[] = [
    { id: 'todas', texto: 'Todas' },
    ...categorias.map((c) => ({ id: c as Filtro, texto: INFO_CATEGORIA[c].nombre })),
    { id: 'propias', texto: 'Propias' },
    { id: 'desactivadas', texto: 'Desactivadas' },
  ];

  let contenidoVentana = null;
  if (ventana === 'nueva' || edicion) {
    // Con las de fábrica solo se cambia el texto
    const completo = !edicion || edicion.propia;
    contenidoVentana = (
      <Caja>
        <CabeceraModal
          sangrado
          titulo={edicion ? 'Editar tarjeta' : 'Nueva tarjeta'}
          chip={edicion && !edicion.propia ? 'tarjeta de fábrica.' : `mazo ${nombre.toLowerCase()}.`}
          dibujo="feliz"
        />
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder={tipo === 'reto' ? 'Escribe el reto…' : 'Escribe la pregunta…'}
          placeholderTextColor="#8A857A"
          multiline
          maxLength={LARGO_MAXIMO}
          scrollEnabled
          style={styles.campo}
        />
        {completo ? (
          <>
        <Text style={styles.etiqueta}>Tipo</Text>
        <View style={styles.opciones}>
          <Chip texto="Pregunta" activo={tipo === 'pregunta'} onPress={() => setTipo('pregunta')} color={paleta.oca} />
          <Chip texto="Reto" activo={tipo === 'reto'} onPress={() => setTipo('reto')} color={paleta.oca} />
        </View>
        <Text style={styles.etiqueta}>Tema</Text>
        <View style={styles.opciones}>
          {categorias.map((c) => (
            <Chip key={c} texto={INFO_CATEGORIA[c].nombre} activo={categoria === c} onPress={() => setCategoria(c)} color={paleta.oca} />
          ))}
        </View>
        <Text style={styles.etiqueta}>Intensidad</Text>
        <View style={styles.opciones}>
          {([1, 2, 3] as Intensidad[]).map((n) => (
            <Chip key={n} texto={NIVELES_TEXTO[n]} activo={intensidad === n} onPress={() => setIntensidad(n)} color={paleta.oca} />
          ))}
        </View>
          </>
        ) : (
          <TextoModal>Puedes cambiar el texto. Su tipo, tema e intensidad se quedan como están.</TextoModal>
        )}
        <BotonModal
          principal
          texto={edicion ? 'Guardar cambios' : 'Guardar tarjeta'}
          desactivado={texto.trim().length === 0}
          onPress={guardarFormulario}
        />
        {edicion && edicion.editada ? (
          <BotonModal
            texto="Volver al texto original"
            descripcion={edicion.original}
            onPress={() => {
              editarDeFabrica(edicion.id, edicion.original ?? '', edicion.original ?? '');
              setVentana(null);
            }}
          />
        ) : null}
        <BotonModal texto="Cancelar" onPress={() => setVentana(null)} />
      </Caja>
    );
  } else if (ventana === 'restablecer') {
    contenidoVentana = (
      <Caja>
        <CabeceraModal sangrado titulo="Restablecer" chip={`mazo ${nombre.toLowerCase()}.`} dibujo="preocupado" />
        <TextoModal>Se vuelven a activar todas las tarjetas de fábrica con su texto original y se borran vuestras tarjetas propias de este mazo.</TextoModal>
        <BotonModal
          principal
          texto="Restablecer"
          onPress={() => {
            restablecer(id);
            setAviso(null);
            setVentana(null);
          }}
        />
        <BotonModal texto="Cancelar" onPress={() => setVentana(null)} />
      </Caja>
    );
  } else if (ventana && typeof ventana === 'object' && 'borrar' in ventana) {
    const t = ventana.borrar;
    contenidoVentana = (
      <Caja>
        <CabeceraModal sangrado titulo="Borrar tarjeta" chip="tarjeta propia." dibujo="preocupado" />
        <TextoModal>{`«${textoDeFila(t.tarjeta)}»`}</TextoModal>
        <BotonModal
          principal
          texto="Borrar"
          onPress={() => {
            borrar(t.id);
            setVentana(null);
          }}
        />
        <BotonModal texto="Cancelar" onPress={() => setVentana(null)} />
      </Caja>
    );
  }

  return (
    <TemaProvider modo={id}>
      <Pantalla
        titulo={`Mazo ${nombre}`}
        subtitulo={`${activas} de ${lista.length} activas.`}
        onVolver={router.canGoBack() ? () => router.back() : volver}
      >
        <View style={styles.arriba}>
          <BotonDuro texto="Añadir tarjeta" icono="mas" color={paleta.oca} onPress={abrirNueva} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtros}>
            {filtros.map((f) => (
              <Chip key={f.id} texto={f.texto} activo={filtro === f.id} onPress={() => setFiltro(f.id)} color={paleta.oca} />
            ))}
          </ScrollView>
          {aviso ? (
            <View style={[styles.aviso, { backgroundColor: paleta.duo }]}>
              <Text style={styles.avisoTexto}>{aviso}</Text>
            </View>
          ) : null}
        </View>
        <FlatList
          data={visibles}
          keyExtractor={(t) => t.id}
          renderItem={fila}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <Text style={styles.vacio}>
              {filtro === 'propias' ? 'Todavía no habéis añadido tarjetas a este mazo.' : 'No hay tarjetas aquí.'}
            </Text>
          }
          ListFooterComponent={
            <BotonDuro texto="Restablecer este mazo" onPress={() => setVentana('restablecer')} style={styles.restablecer} />
          }
        />
        <Capa visible={contenidoVentana !== null}>{contenidoVentana}</Capa>
      </Pantalla>
    </TemaProvider>
  );
}

const styles = StyleSheet.create({
  arriba: { paddingHorizontal: 16, gap: 10, paddingBottom: 8 },
  filtros: { gap: 8, paddingVertical: 2, paddingRight: 16 },
  chip: {
    borderWidth: 1.5,
    borderColor: TINTA,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipTexto: { fontFamily: FUENTES.textoFuerte, fontSize: 13, color: TINTA },
  aviso: { borderWidth: 1.5, borderColor: TINTA, borderRadius: 12, padding: 10 },
  avisoTexto: { fontFamily: FUENTES.textoFuerte, fontSize: 13, lineHeight: 18, color: TINTA },
  lista: { paddingHorizontal: 16, paddingBottom: 40, gap: 8 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: TINTA,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filaApagada: { backgroundColor: PAPEL, opacity: 0.6 },
  filaTextos: { flex: 1, gap: 4 },
  filaCabecera: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  puntos: { flexDirection: 'row', gap: 3 },
  punto: { width: 7, height: 7, borderRadius: 4, borderWidth: 1.2, borderColor: TINTA },
  propia: { borderWidth: 1.2, borderColor: TINTA, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 1 },
  propiaTexto: { fontFamily: FUENTES.textoFuerte, fontSize: 10.5, color: TINTA },
  filaTexto: { fontFamily: FUENTES.textoSemi, fontSize: 14.5, lineHeight: 20, color: TINTA },
  acciones: { flexDirection: 'row', gap: 16 },
  borrar: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingVertical: 2 },
  borrarTexto: { fontFamily: FUENTES.textoFuerte, fontSize: 12.5, color: TINTA, textDecorationLine: 'underline' },
  pista: {
    width: 50,
    height: 30,
    borderRadius: 15,
    borderWidth: BORDE,
    borderColor: TINTA,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  bola: { width: 20, height: 20, borderRadius: 10, borderWidth: BORDE, borderColor: TINTA, backgroundColor: PAPEL },
  bolaEncendida: { alignSelf: 'flex-end' },
  vacio: { fontFamily: FUENTES.textoSemi, fontSize: 14, color: TINTA, textAlign: 'center', paddingVertical: 24 },
  restablecer: { marginTop: 16 },
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
  etiqueta: { alignSelf: 'flex-start', fontFamily: FUENTES.titulo, fontSize: 15, color: TINTA, textTransform: 'uppercase' },
  opciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignSelf: 'stretch' },
});
